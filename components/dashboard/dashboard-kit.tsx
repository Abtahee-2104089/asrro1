import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight, Ellipsis, Sparkles } from "lucide-react"
import type { ReactNode } from "react"

import { AnimatedNumber } from "@/components/motion/animated-number"
import { cn } from "@/lib/utils"

const metricToneClasses = {
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  cyan: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
  violet:
    "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  emerald:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
}

const statusToneClasses = {
  slate: "bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-slate-300",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-300",
  green:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300",
  red: "bg-rose-50 text-rose-700 dark:bg-rose-500/12 dark:text-rose-300",
  violet:
    "bg-violet-50 text-violet-700 dark:bg-violet-500/12 dark:text-violet-300",
}

const actionVariantClasses = {
  primary: "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
  quiet:
    "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/8",
  danger:
    "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/12 dark:text-rose-300",
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-blue-700 uppercase dark:text-blue-300">
            <span className="size-1.5 rounded-full bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.12)]" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-[-0.035em] text-balance text-slate-950 sm:text-[2rem] dark:text-white">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </header>
  )
}

export function Panel({
  children,
  className,
  title,
  description,
  action,
}: {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-white/10 dark:bg-slate-950/60",
        className
      )}
    >
      {title || description || action ? (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-white/8">
          <div>
            {title ? (
              <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "blue",
  prefix,
  suffix,
}: {
  label: string
  value: number
  detail: string
  icon: LucideIcon
  tone?: "blue" | "cyan" | "violet" | "amber" | "emerald"
  prefix?: string
  suffix?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-slate-950/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-[1.65rem] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
            {prefix}
            <AnimatedNumber value={value} />
            {suffix}
          </p>
        </div>
        <span
          className={cn(
            "grid size-9 place-items-center rounded-xl",
            metricToneClasses[tone]
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
        {detail}
      </p>
    </div>
  )
}

export function StatusPill({
  children,
  tone = "slate",
}: {
  children: ReactNode
  tone?: "slate" | "blue" | "green" | "amber" | "red" | "violet"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        statusToneClasses[tone]
      )}
    >
      <span className="size-1 rounded-full bg-current opacity-70" />
      {children}
    </span>
  )
}

export function ProgressBar({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10",
        className
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-blue-600"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function ActionButton({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet" | "danger"
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-slate-950",
        actionVariantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Delta({
  value,
  positive = true,
}: {
  value: string
  positive?: boolean
}) {
  const Icon = positive ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        "inline-flex items-center text-[11px] font-semibold",
        positive ? "text-emerald-600" : "text-rose-600"
      )}
    >
      <Icon className="mr-0.5 size-3" />
      {value}
    </span>
  )
}

export function IconMenuButton({ label = "More actions" }: { label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid size-8 place-items-center rounded-lg text-slate-400 transition outline-none hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-white/8 dark:hover:text-white"
    >
      <Ellipsis className="size-4" />
    </button>
  )
}

export function Insight({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs leading-5 text-blue-950 dark:border-blue-400/15 dark:bg-blue-500/8 dark:text-blue-100">
      <Sparkles
        className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-300"
        aria-hidden
      />
      <p>{children}</p>
    </div>
  )
}
