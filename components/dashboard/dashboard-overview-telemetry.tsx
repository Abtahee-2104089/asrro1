import {
  CalendarDays,
  CircleDotDashed,
  FolderKanban,
  UsersRound,
} from "lucide-react"

export function DashboardOverviewTelemetry({
  events,
  projects,
}: {
  events: Array<{ capacity: number; activeRegistrationCount: number }>
  projects: Array<{ projectState: string }>
}) {
  const activeProjects = projects.filter(
    (project) => project.projectState !== "completed"
  )
  const telemetry = [
    {
      label: "Upcoming windows",
      value: events.length.toString().padStart(2, "0"),
      detail: "Published events",
      icon: CalendarDays,
      tone: "text-blue-600 dark:text-blue-300",
    },
    {
      label: "Registered seats",
      value: events
        .reduce((total, event) => total + event.activeRegistrationCount, 0)
        .toLocaleString("en-US"),
      detail: "Across open events",
      icon: UsersRound,
      tone: "text-cyan-600 dark:text-cyan-300",
    },
    {
      label: "Capacity remaining",
      value: events
        .reduce(
          (total, event) =>
            total + event.capacity - event.activeRegistrationCount,
          0
        )
        .toString()
        .padStart(3, "0"),
      detail: "Available seats",
      icon: CircleDotDashed,
      tone: "text-orange-600 dark:text-orange-300",
    },
    {
      label: "Active programs",
      value: activeProjects.length.toString().padStart(2, "0"),
      detail: "Research and build",
      icon: FolderKanban,
      tone: "text-violet-600 dark:text-violet-300",
    },
  ]
  return (
    <section
      aria-label="Organization telemetry"
      className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,.03)] sm:grid-cols-2 xl:grid-cols-4 dark:border-white/10 dark:bg-[#081321]"
    >
      {telemetry.map((item, index) => (
        <div
          key={item.label}
          className={`group flex min-h-28 items-center gap-4 p-4 sm:p-5 ${
            index > 0
              ? "border-t border-slate-200 sm:border-t-0 sm:border-l dark:border-white/10"
              : ""
          } ${index === 2 ? "sm:border-l-0 xl:border-l" : ""} ${
            index >= 2 ? "sm:border-t xl:border-t-0 dark:border-white/10" : ""
          }`}
        >
          <span
            className={`grid size-9 shrink-0 place-items-center ${item.tone}`}
          >
            <item.icon className="size-[18px]" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[9px] tracking-[0.14em] text-slate-400 uppercase">
              {item.label}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-semibold tracking-[-0.06em] text-slate-950 tabular-nums dark:text-white">
                {item.value}
              </span>
              <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                {item.detail}
              </span>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
