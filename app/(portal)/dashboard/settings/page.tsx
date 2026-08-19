import { LockKeyhole } from "lucide-react"

import {
  PageHeader,
  Panel,
  StatusPill,
} from "@/components/dashboard/dashboard-kit"
import { SettingsForm } from "@/components/dashboard/settings-form"
import { requirePortalRole } from "@/lib/admin-auth"

export default async function SettingsPage() {
  await requirePortalRole("super_admin")
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Super admin"
        title="Portal settings"
        description="Configure public website identity, homepage content, social channels, and email delivery."
        actions={
          <StatusPill tone="violet">
            <LockKeyhole className="size-3" />
            Admin access
          </StatusPill>
        }
      />
      <Panel>
        <SettingsForm />
      </Panel>
    </div>
  )
}
