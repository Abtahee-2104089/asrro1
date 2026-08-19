import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server"
import { ConvexError, v } from "convex/values"
import { mutation, query, type MutationCtx } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"
import {
  currentMember,
  hasPermission,
  requireFinanceAccess,
  requirePermission,
  writeAudit,
} from "./_lib/auth"
import {
  assertFiniteNonNegative,
  cleanText,
  monthKey,
  optionalText,
} from "./_lib/validation"
import { financeTransactionFields, moneyDirection } from "./model"

const transactionDoc = v.object({
  _id: v.id("financeTransactions"),
  _creationTime: v.number(),
  ...financeTransactionFields,
})
const summaryDoc = v.object({
  _id: v.id("financeMonthlySummaries"),
  _creationTime: v.number(),
  monthKey: v.string(),
  currency: v.string(),
  income: v.number(),
  expense: v.number(),
  updatedAt: v.number(),
})
const financeAccessLevel = v.union(
  v.literal("manage"),
  v.literal("summary"),
  v.literal("none")
)

export const access = query({
  args: {},
  returns: v.object({
    allowed: v.boolean(),
    level: financeAccessLevel,
    reason: v.string(),
  }),
  handler: async (ctx) => {
    const member = await currentMember(ctx)
    if (!member || member.status !== "active") {
      return {
        allowed: false,
        level: "none" as const,
        reason: "Active membership is required.",
      }
    }
    if (hasPermission(member, "finance_manage")) {
      return {
        allowed: true,
        level: "manage" as const,
        reason: "Detailed finance access granted.",
      }
    }
    if (hasPermission(member, "finance_summary")) {
      return {
        allowed: true,
        level: "summary" as const,
        reason: "High-level finance summary access granted.",
      }
    }
    return {
      allowed: false,
      level: "none" as const,
      reason: "Finance access is restricted.",
    }
  },
})

export const summaryView = query({
  args: {
    currency: v.string(),
    from: v.number(),
    to: v.number(),
    fromMonth: v.string(),
    toMonth: v.string(),
  },
  returns: v.object({
    income: v.number(),
    expense: v.number(),
    net: v.number(),
    transactionCount: v.number(),
    truncated: v.boolean(),
    months: v.array(
      v.object({
        monthKey: v.string(),
        income: v.number(),
        expense: v.number(),
      })
    ),
    expenseCategories: v.array(
      v.object({ category: v.string(), amount: v.number() })
    ),
  }),
  handler: async (ctx, args) => {
    await requirePermission(ctx, "finance_summary")
    if (args.to < args.from) throw new ConvexError("Invalid reporting period")
    const currency = cleanText(args.currency, "Currency", 10).toUpperCase()
    const [months, transactions] = await Promise.all([
      ctx.db
        .query("financeMonthlySummaries")
        .withIndex("by_currency_and_monthKey", (q) =>
          q
            .eq("currency", currency)
            .gte("monthKey", args.fromMonth)
            .lte("monthKey", args.toMonth)
        )
        .order("asc")
        .take(120),
      ctx.db
        .query("financeTransactions")
        .withIndex("by_status_and_occurredAt", (q) =>
          q
            .eq("status", "posted")
            .gte("occurredAt", args.from)
            .lte("occurredAt", args.to)
        )
        .take(5_001),
    ])
    const bounded = transactions.slice(0, 5_000)
    const categories = new Map<string, number>()
    for (const transaction of bounded) {
      if (
        transaction.currency === currency &&
        transaction.direction === "expense"
      ) {
        categories.set(
          transaction.category,
          (categories.get(transaction.category) ?? 0) + transaction.amount
        )
      }
    }
    const income = months.reduce((total, month) => total + month.income, 0)
    const expense = months.reduce((total, month) => total + month.expense, 0)
    return {
      income,
      expense,
      net: income - expense,
      transactionCount: bounded.length,
      truncated: transactions.length > bounded.length,
      months: months.map((month) => ({
        monthKey: month.monthKey,
        income: month.income,
        expense: month.expense,
      })),
      expenseCategories: [...categories.entries()]
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 12),
    }
  },
})

