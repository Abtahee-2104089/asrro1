"use client"

import { useMutation } from "convex/react"
import { useState, type FormEvent } from "react"

import { ActionButton } from "@/components/dashboard/dashboard-kit"
import { api } from "@/convex/_generated/api"

export function FinanceTransactionForm({ onDone }: { onDone: () => void }) {
  const createTransaction = useMutation(api.finance.createTransaction)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [direction, setDirection] = useState<"income" | "expense">("income")

  const categories =
    direction === "income"
      ? [
          "Membership fees",
          "Sponsor contributions",
          "Event income",
          "Donations",
          "Miscellaneous income",
        ]
      : [
          "Event expenses",
          "Equipment purchases",
          "Travel",
          "Training",
          "Miscellaneous expenses",
        ]

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const form = new FormData(event.currentTarget)
    try {
      await createTransaction({
        direction: form.get("direction") === "income" ? "income" : "expense",
        category: String(form.get("category")),
        amount: Number(form.get("amount")),
        currency: "BDT",
        occurredAt: new Date(String(form.get("date"))).getTime(),
        description: String(form.get("description")),
        reference: String(form.get("reference") || "") || undefined,
        status: form.get("status") === "draft" ? "draft" : "posted",
      })
      onDone()
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save transaction."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="grid gap-4 p-5 sm:grid-cols-2"
    >
      <Field label="Description" name="description" className="sm:col-span-2" />
      <label className="text-xs font-medium">
        Type
        <select
          name="direction"
          value={direction}
          onChange={(event) =>
            setDirection(event.target.value as "income" | "expense")
          }
          className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-slate-900"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </label>
      <label className="text-xs font-medium">
        Category
        <select
          key={direction}
          name="category"
          className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-slate-900"
        >
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <Field
        label="Amount (BDT)"
        name="amount"
        type="number"
        min="1"
        step="0.01"
      />
      <Field
        label="Date"
        name="date"
        type="date"
        defaultValue={new Date().toISOString().slice(0, 10)}
      />
      <Field
        label="Reference (optional)"
        name="reference"
        className="sm:col-span-2"
        required={false}
      />
      <label className="text-xs font-medium">
        Posting state
        <select
          name="status"
          className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-slate-900"
        >
          <option value="posted">Post now</option>
          <option value="draft">Save draft</option>
        </select>
      </label>
      <div className="flex items-end justify-end gap-2">
        <ActionButton type="button" variant="secondary" onClick={onDone}>
          Cancel
        </ActionButton>
        <ActionButton type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save transaction"}
        </ActionButton>
      </div>
      {error ? (
        <p role="alert" className="text-xs text-rose-600 sm:col-span-2">
          {error}
        </p>
      ) : null}
    </form>
  )
}

function Field({
  label,
  className,
  required = true,
  ...props
}: {
  label: string
  name: string
  className?: string
  required?: boolean
  type?: string
  min?: string
  step?: string
  defaultValue?: string
}) {
  return (
    <label className={`text-xs font-medium ${className ?? ""}`}>
      {label}
      <input
        required={required}
        {...props}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-slate-900"
      />
    </label>
  )
}
