import { ConvexError } from "convex/values"
import type { Doc } from "../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../_generated/server"

type ReadCtx = QueryCtx | MutationCtx

export const PORTAL_PERMISSIONS = [
  "membership_manage",
  "events_manage",
  "committee_manage",
  "projects_manage",
  "content_manage",
  "reports_view",
  "files_manage",
  "notifications_send",
  "finance_manage",
  "finance_summary",
] as const

export type PortalPermission = (typeof PORTAL_PERMISSIONS)[number]

const POSITION_PERMISSIONS: Record<string, readonly PortalPermission[]> = {
  president: PORTAL_PERMISSIONS,
  "vice_president_(admin)": PORTAL_PERMISSIONS,
  "vice_president_(logistics)": PORTAL_PERMISSIONS,
  "vice_president_(technical)": PORTAL_PERMISSIONS,
  "vice_president_(r&d)": PORTAL_PERMISSIONS,
  general_secretary: [
    "membership_manage",
    "events_manage",
    "committee_manage",
    "projects_manage",
    "content_manage",
    "reports_view",
    "files_manage",
    "notifications_send",
    "finance_summary",
  ],
  joint_general_secretary: [
    "membership_manage",
    "events_manage",
    "committee_manage",
    "reports_view",
    "notifications_send",
    "finance_summary",
  ],
  organizing_secretary: [
    "membership_manage",
    "events_manage",
    "committee_manage",
    "notifications_send",
    "finance_manage",
    "finance_summary",
  ],
  joint_organizing_secretary: [
    "membership_manage",
    "events_manage",
    "committee_manage",
    "notifications_send",
    "finance_manage",
    "finance_summary",
  ],
  finance_secretary: ["reports_view", "finance_manage", "finance_summary"],
  joint_finance_secretary: ["reports_view", "finance_manage", "finance_summary"],
  robotics_secretary: [],
  space_astronomy_secretary: [],
  research_publication_secretary: [],
  joint_research_publication_secretary: [],
  programming_software_secretary: [],
  joint_programming_software_secretary: [],
  office_secretary: [],
  event_management_secretary: [],
  graphics_design_secretary: [],
  media_secretary: [],
  outreach_sponsor_management_secretary: [],
  executive_member: [],
}

export function effectivePermissions(member: Doc<"members">) {
  if (member.systemRole === "super_admin") return [...PORTAL_PERMISSIONS]
  if (member.systemRole !== "executive") return []
  if (member.permissions) return [...new Set(member.permissions)]
  if (member.executivePosition) {
    return [...(POSITION_PERMISSIONS[member.executivePosition] ?? [])]
  }
  // Preserve access for executive records created before granular permissions.
  return [...PORTAL_PERMISSIONS]
}

export function hasPermission(
  member: Doc<"members">,
  permission: PortalPermission
) {
  return effectivePermissions(member).includes(permission)
}

export async function currentIdentityToken(ctx: ReadCtx) {
  const identity = await ctx.auth.getUserIdentity()
  return identity?.tokenIdentifier ?? null
}

export async function currentMember(
  ctx: ReadCtx
): Promise<Doc<"members"> | null> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null
  const byToken = await ctx.db
    .query("members")
    .withIndex("by_identityToken", (q) =>
      q.eq("identityToken", identity.tokenIdentifier)
    )
    .unique()
  if (byToken) return byToken
  const byAuthUser = await ctx.db
    .query("members")
    .withIndex("by_authUserId", (q) => q.eq("authUserId", identity.subject))
    .unique()
  if (byAuthUser) return byAuthUser
  if (!identity.email) return null
  return await ctx.db
    .query("members")
    .withIndex("by_emailNormalized", (q) =>
      q.eq("emailNormalized", identity.email!.trim().toLowerCase())
    )
    .unique()
}

export async function requireMember(ctx: ReadCtx): Promise<Doc<"members">> {
  const member = await currentMember(ctx)
  if (!member || member.status !== "active") {
    throw new ConvexError("Active membership is required")
  }
  return member
}

export async function requireExecutive(ctx: ReadCtx): Promise<Doc<"members">> {
  const member = await requireMember(ctx)
  if (
    member.systemRole !== "executive" &&
    member.systemRole !== "super_admin"
  ) {
    throw new ConvexError("Executive access is required")
  }
  return member
}

export async function requireSuperAdmin(ctx: ReadCtx): Promise<Doc<"members">> {
  const member = await requireMember(ctx)
  if (member.systemRole !== "super_admin") {
    throw new ConvexError("Super administrator access is required")
  }
  return member
}

export async function requirePermission(
  ctx: ReadCtx,
  permission: PortalPermission
): Promise<Doc<"members">> {
  const member = await requireMember(ctx)
  if (!hasPermission(member, permission)) {
    throw new ConvexError(`Permission required: ${permission}`)
  }
  return member
}

export async function requireFinanceAccess(
  ctx: ReadCtx
): Promise<Doc<"members">> {
  const member = await requireMember(ctx)
  if (hasPermission(member, "finance_manage")) return member
  if (member.systemRole !== "executive") {
    throw new ConvexError("Finance access is required")
  }

  const currentTerm = await ctx.db
    .query("committeeTerms")
    .withIndex("by_status_and_startsAt", (q) => q.eq("status", "current"))
    .order("desc")
    .first()
  if (!currentTerm) throw new ConvexError("Finance access is not configured")

  const appointment = await ctx.db
    .query("committeeMembers")
    .withIndex("by_memberId_and_termId", (q) =>
      q.eq("memberId", member._id).eq("termId", currentTerm._id)
    )
    .unique()
  const allowed = new Set([
    "president",
    "vice_president",
    "financial_secretary",
    "organizing_secretary",
  ])
  if (!appointment || !allowed.has(appointment.positionKey)) {
    throw new ConvexError(
      "Your committee position does not grant finance access"
    )
  }
  return member
}

export async function writeAudit(
  ctx: MutationCtx,
  actor: Doc<"members">,
  action: string,
  entityType: string,
  entityId: string | undefined,
  summary: string
) {
  await ctx.db.insert("auditLogs", {
    actorMemberId: actor._id,
    action,
    entityType,
    entityId,
    summary,
    createdAt: Date.now(),
  })
}
