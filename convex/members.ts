import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server"
import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"
import {
  currentMember,
  effectivePermissions,
  requirePermission,
  requireMember,
  requireSuperAdmin,
  writeAudit,
} from "./_lib/auth"
import { defaultUuidMapping } from "./_lib/uuid"
import {
  cleanText,
  hashSecret,
  normalizeEmail,
  optionalText,
} from "./_lib/validation"
import {
  executivePosition,
  memberFields,
  memberStatus,
  portalPermission,
} from "./model"

const memberDoc = v.object({
  _id: v.id("members"),
  _creationTime: v.number(),
  ...memberFields,
})
const memberSelf = v.object({
  _id: v.id("members"),
  uuid: v.string(),
  fullName: v.string(),
  email: v.string(),
  phone: v.string(),
  department: v.string(),
  hscBatch: v.string(),
  studentId: v.string(),
  institute: v.string(),
  dateOfBirth: v.optional(v.string()),
  bloodGroup: v.optional(v.string()),
  profileAssetId: v.optional(v.id("assets")),
  profileImageUrl: v.optional(v.string()),
  address: v.optional(v.string()),
  emergencyContact: v.optional(v.string()),
  status: v.union(
    v.literal("pending"),
    v.literal("active"),
    v.literal("suspended"),
    v.literal("alumni"),
    v.literal("rejected")
  ),
  systemRole: v.union(
    v.literal("member"),
    v.literal("executive"),
    v.literal("super_admin")
  ),
  executivePosition: v.optional(executivePosition),
  permissions: v.array(portalPermission),
  joinedAt: v.number(),
  membershipValidUntil: v.optional(v.number()),
})

const membershipCredential = v.object({
  uuid: v.string(),
  fullName: v.string(),
  department: v.string(),
  hscBatch: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("active"),
    v.literal("suspended"),
    v.literal("alumni"),
    v.literal("rejected")
  ),
  joinedAt: v.number(),
  membershipValidUntil: v.optional(v.number()),
  profileImageUrl: v.optional(v.string()),
  galaxyName: v.optional(v.string()),
  starName: v.optional(v.string()),
  receipt: v.optional(
    v.object({
      id: v.string(),
      applicationCode: v.string(),
      amount: v.number(),
      currency: v.string(),
      paidAt: v.number(),
      paymentMethod: v.union(
        v.literal("bkash"),
        v.literal("nagad"),
        v.literal("rocket")
      ),
      transactionId: v.string(),
      paymentProofUrl: v.optional(v.string()),
    })
  ),
})

async function presentMember(
  ctx: Parameters<typeof currentMember>[0],
  member: Doc<"members">
) {
  const profileAsset = member.profileAssetId
    ? await ctx.db.get("assets", member.profileAssetId)
    : null
  const profileImageUrl = profileAsset
    ? ((await ctx.storage.getUrl(profileAsset.storageId)) ?? undefined)
    : undefined
  return {
    _id: member._id,
    uuid: member.uuid,
    fullName: member.fullName,
    email: member.email,
    phone: member.phone,
    department: member.department,
    hscBatch: member.hscBatch,
    studentId: member.studentId,
    institute: member.institute,
    dateOfBirth: member.dateOfBirth,
    bloodGroup: member.bloodGroup,
    profileAssetId: member.profileAssetId,
    profileImageUrl,
    address: member.address,
    emergencyContact: member.emergencyContact,
    status: member.status,
    systemRole: member.systemRole,
    executivePosition: member.executivePosition,
    permissions: effectivePermissions(member),
    joinedAt: member.joinedAt,
    membershipValidUntil: member.membershipValidUntil,
  }
}

export const me = query({
  args: {},
  returns: v.union(memberSelf, v.null()),
  handler: async (ctx) => {
    const member = await currentMember(ctx)
    return member ? await presentMember(ctx, member) : null
  },
})

