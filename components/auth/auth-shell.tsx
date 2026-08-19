import Link from "next/link"
import type { ReactNode } from "react"

import { AsrroMark } from "@/components/shared/asrro-mark"
import { ThemeToggle } from "@/components/shared/theme-toggle"

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-svh overflow-hidden bg-[#eef3f5] text-slate-950 dark:bg-[#050c17] dark:text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(8,145,178,0.13),transparent_30%),radial-gradient(circle_at_12%_85%,rgba(37,99,235,0.10),transparent_35%)] dark:bg-[radial-gradient(circle_at_72%_18%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_12%_85%,rgba(37,99,235,0.16),transparent_35%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 [background-image:linear-gradient(rgba(15,23,42,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.08)_1px,transparent_1px)] [background-size:72px_72px] opacity-40 dark:[background-image:linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] dark:opacity-[0.08]"
      />
      <ThemeToggle className="fixed top-5 right-5 z-30 sm:top-7 sm:right-7" />

      <div className="relative mx-auto grid min-h-svh max-w-[94rem] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden min-h-svh flex-col justify-between border-r border-slate-300/70 p-12 lg:flex xl:p-16 dark:border-white/8">
          <HomeBrand />

          <div className="max-w-xl pb-10">
            <div className="mb-9 flex items-center gap-4">
              <span className="h-px w-14 bg-cyan-300/70" />
              <span className="font-mono text-[10px] tracking-[0.2em] text-cyan-700 uppercase dark:text-cyan-300">
                Secure mission operations
              </span>
            </div>
            <p className="font-heading text-5xl leading-[1.04] font-medium tracking-[-0.05em] xl:text-6xl">
              Build together.
              <br />
              <span className="text-slate-500 dark:text-slate-500">
                Go beyond.
              </span>
            </p>
            <p className="mt-7 max-w-md text-base leading-7 text-slate-600 dark:text-slate-400">
              One workspace for member records, events, projects, research, and
              the teams moving ASRRO forward.
            </p>
          </div>

          <p className="font-mono text-[9px] tracking-[0.16em] text-slate-500 uppercase dark:text-slate-600">
            Andromeda Space & Robotics Research Organization
          </p>
        </section>

        <section className="flex min-h-svh items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
          <div className="w-full">
            <div className="mb-12 lg:hidden">
              <HomeBrand compact />
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}

function HomeBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="flex w-fit items-center gap-3 rounded-full focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
      aria-label="Back to ASRRO home"
    >
      <AsrroMark
        priority
        className={compact ? "size-14 rounded-2xl" : "size-16 rounded-2xl"}
      />
      <span>
        <span
          className={
            compact
              ? "font-heading text-sm font-bold tracking-[0.16em]"
              : "block font-heading text-lg font-bold tracking-[0.12em]"
          }
        >
          ASRRO
        </span>
        {compact ? null : (
          <span className="block font-mono text-[9px] tracking-[0.18em] text-slate-600 uppercase dark:text-slate-500">
            CUET · Bangladesh
          </span>
        )}
      </span>
    </Link>
  )
}
