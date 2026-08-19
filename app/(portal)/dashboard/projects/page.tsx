import { PageHeader } from "@/components/dashboard/dashboard-kit"
import { ProjectManager } from "@/components/dashboard/project-manager"
import { requirePortalRole } from "@/lib/admin-auth"

export default async function ProjectsPage() {
  await requirePortalRole("executive")
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Research portfolio"
        title="Projects"
        description="Create and publish complete project records."
      />
      <ProjectManager />
    </div>
  )
}
