import { RadioTower } from "lucide-react"

import { PageHeader, Panel } from "@/components/dashboard/dashboard-kit"
import { NotificationCenter } from "@/components/dashboard/notification-center"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Signal centre"
        title="Notifications"
        description="Event reminders, committee announcements, and membership updates in one timeline."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
        <Panel>
          <NotificationCenter />
        </Panel>
        <aside className="space-y-4">
          <Panel className="p-5">
            <RadioTower className="size-5 text-blue-600" />
            <h2 className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">
              Delivery channels
            </h2>
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Membership and portal messages are delivered to this live
              dashboard timeline.
            </p>
            <div className="mt-4 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Dashboard</span>
                <span className="font-semibold text-emerald-600">On</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-500">
                  Not configured
                </span>
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
