import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server"
import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { requireExecutive, writeAudit } from "./_lib/auth"
import { adjustCounter } from "./_lib/counters"
import { cleanText, optionalText } from "./_lib/validation"
import { alumniFields } from "./model"

const alumniDoc = v.object({
  _id: v.id("alumni"),
  _creationTime: v.number(),
  ...alumniFields,
})

export const listPublic = query({
  args: {
    department: v.optional(v.string()),
    batch: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(alumniDoc),
  handler: async (ctx, args) => {
    if (args.department !== undefined)
      return await ctx.db
        .query("alumni")
        .withIndex("by_status_and_department_and_graduationYear", (q) =>
          q.eq("status", "published").eq("department", args.department!)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    if (args.batch !== undefined)
      return await ctx.db
        .query("alumni")
        .withIndex("by_status_and_batch_and_graduationYear", (q) =>
          q.eq("status", "published").eq("batch", args.batch!)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    return await ctx.db
      .query("alumni")
      .withIndex("by_status_and_graduationYear", (q) =>
        q.eq("status", "published")
      )
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const getPublicBySlug = query({
  args: { slug: v.string() },
  returns: v.union(alumniDoc, v.null()),
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("alumni")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.trim().toLowerCase()))
      .unique()
    return item?.status === "published" ? item : null
  },
})

export const listAdmin = query({
  args: {},
  returns: v.array(alumniDoc),
  handler: async (ctx) => {
    await requireExecutive(ctx)
    const [drafts, published, archived] = await Promise.all([
      ctx.db
        .query("alumni")
        .withIndex("by_status_and_graduationYear", (q) =>
          q.eq("status", "draft")
        )
        .order("desc")
        .take(100),
      ctx.db
        .query("alumni")
        .withIndex("by_status_and_graduationYear", (q) =>
          q.eq("status", "published")
        )
        .order("desc")
        .take(100),
      ctx.db
        .query("alumni")
        .withIndex("by_status_and_graduationYear", (q) =>
          q.eq("status", "archived")
        )
        .order("desc")
        .take(100),
    ])
    return [...drafts, ...published, ...archived]
  },
})

export const upsert = mutation({
  args: {
    alumniId: v.optional(v.id("alumni")),
    slug: v.string(),
    name: v.string(),
    department: v.string(),
    session: v.string(),
    batch: v.string(),
    graduationYear: v.number(),
    currentWorkplace: v.optional(v.string()),
    higherStudies: v.optional(v.string()),
    linkedInUrl: v.optional(v.string()),
    researchInterests: v.optional(v.string()),
    photoAssetId: v.optional(v.id("assets")),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
  },
  returns: v.id("alumni"),
  handler: async (ctx, args) => {
    const actor = await requireExecutive(ctx)
    const slug = cleanText(args.slug, "Slug", 100).toLowerCase()
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      throw new ConvexError("Invalid alumni slug")
    if (
      !Number.isInteger(args.graduationYear) ||
      args.graduationYear < 1900 ||
      args.graduationYear > 2200
    )
      throw new ConvexError("Invalid graduation year")
    const slugOwner = await ctx.db
      .query("alumni")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique()
    if (slugOwner && slugOwner._id !== args.alumniId)
      throw new ConvexError("Alumni slug is already in use")
    const existing = args.alumniId
      ? await ctx.db.get("alumni", args.alumniId)
      : null
    if (args.alumniId && !existing)
      throw new ConvexError("Alumni profile not found")
    const now = Date.now()
    const value = {
      slug,
      name: cleanText(args.name, "Name", 120),
      department: cleanText(args.department, "Department", 100),
      session: cleanText(args.session, "Session", 40),
      batch: cleanText(args.batch, "Batch", 40),
      graduationYear: args.graduationYear,
      currentWorkplace: optionalText(args.currentWorkplace, "Workplace", 300),
      higherStudies: optionalText(args.higherStudies, "Higher studies", 500),
      linkedInUrl: optionalText(args.linkedInUrl, "LinkedIn URL", 500),
      researchInterests: optionalText(
        args.researchInterests,
        "Research interests",
        1_000
      ),
      photoAssetId: args.photoAssetId,
      status: args.status,
      publishedAt:
        args.status === "published"
          ? (existing?.publishedAt ?? now)
          : existing?.publishedAt,
      updatedAt: now,
    }
    const id = existing
      ? (await ctx.db.replace("alumni", existing._id, value), existing._id)
      : await ctx.db.insert("alumni", value)
    if (existing?.status !== "published" && value.status === "published") {
      await adjustCounter(ctx, "alumni.published", 1)
    } else if (
      existing?.status === "published" &&
      value.status !== "published"
    ) {
      await adjustCounter(ctx, "alumni.published", -1)
    }
    await writeAudit(
      ctx,
      actor,
      "alumni.upsert",
      "alumni",
      id,
      `Updated ${value.name}`
    )
    return id
  },
})
