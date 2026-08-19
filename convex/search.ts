import { ConvexError, v } from "convex/values"
import { query } from "./_generated/server"
import { requireExecutive } from "./_lib/auth"
import { cleanText } from "./_lib/validation"
import {
  alumniFields,
  blogFields,
  committeeMemberFields,
  eventFields,
  memberFields,
  projectFields,
  publicationFields,
} from "./model"

const memberDoc = v.object({
  _id: v.id("members"),
  _creationTime: v.number(),
  ...memberFields,
})
const eventDoc = v.object({
  _id: v.id("events"),
  _creationTime: v.number(),
  ...eventFields,
})
const projectDoc = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  ...projectFields,
})
const alumniDoc = v.object({
  _id: v.id("alumni"),
  _creationTime: v.number(),
  ...alumniFields,
})
const blogDoc = v.object({
  _id: v.id("blogs"),
  _creationTime: v.number(),
  ...blogFields,
})
const committeeDoc = v.object({
  _id: v.id("committeeMembers"),
  _creationTime: v.number(),
  ...committeeMemberFields,
})
const publicationDoc = v.object({
  _id: v.id("publications"),
  _creationTime: v.number(),
  ...publicationFields,
})

function limitValue(value: number) {
  if (!Number.isFinite(value)) throw new ConvexError("Invalid result limit")
  return Math.max(1, Math.min(25, Math.floor(value)))
}

export const publicSearch = query({
  args: { search: v.string(), limitPerType: v.number() },
  returns: v.object({
    events: v.array(eventDoc),
    projects: v.array(projectDoc),
    alumni: v.array(alumniDoc),
    blogs: v.array(blogDoc),
    committee: v.array(committeeDoc),
    publications: v.array(publicationDoc),
  }),
  handler: async (ctx, args) => {
    const search = cleanText(args.search, "Search", 200)
    const limit = limitValue(args.limitPerType)
    const currentTerm = await ctx.db
      .query("committeeTerms")
      .withIndex("by_status_and_startsAt", (q) => q.eq("status", "current"))
      .order("desc")
      .first()
    const [events, projects, alumni, blogs, committee, publications] =
      await Promise.all([
        ctx.db
          .query("events")
          .withSearchIndex("search_public_events", (q) =>
            q.search("name", search).eq("status", "published")
          )
          .take(limit),
        ctx.db
          .query("projects")
          .withSearchIndex("search_public_projects", (q) =>
            q.search("title", search).eq("status", "published")
          )
          .take(limit),
        ctx.db
          .query("alumni")
          .withSearchIndex("search_public_alumni", (q) =>
            q.search("name", search).eq("status", "published")
          )
          .take(limit),
        ctx.db
          .query("blogs")
          .withSearchIndex("search_public_blogs", (q) =>
            q.search("title", search).eq("status", "published")
          )
          .take(limit),
        currentTerm
          ? ctx.db
              .query("committeeMembers")
              .withSearchIndex("search_committee", (q) =>
                q
                  .search("name", search)
                  .eq("termId", currentTerm._id)
                  .eq("isPublic", true)
              )
              .take(limit)
          : Promise.resolve([]),
        ctx.db
          .query("publications")
          .withSearchIndex("search_public_publications", (q) =>
            q.search("title", search).eq("status", "published")
          )
          .take(limit),
      ])
    return { events, projects, alumni, blogs, committee, publications }
  },
})

export const searchMembers = query({
  args: {
    search: v.string(),
    department: v.optional(v.string()),
    limit: v.number(),
  },
  returns: v.array(memberDoc),
  handler: async (ctx, args) => {
    await requireExecutive(ctx)
    const search = cleanText(args.search, "Search", 200)
    const limit = limitValue(args.limit)
    return args.department !== undefined
      ? await ctx.db
          .query("members")
          .withSearchIndex("search_members", (q) =>
            q
              .search("fullName", search)
              .eq("status", "active")
              .eq("department", args.department!)
          )
          .take(limit)
      : await ctx.db
          .query("members")
          .withSearchIndex("search_members", (q) =>
            q.search("fullName", search).eq("status", "active")
          )
          .take(limit)
  },
})
