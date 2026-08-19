import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server"
import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { action } from "./_generated/server"
import { api, internal } from "./_generated/api"
import type { MutationCtx } from "./_generated/server"
import type { Id } from "./_generated/dataModel"
import { currentMember } from "./_lib/auth"
import { requirePermission, writeAudit } from "./_lib/auth"
import { adjustCounter } from "./_lib/counters"
import { enqueueEmail, membershipDecisionEmail } from "./_lib/email"
import { defaultUuidMapping } from "./_lib/uuid"
import {
  cleanText,
  hashSecret,
  normalizeEmail,
  optionalText,
  randomSecret,
} from "./_lib/validation"
import { applicationFields } from "./model"

const applicationDoc = v.object({
  _id: v.id("membershipApplications"),
  _creationTime: v.number(),
  ...applicationFields,
})

const applicationInput = v.object({
  fullName: v.string(),
  profileAssetId: v.optional(v.id("assets")),
  dateOfBirth: v.optional(v.string()),
  gender: v.string(),
  bloodGroup: v.optional(v.string()),
  email: v.string(),
  phone: v.string(),
  institute: v.string(),
  universityName: v.optional(v.string()),
  department: v.string(),
  semester: v.optional(v.string()),
  studentId: v.string(),
  hscBatch: v.string(),
  address: v.string(),
  emergencyContact: v.string(),
  paymentMethod: v.union(
    v.literal("bkash"),
    v.literal("nagad"),
    v.literal("rocket")
  ),
  transactionId: v.string(),
  paymentAssetId: v.optional(v.id("assets")),
})

const trackedApplication = v.object({
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected")
  ),
  submittedAt: v.number(),
  reviewedAt: v.optional(v.number()),
  reviewNote: v.optional(v.string()),
  memberUuid: v.optional(v.string()),
})

const accountApplication = v.object({
  applicationCode: v.string(),
  fullName: v.string(),
  email: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected")
  ),
  submittedAt: v.number(),
  reviewedAt: v.optional(v.number()),
  reviewNote: v.optional(v.string()),
  memberUuid: v.optional(v.string()),
  linked: v.boolean(),
})

async function requirePrivateAsset(
  ctx: MutationCtx,
  assetId: Id<"assets"> | undefined,
  label: string
) {
  if (!assetId) return
  const asset = await ctx.db.get("assets", assetId)
  if (!asset || asset.visibility !== "private") {
    throw new ConvexError(`${label} upload is invalid`)
  }
}

export const submitApplication = mutation({
  args: applicationInput.fields,
  returns: v.object({
    applicationId: v.id("membershipApplications"),
    applicationCode: v.string(),
    trackingToken: v.string(),
    status: v.literal("pending"),
  }),
  handler: async (ctx, args) => {
    await requirePrivateAsset(ctx, args.profileAssetId, "Profile photo")
    await requirePrivateAsset(ctx, args.paymentAssetId, "Payment proof")
    const emailNormalized = normalizeEmail(args.email)
    const transactionId = cleanText(args.transactionId, "Transaction ID", 100)
    const duplicatePayment = await ctx.db
      .query("membershipApplications")
      .withIndex("by_transactionId", (q) =>
        q.eq("transactionId", transactionId)
      )
      .unique()
    if (duplicatePayment)
      throw new ConvexError("This transaction ID has already been submitted")

    const recent = await ctx.db
      .query("membershipApplications")
      .withIndex("by_emailNormalized_and_submittedAt", (q) =>
        q.eq("emailNormalized", emailNormalized)
      )
      .order("desc")
      .first()
    if (recent && recent.status !== "rejected") {
      throw new ConvexError(
        "An active application already exists for this email address"
      )
    }

    const identity = await ctx.auth.getUserIdentity()
    const trackingToken = randomSecret()
    const trackingTokenHash = await hashSecret(trackingToken)
    const now = Date.now()
    const applicationCode = `APP-${now.toString(36).toUpperCase()}-${trackingToken.slice(0, 6).toUpperCase()}`
    const applicationId = await ctx.db.insert("membershipApplications", {
      applicationCode,
      trackingTokenHash,
      identityToken: identity?.tokenIdentifier,
      fullName: cleanText(args.fullName, "Full name", 120),
      profileAssetId: args.profileAssetId,
      dateOfBirth: optionalText(args.dateOfBirth, "Date of birth", 20),
      gender: cleanText(args.gender, "Gender", 40),
      bloodGroup: optionalText(args.bloodGroup, "Blood group", 10),
      email: emailNormalized,
      emailNormalized,
      phone: cleanText(args.phone, "Phone", 30),
      institute: cleanText(args.institute, "Institute", 160),
      universityName: optionalText(args.universityName, "University", 160),
      department: cleanText(args.department, "Department", 100),
      semester: optionalText(args.semester, "Semester", 40),
      studentId: cleanText(args.studentId, "Student ID", 80),
      hscBatch: cleanText(args.hscBatch, "HSC batch", 20),
      address: cleanText(args.address, "Address", 500),
      emergencyContact: cleanText(
        args.emergencyContact,
        "Emergency contact",
        80
      ),
      paymentMethod: args.paymentMethod,
      transactionId,
      paymentAssetId: args.paymentAssetId,
      amountPaid: 300,
      currency: "BDT",
      status: "pending",
      submittedAt: now,
    })
    await adjustCounter(ctx, "membershipApplications.total", 1)
    await adjustCounter(ctx, "membershipApplications.pending", 1)
    return {
      applicationId,
      applicationCode,
      trackingToken,
      status: "pending" as const,
    }
  },
})

