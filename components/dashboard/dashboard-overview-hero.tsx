import {
  CheckCircle2,
  Link2,
  Orbit,
  Radio,
  ShieldCheck,
  Signal,
} from "lucide-react"

const dashboardEventDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "Asia/Dhaka",
})

type HeroMember = {
  fullName: string
  status: string
  systemRole: string
  uuid: string
}

export function DashboardOverviewHero({
  accountEmail,
  isLoading,
  member,
  nextEvent,
}: {
  accountEmail?: string
  isLoading: boolean
  member: HeroMember | null
  nextEvent?: { _id: string; name: string; startsAt: number }
}) {
  return (
    <section className="relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white text-slate-950 shadow-[0_22px_70px_rgba(15,23,42,.08)] dark:border-cyan-400/15 dark:bg-[#071321] dark:text-white dark:shadow-[0_24px_90px_rgba(0,0,0,.24)]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(37,99,235,.04)_50%,rgba(6,182,212,.08)_100%)] dark:bg-[linear-gradient(115deg,transparent_0%,rgba(37,99,235,.08)_52%,rgba(34,211,238,.12)_100%)]"
      />
      <div className="relative grid min-h-[23rem] lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,.85fr)]">
        <div className="flex flex-col justify-between border-b border-slate-200 p-5 sm:p-7 lg:border-r lg:border-b-0 lg:p-8 dark:border-white/10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-mono text-[9px] font-semibold tracking-[0.12em] text-emerald-700 uppercase dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                <Radio className="size-3" /> Portal signal nominal
              </span>
              <span className="font-mono text-[9px] tracking-[0.16em] text-slate-400 uppercase">
                ASRRO–OPS / CUET
              </span>
            </div>
            <h2 className="font-display mt-8 max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-balance sm:text-4xl">
              {member
                ? "Your operations brief is ready."
                : "Connect your crew identity to the mission record."}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {member
                ? `${member.fullName}, your ${member.status} membership record is synchronized with this account.`
                : "Your authenticated account is active, but no approved ASRRO membership record is linked yet. General portal access remains available."}
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.045]">
              <p className="font-mono text-[9px] tracking-[0.16em] text-slate-400 uppercase">
                Account channel
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
                <ShieldCheck className="size-4 text-emerald-500" />
                Secure account active
              </div>
              <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
                {accountEmail || "Authenticated session"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.045]">
              <p className="font-mono text-[9px] tracking-[0.16em] text-slate-400 uppercase">
                Membership link
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-100">
                {isLoading ? (
                  <Signal className="size-4 animate-pulse text-blue-500 motion-reduce:animate-none" />
                ) : member ? (
                  <CheckCircle2 className="size-4 text-cyan-500" />
                ) : (
                  <Link2 className="size-4 text-orange-500" />
                )}
                {isLoading
                  ? "Resolving record"
                  : member
                    ? `Member ${member.uuid}`
                    : "Record not connected"}
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                {member
                  ? `${member.systemRole.replace("_", " ")} access`
                  : "Open your profile for next steps"}
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[22rem] items-center justify-center overflow-hidden p-6 sm:p-8">
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/10 dark:border-cyan-300/10"
          />
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 size-[19rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-slate-300 dark:border-white/15"
          />
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 size-[12rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/20 dark:border-cyan-300/20"
          />
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 h-px w-[30rem] -translate-x-1/2 -translate-y-1/2 rotate-[24deg] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
          />
          <div className="relative z-10 grid size-36 place-items-center rounded-full border border-slate-200 bg-white/90 shadow-[0_20px_80px_rgba(37,99,235,.16)] backdrop-blur-sm dark:border-white/10 dark:bg-[#091a2e]/90 dark:shadow-[0_20px_80px_rgba(34,211,238,.12)]">
            <div className="text-center">
              <Orbit className="mx-auto size-7 text-blue-600 dark:text-cyan-300" />
              <p className="mt-3 font-mono text-[8px] tracking-[0.2em] text-slate-400 uppercase">
                Next operation
              </p>
              <p className="mt-1 text-sm font-semibold">
                {nextEvent
                  ? dashboardEventDateFormatter.format(nextEvent.startsAt)
                  : "Stand by"}
              </p>
            </div>
          </div>
          <span
            aria-hidden
            className="absolute top-[25%] left-[68%] size-3 rounded-full border-2 border-white bg-orange-500 shadow-[0_0_0_6px_rgba(249,115,22,.14),0_0_25px_rgba(249,115,22,.5)] dark:border-[#071321]"
          />
          <div className="absolute right-5 bottom-5 rounded-lg border border-slate-200 bg-white/85 px-3 py-2 backdrop-blur dark:border-white/10 dark:bg-[#071321]/80">
            <p className="font-mono text-[8px] tracking-[0.14em] text-slate-400 uppercase">
              Window code
            </p>
            <p className="mt-1 font-mono text-[10px] font-semibold text-blue-700 dark:text-cyan-300">
              {nextEvent ? `${nextEvent._id.slice(-8)} / OPEN` : "NO WINDOW"}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
