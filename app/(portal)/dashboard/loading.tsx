export default function DashboardLoading() {
  return (
    <div
      className="animate-pulse space-y-5 motion-reduce:animate-none sm:space-y-6"
      aria-label="Loading portal content"
    >
      <div className="space-y-3">
        <div className="h-2.5 w-44 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="h-8 w-72 max-w-full rounded-lg bg-slate-200 dark:bg-white/10" />
        <div className="h-3 w-96 max-w-full rounded-full bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="h-[30rem] rounded-[1.6rem] border border-slate-200 bg-white dark:border-white/10 dark:bg-[#071321]" />
      <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-4 dark:border-white/10 dark:bg-[#081321]">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 border-slate-200 bg-slate-100/70 sm:border-l dark:border-white/10 dark:bg-white/[0.035]"
          />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_.6fr]">
        <div className="h-96 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#081321]" />
        <div className="h-80 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#081321]" />
      </div>
    </div>
  )
}
