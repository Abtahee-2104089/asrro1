import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server"
import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { currentMember, requireMember } from "./_lib/auth"
import { notificationFields } from "./model"

const notificationDoc = v.object({
  _id: v.id("notifications"),
  _creationTime: v.number(),
  ...notificationFields,
})

export const listMine = query({
  args: { unreadOnly: v.boolean(), paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(notificationDoc),
  handler: async (ctx, args) => {
    const member = await requireMember(ctx)
    if (args.unreadOnly) {
      return await ctx.db
        .query("notifications")
        .withIndex("by_memberId_and_read_and_createdAt", (q) =>
          q.eq("memberId", member._id).eq("read", false)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    }
    return await ctx.db
      .query("notifications")
      .withIndex("by_memberId_and_createdAt", (q) =>
        q.eq("memberId", member._id)
      )
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const listForAccount = query({
  args: { unreadOnly: v.boolean(), paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(notificationDoc),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Authentication is required")
    const member = await currentMember(ctx)
    if (member) {
      if (args.unreadOnly) {
        return await ctx.db
          .query("notifications")
          .withIndex("by_memberId_and_read_and_createdAt", (q) =>
            q.eq("memberId", member._id).eq("read", false)
          )
          .order("desc")
          .paginate(args.paginationOpts)
      }
      return await ctx.db
        .query("notifications")
        .withIndex("by_memberId_and_createdAt", (q) =>
          q.eq("memberId", member._id)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    }
    if (args.unreadOnly) {
      return await ctx.db
        .query("notifications")
        .withIndex("by_identityToken_and_read_and_createdAt", (q) =>
          q.eq("identityToken", identity.tokenIdentifier).eq("read", false)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    }
    return await ctx.db
      .query("notifications")
      .withIndex("by_identityToken_and_createdAt", (q) =>
        q.eq("identityToken", identity.tokenIdentifier)
      )
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Authentication is required")
    const [member, notification] = await Promise.all([
      currentMember(ctx),
      ctx.db.get("notifications", args.notificationId),
    ])
    const ownsNotification =
      notification &&
      ((member && notification.memberId === member._id) ||
        notification.identityToken === identity.tokenIdentifier)
    if (!notification || !ownsNotification)
      throw new ConvexError("Notification not found")
    if (!notification.read)
      await ctx.db.patch("notifications", notification._id, {
        read: true,
        readAt: Date.now(),
      })
    return null
  },
})

export const markAllRead = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Authentication is required")
    const member = await currentMember(ctx)
    const unread = member
      ? await ctx.db
          .query("notifications")
          .withIndex("by_memberId_and_read_and_createdAt", (q) =>
            q.eq("memberId", member._id).eq("read", false)
          )
          .take(100)
      : await ctx.db
          .query("notifications")
          .withIndex("by_identityToken_and_read_and_createdAt", (q) =>
            q.eq("identityToken", identity.tokenIdentifier).eq("read", false)
          )
          .take(100)
    const readAt = Date.now()
    await Promise.all(
      unread.map((notification) =>
        ctx.db.patch("notifications", notification._id, {
          read: true,
          readAt,
        })
      )
    )
    return unread.length
  },
})
