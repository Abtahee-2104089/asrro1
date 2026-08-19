import { ConvexError, v } from "convex/values"
import { internal } from "./_generated/api"
import { mutation, query } from "./_generated/server"
import { requireExecutive, requirePermission, writeAudit } from "./_lib/auth"
import { announcementEmail, enqueueEmail } from "./_lib/email"
import {
  assertTimestampOrder,
  cleanText,
  normalizeKey,
  optionalText,
} from "./_lib/validation"
import { committeeMemberFields, committeeTermFields } from "./model"

const termDoc = v.object({
  _id: v.id("committeeTerms"),
  _creationTime: v.number(),
  ...committeeTermFields,
})
const committeeMemberDoc = v.object({
  _id: v.id("committeeMembers"),
  _creationTime: v.number(),
  ...committeeMemberFields,
})
const publicCommitteeMember = v.object({
  member: committeeMemberDoc,
  photoUrl: v.union(v.string(), v.null()),
})

export const current = query({
  args: {},
  returns: v.union(
    v.object({ term: termDoc, members: v.array(committeeMemberDoc) }),
    v.null()
  ),
  handler: async (ctx) => {
    const term = await ctx.db
      .query("committeeTerms")
      .withIndex("by_status_and_startsAt", (q) => q.eq("status", "current"))
      .order("desc")
      .first()
    if (!term) return null
    const members = await ctx.db
      .query("committeeMembers")
      .withIndex("by_termId_and_isPublic_and_displayOrder", (q) =>
        q.eq("termId", term._id).eq("isPublic", true)
      )
      .order("asc")
      .take(100)
    return { term, members }
  },
})

export const currentWithPhotos = query({
  args: {},
  returns: v.union(
    v.object({ term: termDoc, members: v.array(publicCommitteeMember) }),
    v.null()
  ),
  handler: async (ctx) => {
    const term = await ctx.db
      .query("committeeTerms")
      .withIndex("by_status_and_startsAt", (q) => q.eq("status", "current"))
      .order("desc")
      .first()
    if (!term) return null
    const members = await ctx.db
      .query("committeeMembers")
      .withIndex("by_termId_and_isPublic_and_displayOrder", (q) =>
        q.eq("termId", term._id).eq("isPublic", true)
      )
      .order("asc")
      .take(100)
    return {
      term,
      members: await Promise.all(
        members.map(async (member) => {
          const asset = member.photoAssetId
            ? await ctx.db.get("assets", member.photoAssetId)
            : null
          return {
            member,
            photoUrl:
              asset?.visibility === "public"
                ? await ctx.storage.getUrl(asset.storageId)
                : null,
          }
        })
      ),
    }
  },
})

export const listAdmin = query({
  args: {},
  returns: v.object({
    terms: v.array(termDoc),
    currentMembers: v.array(committeeMemberDoc),
  }),
  handler: async (ctx) => {
    await requireExecutive(ctx)
    const [drafts, currentTerms, past] = await Promise.all([
      ctx.db
        .query("committeeTerms")
        .withIndex("by_status_and_startsAt", (q) => q.eq("status", "draft"))
        .order("desc")
        .take(50),
      ctx.db
        .query("committeeTerms")
        .withIndex("by_status_and_startsAt", (q) => q.eq("status", "current"))
        .order("desc")
        .take(10),
      ctx.db
        .query("committeeTerms")
        .withIndex("by_status_and_startsAt", (q) => q.eq("status", "past"))
        .order("desc")
        .take(50),
    ])
    const current = currentTerms[0]
    const currentMembers = current
      ? await ctx.db
          .query("committeeMembers")
          .withIndex("by_termId_and_displayOrder", (q) =>
            q.eq("termId", current._id)
          )
          .order("asc")
          .take(100)
      : []
    return { terms: [...currentTerms, ...drafts, ...past], currentMembers }
  },
})