async function applySummary(
  ctx: MutationCtx,
  transaction: Pick<
    Doc<"financeTransactions">,
    "monthKey" | "currency" | "direction" | "amount"
  >,
  multiplier: 1 | -1
) {
  const summary = await ctx.db
    .query("financeMonthlySummaries")
    .withIndex("by_monthKey_and_currency", (q) =>
      q
        .eq("monthKey", transaction.monthKey)
        .eq("currency", transaction.currency)
    )
    .unique()
  const incomeDelta =
    transaction.direction === "income" ? transaction.amount * multiplier : 0
  const expenseDelta =
    transaction.direction === "expense" ? transaction.amount * multiplier : 0
  if (summary) {
    await ctx.db.patch("financeMonthlySummaries", summary._id, {
      income: Math.max(0, summary.income + incomeDelta),
      expense: Math.max(0, summary.expense + expenseDelta),
      updatedAt: Date.now(),
    })
  } else {
    if (multiplier === -1)
      throw new ConvexError(
        "Finance summary is missing; reconcile before voiding"
      )
    await ctx.db.insert("financeMonthlySummaries", {
      monthKey: transaction.monthKey,
      currency: transaction.currency,
      income: incomeDelta,
      expense: expenseDelta,
      updatedAt: Date.now(),
    })
  }
}

export const createTransaction = mutation({
  args: {
    direction: moneyDirection,
    category: v.string(),
    amount: v.number(),
    currency: v.string(),
    occurredAt: v.number(),
    description: v.string(),
    reference: v.optional(v.string()),
    eventId: v.optional(v.id("events")),
    memberId: v.optional(v.id("members")),
    receiptAssetId: v.optional(v.id("assets")),
    status: v.union(v.literal("draft"), v.literal("posted")),
  },
  returns: v.id("financeTransactions"),
  handler: async (ctx, args) => {
    const actor = await requireFinanceAccess(ctx)
    assertFiniteNonNegative(args.amount, "Amount")
    if (args.amount === 0)
      throw new ConvexError("Amount must be greater than zero")
    const currency = cleanText(args.currency, "Currency", 10).toUpperCase()
    const value = {
      direction: args.direction,
      category: cleanText(args.category, "Category", 100),
      amount: args.amount,
      currency,
      occurredAt: args.occurredAt,
      monthKey: monthKey(args.occurredAt),
      description: cleanText(args.description, "Description", 2_000),
      reference: optionalText(args.reference, "Reference", 200),
      eventId: args.eventId,
      memberId: args.memberId,
      receiptAssetId: args.receiptAssetId,
      status: args.status,
      createdBy: actor._id,
      createdAt: Date.now(),
    } as const
    const id = await ctx.db.insert("financeTransactions", value)
    if (args.status === "posted") await applySummary(ctx, value, 1)
    await writeAudit(
      ctx,
      actor,
      "finance.create",
      "financeTransaction",
      id,
      `Recorded ${value.direction} ${value.amount} ${value.currency}`
    )
    return id
  },
})

export const postDraft = mutation({
  args: { transactionId: v.id("financeTransactions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const actor = await requireFinanceAccess(ctx)
    const transaction = await ctx.db.get(
      "financeTransactions",
      args.transactionId
    )
    if (!transaction || transaction.status !== "draft")
      throw new ConvexError("Draft transaction not found")
    await ctx.db.patch("financeTransactions", transaction._id, {
      status: "posted",
    })
    await applySummary(ctx, transaction, 1)
    await writeAudit(
      ctx,
      actor,
      "finance.post",
      "financeTransaction",
      transaction._id,
      "Posted finance transaction"
    )
    return null
  },
})

export const voidTransaction = mutation({
  args: { transactionId: v.id("financeTransactions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const actor = await requireFinanceAccess(ctx)
    const transaction = await ctx.db.get(
      "financeTransactions",
      args.transactionId
    )
    if (!transaction || transaction.status !== "posted")
      throw new ConvexError("Posted transaction not found")
    await applySummary(ctx, transaction, -1)
    await ctx.db.patch("financeTransactions", transaction._id, {
      status: "void",
    })
    await writeAudit(
      ctx,
      actor,
      "finance.void",
      "financeTransaction",
      transaction._id,
      "Voided finance transaction"
    )
    return null
  },
})

export const ledger = query({
  args: {
    from: v.number(),
    to: v.number(),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(transactionDoc),
  handler: async (ctx, args) => {
    await requireFinanceAccess(ctx)
    if (args.to < args.from) throw new ConvexError("Invalid reporting period")
    return await ctx.db
      .query("financeTransactions")
      .withIndex("by_status_and_occurredAt", (q) =>
        q
          .eq("status", "posted")
          .gte("occurredAt", args.from)
          .lte("occurredAt", args.to)
      )
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const monthlySummary = query({
  args: { currency: v.string(), fromMonth: v.string(), toMonth: v.string() },
  returns: v.array(summaryDoc),
  handler: async (ctx, args) => {
    await requireFinanceAccess(ctx)
    return await ctx.db
      .query("financeMonthlySummaries")
      .withIndex("by_currency_and_monthKey", (q) =>
        q
          .eq("currency", args.currency.trim().toUpperCase())
          .gte("monthKey", args.fromMonth)
          .lte("monthKey", args.toMonth)
      )
      .order("asc")
      .take(120)
  },
})
