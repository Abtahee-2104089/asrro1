import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server"
import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { requireExecutive, writeAudit } from "./_lib/auth"
import { cleanText, optionalText } from "./_lib/validation"
import { contentPageFields, settingFields } from "./model"

const pageDoc = v.object({
  _id: v.id("contentPages"),
  _creationTime: v.number(),
  ...contentPageFields,
})
const settingDoc = v.object({
  _id: v.id("settings"),
  _creationTime: v.number(),
  ...settingFields,
})

export const getPage = query({
  args: { slug: v.string() },
  returns: v.union(pageDoc, v.null()),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("contentPages")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.trim().toLowerCase()))
      .unique()
    return page?.status === "published" ? page : null
  },
})

export const listPages = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(pageDoc),
  handler: async (ctx, args) =>
    await ctx.db
      .query("contentPages")
      .withIndex("by_status_and_publishedAt", (q) =>
        q.eq("status", "published")
      )
      .order("desc")
      .paginate(args.paginationOpts),
})

export const listPagesAdmin = query({
  args: {},
  returns: v.array(pageDoc),
  handler: async (ctx) => {
    await requireExecutive(ctx)
    const [drafts, published, archived] = await Promise.all([
      ctx.db
        .query("contentPages")
        .withIndex("by_status_and_publishedAt", (q) => q.eq("status", "draft"))
        .order("desc")
        .take(100),
      ctx.db
        .query("contentPages")
        .withIndex("by_status_and_publishedAt", (q) =>
          q.eq("status", "published")
        )
        .order("desc")
        .take(100),
      ctx.db
        .query("contentPages")
        .withIndex("by_status_and_publishedAt", (q) =>
          q.eq("status", "archived")
        )
        .order("desc")
        .take(100),
    ])
    return [...drafts, ...published, ...archived]
  },
})

export const upsertPage = mutation({
  args: {
    pageId: v.optional(v.id("contentPages")),
    slug: v.string(),
    title: v.string(),
    summary: v.optional(v.string()),
    body: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    heroAssetId: v.optional(v.id("assets")),
  },
  returns: v.id("contentPages"),
  handler: async (ctx, args) => {
    const actor = await requireExecutive(ctx)
    const slug = cleanText(args.slug, "Slug", 100).toLowerCase()
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      throw new ConvexError("Invalid page slug")
    const slugOwner = await ctx.db
      .query("contentPages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique()
    if (slugOwner && slugOwner._id !== args.pageId)
      throw new ConvexError("Page slug is already in use")
    const existing = args.pageId
      ? await ctx.db.get("contentPages", args.pageId)
      : null
    if (args.pageId && !existing) throw new ConvexError("Page not found")
    const now = Date.now()
    const value = {
      slug,
      title: cleanText(args.title, "Title", 180),
      summary: optionalText(args.summary, "Summary", 500),
      body: cleanText(args.body, "Body", 100_000),
      status: args.status,
      heroAssetId: args.heroAssetId,
      publishedAt:
        args.status === "published"
          ? (existing?.publishedAt ?? now)
          : existing?.publishedAt,
      updatedAt: now,
      updatedBy: actor._id,
    }
    const id = existing
      ? (await ctx.db.replace("contentPages", existing._id, value),
        existing._id)
      : await ctx.db.insert("contentPages", value)
    await writeAudit(
      ctx,
      actor,
      existing ? "page.update" : "page.create",
      "contentPage",
      id,
      `${existing ? "Updated" : "Created"} ${value.title}`
    )
    return id
  },
})

export const publicSettings = query({
  args: {},
  returns: v.array(settingDoc),
  handler: async (ctx) =>
    await ctx.db
      .query("settings")
      .withIndex("by_isPublic_and_key", (q) => q.eq("isPublic", true))
      .order("asc")
      .take(100),
})

export const publicBranding = query({
  args: {},
  returns: v.object({
    organizationName: v.string(),
    logoUrl: v.union(v.string(), v.null()),
    heroUrl: v.union(v.string(), v.null()),
    primaryColor: v.string(),
    accentColor: v.string(),
    aboutTitle: v.string(),
    aboutCopy: v.string(),
    mission: v.string(),
    vision: v.string(),
    highlightsEnabled: v.boolean(),
  }),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("settings")
      .withIndex("by_isPublic_and_key", (q) => q.eq("isPublic", true))
      .order("asc")
      .take(100)
    const settings = new Map(rows.map((row) => [row.key, row.value]))
    const assetUrl = async (key: string) => {
      const raw = settings.get(key)
      if (!raw) return null
      const assetId = ctx.db.normalizeId("assets", raw)
      if (!assetId) return null
      const asset = await ctx.db.get("assets", assetId)
      return asset?.visibility === "public"
        ? await ctx.storage.getUrl(asset.storageId)
        : null
    }
    const color = (key: string, fallback: string) => {
      const value = settings.get(key)
      return value && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback
    }
    const [logoUrl, heroUrl] = await Promise.all([
      assetUrl("branding.logoassetid"),
      assetUrl("home.heroassetid"),
    ])
    return {
      organizationName:
        settings.get("organization.name") ??
        "Andromeda Space and Robotics Research Organization",
      logoUrl,
      heroUrl,
      primaryColor: color("theme.primary", "#2359d4"),
      accentColor: color("theme.accent", "#00a6b2"),
      aboutTitle:
        settings.get("home.about.title") ??
        "Research becomes credible when curiosity meets discipline.",
      aboutCopy:
        settings.get("home.about.copy") ??
        "ASRRO is CUET’s cross-disciplinary home for students building, testing, documenting, and sharing frontier technology.",
      mission:
        settings.get("home.mission") ??
        "Make frontier research practical, collaborative, and locally meaningful.",
      vision:
        settings.get("home.vision") ??
        "A Bangladesh where student researchers shape the technologies defining our future.",
      highlightsEnabled: settings.get("home.highlights.enabled") !== "false",
    }
  },
})

