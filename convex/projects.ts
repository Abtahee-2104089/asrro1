import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server"
import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { requireExecutive, writeAudit } from "./_lib/auth"
import { adjustCounter } from "./_lib/counters"
import { cleanText, optionalText } from "./_lib/validation"
import { projectFields, publicationFields } from "./model"

const projectDoc = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  ...projectFields,
})
const teamDoc = v.object({
  _id: v.id("projectMembers"),
  _creationTime: v.number(),
  projectId: v.id("projects"),
  memberId: v.optional(v.id("members")),
  name: v.string(),
  role: v.string(),
  displayOrder: v.number(),
})
const publicationDoc = v.object({
  _id: v.id("publications"),
  _creationTime: v.number(),
  ...publicationFields,
})

export const listPublic = query({
  args: {
    domain: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("completed"),
        v.literal("ongoing"),
        v.literal("research"),
        v.literal("competition"),
        v.literal("industry_collaboration")
      )
    ),
    featured: v.optional(v.boolean()),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(projectDoc),
  handler: async (ctx, args) => {
    if (args.domain !== undefined)
      return await ctx.db
        .query("projects")
        .withIndex("by_status_and_domain_and_publishedAt", (q) =>
          q.eq("status", "published").eq("domain", args.domain!)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    if (args.category !== undefined)
      return await ctx.db
        .query("projects")
        .withIndex("by_status_and_category_and_publishedAt", (q) =>
          q.eq("status", "published").eq("category", args.category!)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    if (args.featured !== undefined)
      return await ctx.db
        .query("projects")
        .withIndex("by_status_and_featured_and_publishedAt", (q) =>
          q.eq("status", "published").eq("featured", args.featured!)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    return await ctx.db
      .query("projects")
      .withIndex("by_status_and_publishedAt", (q) =>
        q.eq("status", "published")
      )
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const getPublicBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      project: projectDoc,
      team: v.array(teamDoc),
      publications: v.array(publicationDoc),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.trim().toLowerCase()))
      .unique()
    if (!project || project.status !== "published") return null
    const [team, publications] = await Promise.all([
      ctx.db
        .query("projectMembers")
        .withIndex("by_projectId_and_displayOrder", (q) =>
          q.eq("projectId", project._id)
        )
        .order("asc")
        .take(100),
      ctx.db
        .query("publications")
        .withIndex("by_projectId_and_status_and_publicationDate", (q) =>
          q.eq("projectId", project._id).eq("status", "published")
        )
        .order("desc")
        .take(100),
    ])
    return {
      project,
      team,
      publications,
    }
  },
})

export const listAdmin = query({
  args: {},
  returns: v.array(projectDoc),
  handler: async (ctx) => {
    await requireExecutive(ctx)
    const [drafts, published, archived] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_status_and_publishedAt", (q) => q.eq("status", "draft"))
        .order("desc")
        .take(100),
      ctx.db
        .query("projects")
        .withIndex("by_status_and_publishedAt", (q) =>
          q.eq("status", "published")
        )
        .order("desc")
        .take(100),
      ctx.db
        .query("projects")
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
    projectId: v.optional(v.id("projects")),
    slug: v.string(),
    title: v.string(),
    summary: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("completed"),
      v.literal("ongoing"),
      v.literal("research"),
      v.literal("competition"),
      v.literal("industry_collaboration")
    ),
    domain: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    projectState: v.union(
      v.literal("planned"),
      v.literal("ongoing"),
      v.literal("completed"),
      v.literal("paused")
    ),
    technologyStack: v.array(v.string()),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    githubUrl: v.optional(v.string()),
    awards: v.optional(v.string()),
    coverAssetId: v.optional(v.id("assets")),
    featured: v.boolean(),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const actor = await requireExecutive(ctx)
    if (args.technologyStack.length > 40)
      throw new ConvexError("Technology stack is limited to 40 entries")
    if (
      args.startedAt !== undefined &&
      args.endedAt !== undefined &&
      args.endedAt < args.startedAt
    )
      throw new ConvexError("Project end date cannot be before start date")
    const slug = cleanText(args.slug, "Slug", 100).toLowerCase()
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      throw new ConvexError("Invalid project slug")
    const slugOwner = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique()
    if (slugOwner && slugOwner._id !== args.projectId)
      throw new ConvexError("Project slug is already in use")
    const existing = args.projectId
      ? await ctx.db.get("projects", args.projectId)
      : null
    if (args.projectId && !existing) throw new ConvexError("Project not found")
    const now = Date.now()
    const value = {
      slug,
      title: cleanText(args.title, "Title", 200),
      summary: cleanText(args.summary, "Summary", 500),
      description: cleanText(args.description, "Description", 50_000),
      category: args.category,
      domain: cleanText(args.domain, "Domain", 80),
      status: args.status,
      projectState: args.projectState,
      technologyStack: args.technologyStack.map((item) =>
        cleanText(item, "Technology", 80)
      ),
      startedAt: args.startedAt,
      endedAt: args.endedAt,
      githubUrl: optionalText(args.githubUrl, "GitHub URL", 500),
      awards: optionalText(args.awards, "Awards", 2_000),
      coverAssetId: args.coverAssetId,
      featured: args.featured,
      publishedAt:
        args.status === "published"
          ? (existing?.publishedAt ?? now)
          : existing?.publishedAt,
      updatedAt: now,
    }
    const id = existing
      ? (await ctx.db.replace("projects", existing._id, value), existing._id)
      : await ctx.db.insert("projects", value)
    if (existing?.status !== "published" && value.status === "published") {
      await adjustCounter(ctx, "projects.published", 1)
    } else if (
      existing?.status === "published" &&
      value.status !== "published"
    ) {
      await adjustCounter(ctx, "projects.published", -1)
    }
    await writeAudit(
      ctx,
      actor,
      "project.upsert",
      "project",
      id,
      `Updated ${value.title}`
    )
    return id
  },
})

export const upsertTeamMember = mutation({
  args: {
    projectMemberId: v.optional(v.id("projectMembers")),
    projectId: v.id("projects"),
    memberId: v.optional(v.id("members")),
    name: v.string(),
    role: v.string(),
    displayOrder: v.number(),
  },
  returns: v.id("projectMembers"),
  handler: async (ctx, args) => {
    const actor = await requireExecutive(ctx)
    if (!(await ctx.db.get("projects", args.projectId)))
      throw new ConvexError("Project not found")
    const existing = args.projectMemberId
      ? await ctx.db.get("projectMembers", args.projectMemberId)
      : null
    if (
      args.projectMemberId &&
      (!existing || existing.projectId !== args.projectId)
    )
      throw new ConvexError("Project team member not found")
    const value = {
      projectId: args.projectId,
      memberId: args.memberId,
      name: cleanText(args.name, "Name", 120),
      role: cleanText(args.role, "Role", 120),
      displayOrder: Math.max(0, Math.floor(args.displayOrder)),
    }
    const id = existing
      ? (await ctx.db.replace("projectMembers", existing._id, value),
        existing._id)
      : await ctx.db.insert("projectMembers", value)
    await writeAudit(
      ctx,
      actor,
      "project.team_upsert",
      "projectMember",
      id,
      `Updated ${value.name}`
    )
    return id
  },
})
