import { PageHeader, Panel } from "@/components/dashboard/dashboard-kit"
import { FileManager } from "@/components/dashboard/file-manager"
import { requirePortalPermission } from "@/lib/admin-auth"

export default async function FilesPage() {
  await requirePortalPermission("files_manage")
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Asset operations"
        title="File library"
        description="Upload validated images, video, PDFs, and office documents for portal workflows."
      />
      <Panel title="Upload workflows">
        <FileManager />
      </Panel>
    </div>
  )
}
