import { redirect } from "next/navigation"

import { api } from "@/convex/_generated/api"
import { fetchAuthQuery } from "@/lib/auth-server"

export async function requirePortalRole(
  minimum: "executive" | "super_admin" = "executive"
) {
  const member = await fetchAuthQuery(api.members.me)
  const allowed =
    member?.status === "active" &&
    (member.systemRole === "super_admin" ||
      (minimum === "executive" && member.systemRole === "executive"))
  if (!allowed) redirect("/dashboard")
  return member
}

export async function requirePortalPermission(
  permission:
    | "membership_manage"
    | "events_manage"
    | "committee_manage"
    | "projects_manage"
    | "content_manage"
    | "reports_view"
    | "files_manage"
    | "notifications_send"
    | "finance_manage"
    | "finance_summary"
) {
  const member = await fetchAuthQuery(api.members.me)
  if (
    member?.status !== "active" ||
    (member.systemRole !== "super_admin" &&
      !member.permissions.includes(permission))
  ) {
    redirect("/dashboard")
  }
  return member
}
