import { MotionThemeToggle } from "@/components/motion/theme-toggle"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  return (
    <MotionThemeToggle
      variant="circle-blur"
      start="center"
      title="Change color theme"
      iconClassName="size-4"
      className={cn(
        "inline-grid size-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white/80 p-0 text-slate-700 shadow-sm backdrop-blur-xl transition hover:border-cyan-400 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none dark:border-white/12 dark:bg-white/6 dark:text-slate-200 dark:hover:border-cyan-300/60 dark:hover:text-white",
        className
      )}
    />
  )
}
