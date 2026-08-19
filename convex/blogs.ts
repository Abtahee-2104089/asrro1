import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server"
import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { requireExecutive, writeAudit } from "./_lib/auth"
import { cleanText, normalizeEmail } from "./_lib/validation"
import { blogCommentFields, blogFields } from "./model"

const blogDoc = v.object({
  _id: v.id("blogs"),
  _creationTime: v.number(),
  ...blogFields,
})
const commentDoc = v.object({
  _id: v.id("blogComments"),
  _creationTime: v.number(),
  ...blogCommentFields,
})

export const listPublic = query({
  args: {
    category: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(blogDoc),
  handler: async (ctx, args) => {
    if (args.category !== undefined)
      return await ctx.db
        .query("blogs")
        .withIndex("by_status_and_category_and_publishedAt", (q) =>
          q.eq("status", "published").eq("category", args.category!)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    if (args.featured !== undefined)
      return await ctx.db
        .query("blogs")
        .withIndex("by_status_and_featured_and_publishedAt", (q) =>
          q.eq("status", "published").eq("featured", args.featured!)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    return await ctx.db
      .query("blogs")
      .withIndex("by_status_and_publishedAt", (q) =>
        q.eq("status", "published")
      )
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const searchPublic = query({
  args: {
    search: v.string(),
    category: v.optional(v.string()),
    limit: v.number(),
  },
  returns: v.array(blogDoc),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(50, Math.floor(args.limit)))
    const search = cleanText(args.search, "Search", 200)
    return args.category !== undefined
      ? await ctx.db
          .query("blogs")
          .withSearchIndex("search_public_blogs", (q) =>
            q
              .search("title", search)
              .eq("status", "published")
              .eq("category", args.category!)
          )
          .take(limit)
      : await ctx.db
          .query("blogs")
          .withSearchIndex("search_public_blogs", (q) =>
            q.search("title", search).eq("status", "published")
          )
          .take(limit)
  },
})

export const getPublicBySlug = query({
  args: { slug: v.string() },
  returns: v.union(blogDoc, v.null()),
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("blogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.trim().toLowerCase()))
      .unique()
    return item?.status === "published" ? item : null
  },
})

export const listComments = query({
  args: { blogId: v.id("blogs") },
  returns: v.array(commentDoc),
  handler: async (ctx, args) => {
    const blog = await ctx.db.get("blogs", args.blogId)
    if (!blog || blog.status !== "published") return []
    return await ctx.db
      .query("blogComments")
      .withIndex("by_blogId_and_status_and_createdAt", (q) =>
        q.eq("blogId", args.blogId).eq("status", "approved")
      )
      .order("desc")
      .take(100)
  },
})

export const submitComment = mutation({
  args: {
    blogId: v.id("blogs"),
    name: v.string(),
    email: v.string(),
    body: v.string(),
    website: v.optional(v.string()),
  },
  returns: v.object({ status: v.literal("pending") }),
  handler: async (ctx, args) => {
    const blog = await ctx.db.get("blogs", args.blogId)
    if (!blog || blog.status !== "published")
      throw new ConvexError("Article not found")
    if (args.website?.trim()) return { status: "pending" as const }
    const emailNormalized = normalizeEmail(args.email)
    const latest = await ctx.db
      .query("blogComments")
      .withIndex("by_emailNormalized_and_createdAt", (q) =>
        q.eq("emailNormalized", emailNormalized)
      )
      .order("desc")
      .first()
    const now = Date.now()
    if (latest && now - latest.createdAt < 60_000)
      throw new ConvexError("Please wait before sending another comment")
    await ctx.db.insert("blogComments", {
      blogId: args.blogId,
      name: cleanText(args.name, "Name", 120),
      emailNormalized,
      body: cleanText(args.body, "Comment", 2_000),
      status: "pending",
      createdAt: now,
    })
    return { status: "pending" as const }
  },
})

export const listCommentsAdmin = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("spam")
    ),
  },
  returns: v.array(commentDoc),
  handler: async (ctx, args) => {
    await requireExecutive(ctx)
    return await ctx.db
      .query("blogComments")
      .withIndex("by_status_and_createdAt", (q) => q.eq("status", args.status))
      .order("desc")
      .take(200)
  },
})

export const moderateComment = mutation({
  args: {
    commentId: v.id("blogComments"),
    status: v.union(v.literal("approved"), v.literal("spam")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const actor = await requireExecutive(ctx)
    const comment = await ctx.db.get("blogComments", args.commentId)
    if (!comment) throw new ConvexError("Comment not found")
    await ctx.db.patch("blogComments", comment._id, {
      status: args.status,
      moderatedAt: Date.now(),
      moderatedBy: actor._id,
    })
    await writeAudit(
      ctx,
      actor,
      "blog.comment_moderate",
      "blogComment",
      comment._id,
      `Marked comment ${args.status}`
    )
    return null
  },
})

export const listAdmin = query({
  args: {},
  returns: v.array(blogDoc),
  handler: async (ctx) => {
    await requireExecutive(ctx)
    const [drafts, published, archived] = await Promise.all([
      ctx.db
        .query("blogs")
        .withIndex("by_status_and_publishedAt", (q) => q.eq("status", "draft"))
        .order("desc")
        .take(100),
      ctx.db
        .query("blogs")
        .withIndex("by_status_and_publishedAt", (q) =>
          q.eq("status", "published")
        )
        .order("desc")
        .take(100),
      ctx.db
        .query("blogs")
        .withIndex("by_status_and_publishedAt", (q) =>
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
    blogId: v.optional(v.id("blogs")),
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    authorName: v.string(),
    authorMemberId: v.optional(v.id("members")),
    coverAssetId: v.optional(v.id("assets")),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    featured: v.boolean(),
  },
  returns: v.id("blogs"),
  handler: async (ctx, args) => {
    const actor = await requireExecutive(ctx)
    if (args.tags.length > 30)
      throw new ConvexError("Tags are limited to 30 entries")
    const slug = cleanText(args.slug, "Slug", 100).toLowerCase()
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      throw new ConvexError("Invalid blog slug")
    const slugOwner = await ctx.db
      .query("blogs")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique()
    if (slugOwner && slugOwner._id !== args.blogId)
      throw new ConvexError("Blog slug is already in use")
    const existing = args.blogId ? await ctx.db.get("blogs", args.blogId) : null
    if (args.blogId && !existing) throw new ConvexError("Blog post not found")
    const now = Date.now()
    const value = {
      slug,
      title: cleanText(args.title, "Title", 220),
      excerpt: cleanText(args.excerpt, "Excerpt", 600),
      body: cleanText(args.body, "Body", 100_000),
      category: cleanText(args.category, "Category", 80),
      tags: args.tags.map((tag) => cleanText(tag, "Tag", 60)),
      authorName: cleanText(args.authorName, "Author name", 120),
      authorMemberId: args.authorMemberId,
      coverAssetId: args.coverAssetId,
      status: args.status,
      featured: args.featured,
      publishedAt:
        args.status === "published"
          ? (existing?.publishedAt ?? now)
          : existing?.publishedAt,
      updatedAt: now,
    }
    const id = existing
      ? (await ctx.db.replace("blogs", existing._id, value), existing._id)
      : await ctx.db.insert("blogs", value)
    await writeAudit(
      ctx,
      actor,
      "blog.upsert",
      "blog",
      id,
      `Updated ${value.title}`
    )
    return id
  },
})