export const accountStatus = query({
  args: {},
  returns: v.union(
    v.object({ state: v.literal("signed_out") }),
    v.object({
      state: v.literal("member"),
      memberStatus: v.union(
        v.literal("pending"),
        v.literal("active"),
        v.literal("suspended"),
        v.literal("alumni"),
        v.literal("rejected")
      ),
      uuid: v.string(),
      fullName: v.string(),
      email: v.string(),
    }),
    v.object({
      state: v.literal("applicant"),
      accountName: v.optional(v.string()),
      accountEmail: v.optional(v.string()),
      application: accountApplication,
    }),
    v.object({
      state: v.literal("unlinked"),
      accountName: v.optional(v.string()),
      accountEmail: v.optional(v.string()),
      canBootstrap: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return { state: "signed_out" as const }
    const member = await currentMember(ctx)
    if (member) {
      return {
        state: "member" as const,
        memberStatus: member.status,
        uuid: member.uuid,
        fullName: member.fullName,
        email: member.email,
      }
    }

    let application = await ctx.db
      .query("membershipApplications")
      .withIndex("by_identityToken_and_submittedAt", (q) =>
        q.eq("identityToken", identity.tokenIdentifier)
      )
      .order("desc")
      .first()
    const identityEmail = identity.email
    if (!application && identityEmail) {
      application = await ctx.db
        .query("membershipApplications")
        .withIndex("by_emailNormalized_and_submittedAt", (q) =>
          q.eq("emailNormalized", normalizeEmail(identityEmail))
        )
        .order("desc")
        .first()
    }
    if (!application) {
      const firstMember = await ctx.db.query("members").first()
      return {
        state: "unlinked" as const,
        accountName: identity.name,
        accountEmail: identity.email,
        canBootstrap: firstMember === null,
      }
    }
    const applicationMember = application.memberId
      ? await ctx.db.get("members", application.memberId)
      : null
    return {
      state: "applicant" as const,
      accountName: identity.name,
      accountEmail: identity.email,
      application: {
        applicationCode: application.applicationCode,
        fullName: application.fullName,
        email: application.email,
        status: application.status,
        submittedAt: application.submittedAt,
        reviewedAt: application.reviewedAt,
        reviewNote: application.reviewNote,
        memberUuid: applicationMember?.uuid,
        linked: application.identityToken === identity.tokenIdentifier,
      },
    }
  },
})

export const initializeFirstAdmin = mutation({
  args: {
    phone: v.string(),
    institute: v.string(),
    department: v.string(),
    studentId: v.string(),
    hscBatch: v.string(),
  },
  returns: v.object({ uuid: v.string() }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity?.email) throw new ConvexError("Authentication is required")
    if (await ctx.db.query("members").first()) {
      throw new ConvexError("The first administrator is already configured")
    }
    const now = Date.now()
    const email = normalizeEmail(identity.email)
    await ctx.db.insert("members", {
      identityToken: identity.tokenIdentifier,
      uuid: "AR-001",
      fullName: cleanText(
        identity.name ?? email.split("@", 1)[0],
        "Full name",
        120
      ),
      email,
      emailNormalized: email,
      phone: cleanText(args.phone, "Phone", 30),
      department: cleanText(args.department, "Department", 100),
      hscBatch: cleanText(args.hscBatch, "HSC batch", 20),
      studentId: cleanText(args.studentId, "Student ID", 80),
      institute: cleanText(args.institute, "Institute", 160),
      status: "active",
      systemRole: "super_admin",
      joinedAt: now,
      membershipValidUntil: now + 366 * 86_400_000,
      updatedAt: now,
    })
    await ctx.db.insert("uuidCounters", {
      key: "uuid.AR",
      nextNumber: 2,
      updatedAt: now,
    })
    await adjustCounter(ctx, "members.total", 1)
    await adjustCounter(ctx, "members.active", 1)
    return { uuid: "AR-001" }
  },
})

export const linkApplicationToMyAccount = mutation({
  args: { applicationCode: v.string(), trackingToken: v.string() },
  returns: v.object({
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    memberId: v.optional(v.id("members")),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new ConvexError("Authentication is required")
    const application = await ctx.db
      .query("membershipApplications")
      .withIndex("by_applicationCode", (q) =>
        q.eq("applicationCode", args.applicationCode.trim())
      )
      .unique()
    if (
      !application ||
      application.trackingTokenHash !== (await hashSecret(args.trackingToken))
    ) {
      throw new ConvexError("Invalid application code or tracking token")
    }
    if (
      application.identityToken &&
      application.identityToken !== identity.tokenIdentifier
    ) {
      throw new ConvexError("Application is already linked to another account")
    }
    const existingMember = await currentMember(ctx)
    if (existingMember && existingMember._id !== application.memberId) {
      throw new ConvexError("This account is already linked to a member")
    }
    await ctx.db.patch("membershipApplications", application._id, {
      identityToken: identity.tokenIdentifier,
    })
    if (application.memberId) {
      const member = await ctx.db.get("members", application.memberId)
      if (!member) throw new ConvexError("Member record not found")
      if (
        member.identityToken &&
        member.identityToken !== identity.tokenIdentifier
      ) {
        throw new ConvexError("Member is already linked to another account")
      }
      await ctx.db.patch("members", member._id, {
        identityToken: identity.tokenIdentifier,
        updatedAt: Date.now(),
      })
    }
    return {
      status: application.status,
      memberId: application.memberId,
    }
  },
})

export const trackApplication = query({
  args: { applicationCode: v.string(), trackingToken: v.string() },
  returns: v.union(trackedApplication, v.null()),
  handler: async (ctx, args) => {
    const application = await ctx.db
      .query("membershipApplications")
      .withIndex("by_applicationCode", (q) =>
        q.eq("applicationCode", args.applicationCode.trim())
      )
      .unique()
    if (
      !application ||
      application.trackingTokenHash !== (await hashSecret(args.trackingToken))
    )
      return null
    const member = application.memberId
      ? await ctx.db.get("members", application.memberId)
      : null
    return {
      status: application.status,
      submittedAt: application.submittedAt,
      reviewedAt: application.reviewedAt,
      reviewNote: application.reviewNote,
      memberUuid: member?.uuid,
    }
  },
})

export const listApplications = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(applicationDoc),
  handler: async (ctx, args) => {
    await requirePermission(ctx, "membership_manage")
    return await ctx.db
      .query("membershipApplications")
      .withIndex("by_status_and_submittedAt", (q) =>
        q.eq("status", args.status)
      )
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const reviewApplication = mutation({
  args: {
    applicationId: v.id("membershipApplications"),
    decision: v.union(v.literal("approve"), v.literal("reject")),
    reviewNote: v.optional(v.string()),
  },
  returns: v.object({
    status: v.union(v.literal("approved"), v.literal("rejected")),
    memberId: v.optional(v.id("members")),
    uuid: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const actor = await requirePermission(ctx, "membership_manage")
    const application = await ctx.db.get(
      "membershipApplications",
      args.applicationId
    )
    if (!application) throw new ConvexError("Application not found")
    if (application.status !== "pending")
      throw new ConvexError("Application has already been reviewed")
    const now = Date.now()
    const reviewNote = optionalText(args.reviewNote, "Review note", 500)

    if (args.decision === "reject") {
      await ctx.db.patch("membershipApplications", application._id, {
        status: "rejected",
        reviewedAt: now,
        reviewedBy: actor._id,
        reviewNote,
      })
      await adjustCounter(ctx, "membershipApplications.pending", -1)
      await adjustCounter(ctx, "membershipApplications.rejected", 1)
      if (application.identityToken) {
        await ctx.db.insert("notifications", {
          identityToken: application.identityToken,
          applicationId: application._id,
          kind: "membership_rejected",
          title: "Membership application update",
          body:
            reviewNote ??
            "Your membership application was not approved. Contact the membership team if you need help.",
          link: "/applicant-status",
          read: false,
          createdAt: now,
        })
      }
      const email = membershipDecisionEmail({
        name: application.fullName,
        decision: "rejected",
        note: reviewNote,
      })
      const outboxId = await enqueueEmail(ctx, {
        recipient: application.email,
        recipientName: application.fullName,
        applicationId: application._id,
        ...email,
      })
      await ctx.scheduler.runAfter(0, internal.emailActions.deliver, {
        outboxId,
      })
      await writeAudit(
        ctx,
        actor,
        "membership.reject",
        "membershipApplication",
        application._id,
        `Rejected ${application.applicationCode}`
      )
      return { status: "rejected" as const }
    }

    const existing = await ctx.db
      .query("members")
      .withIndex("by_emailNormalized", (q) =>
        q.eq("emailNormalized", application.emailNormalized)
      )
      .unique()
    if (existing)
      throw new ConvexError("A member already exists for this email address")
    const mapping = await ctx.db
      .query("uuidMappings")
      .withIndex("by_hscBatch_and_department", (q) =>
        q
          .eq("hscBatch", application.hscBatch)
          .eq("department", application.department.toLowerCase())
      )
      .unique()
    const fallbackMapping = defaultUuidMapping(
      application.hscBatch,
      application.department
    )
    const code = mapping?.active ? mapping.code : fallbackMapping?.code
    if (!code)
      throw new ConvexError(
        "No UUID mapping is configured for this batch and department"
      )
    const counterKey = `uuid.${code}`
    const counter = await ctx.db
      .query("uuidCounters")
      .withIndex("by_key", (q) => q.eq("key", counterKey))
      .unique()
    const number = counter?.nextNumber ?? 1
    if (counter) {
      await ctx.db.patch("uuidCounters", counter._id, {
        nextNumber: number + 1,
        updatedAt: now,
      })
    } else {
      await ctx.db.insert("uuidCounters", {
        key: counterKey,
        nextNumber: 2,
        updatedAt: now,
      })
    }
    const uuid = `${code}-${String(number).padStart(3, "0")}`
    const duplicateUuid = await ctx.db
      .query("members")
      .withIndex("by_uuid", (q) => q.eq("uuid", uuid))
      .unique()
    if (duplicateUuid)
      throw new ConvexError(
        "UUID collision detected; repair the UUID counter before retrying"
      )
    const memberId = await ctx.db.insert("members", {
      identityToken: application.identityToken,
      applicationId: application._id,
      uuid,
      fullName: application.fullName,
      email: application.email,
      emailNormalized: application.emailNormalized,
      phone: application.phone,
      department: application.department,
      hscBatch: application.hscBatch,
      studentId: application.studentId,
      institute: application.institute,
      dateOfBirth: application.dateOfBirth,
      bloodGroup: application.bloodGroup,
      profileAssetId: application.profileAssetId,
      address: application.address,
      emergencyContact: application.emergencyContact,
      status: "active",
      systemRole: "member",
      joinedAt: now,
      membershipValidUntil: now + 366 * 86_400_000,
      updatedAt: now,
    })
    await ctx.db.patch("membershipApplications", application._id, {
      status: "approved",
      reviewedAt: now,
      reviewedBy: actor._id,
      reviewNote,
      memberId,
    })
    await ctx.db.insert("notifications", {
      memberId,
      identityToken: application.identityToken,
      applicationId: application._id,
      kind: "membership_approved",
      title: "Membership approved",
      body: `Welcome to ASRRO. Your member UUID is ${uuid}.`,
      link: "/dashboard/membership",
      read: false,
      createdAt: now,
    })
    const email = membershipDecisionEmail({
      name: application.fullName,
      decision: "approved",
      uuid,
    })
    const outboxId = await enqueueEmail(ctx, {
      recipient: application.email,
      recipientName: application.fullName,
      memberId,
      applicationId: application._id,
      ...email,
    })
    await ctx.scheduler.runAfter(0, internal.emailActions.deliver, { outboxId })
    await adjustCounter(ctx, "membershipApplications.pending", -1)
    await adjustCounter(ctx, "members.active", 1)
    await adjustCounter(ctx, "membershipApplications.approved", 1)
    await writeAudit(
      ctx,
      actor,
      "membership.approve",
      "member",
      memberId,
      `Approved ${application.applicationCode} as ${uuid}`
    )
    return { status: "approved" as const, memberId, uuid }
  },
})

export const upsertUuidMapping = mutation({
  args: {
    hscBatch: v.string(),
    department: v.string(),
    galaxyName: v.string(),
    starName: v.string(),
    code: v.string(),
    active: v.boolean(),
  },
  returns: v.id("uuidMappings"),
  handler: async (ctx, args) => {
    const actor = await requirePermission(ctx, "membership_manage")
    const hscBatch = cleanText(args.hscBatch, "HSC batch", 20)
    const department = cleanText(
      args.department,
      "Department",
      100
    ).toLowerCase()
    const code = cleanText(args.code, "UUID code", 10).toUpperCase()
    if (!/^[A-Z0-9]{2,10}$/.test(code))
      throw new ConvexError("UUID code must be 2-10 letters or digits")
    const existing = await ctx.db
      .query("uuidMappings")
      .withIndex("by_hscBatch_and_department", (q) =>
        q.eq("hscBatch", hscBatch).eq("department", department)
      )
      .unique()
    const value = {
      hscBatch,
      department,
      galaxyName: cleanText(args.galaxyName, "Galaxy name", 80),
      starName: cleanText(args.starName, "Star name", 80),
      code,
      active: args.active,
      updatedAt: Date.now(),
    }
    const id = existing
      ? (await ctx.db.patch("uuidMappings", existing._id, value), existing._id)
      : await ctx.db.insert("uuidMappings", value)
    await writeAudit(
      ctx,
      actor,
      "uuid_mapping.upsert",
      "uuidMapping",
      id,
      `Configured ${hscBatch}/${department} as ${code}`
    )
    return id
  },
})

export const bulkApproveApplications = action({
  args: { applicationIds: v.array(v.id("membershipApplications")) },
  returns: v.array(
    v.object({
      applicationId: v.id("membershipApplications"),
      uuid: v.string(),
    })
  ),
  handler: async (
    ctx,
    args
  ): Promise<
    Array<{ applicationId: Id<"membershipApplications">; uuid: string }>
  > => {
    const applicationIds = [...new Set(args.applicationIds)]
    if (applicationIds.length === 0 || applicationIds.length > 25) {
      throw new ConvexError("Select between 1 and 25 pending applications")
    }
    return await Promise.all(
      applicationIds.map(
        async (
          applicationId
        ): Promise<{
          applicationId: Id<"membershipApplications">
          uuid: string
        }> => {
          const result: { uuid?: string } = await ctx.runMutation(
            api.membership.reviewApplication,
            {
              applicationId,
              decision: "approve",
            }
          )
          if (!result.uuid)
            throw new ConvexError("Approval did not create a UUID")
          return { applicationId, uuid: result.uuid }
        }
      )
    )
  },
})
