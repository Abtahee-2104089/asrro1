import type { Metadata } from "next"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { PortalShell } from "@/components/dashboard/portal-shell"
import { api } from "@/convex/_generated/api"
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: {
    default: "Mission Portal | ASRRO",
    template: "%s | ASRRO Portal",
  },
  description: "Member and executive operations portal for ASRRO.",
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  if (!(await isAuthenticated())) {
    redirect("/login?next=/dashboard")
  }

  const member = await fetchAuthQuery(api.members.me, {})
  if (!member || member.status !== "active") {
    redirect("/applicant-status")
  }

  return <PortalShell initialMember={member}>{children}</PortalShell>
}
