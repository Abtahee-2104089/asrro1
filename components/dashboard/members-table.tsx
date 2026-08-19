"use client"

import { useAction, useMutation, usePaginatedQuery } from "convex/react"
import { Check, Search, X } from "lucide-react"
import { useMemo, useState } from "react"

import { ActionButton, StatusPill } from "@/components/dashboard/dashboard-kit"
import { Input } from "@/components/motion/input"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

const memberAmountFormatter = new Intl.NumberFormat("en-BD", {
  maximumFractionDigits: 0,
})
const applicationDateFormatter = new Intl.DateTimeFormat("en-BD", {
  dateStyle: "medium",
  timeZone: "Asia/Dhaka",
})

export function MembersTable() {
  const [query, setQuery] = useState("")
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<Id<"membershipApplications">>>(
    new Set()
  )
  const [error, setError] = useState<string | null>(null)
  const review = useMutation(api.membership.reviewApplication)
  const bulkApprove = useAction(api.membership.bulkApproveApplications)
  const { results, status, loadMore } = usePaginatedQuery(
    api.membership.listApplications,
    { status: "pending" },
    { initialNumItems: 25 }
  )
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return results
    return results.filter((application) =>
      `${application.fullName} ${application.department} ${application.applicationCode} ${application.studentId}`
        .toLowerCase()
        .includes(needle)
    )
  }, [query, results])
  const allSelected =
    Boolean(filtered.length) &&
    filtered.every((application) => selected.has(application._id))

  async function approveSelected() {
    const applicationIds = [...selected]
    if (!applicationIds.length) return
    setWorkingId("bulk")
    setError(null)
    try {
      await bulkApprove({ applicationIds })
      setSelected(new Set())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Bulk approval failed")
    } finally {
      setWorkingId(null)
    }
  }

  async function decide(
    applicationId: (typeof results)[number]["_id"],
    decision: "approve" | "reject"
  ) {
    const reviewNote =
      decision === "reject"
        ? (prompt("Add a reason for the applicant (optional):") ?? undefined)
        : undefined
    setWorkingId(applicationId)
    setError(null)
    try {
      await review({ applicationId, decision, reviewNote })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Review failed")
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <>
      <div className="border-b border-slate-100 p-4 dark:border-white/8">
        <div className="flex flex-wrap gap-3">
          <Input
            value={query}
            onChange={setQuery}
            placeholder="Search pending applications…"
            leftIcon={<Search />}
            className="w-full sm:max-w-sm"
            classNames={{
              field: "h-9 rounded-xl bg-slate-50 dark:bg-white/5",
              input: "text-sm",
            }}
          />
          <ActionButton
            variant="secondary"
            disabled={!selected.size || workingId === "bulk"}
            onClick={() => void approveSelected()}
          >
            <Check className="size-3.5" /> Approve selected ({selected.size})
          </ActionButton>
        </div>
        {error ? <p className="mt-3 text-xs text-rose-600">{error}</p> : null}
      </div>
      {status === "LoadingFirstPage" ? (
        <p className="p-8 text-center text-sm text-slate-500">
          Loading applications…
        </p>
      ) : null}
      {status !== "LoadingFirstPage" && !filtered.length ? (
        <p className="p-8 text-center text-sm text-slate-500">
          No pending applications found.
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-semibold tracking-[0.12em] text-slate-400 uppercase dark:border-white/8">
              <th className="px-5 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() =>
                    setSelected(
                      allSelected
                        ? new Set()
                        : new Set(
                            filtered.map((application) => application._id)
                          )
                    )
                  }
                  aria-label="Select all visible applications"
                />
              </th>
              <th className="py-3 pr-4">Applicant</th>
              <th className="py-3 pr-4">Academic</th>
              <th className="py-3 pr-4">Payment</th>
              <th className="py-3 pr-4">Submitted</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-5 text-right">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/8">
            {filtered.map((application) => (
              <tr key={application._id}>
                <td className="px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selected.has(application._id)}
                    onChange={() =>
                      setSelected((current) => {
                        const next = new Set(current)
                        if (next.has(application._id))
                          next.delete(application._id)
                        else next.add(application._id)
                        return next
                      })
                    }
                    aria-label={`Select ${application.fullName}`}
                  />
                </td>
                <td className="py-4 pr-4">
                  <p className="text-xs font-semibold">
                    {application.fullName}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {application.applicationCode} · {application.email}
                  </p>
                </td>
                <td className="py-4 pr-4 text-xs">
                  {application.department} · HSC {application.hscBatch}
                  <p className="mt-1 text-[10px] text-slate-400">
                    {application.studentId}
                  </p>
                </td>
                <td className="py-4 pr-4 text-xs font-semibold">
                  {application.amountPaid !== undefined && application.currency
                    ? `${application.currency} ${memberAmountFormatter.format(application.amountPaid)}`
                    : application.transactionId}
                </td>
                <td className="py-4 pr-4 text-xs text-slate-500">
                  {applicationDateFormatter.format(application.submittedAt)}
                </td>
                <td className="py-4 pr-4">
                  <StatusPill tone="amber">Pending</StatusPill>
                </td>
                <td className="py-4 pr-5">
                  <div className="flex justify-end gap-1">
                    <ActionButton
                      variant="quiet"
                      disabled={workingId === application._id}
                      onClick={() => void decide(application._id, "reject")}
                      aria-label={`Reject ${application.fullName}`}
                    >
                      <X className="size-3.5 text-rose-600" />
                    </ActionButton>
                    <ActionButton
                      variant="quiet"
                      disabled={workingId === application._id}
                      onClick={() => void decide(application._id, "approve")}
                      aria-label={`Approve ${application.fullName}`}
                    >
                      <Check className="size-3.5 text-emerald-600" />
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {status === "CanLoadMore" ? (
        <button
          type="button"
          className="w-full border-t border-slate-100 p-4 text-xs font-semibold text-blue-600 dark:border-white/8"
          onClick={() => loadMore(25)}
        >
          Load more applications
        </button>
      ) : null}
    </>
  )
}