export const upsertSetting = mutation({
  args: {
    key: v.string(),
    value: v.string(),
    isPublic: v.boolean(),
    description: v.optional(v.string()),
  },
  returns: v.id("settings"),
  handler: async (ctx, args) => {
    const actor = await requireExecutive(ctx)
    const key = cleanText(args.key, "Key", 100).toLowerCase()
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(key))
      throw new ConvexError("Invalid setting key")
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique()
    const value = {
      key,
      value: cleanText(args.value, "Value", 20_000),
      isPublic: args.isPublic,
      description: optionalText(args.description, "Description", 500),
      updatedAt: Date.now(),
      updatedBy: actor._id,
    }
    const id = existing
      ? (await ctx.db.replace("settings", existing._id, value), existing._id)
      : await ctx.db.insert("settings", value)
    await writeAudit(
      ctx,
      actor,
      "setting.upsert",
      "setting",
      id,
      `Updated ${key}`
    )
    return id
  },
})

export const listSettingsAdmin = query({
  args: {},
  returns: v.array(settingDoc),
  handler: async (ctx) => {
    await requireExecutive(ctx)
    const [publicItems, privateItems] = await Promise.all([
      ctx.db
        .query("settings")
        .withIndex("by_isPublic_and_key", (q) => q.eq("isPublic", true))
        .order("asc")
        .take(200),
      ctx.db
        .query("settings")
        .withIndex("by_isPublic_and_key", (q) => q.eq("isPublic", false))
        .order("asc")
        .take(200),
    ])
    return [...publicItems, ...privateItems]
  },
})

export const publicStatistics = query({
  args: {},
  returns: v.object({
    members: v.number(),
    projects: v.number(),
    events: v.number(),
    alumni: v.number(),
    publications: v.number(),
  }),
  handler: async (ctx) => {
    const keys = [
      "members.active",
      "projects.published",
      "events.published",
      "alumni.published",
      "publications.published",
    ]
    const values = await Promise.all(
      keys.map(
        async (key) =>
          await ctx.db
            .query("counters")
            .withIndex("by_key", (q) => q.eq("key", key))
            .unique()
      )
    )
    return {
      members: values[0]?.value ?? 0,
      projects: values[1]?.value ?? 0,
      events: values[2]?.value ?? 0,
      alumni: values[3]?.value ?? 0,
      publications: values[4]?.value ?? 0,
    }
  },
})