export const myMembership = query({
  args: {},
  returns: membershipCredential,
  handler: async (ctx) => {
    const member = await requireMember(ctx)
    const mapping = await ctx.db
      .query("uuidMappings")
      .withIndex("by_hscBatch_and_department", (q) =>
        q
          .eq("hscBatch", member.hscBatch)
          .eq("department", member.department.toLowerCase())
      )
      .unique()
    const fallbackMapping = defaultUuidMapping(
      member.hscBatch,
      member.department
    )
    const application = member.applicationId
      ? await ctx.db.get("membershipApplications", member.applicationId)
      : null
    const paymentAsset = application?.paymentAssetId
      ? await ctx.db.get("assets", application.paymentAssetId)
      : null
    const paymentProofUrl = paymentAsset
      ? ((await ctx.storage.getUrl(paymentAsset.storageId)) ?? undefined)
      : undefined
    const profileAsset = member.profileAssetId
      ? await ctx.db.get("assets", member.profileAssetId)
      : null
    const profileImageUrl = profileAsset
      ? ((await ctx.storage.getUrl(profileAsset.storageId)) ?? undefined)
      : undefined

    return {
      uuid: member.uuid,
      fullName: member.fullName,
      department: member.department,
      hscBatch: member.hscBatch,
      status: member.status,
      joinedAt: member.joinedAt,
      membershipValidUntil: member.membershipValidUntil,
      profileImageUrl,
      galaxyName: mapping?.galaxyName ?? fallbackMapping?.galaxyName,
      starName: mapping?.starName ?? fallbackMapping?.starName,
      receipt:
        application &&
        application.amountPaid !== undefined &&
        application.currency
          ? {
              id: `RCPT-${application.applicationCode}`,
              applicationCode: application.applicationCode,
              amount: application.amountPaid,
              currency: application.currency,
              paidAt: application.submittedAt,
              paymentMethod: application.paymentMethod,
              transactionId: application.transactionId,
              paymentProofUrl,
            }
          : undefined,
    }
  },
})

export const verifyMembership = query({
  args: { uuid: v.string() },
  returns: v.union(
    v.object({
      uuid: v.string(),
      fullName: v.string(),
      department: v.string(),
      hscBatch: v.string(),
      status: v.union(
        v.literal("active"),
        v.literal("suspended"),
        v.literal("alumni")
      ),
      joinedAt: v.number(),
      membershipValidUntil: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("members")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid.trim().toUpperCase()))
      .unique()
    if (
      !member ||
      (member.status !== "active" &&
        member.status !== "suspended" &&
        member.status !== "alumni")
    ) {
      return null
    }
    return {
      uuid: member.uuid,
      fullName: member.fullName,
      department: member.department,
      hscBatch: member.hscBatch,
      status: member.status,
      joinedAt: member.joinedAt,
      membershipValidUntil: member.membershipValidUntil,
    }
  },
})

export const updateMyProfile = mutation({
  args: {
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    profileAssetId: v.optional(v.id("assets")),
  },
  returns: memberSelf,
  handler: async (ctx, args) => {
    const member = await requireMember(ctx)
    const patch: {
      fullName?: string
      phone?: string
      email?: string
      emailNormalized?: string
      address?: string
      emergencyContact?: string
      profileAssetId?: typeof args.profileAssetId
      updatedAt: number
    } = { updatedAt: Date.now() }
    if (args.fullName !== undefined)
      patch.fullName = cleanText(args.fullName, "Full name", 120)
    if (args.phone !== undefined)
      patch.phone = cleanText(args.phone, "Phone", 30)
    if (args.address !== undefined)
      patch.address = optionalText(args.address, "Address", 500)
    if (args.emergencyContact !== undefined)
      patch.emergencyContact = optionalText(
        args.emergencyContact,
        "Emergency contact",
        80
      )
    if (args.profileAssetId !== undefined)
      patch.profileAssetId = args.profileAssetId
    if (args.email !== undefined) {
      const emailNormalized = normalizeEmail(args.email)
      const duplicate = await ctx.db
        .query("members")
        .withIndex("by_emailNormalized", (q) =>
          q.eq("emailNormalized", emailNormalized)
        )
        .unique()
      if (duplicate && duplicate._id !== member._id)
        throw new ConvexError("Email address is already in use")
      patch.email = emailNormalized
      patch.emailNormalized = emailNormalized
    }
    await ctx.db.patch("members", member._id, patch)
    const updated = await ctx.db.get("members", member._id)
    if (!updated) throw new ConvexError("Member not found after update")
    return await presentMember(ctx, updated)
  },
})

export const list = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("suspended"),
      v.literal("alumni"),
      v.literal("rejected")
    ),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(memberDoc),
  handler: async (ctx, args) => {
    await requirePermission(ctx, "membership_manage")
    return await ctx.db
      .query("members")
      .withIndex("by_status_and_joinedAt", (q) => q.eq("status", args.status))
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const getByUuid = query({
  args: { uuid: v.string() },
  returns: v.union(memberDoc, v.null()),
  handler: async (ctx, args) => {
    await requirePermission(ctx, "membership_manage")
    return await ctx.db
      .query("members")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid.trim().toUpperCase()))
      .unique()
  },
})

