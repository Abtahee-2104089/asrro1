import { ConvexError, v } from "convex/values"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { action, internalMutation, internalQuery } from "./_generated/server"
import { requireSuperAdmin } from "./_lib/auth"
import { cleanText, normalizeEmail } from "./_lib/validation"
import { authComponent, createAuth } from "./betterAuth/auth"
import { executivePosition, portalPermission } from "./model"

const accountInput = {
  fullName: v.string(),
  email: v.string(),
  password: v.string(),
  phone: v.string(),
  institute: v.string(),
  department: v.string(),
  studentId: v.string(),
  hscBatch: v.string(),
  executivePosition,
  permissions: v.array(portalPermission),
}

export const authorizeSuperAdmin = internalQuery({
  args: {},
  returns: v.object({ memberId: v.id("members") }),
  handler: async (ctx) => {
    const member = await requireSuperAdmin(ctx)
    return { memberId: member._id }
  },
})

export const preflightEmail = internalQuery({
  args: { email: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("members")
      .withIndex("by_emailNormalized", (q) =>
        q.eq("emailNormalized", normalizeEmail(args.email))
      )
      .unique()
    return existing === null
  },
})

export const insertExecutiveMember = internalMutation({
  args: {
    ...accountInput,
    authUserId: v.string(),
  },
  returns: v.object({ memberId: v.id("members"), uuid: v.string() }),
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)
    const duplicate = await ctx.db
      .query("members")
      .withIndex("by_emailNormalized", (q) => q.eq("emailNormalized", email))
      .unique()
    if (duplicate) throw new ConvexError("A member already uses this email")
    const duplicateAuth = await ctx.db
      .query("members")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", args.authUserId))
      .unique()
    if (duplicateAuth) throw new ConvexError("This account is already linked")

    const now = Date.now()
    const counterKey = "uuid.executive"
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
    const uuid = `AR-E${String(number).padStart(3, "0")}`
    const memberId = await ctx.db.insert("members", {
      authUserId: args.authUserId,
      uuid,
      fullName: cleanText(args.fullName, "Full name", 120),
      email,
      emailNormalized: email,
      phone: cleanText(args.phone, "Phone", 30),
      department: cleanText(args.department, "Department", 100),
      hscBatch: cleanText(args.hscBatch, "HSC batch", 20),
      studentId: cleanText(args.studentId, "Student ID", 80),
      institute: cleanText(args.institute, "Institute", 160),
      status: "active",
      systemRole: "executive",
      executivePosition: args.executivePosition,
      permissions: [...new Set(args.permissions)],
      joinedAt: now,
      membershipValidUntil: now + 366 * 86_400_000,
      updatedAt: now,
    })
    return { memberId, uuid }
  },
})

export const createExecutive = action({
  args: accountInput,
  returns: v.object({
    memberId: v.id("members"),
    authUserId: v.string(),
    uuid: v.string(),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    memberId: Id<"members">
    authUserId: string
    uuid: string
  }> => {
    await ctx.runQuery(internal.adminAccounts.authorizeSuperAdmin, {})
    if (args.password.length < 8 || args.password.length > 128) {
      throw new ConvexError("Password must be between 8 and 128 characters")
    }
    if (
      !(await ctx.runQuery(internal.adminAccounts.preflightEmail, {
        email: args.email,
      }))
    ) {
      throw new ConvexError("A member already uses this email")
    }
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx)
    const created = await auth.api.createUser({
      headers,
      body: {
        email: normalizeEmail(args.email),
        name: cleanText(args.fullName, "Full name", 120),
        password: args.password,
        role: "user",
      },
    })
    try {
      const member: { memberId: Id<"members">; uuid: string } =
        await ctx.runMutation(internal.adminAccounts.insertExecutiveMember, {
          ...args,
          authUserId: created.user.id,
        })
      return { ...member, authUserId: created.user.id }
    } catch (error) {
      await auth.api
        .removeUser({
          headers,
          body: { userId: created.user.id },
        })
        .catch(() => undefined)
      throw error
    }
  },
})

export const memberAuthTarget = internalQuery({
  args: { memberId: v.id("members") },
  returns: v.object({ email: v.string(), authUserId: v.optional(v.string()) }),
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx)
    const member = await ctx.db.get("members", args.memberId)
    if (!member) throw new ConvexError("Member not found")
    return { email: member.email, authUserId: member.authUserId }
  },
})

export const saveAuthUserId = internalMutation({
  args: { memberId: v.id("members"), authUserId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const member = await ctx.db.get("members", args.memberId)
    if (!member) throw new ConvexError("Member not found")
    await ctx.db.patch("members", member._id, {
      authUserId: args.authUserId,
      updatedAt: Date.now(),
    })
    return null
  },
})

export const resetPassword = action({
  args: { memberId: v.id("members"), newPassword: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runQuery(internal.adminAccounts.authorizeSuperAdmin, {})
    if (args.newPassword.length < 8 || args.newPassword.length > 128) {
      throw new ConvexError("Password must be between 8 and 128 characters")
    }
    const [target, { auth, headers }] = await Promise.all([
      ctx.runQuery(internal.adminAccounts.memberAuthTarget, {
        memberId: args.memberId,
      }),
      authComponent.getAuth(createAuth, ctx),
    ])
    let authUserId = target.authUserId
    if (!authUserId) {
      const result = await auth.api.listUsers({
        headers,
        query: {
          filterField: "email",
          filterValue: target.email,
          filterOperator: "eq",
          limit: 2,
        },
      })
      const user = result.users.find(
        (candidate) =>
          candidate.email.toLowerCase() === target.email.toLowerCase()
      )
      if (!user)
        throw new ConvexError("No Better Auth account exists for this member")
      authUserId = user.id
      await ctx.runMutation(internal.adminAccounts.saveAuthUserId, {
        memberId: args.memberId,
        authUserId,
      })
    }
    await auth.api.setUserPassword({
      headers,
      body: { userId: authUserId, newPassword: args.newPassword },
    })
    return null
  },
})
