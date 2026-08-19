import type { ReactNode } from "react"

export function PageHero({
  eyebrow,
  title,
  intro,
  aside,
}: {
  eyebrow: string
  title: string
  intro: string
  aside?: ReactNode
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-[#2359d4]/15 px-5 pt-14 pb-16 sm:px-8 lg:px-12 lg:pt-24 lg:pb-20 dark:border-white/10">
      <div className="pointer-events-none absolute -top-44 right-[6%] -z-10 size-[34rem] rounded-full border border-[#2359d4]/10 dark:border-[#65f2f1]/10" />
      <div className="pointer-events-none absolute -top-28 right-[11%] -z-10 size-[24rem] rounded-full border border-dashed border-[#00a6b2]/15 dark:border-[#65f2f1]/15" />
      <div className="mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[6rem_minmax(0,1fr)_22rem] lg:items-end">
        <div className="hidden h-full border-r border-[#2359d4]/15 pr-5 lg:flex lg:flex-col lg:justify-between dark:border-white/10">
          <span className="font-mono text-[9px] tracking-[.18em] text-[#597084] uppercase dark:text-[#7890a8]">
            Public
            <br />
            record
          </span>
          <span className="size-2 bg-[#d97706] shadow-[0_0_16px_rgba(217,119,6,.5)]" />
        </div>
        <div>
          <p className="mb-5 flex items-center gap-3 font-mono text-[10px] tracking-[0.24em] text-[#007d89] uppercase dark:text-[#65f2f1]">
            <span className="h-px w-7 bg-current" />
            {eyebrow}
          </p>
          <h1 className="max-w-4xl font-heading text-5xl leading-[0.94] font-semibold tracking-[-0.055em] text-balance text-[#07111f] sm:text-6xl lg:text-8xl dark:text-[#f4fbff]">
            {title}
          </h1>
        </div>
        <div className="border-l-2 border-[#2359d4] pl-5 dark:border-[#65f2f1]">
          <p className="text-base leading-7 text-[#425a70] dark:text-[#b9c8d9]">
            {intro}
          </p>
          {aside}
        </div>
      </div>
    </section>
  )
}
