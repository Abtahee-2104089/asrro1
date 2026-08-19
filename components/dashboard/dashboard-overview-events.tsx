import { Clock3, MapPin } from "lucide-react"
import Link from "next/link"

import { ProgressBar, StatusPill } from "@/components/dashboard/dashboard-kit"
type OverviewEvent = {
  _id: string
  name: string
  scope: "intra_cuet" | "divisional" | "national"
  startsAt: number
  venue: string
  capacity: number
  activeRegistrationCount: number
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "Asia/Dhaka",
})
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Dhaka",
})

export function DashboardOverviewEvents({
  events,
}: {
  events: OverviewEvent[]
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#081321]">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6 dark:border-white/10">
        <div>
          <p className="font-mono text-[9px] tracking-[0.16em] text-blue-700 uppercase dark:text-cyan-300">
            Flight plan / Events
          </p>
          <h2 className="font-display mt-1 text-base font-semibold text-slate-950 dark:text-white">
            Upcoming mission windows
          </h2>
        </div>
        <Link
          href="/dashboard/events"
          className="shrink-0 text-xs font-semibold text-blue-700 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-cyan-500 dark:text-cyan-300"
        >
          View schedule
        </Link>
      </div>
      <div className="divide-y divide-slate-200 dark:divide-white/10">
        {events.slice(0, 4).map((event) => {
          const occupancy = Math.round(
            (event.activeRegistrationCount / Math.max(event.capacity, 1)) * 100
          )
          const [day, month] = dateFormat.format(event.startsAt).split(" ", 2)
          return (
            <article
              key={event._id}
              className="grid gap-4 px-5 py-5 transition hover:bg-slate-50/80 sm:grid-cols-[4.25rem_minmax(0,1fr)_auto] sm:items-center sm:px-6 dark:hover:bg-white/[0.025]"
            >
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.04]">
                <span className="font-mono text-[9px] font-semibold tracking-[0.16em] text-blue-700 uppercase dark:text-cyan-300">
                  {month}
                </span>
                <span className="font-mono text-xl font-semibold text-slate-950 dark:text-white">
                  {day}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                    {event.name}
                  </h3>
                  <StatusPill tone="blue">{event.scope}</StatusPill>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3" />{" "}
                    {timeFormat.format(event.startsAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3" /> {event.venue}
                  </span>
                </div>
              </div>
              <div className="w-full sm:w-28">
                <div className="flex justify-between font-mono text-[8px] tracking-wide text-slate-400 uppercase">
                  <span>Capacity</span>
                  <span>{occupancy}%</span>
                </div>
                <ProgressBar value={occupancy} className="mt-2" />
                <p className="mt-2 text-right font-mono text-[9px] text-slate-500 dark:text-slate-400">
                  {event.activeRegistrationCount}/{event.capacity}
                </p>
              </div>
            </article>
          )
        })}
        {events.length === 0 ? (
          <p className="px-6 py-10 text-center text-xs text-slate-500">
            No upcoming event windows are published.
          </p>
        ) : null}
      </div>
    </section>
  )
}
