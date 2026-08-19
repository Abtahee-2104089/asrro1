import { CommitteeManager } from "@/components/dashboard/committee-manager"
import { PageHeader } from "@/components/dashboard/dashboard-kit"
import { requirePortalRole } from "@/lib/admin-auth"

export default async function CommitteePage() {
  await requirePortalRole("executive")
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Executive committee"
        description="Maintain committee terms, positions, contact details, and portraits."
      />
      <CommitteeManager />
    </div>
  )
}
