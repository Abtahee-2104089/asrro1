import { ContentManager } from "@/components/dashboard/content-manager"
import { AlumniManager } from "@/components/dashboard/alumni-manager"
import { CommentModeration } from "@/components/dashboard/comment-moderation"
import { GalleryManager } from "@/components/dashboard/gallery-manager"
import { PageHeader } from "@/components/dashboard/dashboard-kit"
import { requirePortalRole } from "@/lib/admin-auth"

export default async function ContentPage() {
  await requirePortalRole("executive")
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Public publishing"
        title="Content studio"
        description="Create and publish news, pages, publications, and gallery albums."
      />
      <ContentManager />
      <AlumniManager />
      <GalleryManager />
      <CommentModeration />
    </div>
  )
}