export const setStatus = mutation({
  args: {
    memberId: v.id("members"),
    status: v.union(
      v.literal("active"),
      v.literal("suspended"),
      v.literal("alumni")
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const actor = await requirePermission(ctx, "membership_manage")
    const member = await ctx.db.get("members", args.memberId)
    if (!member) throw new ConvexError("Member not found")
    if (
      member.systemRole === "super_admin" &&
      actor.systemRole !== "super_admin"
    ) {
      throw new ConvexError(
        "Only a super administrator may change this account"
      )
    }
    await ctx.db.patch("members", member._id, {
      status: args.status,
      updatedAt: Date.now(),
    })
    await writeAudit(
      ctx,
      actor,
      "member.status",
      "member",
      member._id,
      `Changed ${member.uuid} to ${args.status}`
    )
    return null
  },
})

export const setRole = mutation({
  args: {
    memberId: v.id("members"),
    systemRole: v.union(
      v.literal("member"),
      v.literal("executive"),
      v.literal("super_admin")
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const actor = await requireSuperAdmin(ctx)
    const member = await ctx.db.get("members", args.memberId)
    if (!member) throw new ConvexError("Member not found")
    await ctx.db.patch("members", member._id, {
      systemRole: args.systemRole,
      executivePosition:
        args.systemRole === "executive" ? member.executivePosition : undefined,
      permissions:
        args.systemRole === "executive" ? member.permissions : undefined,
      updatedAt: Date.now(),
    })
    await writeAudit(
      ctx,
      actor,
      "member.role",
      "member",
      member._id,
      `Changed ${member.uuid} role to ${args.systemRole}`
    )
    return null
  },
})

export const setExecutiveAccess = mutation({
  args: {
    memberId: v.id("members"),
    executivePosition,
    permissions: v.array(portalPermission),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const actor = await requireSuperAdmin(ctx)
    const member = await ctx.db.get("members", args.memberId)
    if (!member) throw new ConvexError("Member not found")
    if (args.permissions.length > 10) {
      throw new ConvexError("Too many permissions were selected")
    }
    await ctx.db.patch("members", member._id, {
      systemRole: "executive",
      executivePosition: args.executivePosition,
      permissions: [...new Set(args.permissions)],
      updatedAt: Date.now(),
    })
    await writeAudit(
      ctx,
      actor,
      "member.executive_access",
      "member",
      member._id,
      `Assigned ${args.executivePosition} with ${args.permissions.length} permissions`
    )
    return null
  },
})

export const searchAdmin = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(memberStatus),
    department: v.optional(v.string()),
  },
  returns: v.array(memberDoc),
  handler: async (ctx, args) => {
    await requirePermission(ctx, "membership_manage")
    const search = args.search?.trim()
    let rows
    if (search && args.status && args.department) {
      rows = await ctx.db
        .query("members")
        .withSearchIndex("search_members", (q) =>
          q
            .search("fullName", search)
            .eq("status", args.status!)
            .eq("department", args.department!)
        )
        .take(100)
    } else if (search && args.status) {
      rows = await ctx.db
        .query("members")
        .withSearchIndex("search_members", (q) =>
          q.search("fullName", search).eq("status", args.status!)
        )
        .take(100)
    } else if (search && args.department) {
      rows = await ctx.db
        .query("members")
        .withSearchIndex("search_members", (q) =>
          q.search("fullName", search).eq("department", args.department!)
        )
        .take(100)
    } else if (search) {
      rows = await ctx.db
        .query("members")
        .withSearchIndex("search_members", (q) => q.search("fullName", search))
        .take(100)
    } else if (args.status) {
      rows = await ctx.db
        .query("members")
        .withIndex("by_status_and_joinedAt", (q) =>
          q.eq("status", args.status!)
        )
        .order("desc")
        .take(100)
    } else if (args.department) {
      rows = await ctx.db
        .query("members")
        .withIndex("by_department_and_joinedAt", (q) =>
          q.eq("department", args.department!)
        )
        .order("desc")
        .take(100)
    } else {
      rows = await ctx.db.query("members").order("desc").take(100)
    }
    return args.department && !search && args.status
      ? rows.filter((row) => row.department === args.department)
      : rows
  },
})

