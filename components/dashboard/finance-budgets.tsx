"use client"

import { useMutation, useQuery } from "convex/react"
import { useState, type FormEvent } from "react"

import {
  ActionButton,
  Panel,
  StatusPill,
} from "@/components/dashboard/dashboard-kit"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { formatMoney } from "@/lib/format"

export function FinanceBudgets() {
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear())
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState("")
  const budgets = useQuery(api.financeBudgets.list, { fiscalYear })
  const events = useQuery(api.events.listManagedEvents)
  const save = useMutation(api.financeBudgets.upsert)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await save({
      fiscalYear,
      name: String(form.get("name")),
      eventId:
        String(form.get("eventId") || "") === ""
          ? undefined
          : (String(form.get("eventId")) as Id<"events">),
      currency: "BDT",
      plannedIncome: Number(form.get("plannedIncome")),
      plannedExpense: Number(form.get("plannedExpense")),
      status: String(form.get("status")) as "draft" | "approved" | "closed",
      notes: String(form.get("notes") || "") || undefined,
    })
    event.currentTarget.reset()
    setEditing(false)
    setMessage("Budget saved.")
  }

  return (
    <Panel
      title="Event and annual budgets"
      description="Plan expected income and expenditure before transactions are posted."
      action={
        <div className="flex items-center gap-2">
          <input
            aria-label="Fiscal year"
            type="number"
            value={fiscalYear}
            onChange={(event) => {
              const nextFiscalYear = event.currentTarget.valueAsNumber
              if (Number.isFinite(nextFiscalYear)) {
                setFiscalYear(nextFiscalYear)
              }
            }}
            className="h-9 w-24 rounded-lg border border-slate-200 px-2 text-xs dark:border-white/10 dark:bg-slate-900"
          />
          <ActionButton onClick={() => setEditing((value) => !value)}>
            {editing ? "Close form" : "New budget"}
          </ActionButton>
        </div>
      }
    >
      {editing ? (
        <form
          onSubmit={(event) => void submit(event)}
          className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-2 dark:border-white/8"
        >
          <Field name="name" label="Budget name" className="sm:col-span-2" />
          <label className="text-xs font-medium sm:col-span-2">
            Related event (optional)
            <select
              name="eventId"
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 dark:border-white/10 dark:bg-slate-900"
            >
              <option value="">Organization-wide budget</option>
              {events?.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <Field name="plannedIncome" label="Planned income" type="number" />
          <Field name="plannedExpense" label="Planned expense" type="number" />
          <label className="text-xs font-medium">
            Status
            <select
              name="status"
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 dark:border-white/10 dark:bg-slate-900"
            >
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <Field name="notes" label="Notes" required={false} />
          <ActionButton type="submit" className="sm:col-span-2">
            Save budget
          </ActionButton>
        </form>
      ) : null}
      <p role="status" className="px-5 pt-3 text-xs text-emerald-600">
        {message}
      </p>
      <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
        {budgets?.map((budget) => (
          <article
            key={budget._id}
            className="rounded-xl border border-slate-200 p-4 dark:border-white/10"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">{budget.name}</h3>
              <StatusPill
                tone={budget.status === "approved" ? "green" : "amber"}
              >
                {budget.status}
              </StatusPill>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-500">Income plan</dt>
                <dd className="mt-1 font-semibold">
                  ৳{formatMoney(budget.plannedIncome)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Expense plan</dt>
                <dd className="mt-1 font-semibold">
                  ৳{formatMoney(budget.plannedExpense)}
                </dd>
              </div>
            </dl>
            {budget.notes ? (
              <p className="mt-4 text-xs text-slate-500">{budget.notes}</p>
            ) : null}
          </article>
        ))}
        {budgets?.length === 0 ? (
          <p className="text-sm text-slate-500">No budgets for {fiscalYear}.</p>
        ) : null}
      </div>
    </Panel>
  )
}

function Field({
  name,
  label,
  type = "text",
  required = true,
  className = "",
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  className?: string
}) {
  return (
    <label className={`text-xs font-medium ${className}`}>
      {label}
      <input
        name={name}
        type={type}
        required={required}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? "0.01" : undefined}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 dark:border-white/10 dark:bg-slate-900"
      />
    </label>
  )
}
