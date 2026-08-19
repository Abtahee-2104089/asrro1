import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server"
import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { requireExecutive, writeAudit } from "./_lib/auth"
import { adjustCounter } from "./_lib/counters"
import { cleanText, optionalText } from "./_lib/validation"
import { publicationFields } from "./model"

const publicationDoc = v.object({
  _id: v.id("publications"),
  _creationTime: v.number(),
  ...publicationFields,
})
const publicationType = v.union(
  v.literal("research_paper"),
  v.literal("magazine"),
  v.literal("report"),
  v.literal("annual_publication")
)

export const listPublic = query({
  args: {
    type: v.optional(publicationType),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(publicationDoc),
  handler: async (ctx, args) =>
    args.type !== undefined
      ? await ctx.db
          .query("publications")
          .withIndex("by_status_and_type_and_publicationDate", (q) =>
            q.eq("status", "published").eq("type", args.type!)
          )
          .order("desc")
          .paginate(args.paginationOpts)
      : await ctx.db
          .query("publications")
          .withIndex("by_status_and_publicationDate", (q) =>
            q.eq("status", "published")
          )
          .order("desc")
          .paginate(args.paginationOpts),
})

export const getPublicBySlug = query({
  args: { slug: v.string() },
  returns: v.union(publicationDoc, v.null()),
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("publications")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.trim().toLowerCase()))
      .unique()
    return item?.status === "published" ? item : null
  },
})

const publicPublicationCard = v.object({
  publication: publicationDoc,
  downloadUrl: v.union(v.string(), v.null()),
})

export const listPublicCards = query({
  args: { type: v.optional(publicationType) },
  returns: v.array(publicPublicationCard),
  handler: async (ctx, args) => {
    const publications = args.type
      ? await ctx.db
          .query("publications")
          .withIndex("by_status_and_type_and_publicationDate", (q) =>
            q.eq("status", "published").eq("type", args.type!)
          )
          .order("desc")
          .take(100)
      : await ctx.db
          .query("publications")
          .withIndex("by_status_and_publicationDate", (q) =>
            q.eq("status", "published")
          )
          .order("desc")
          .take(100)
    return await Promise.all(
      publications.map(async (publication) => {
        const asset = publication.assetId
          ? await ctx.db.get("assets", publication.assetId)
          : null
        return {
          publication,
          downloadUrl:
            asset?.visibility === "public"
              ? await ctx.storage.getUrl(asset.storageId)
              : null,
        }
      })
    )
  },
})

export const listAdmin = query({
  args: {},
  returns: v.array(publicationDoc),
  handler: async (ctx) => {
    await requireExecutive(ctx)
    const [drafts, published, archived] = await Promise.all([
      ctx.db
        .query("publications")
        .withIndex("by_status_and_publicationDate", (q) =>
          q.eq("status", "draft")
        )
        .order("desc")
        .take(100),
      ctx.db
        .query("publications")
        .withIndex("by_status_and_publicationDate", (q) =>
          q.eq("status", "published")
        )
        .order("desc")
        .take(100),
      ctx.db
        .query("publications")
        .withIndex("by_status_and_publicationDate", (q) =>
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
    publicationId: v.optional(v.id("publications")),
    slug: v.string(),
    title: v.string(),
    abstract: v.string(),
    type: publicationType,
    authors: v.array(v.string()),
    publicationDate: v.number(),
    externalUrl: v.optional(v.string()),
    assetId: v.optional(v.id("assets")),
    projectId: v.optional(v.id("projects")),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    featured: v.boolean(),
  },
  returns: v.id("publications"),
  handler: async (ctx, args) => {
    const actor = await requireExecutive(ctx)
    if (args.authors.length === 0 || args.authors.length > 50)
      throw new ConvexError("Authors must contain 1-50 entries")
    const slug = cleanText(args.slug, "Slug", 100).toLowerCase()
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      throw new ConvexError("Invalid publication slug")
    const slugOwner = await ctx.db
      .query("publications")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique()
    if (slugOwner && slugOwner._id !== args.publicationId)
      throw new ConvexError("Publication slug is already in use")
    const existing = args.publicationId
      ? await ctx.db.get("publications", args.publicationId)
      : null
    if (args.publicationId && !existing)
      throw new ConvexError("Publication not found")
    const now = Date.now()
    const value = {
      slug,
      title: cleanText(args.title, "Title", 250),
      abstract: cleanText(args.abstract, "Abstract", 10_000),
      type: args.type,
      authors: args.authors.map((author) => cleanText(author, "Author", 120)),
      publicationDate: args.publicationDate,
      externalUrl: optionalText(args.externalUrl, "External URL", 500),
      assetId: args.assetId,
      projectId: args.projectId,
      status: args.status,
      featured: args.featured,
      publishedAt:
        args.status === "published"
          ? (existing?.publishedAt ?? now)
          : existing?.publishedAt,
      updatedAt: now,
    }
    const id = existing
      ? (await ctx.db.replace("publications", existing._id, value),
        existing._id)
      : await ctx.db.insert("publications", value)
    if (existing?.status !== "published" && value.status === "published") {
      await adjustCounter(ctx, "publications.published", 1)
    } else if (
      existing?.status === "published" &&
      value.status !== "published"
    ) {
      await adjustCounter(ctx, "publications.published", -1)
    }
    await writeAudit(
      ctx,
      actor,
      "publication.upsert",
      "publication",
      id,
      `Updated ${value.title}`
    )
    return id
  },
})
