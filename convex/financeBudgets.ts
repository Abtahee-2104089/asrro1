import { ConvexError, v } from "convex/values"

import { mutation, query } from "./_generated/server"
import { requireFinanceAccess, writeAudit } from "./_lib/auth"
import {
  assertFiniteNonNegative,
  cleanText,
  optionalText,
} from "./_lib/validation"

const budgetStatus = v.union(
  v.literal("draft"),
  v.literal("approved"),
  v.literal("closed")
)

const budgetDoc = v.object({
  _id: v.id("financeBudgets"),
  _creationTime: v.number(),
  eventId: v.optional(v.id("events")),
  fiscalYear: v.number(),
  name: v.string(),
  currency: v.string(),
  plannedIncome: v.number(),
  plannedExpense: v.number(),
  status: budgetStatus,
  notes: v.optional(v.string()),
  createdBy: v.id("members"),
  updatedAt: v.number(),
})

export const list = query({
  args: { fiscalYear: v.number() },
  returns: v.array(budgetDoc),
  handler: async (ctx, args) => {
    await requireFinanceAccess(ctx)
    if (!Number.isInteger(args.fiscalYear)) {
      throw new ConvexError("Fiscal year must be an integer")
    }
    const [draft, approved, closed] = await Promise.all(
      (["draft", "approved", "closed"] as const).map(
        async (status) =>
          await ctx.db
            .query("financeBudgets")
            .withIndex("by_fiscalYear_and_status", (q) =>
              q.eq("fiscalYear", args.fiscalYear).eq("status", status)
            )
            .order("desc")
            .take(100)
      )
    )
    return [...approved, ...draft, ...closed]
  },
})

export const upsert = mutation({
  args: {
    budgetId: v.optional(v.id("financeBudgets")),
    eventId: v.optional(v.id("events")),
    fiscalYear: v.number(),
    name: v.string(),
    currency: v.string(),
    plannedIncome: v.number(),
    plannedExpense: v.number(),
    status: budgetStatus,
    notes: v.optional(v.string()),
  },
  returns: v.id("financeBudgets"),
  handler: async (ctx, args) => {
    const actor = await requireFinanceAccess(ctx)
    if (!Number.isInteger(args.fiscalYear)) {
      throw new ConvexError("Fiscal year must be an integer")
    }
    assertFiniteNonNegative(args.plannedIncome, "Planned income")
    assertFiniteNonNegative(args.plannedExpense, "Planned expense")
    if (args.eventId && !(await ctx.db.get("events", args.eventId))) {
      throw new ConvexError("Event not found")
    }
    const existing = args.budgetId
      ? await ctx.db.get("financeBudgets", args.budgetId)
      : null
    if (args.budgetId && !existing) throw new ConvexError("Budget not found")
    const value = {
      eventId: args.eventId,
      fiscalYear: args.fiscalYear,
      name: cleanText(args.name, "Budget name", 160),
      currency: cleanText(args.currency, "Currency", 10).toUpperCase(),
      plannedIncome: args.plannedIncome,
      plannedExpense: args.plannedExpense,
      status: args.status,
      notes: optionalText(args.notes, "Budget notes", 2_000),
      createdBy: existing?.createdBy ?? actor._id,
      updatedAt: Date.now(),
    }
    const id = existing
      ? (await ctx.db.replace("financeBudgets", existing._id, value),
        existing._id)
      : await ctx.db.insert("financeBudgets", value)
    await writeAudit(
      ctx,
      actor,
      "finance.budget_upsert",
      "financeBudget",
      id,
      `Updated ${value.name}`
    )
    return id
  },
})
