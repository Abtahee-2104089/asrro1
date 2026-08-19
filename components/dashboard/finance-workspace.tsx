"use client"

import { useQuery } from "convex/react"
import { LockKeyhole, Plus } from "lucide-react"
import { useState } from "react"

import {
  ActionButton,
  PageHeader,
  Panel,
} from "@/components/dashboard/dashboard-kit"
import { FinanceLedger } from "@/components/dashboard/finance-ledger"
import { FinanceSummary } from "@/components/dashboard/finance-summary"
import { FinanceBudgets } from "@/components/dashboard/finance-budgets"
import { FinanceTransactionForm } from "@/components/dashboard/finance-transaction-form"
import { api } from "@/convex/_generated/api"

export function FinanceWorkspace() {
  const access = useQuery(api.finance.access)
  const [editing, setEditing] = useState(false)
  const [fromDate, setFromDate] = useState(`${new Date().getFullYear()}-01-01`)
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10))

  if (access === undefined)
    return (
      <p className="p-8 text-sm text-slate-500">Checking finance access…</p>
    )
  if (!access.allowed || access.level === "none") {
    return (
      <Panel className="grid min-h-72 place-items-center p-8 text-center">
        <div>
          <LockKeyhole className="mx-auto size-7 text-amber-600" />
          <h1 className="mt-4 text-lg font-semibold">Restricted finance</h1>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            {access.reason}
          </p>
        </div>
      </Panel>
    )
  }

  const from = new Date(`${fromDate}T00:00:00`).getTime()
  const to = new Date(`${toDate}T23:59:59.999`).getTime()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Restricted finance"
        title="Financial operations"
        description="Posted income, expenditure and audit-ready reporting for authorized officers."
        actions={
          access.level === "manage" ? (
            <ActionButton onClick={() => setEditing((value) => !value)}>
              <Plus className="size-3.5" />
              Add transaction
            </ActionButton>
          ) : undefined
        }
      />
      {editing && access.level === "manage" ? (
        <Panel title="New transaction">
          <FinanceTransactionForm onDone={() => setEditing(false)} />
        </Panel>
      ) : null}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row dark:border-white/10 dark:bg-slate-950">
        <DateField label="From" value={fromDate} onChange={setFromDate} />
        <DateField label="To" value={toDate} onChange={setToDate} />
        <p className="self-end pb-3 text-xs text-slate-500">{access.reason}</p>
      </div>
      <FinanceSummary from={from} to={to} />
      {access.level === "manage" ? (
        <>
          <FinanceBudgets />
          <FinanceLedger from={from} to={to} />
        </>
      ) : (
        <Panel
          title="Summary-only access"
          description="Detailed transactions, references, receipts, and entry controls are hidden for this permission level."
        >
          <p className="p-5 text-sm text-slate-500">
            Ask a super administrator to grant detailed finance management if
            your committee responsibilities require ledger access.
          </p>
        </Panel>
      )}
    </div>
  )
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="text-xs font-medium">
      {label}
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 block h-11 rounded-xl border border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-slate-900"
      />
    </label>
  )
}
