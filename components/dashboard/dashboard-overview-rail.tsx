import { ArrowRight, Link2, Satellite } from "lucide-react"
import Link from "next/link"

import { ProgressBar } from "@/components/dashboard/dashboard-kit"
const membershipDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Dhaka",
})

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "AO"
  )
}

function formatMembershipDate(timestamp?: number) {
  return timestamp
    ? membershipDateFormatter.format(timestamp)
    : "No expiry recorded"
}

export function DashboardOverviewRail({
  accountName,
  member,
  profileCompletion,
  projects,
}: {
  accountName: string
  member: { membershipValidUntil?: number; uuid: string } | null
  profileCompletion: number
  projects: Array<{
    _id: string
    title: string
    domain: string
    projectState: string
  }>
}) {
  const activeProjects = projects.filter(
    (project) => project.projectState !== "completed"
  )
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#081321]">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
            {getInitials(accountName)}
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[9px] tracking-[0.16em] text-slate-400 uppercase">
              Crew identity
            </p>
            <h2 className="truncate text-sm font-semibold text-slate-950 dark:text-white">
              {accountName}
            </h2>
          </div>
        </div>

        {member ? (
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">
                  Profile readiness
                </span>
                <span className="font-mono font-semibold text-blue-700 dark:text-cyan-300">
                  {profileCompletion}%
                </span>
              </div>
              <ProgressBar value={profileCompletion} className="mt-2" />
            </div>
            <dl className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 text-[11px] dark:border-white/10">
              <div>
                <dt className="text-slate-400">Member UUID</dt>
                <dd className="mt-1 font-mono font-semibold text-slate-800 dark:text-slate-100">
                  {member.uuid}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Valid through</dt>
                <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                  {formatMembershipDate(member.membershipValidUntil)}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-400/15 dark:bg-orange-400/[0.07]">
            <div className="flex items-start gap-3">
              <Link2 className="mt-0.5 size-4 shrink-0 text-orange-600 dark:text-orange-300" />
              <p className="text-xs leading-5 text-orange-950 dark:text-orange-100">
                No member profile is connected to this authenticated account.
                Membership-only details stay hidden until a record is linked.
              </p>
            </div>
          </div>
        )}

        <Link
          href="/dashboard/profile"
          className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition outline-none hover:border-cyan-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-cyan-500 dark:border-white/10 dark:text-slate-200 dark:hover:border-cyan-400/40 dark:hover:bg-white/5"
        >
          {member ? "Review profile" : "Open account profile"}
          <ArrowRight className="size-3.5" />
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#081321]">
        <div className="flex items-center gap-2">
          <Satellite className="size-4 text-blue-600 dark:text-cyan-300" />
          <h2 className="font-display text-sm font-semibold text-slate-950 dark:text-white">
            Live program signals
          </h2>
        </div>
        <div className="mt-4 space-y-4">
          {activeProjects.slice(0, 3).map((project) => (
            <div key={project._id} className="flex gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan-500 shadow-[0_0_0_4px_rgba(6,182,212,.10)]" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {project.title}
                </p>
                <p className="mt-1 font-mono text-[9px] tracking-wide text-slate-400 uppercase">
                  {project.domain} / {project.projectState}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/dashboard/projects"
          className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-cyan-500 dark:text-cyan-300"
        >
          Browse programs <ArrowRight className="size-3" />
        </Link>
      </section>
    </div>
  )
}
