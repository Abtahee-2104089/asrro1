import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server"
import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { requireExecutive, writeAudit } from "./_lib/auth"
import { cleanText, normalizeEmail } from "./_lib/validation"
import { contactMessageFields } from "./model"

const contactDoc = v.object({
  _id: v.id("contactMessages"),
  _creationTime: v.number(),
  ...contactMessageFields,
})

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  returns: v.id("contactMessages"),
  handler: async (ctx, args) => {
    const emailNormalized = normalizeEmail(args.email)
    const latest = await ctx.db
      .query("contactMessages")
      .withIndex("by_emailNormalized_and_submittedAt", (q) =>
        q.eq("emailNormalized", emailNormalized)
      )
      .order("desc")
      .first()
    const now = Date.now()
    if (latest && now - latest.submittedAt < 60_000)
      throw new ConvexError("Please wait before sending another message")
    return await ctx.db.insert("contactMessages", {
      name: cleanText(args.name, "Name", 120),
      email: emailNormalized,
      emailNormalized,
      subject: cleanText(args.subject, "Subject", 200),
      message: cleanText(args.message, "Message", 10_000),
      status: "new",
      submittedAt: now,
    })
  },
})

export const list = query({
  args: {
    status: v.union(
      v.literal("new"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("spam")
    ),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(contactDoc),
  handler: async (ctx, args) => {
    await requireExecutive(ctx)
    return await ctx.db
      .query("contactMessages")
      .withIndex("by_status_and_submittedAt", (q) =>
        q.eq("status", args.status)
      )
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const updateStatus = mutation({
  args: {
    messageId: v.id("contactMessages"),
    status: v.union(
      v.literal("new"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("spam")
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const actor = await requireExecutive(ctx)
    const message = await ctx.db.get("contactMessages", args.messageId)
    if (!message) throw new ConvexError("Message not found")
    await ctx.db.patch("contactMessages", message._id, {
      status: args.status,
      assignedTo: actor._id,
      resolvedAt: args.status === "resolved" ? Date.now() : undefined,
    })
    await writeAudit(
      ctx,
      actor,
      "contact.status",
      "contactMessage",
      message._id,
      `Set contact message to ${args.status}`
    )
    return null
  },
})
