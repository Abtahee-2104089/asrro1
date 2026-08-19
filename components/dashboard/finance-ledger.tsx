"use client"

import { usePaginatedQuery, useQuery } from "convex/react"
import { Download } from "lucide-react"

import {
  ActionButton,
  Panel,
  StatusPill,
} from "@/components/dashboard/dashboard-kit"
import { api } from "@/convex/_generated/api"
import {
  exportCsv,
  exportExcel,
  exportPdf,
  type ExportRow,
} from "@/lib/export-data"
import { formatMoney } from "@/lib/format"

export function FinanceLedger({ from, to }: { from: number; to: number }) {
  const ledger = usePaginatedQuery(
    api.finance.ledger,
    { from, to },
    { initialNumItems: 50 }
  )
  const fromMonth = new Date(from).toISOString().slice(0, 7)
  const toMonth = new Date(to).toISOString().slice(0, 7)
  const summaries = useQuery(api.finance.monthlySummary, {
    currency: "BDT",
    fromMonth,
    toMonth,
  })
  const rows: ExportRow[] = ledger.results.map((transaction) => ({
    Reference: transaction.reference ?? transaction._id,
    Description: transaction.description,
    Category: transaction.category,
    Date: new Date(transaction.occurredAt).toISOString().slice(0, 10),
    Type: transaction.direction,
    Amount: transaction.amount,
    Currency: transaction.currency,
  }))
  const income = summaries?.reduce((total, item) => total + item.income, 0) ?? 0
  const expense =
    summaries?.reduce((total, item) => total + item.expense, 0) ?? 0

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Summary label="Income" value={income} tone="text-emerald-600" />
        <Summary label="Expense" value={expense} tone="text-amber-600" />
        <Summary
          label="Net balance"
          value={income - expense}
          tone="text-blue-600"
        />
      </div>
      {summaries?.length ? (
        <Panel
          title="Monthly cash flow"
          description="Posted income and expenditure"
        >
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {summaries.map((item) => {
              const max = Math.max(item.income, item.expense, 1)
              return (
                <article
                  key={item._id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-white/10"
                >
                  <p className="text-xs font-semibold">{item.monthKey}</p>
                  <Bar
                    label="Income"
                    value={item.income}
                    max={max}
                    tone="bg-emerald-500"
                  />
                  <Bar
                    label="Expense"
                    value={item.expense}
                    max={max}
                    tone="bg-amber-500"
                  />
                </article>
              )
            })}
          </div>
        </Panel>
      ) : null}
      <Panel
        title="Ledger"
        description={`${ledger.results.length} loaded posted transactions`}
        action={
          <div className="flex flex-wrap gap-2">
            <ExportButton
              label="CSV"
              onClick={() => exportCsv(rows, "asrro-finance.csv")}
            />
            <ExportButton
              label="Excel"
              onClick={() => exportExcel(rows, "asrro-finance.xls")}
            />
            <ExportButton
              label="PDF"
              onClick={() =>
                void exportPdf(
                  rows,
                  "asrro-finance.pdf",
                  "ASRRO finance report"
                )
              }
            />
          </div>
        }
      >
        {ledger.results.length ? (
          <div className="divide-y divide-slate-100 dark:divide-white/8">
            {ledger.results.map((transaction) => (
              <article
                key={transaction._id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold">
                    {transaction.description}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {transaction.category} ·{" "}
                    {new Date(transaction.occurredAt).toLocaleDateString()} ·{" "}
                    {transaction.reference ?? transaction._id}
                  </p>
                </div>
                <StatusPill
                  tone={transaction.direction === "income" ? "green" : "amber"}
                >
                  {transaction.direction}
                </StatusPill>
                <p className="text-sm font-bold tabular-nums">
                  {transaction.direction === "income" ? "+" : "−"}
                  {formatMoney(transaction.amount)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">
            No posted transactions in this period.
          </p>
        )}
        {ledger.status === "CanLoadMore" ? (
          <div className="border-t border-slate-100 p-4 text-center dark:border-white/8">
            <ActionButton
              variant="secondary"
              onClick={() => ledger.loadMore(50)}
            >
              Load more
            </ActionButton>
          </div>
        ) : null}
      </Panel>
    </div>
  )
}

function Summary({
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
      <p className={`mt-2 text-2xl font-semibold ${tone}`}>
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
      <div className="flex justify-between text-[10px] text-slate-500">
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

function ExportButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <ActionButton variant="secondary" onClick={onClick} disabled={false}>
      <Download className="size-3.5" />
      {label}
    </ActionButton>
  )
}
