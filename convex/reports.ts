import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server"
import { v } from "convex/values"
import { query } from "./_generated/server"
import { requireExecutive } from "./_lib/auth"
import {
  applicationFields,
  committeeMemberFields,
  memberFields,
  projectFields,
  registrationFields,
} from "./model"

const memberDoc = v.object({
  _id: v.id("members"),
  _creationTime: v.number(),
  ...memberFields,
})
const applicationDoc = v.object({
  _id: v.id("membershipApplications"),
  _creationTime: v.number(),
  ...applicationFields,
})
const registrationDoc = v.object({
  _id: v.id("eventRegistrations"),
  _creationTime: v.number(),
  ...registrationFields,
})
const committeeDoc = v.object({
  _id: v.id("committeeMembers"),
  _creationTime: v.number(),
  ...committeeMemberFields,
})
const projectDoc = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  ...projectFields,
})

export const memberRoster = query({
  args: {
    status: v.union(
      v.literal("active"),
      v.literal("suspended"),
      v.literal("alumni")
    ),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(memberDoc),
  handler: async (ctx, args) => {
    await requireExecutive(ctx)
    return await ctx.db
      .query("members")
      .withIndex("by_status_and_joinedAt", (q) => q.eq("status", args.status))
      .order("asc")
      .paginate(args.paginationOpts)
  },
})

export const pendingApplications = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(applicationDoc),
  handler: async (ctx, args) => {
    await requireExecutive(ctx)
    return await ctx.db
      .query("membershipApplications")
      .withIndex("by_status_and_submittedAt", (q) => q.eq("status", "pending"))
      .order("asc")
      .paginate(args.paginationOpts)
  },
})

export const eventAttendance = query({
  args: {
    eventId: v.id("events"),
    status: v.union(v.literal("attended"), v.literal("absent")),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(registrationDoc),
  handler: async (ctx, args) => {
    await requireExecutive(ctx)
    return await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId_and_status_and_registeredAt", (q) =>
        q.eq("eventId", args.eventId).eq("status", args.status)
      )
      .order("asc")
      .paginate(args.paginationOpts)
  },
})

export const committeeRoster = query({
  args: { termId: v.id("committeeTerms") },
  returns: v.array(committeeDoc),
  handler: async (ctx, args) => {
    await requireExecutive(ctx)
    return await ctx.db
      .query("committeeMembers")
      .withIndex("by_termId_and_displayOrder", (q) =>
        q.eq("termId", args.termId)
      )
      .order("asc")
      .take(100)
  },
})

export const projectInventory = query({
  args: {
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(projectDoc),
  handler: async (ctx, args) => {
    await requireExecutive(ctx)
    return await ctx.db
      .query("projects")
      .withIndex("by_status_and_publishedAt", (q) =>
        q.eq("status", args.status)
      )
      .order("desc")
      .paginate(args.paginationOpts)
  },
})
