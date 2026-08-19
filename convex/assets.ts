import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server"
import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { hasPermission, requireMember, requirePermission } from "./_lib/auth"
import { cleanText, optionalText } from "./_lib/validation"
import { assetFields, assetKind } from "./model"

const assetDoc = v.object({
  _id: v.id("assets"),
  _creationTime: v.number(),
  ...assetFields,
})

const uploadRules = {
  image: {
    maxBytes: 5 * 1024 * 1024,
    accepts: (contentType: string) => contentType.startsWith("image/"),
  },
  video: {
    maxBytes: 100 * 1024 * 1024,
    accepts: (contentType: string) => contentType.startsWith("video/"),
  },
  pdf: {
    maxBytes: 10 * 1024 * 1024,
    accepts: (contentType: string) => contentType === "application/pdf",
  },
  document: {
    maxBytes: 10 * 1024 * 1024,
    accepts: (contentType: string) =>
      contentType.startsWith("text/") ||
      [
        "application/msword",
        "application/vnd.ms-excel",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/rtf",
        "application/zip",
      ].includes(contentType),
  },
} as const

function validateStoredUpload(
  kind: keyof typeof uploadRules,
  stored: { size: number; contentType?: string }
) {
  const rule = uploadRules[kind]
  if (stored.size > rule.maxBytes) {
    throw new ConvexError(
      `${kind} uploads must be ${Math.round(rule.maxBytes / 1024 / 1024)} MB or smaller`
    )
  }
  if (!stored.contentType || !rule.accepts(stored.contentType)) {
    throw new ConvexError(`Uploaded MIME type does not match ${kind}`)
  }
}

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireMember(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

export const generateApplicationUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
})

export const registerApplicationUpload = mutation({
  args: {
    storageId: v.id("_storage"),
    kind: v.union(v.literal("image"), v.literal("pdf")),
    fileName: v.string(),
  },
  returns: v.id("assets"),
  handler: async (ctx, args) => {
    const stored = await ctx.db.system.get("_storage", args.storageId)
    if (!stored) throw new ConvexError("Uploaded file not found")
    if (stored.size > 5 * 1024 * 1024) {
      throw new ConvexError("Uploads must be 5 MB or smaller")
    }
    const isImage = stored.contentType?.startsWith("image/") ?? false
    const isPdf = stored.contentType === "application/pdf"
    if (
      (args.kind === "image" && !isImage) ||
      (args.kind === "pdf" && !isPdf)
    ) {
      throw new ConvexError("Uploaded file type does not match the form")
    }
    const existing = await ctx.db
      .query("assets")
      .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
      .unique()
    if (existing) return existing._id
    return await ctx.db.insert("assets", {
      storageId: args.storageId,
      kind: args.kind,
      fileName: cleanText(args.fileName, "File name", 200),
      contentType: stored.contentType,
      size: stored.size,
      visibility: "private",
      createdAt: Date.now(),
    })
  },
})

export const registerUpload = mutation({
  args: {
    storageId: v.id("_storage"),
    kind: assetKind,
    fileName: v.string(),
    altText: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("private")),
  },
  returns: v.id("assets"),
  handler: async (ctx, args) => {
    const member = await requireMember(ctx)
    const stored = await ctx.db.system.get("_storage", args.storageId)
    if (!stored) throw new ConvexError("Uploaded file not found")
    validateStoredUpload(args.kind, stored)
    if (
      args.visibility === "public" &&
      !hasPermission(member, "files_manage")
    ) {
      throw new ConvexError(
        "File management permission is required for public uploads"
      )
    }
    const existing = await ctx.db
      .query("assets")
      .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
      .unique()
    if (existing) {
      if (existing.ownerMemberId !== member._id) {
        throw new ConvexError("This uploaded file belongs to another member")
      }
      return existing._id
    }
    return await ctx.db.insert("assets", {
      storageId: args.storageId,
      kind: args.kind,
      fileName: cleanText(args.fileName, "File name", 200),
      contentType: stored.contentType,
      size: stored.size,
      altText: optionalText(args.altText, "Alt text", 300),
      ownerMemberId: member._id,
      visibility: args.visibility,
      createdAt: Date.now(),
    })
  },
})

export const getPublicUrl = query({
  args: { assetId: v.id("assets") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const asset = await ctx.db.get("assets", args.assetId)
    if (!asset || asset.visibility !== "public") return null
    return await ctx.storage.getUrl(asset.storageId)
  },
})

export const getOwnedUrl = query({
  args: { assetId: v.id("assets") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const member = await requireMember(ctx)
    const asset = await ctx.db.get("assets", args.assetId)
    if (!asset) return null
    if (
      asset.ownerMemberId !== member._id &&
      !hasPermission(member, "files_manage")
    ) {
      throw new ConvexError("You do not own this file")
    }
    return await ctx.storage.getUrl(asset.storageId)
  },
})

export const deleteOwned = mutation({
  args: { assetId: v.id("assets") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const member = await requireMember(ctx)
    const asset = await ctx.db.get("assets", args.assetId)
    if (!asset) return null
    if (
      asset.ownerMemberId !== member._id &&
      !hasPermission(member, "files_manage")
    ) {
      throw new ConvexError("You do not own this file")
    }
    await ctx.storage.delete(asset.storageId)
    await ctx.db.delete("assets", asset._id)
    return null
  },
})

export const listAdmin = query({
  args: {
    visibility: v.union(v.literal("public"), v.literal("private")),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(assetDoc),
  handler: async (ctx, args) => {
    await requirePermission(ctx, "files_manage")
    return await ctx.db
      .query("assets")
      .withIndex("by_visibility_and_createdAt", (q) =>
        q.eq("visibility", args.visibility)
      )
      .order("desc")
      .paginate(args.paginationOpts)
  },
})
