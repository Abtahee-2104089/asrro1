import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server"
import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { requireExecutive, writeAudit } from "./_lib/auth"
import { cleanText, optionalText } from "./_lib/validation"
import { galleryAlbumFields, galleryItemFields } from "./model"

const albumDoc = v.object({
  _id: v.id("galleryAlbums"),
  _creationTime: v.number(),
  ...galleryAlbumFields,
})
const itemDoc = v.object({
  _id: v.id("galleryItems"),
  _creationTime: v.number(),
  ...galleryItemFields,
})
const albumCard = v.object({
  album: albumDoc,
  coverUrl: v.union(v.string(), v.null()),
  imageCount: v.number(),
  videoCount: v.number(),
  videoUrl: v.union(v.string(), v.null()),
  event: v.union(v.object({ slug: v.string(), name: v.string() }), v.null()),
})

export const listPublicAlbums = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(albumDoc),
  handler: async (ctx, args) =>
    await ctx.db
      .query("galleryAlbums")
      .withIndex("by_status_and_occurredAt", (q) => q.eq("status", "published"))
      .order("desc")
      .paginate(args.paginationOpts),
})

export const getPublicAlbum = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      album: albumDoc,
      items: v.array(
        v.object({
          item: itemDoc,
          url: v.union(v.string(), v.null()),
          kind: v.union(v.literal("image"), v.literal("video")),
        })
      ),
      event: v.union(
        v.object({ slug: v.string(), name: v.string() }),
        v.null()
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const album = await ctx.db
      .query("galleryAlbums")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.trim().toLowerCase()))
      .unique()
    if (!album || album.status !== "published") return null
    const rows = await ctx.db
      .query("galleryItems")
      .withIndex("by_albumId_and_isPublic_and_displayOrder", (q) =>
        q.eq("albumId", album._id).eq("isPublic", true)
      )
      .order("asc")
      .take(500)
    const items = await Promise.all(
      rows.map(async (item) => {
        const asset = await ctx.db.get("assets", item.assetId)
        return {
          item,
          url:
            asset?.visibility === "public"
              ? await ctx.storage.getUrl(asset.storageId)
              : null,
          kind:
            asset?.kind === "video" ? ("video" as const) : ("image" as const),
        }
      })
    )
    const event = album.eventId
      ? await ctx.db.get("events", album.eventId)
      : null
    return {
      album,
      items,
      event: event ? { slug: event.slug, name: event.name } : null,
    }
  },
})

export const listPublicCards = query({
  args: {},
  returns: v.array(albumCard),
  handler: async (ctx) => {
    const albums = await ctx.db
      .query("galleryAlbums")
      .withIndex("by_status_and_occurredAt", (q) => q.eq("status", "published"))
      .order("desc")
      .take(100)
    return await Promise.all(
      albums.map(async (album) => {
        const items = await ctx.db
          .query("galleryItems")
          .withIndex("by_albumId_and_isPublic_and_displayOrder", (q) =>
            q.eq("albumId", album._id).eq("isPublic", true)
          )
          .order("asc")
          .take(500)
        const assets = await Promise.all(
          items.map(async (item) => await ctx.db.get("assets", item.assetId))
        )
        const cover = album.coverAssetId
          ? await ctx.db.get("assets", album.coverAssetId)
          : assets.find((asset) => asset?.kind === "image")
        const video = assets.find((asset) => asset?.kind === "video")
        const event = album.eventId
          ? await ctx.db.get("events", album.eventId)
          : null
        return {
          album,
          coverUrl:
            cover?.visibility === "public"
              ? await ctx.storage.getUrl(cover.storageId)
              : null,
          imageCount: assets.filter((asset) => asset?.kind === "image").length,
          videoCount: assets.filter((asset) => asset?.kind === "video").length,
          videoUrl:
            video?.visibility === "public"
              ? await ctx.storage.getUrl(video.storageId)
              : null,
          event: event ? { slug: event.slug, name: event.name } : null,
        }
      })
    )
  },
})