export const upsertTerm = mutation({
  args: {
    termId: v.optional(v.id("committeeTerms")),
    name: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("current"),
      v.literal("past")
    ),
  },
  returns: v.id("committeeTerms"),
  handler: async (ctx, args) => {
    const actor = await requireExecutive(ctx)
    assertTimestampOrder(args.startsAt, args.endsAt, "committee term")
    if (args.status === "current") {
      const current = await ctx.db
        .query("committeeTerms")
        .withIndex("by_status_and_startsAt", (q) => q.eq("status", "current"))
        .order("desc")
        .first()
      if (current && current._id !== args.termId)
        await ctx.db.patch("committeeTerms", current._id, { status: "past" })
    }
    const existing = args.termId
      ? await ctx.db.get("committeeTerms", args.termId)
      : null
    if (args.termId && !existing)
      throw new ConvexError("Committee term not found")
    const value = {
      name: cleanText(args.name, "Name", 120),
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      status: args.status,
      publishedAt:
        args.status === "current"
          ? (existing?.publishedAt ?? Date.now())
          : existing?.publishedAt,
    }
    const id = existing
      ? (await ctx.db.replace("committeeTerms", existing._id, value),
        existing._id)
      : await ctx.db.insert("committeeTerms", value)
    await writeAudit(
      ctx,
      actor,
      "committee.term_upsert",
      "committeeTerm",
      id,
      `Updated ${value.name}`
    )
    return id
  },
})

export const upsertMember = mutation({
  args: {
    committeeMemberId: v.optional(v.id("committeeMembers")),
    termId: v.id("committeeTerms"),
    memberId: v.optional(v.id("members")),
    name: v.string(),
    position: v.string(),
    positionKey: v.string(),
    department: v.string(),
    session: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    photoAssetId: v.optional(v.id("assets")),
    displayOrder: v.number(),
    isPublic: v.boolean(),
  },
  returns: v.id("committeeMembers"),
  handler: async (ctx, args) => {
    const actor = await requireExecutive(ctx)
    if (!(await ctx.db.get("committeeTerms", args.termId)))
      throw new ConvexError("Committee term not found")
    const existing = args.committeeMemberId
      ? await ctx.db.get("committeeMembers", args.committeeMemberId)
      : null
    if (args.committeeMemberId && !existing)
      throw new ConvexError("Committee member not found")
    const value = {
      termId: args.termId,
      memberId: args.memberId,
      name: cleanText(args.name, "Name", 120),
      position: cleanText(args.position, "Position", 120),
      positionKey: normalizeKey(args.positionKey, "Position key"),
      department: cleanText(args.department, "Department", 100),
      session: cleanText(args.session, "Session", 40),
      email: optionalText(args.email, "Email", 254),
      phone: optionalText(args.phone, "Phone", 30),
      photoAssetId: args.photoAssetId,
      displayOrder: Math.max(0, Math.floor(args.displayOrder)),
      isPublic: args.isPublic,
    }
    const id = existing
      ? (await ctx.db.replace("committeeMembers", existing._id, value),
        existing._id)
      : await ctx.db.insert("committeeMembers", value)
    await writeAudit(
      ctx,
      actor,
      "committee.member_upsert",
      "committeeMember",
      id,
      `Updated ${value.name} as ${value.position}`
    )
    return id
  },
})

export const sendAnnouncement = mutation({
  args: { subject: v.string(), message: v.string() },
  returns: v.object({ queued: v.number() }),
  handler: async (ctx, args) => {
    await requirePermission(ctx, "committee_manage")
    const term = await ctx.db
      .query("committeeTerms")
      .withIndex("by_status_and_startsAt", (q) => q.eq("status", "current"))
      .order("desc")
      .first()
    if (!term) throw new ConvexError("No current committee is configured")
    const members = await ctx.db
      .query("committeeMembers")
      .withIndex("by_termId_and_displayOrder", (q) => q.eq("termId", term._id))
      .take(100)
    const recipients = members.filter(
      (
        committeeMember
      ): committeeMember is typeof committeeMember & { email: string } =>
        committeeMember.email !== undefined
    )
    await Promise.all(
      recipients.map(async (committeeMember) => {
        const content = announcementEmail({
          name: committeeMember.name,
          subject: args.subject,
          message: args.message,
          template: "committee_announcement",
        })
        const outboxId = await enqueueEmail(ctx, {
          recipient: committeeMember.email,
          recipientName: committeeMember.name,
          memberId: committeeMember.memberId,
          ...content,
        })
        await ctx.scheduler.runAfter(0, internal.emailActions.deliver, {
          outboxId,
        })
      })
    )
    return { queued: recipients.length }
  },
})
