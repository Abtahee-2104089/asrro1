"use client"

import { useQuery } from "convex/react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { DashboardOverviewEvents } from "@/components/dashboard/dashboard-overview-events"
import { DashboardOverviewHero } from "@/components/dashboard/dashboard-overview-hero"
import { DashboardOverviewRail } from "@/components/dashboard/dashboard-overview-rail"
import { DashboardOverviewTelemetry } from "@/components/dashboard/dashboard-overview-telemetry"
import { api } from "@/convex/_generated/api"
import { authClient } from "@/lib/auth-client"

function getFirstName(name: string) {
  return name.trim().split(/\s+/, 1)[0] || "operator"
}

export function DashboardOverview() {
  const [now] = useState(() => Date.now())
  const member = useQuery(api.members.me)
  const eventDashboard = useQuery(api.events.memberDashboard, { now })
  const projectResult = useQuery(api.projects.listPublic, {
    paginationOpts: { cursor: null, numItems: 20 },
  })
  const session = authClient.useSession()
  const accountName = member?.fullName || session.data?.user.name || "Operator"
  const accountEmail = member?.email || session.data?.user.email
  const isLoading = member === undefined || session.isPending
  const profileCompletion = member
    ? Math.round(
        ([
          member.fullName,
          member.email,
          member.phone,
          member.department,
          member.hscBatch,
          member.studentId,
          member.address,
          member.emergencyContact,
          member.profileAssetId,
        ].filter(Boolean).length /
          9) *
          100
      )
    : 0

  return (
    <div className="space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.18em] text-blue-700 uppercase dark:text-cyan-300">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan-400 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-cyan-500" />
            </span>
            Orbital operations / Overview
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-[2rem] dark:text-white">
            Welcome aboard, {getFirstName(accountName)}.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Your command surface for ASRRO events, research programs, and
            membership access.
          </p>
        </div>
        <Link
          href="/dashboard/events"
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0b1b31] px-4 text-xs font-semibold text-white shadow-sm transition outline-none hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:bg-cyan-400 dark:text-[#06101d] dark:hover:bg-cyan-300 dark:focus-visible:ring-offset-[#050b14]"
        >
          Open event schedule <ArrowRight className="size-3.5" />
        </Link>
      </header>

      <DashboardOverviewHero
        accountEmail={accountEmail}
        isLoading={isLoading}
        member={member ?? null}
        nextEvent={eventDashboard?.openEvents[0]}
      />
      <DashboardOverviewTelemetry
        events={eventDashboard?.openEvents ?? []}
        projects={projectResult?.page ?? []}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(19rem,.6fr)]">
        <DashboardOverviewEvents events={eventDashboard?.openEvents ?? []} />
        <DashboardOverviewRail
          accountName={accountName}
          member={member ?? null}
          profileCompletion={profileCompletion}
          projects={projectResult?.page ?? []}
        />
      </div>
    </div>
  )
}