export const adminUpdate = mutation({
  args: {
    memberId: v.id("members"),
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    department: v.optional(v.string()),
    hscBatch: v.optional(v.string()),
    studentId: v.optional(v.string()),
    institute: v.optional(v.string()),
    membershipValidUntil: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const actor = await requirePermission(ctx, "membership_manage")
    const member = await ctx.db.get("members", args.memberId)
    if (!member) throw new ConvexError("Member not found")
    if (
      member.systemRole === "super_admin" &&
      actor.systemRole !== "super_admin"
    ) {
      throw new ConvexError("Only a super administrator may edit this account")
    }
    const patch: Partial<Doc<"members">> & { updatedAt: number } = {
      updatedAt: Date.now(),
    }
    if (args.fullName !== undefined)
      patch.fullName = cleanText(args.fullName, "Full name", 120)
    if (args.phone !== undefined)
      patch.phone = cleanText(args.phone, "Phone", 30)
    if (args.department !== undefined)
      patch.department = cleanText(args.department, "Department", 100)
    if (args.hscBatch !== undefined)
      patch.hscBatch = cleanText(args.hscBatch, "HSC batch", 20)
    if (args.studentId !== undefined)
      patch.studentId = cleanText(args.studentId, "Student ID", 80)
    if (args.institute !== undefined)
      patch.institute = cleanText(args.institute, "Institute", 160)
    if (args.membershipValidUntil !== undefined)
      patch.membershipValidUntil = args.membershipValidUntil
    if (args.email !== undefined) {
      const email = normalizeEmail(args.email)
      const duplicate = await ctx.db
        .query("members")
        .withIndex("by_emailNormalized", (q) => q.eq("emailNormalized", email))
        .unique()
      if (duplicate && duplicate._id !== member._id) {
        throw new ConvexError("Email address is already in use")
      }
      patch.email = email
      patch.emailNormalized = email
    }
    await ctx.db.patch("members", member._id, patch)
    await writeAudit(
      ctx,
      actor,
      "member.update",
      "member",
      member._id,
      `Updated ${member.uuid}`
    )
    return null
  },
})

export const remove = mutation({
  args: { memberId: v.id("members") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const actor = await requirePermission(ctx, "membership_manage")
    const member = await ctx.db.get("members", args.memberId)
    if (!member) throw new ConvexError("Member not found")
    if (member._id === actor._id)
      throw new ConvexError("You cannot delete your own member record")
    if (member.systemRole === "super_admin") {
      throw new ConvexError("Super administrator records cannot be deleted")
    }
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_memberId_and_createdAt", (q) =>
        q.eq("memberId", member._id)
      )
      .take(200)
    await Promise.all(
      notifications.map((notification) =>
        ctx.db.delete("notifications", notification._id)
      )
    )
    if (member.applicationId) {
      await ctx.db.patch("membershipApplications", member.applicationId, {
        memberId: undefined,
      })
    }
    await writeAudit(
      ctx,
      actor,
      "member.delete",
      "member",
      member._id,
      `Deleted ${member.uuid}`
    )
    await ctx.db.delete("members", member._id)
    return null
  },
})

export const linkMyIdentity = mutation({
  args: { applicationCode: v.string(), trackingToken: v.string() },
  returns: v.id("members"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Authentication is required")
    const existing = await currentMember(ctx)
    if (existing) return existing._id
    const application = await ctx.db
      .query("membershipApplications")
      .withIndex("by_applicationCode", (q) =>
        q.eq("applicationCode", args.applicationCode.trim())
      )
      .unique()
    if (
      !application ||
      application.status !== "approved" ||
      !application.memberId
    )
      throw new ConvexError("Approved application not found")
    if (
      application.trackingTokenHash !== (await hashSecret(args.trackingToken))
    )
      throw new ConvexError("Invalid tracking credentials")
    const member = await ctx.db.get("members", application.memberId)
    if (!member) throw new ConvexError("Member record not found")
    if (
      member.identityToken &&
      member.identityToken !== identity.tokenIdentifier
    )
      throw new ConvexError("Member is already linked to another identity")
    await ctx.db.patch("members", member._id, {
      identityToken: identity.tokenIdentifier,
      updatedAt: Date.now(),
    })
    await ctx.db.patch("membershipApplications", application._id, {
      identityToken: identity.tokenIdentifier,
    })
    return member._id
  },
})