export const listAdmin = query({
  args: {},
  returns: v.array(albumDoc),
  handler: async (ctx) => {
    await requireExecutive(ctx)
    const [drafts, published, archived] = await Promise.all([
      ctx.db
        .query("galleryAlbums")
        .withIndex("by_status_and_occurredAt", (q) => q.eq("status", "draft"))
        .order("desc")
        .take(100),
      ctx.db
        .query("galleryAlbums")
        .withIndex("by_status_and_occurredAt", (q) =>
          q.eq("status", "published")
        )
        .order("desc")
        .take(100),
      ctx.db
        .query("galleryAlbums")
        .withIndex("by_status_and_occurredAt", (q) =>
          q.eq("status", "archived")
        )
        .order("desc")
        .take(100),
    ])
    return [...drafts, ...published, ...archived]
  },
})

export const upsertAlbum = mutation({
  args: {
    albumId: v.optional(v.id("galleryAlbums")),
    slug: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    eventId: v.optional(v.id("events")),
    coverAssetId: v.optional(v.id("assets")),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    occurredAt: v.number(),
  },
  returns: v.id("galleryAlbums"),
  handler: async (ctx, args) => {
    const actor = await requireExecutive(ctx)
    const slug = cleanText(args.slug, "Slug", 100).toLowerCase()
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      throw new ConvexError("Invalid album slug")
    const owner = await ctx.db
      .query("galleryAlbums")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique()
    if (owner && owner._id !== args.albumId)
      throw new ConvexError("Album slug is already in use")
    const existing = args.albumId
      ? await ctx.db.get("galleryAlbums", args.albumId)
      : null
    if (args.albumId && !existing) throw new ConvexError("Album not found")
    const value = {
      slug,
      title: cleanText(args.title, "Title", 180),
      description: optionalText(args.description, "Description", 2_000),
      eventId: args.eventId,
      coverAssetId: args.coverAssetId,
      status: args.status,
      occurredAt: args.occurredAt,
      publishedAt:
        args.status === "published"
          ? (existing?.publishedAt ?? Date.now())
          : existing?.publishedAt,
    }
    const id = existing
      ? (await ctx.db.replace("galleryAlbums", existing._id, value),
        existing._id)
      : await ctx.db.insert("galleryAlbums", value)
    await writeAudit(
      ctx,
      actor,
      "gallery.album_upsert",
      "galleryAlbum",
      id,
      `Updated ${value.title}`
    )
    return id
  },
})

export const upsertItem = mutation({
  args: {
    galleryItemId: v.optional(v.id("galleryItems")),
    albumId: v.id("galleryAlbums"),
    assetId: v.id("assets"),
    caption: v.optional(v.string()),
    displayOrder: v.number(),
    isPublic: v.boolean(),
  },
  returns: v.id("galleryItems"),
  handler: async (ctx, args) => {
    const actor = await requireExecutive(ctx)
    if (!(await ctx.db.get("galleryAlbums", args.albumId)))
      throw new ConvexError("Album not found")
    if (!(await ctx.db.get("assets", args.assetId)))
      throw new ConvexError("Asset not found")
    const existing = args.galleryItemId
      ? await ctx.db.get("galleryItems", args.galleryItemId)
      : null
    if (args.galleryItemId && !existing)
      throw new ConvexError("Gallery item not found")
    const value = {
      albumId: args.albumId,
      assetId: args.assetId,
      caption: optionalText(args.caption, "Caption", 500),
      displayOrder: Math.max(0, Math.floor(args.displayOrder)),
      isPublic: args.isPublic,
    }
    const id = existing
      ? (await ctx.db.replace("galleryItems", existing._id, value),
        existing._id)
      : await ctx.db.insert("galleryItems", value)
    await writeAudit(
      ctx,
      actor,
      "gallery.item_upsert",
      "galleryItem",
      id,
      "Updated gallery item"
    )
    return id
  },
})
