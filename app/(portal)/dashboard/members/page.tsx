import { PageHeader, Panel } from "@/components/dashboard/dashboard-kit"
import { MembersTable } from "@/components/dashboard/members-table"
import { RoleManager } from "@/components/dashboard/role-manager"
import { ExecutiveAccountForm } from "@/components/dashboard/executive-account-form"
import { requirePortalPermission } from "@/lib/admin-auth"

export default async function MembersPage() {
  const member = await requirePortalPermission("membership_manage")
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Membership operations"
        title="Members and applications"
        description="Review pending membership applications and assign portal roles to active members."
      />
      <Panel title="Pending applications">
        <MembersTable />
      </Panel>
      <Panel title="Active members">
        <RoleManager />
      </Panel>
      {member.systemRole === "super_admin" ? (
        <Panel title="Create executive account">
          <ExecutiveAccountForm />
        </Panel>
      ) : null}
    </div>
  )
}
