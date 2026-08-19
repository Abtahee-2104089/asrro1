import type { ReactNode } from "react"

export function SectionHeading({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string
  title: string
  copy?: string
  action?: ReactNode
}) {
  return (
    <div className="relative mb-9 flex flex-col gap-5 border-t border-[#2359d4]/15 pt-5 md:flex-row md:items-end md:justify-between dark:border-white/10">
      <span className="absolute -top-px left-0 h-px w-20 bg-[#00a6b2] dark:bg-[#65f2f1]" />
      <div className="max-w-3xl">
        <p className="mb-3 font-mono text-[10px] tracking-[0.24em] text-[#007d89] uppercase dark:text-[#65f2f1]">
          {eyebrow}
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-balance text-[#07111f] sm:text-5xl dark:text-[#f4fbff]">
          {title}
        </h2>
        {copy ? (
          <p className="mt-4 max-w-2xl leading-7 text-[#4b6175] dark:text-[#9fb1c5]">
            {copy}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
