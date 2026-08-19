"use client"

import { useQuery } from "convex/react"

import { Panel } from "@/components/dashboard/dashboard-kit"
import { api } from "@/convex/_generated/api"
import { formatMoney } from "@/lib/format"

export function FinanceSummary({ from, to }: { from: number; to: number }) {
  const fromMonth = new Date(from).toISOString().slice(0, 7)
  const toMonth = new Date(to).toISOString().slice(0, 7)
  const summary = useQuery(api.finance.summaryView, {
    currency: "BDT",
    from,
    to,
    fromMonth,
    toMonth,
  })

  if (summary === undefined) {
    return <p className="p-6 text-sm text-slate-500">Loading summary…</p>
  }

  const categoryMax = Math.max(
    ...summary.expenseCategories.map((item) => item.amount),
    1
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Income"
          value={summary.income}
          tone="text-emerald-600"
        />
        <SummaryCard
          label="Expense"
          value={summary.expense}
          tone="text-amber-600"
        />
        <SummaryCard
          label="Net cash flow"
          value={summary.net}
          tone="text-blue-600"
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950">
          <p className="text-xs text-slate-500">Posted transactions</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {summary.transactionCount.toLocaleString("en-US")}
            {summary.truncated ? "+" : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel
          title="Monthly trend"
          description="Income versus expense by month"
        >
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {summary.months.map((month) => {
              const max = Math.max(month.income, month.expense, 1)
              return (
                <article
                  key={month.monthKey}
                  className="rounded-xl border border-slate-200 p-4 dark:border-white/10"
                >
                  <p className="text-xs font-semibold">{month.monthKey}</p>
                  <Bar
                    label="Income"
                    value={month.income}
                    max={max}
                    tone="bg-emerald-500"
                  />
                  <Bar
                    label="Expense"
                    value={month.expense}
                    max={max}
                    tone="bg-amber-500"
                  />
                </article>
              )
            })}
            {summary.months.length === 0 ? (
              <p className="text-sm text-slate-500">
                No posted totals in this period.
              </p>
            ) : null}
          </div>
        </Panel>

        <Panel
          title="Expense categories"
          description="Posted expenditure distribution"
        >
          <div className="space-y-4 p-5">
            {summary.expenseCategories.map((category) => (
              <div key={category.category}>
                <div className="flex justify-between gap-4 text-xs">
                  <span className="font-medium">{category.category}</span>
                  <span className="text-slate-500 tabular-nums">
                    ৳{formatMoney(category.amount)}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <span
                    className="block h-full rounded-full bg-violet-500"
                    style={{
                      width: `${Math.max(2, (category.amount / categoryMax) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {summary.expenseCategories.length === 0 ? (
              <p className="text-sm text-slate-500">
                No expenses in this period.
              </p>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${tone}`}>
        ৳{formatMoney(value)}
      </p>
    </div>
  )
}

function Bar({
  label,
  value,
  max,
  tone,
}: {
  label: string
  value: number
  max: number
  tone: string
}) {
  return (
    <div className="mt-3">
      <div className="flex justify-between gap-3 text-[10px] text-slate-500">
        <span>{label}</span>
        <span>৳{formatMoney(value)}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/10">
        <span
          className={`block h-full rounded-full ${tone}`}
          style={{ width: `${Math.round((value / max) * 100)}%` }}
        />
      </div>
    </div>
  )
}
