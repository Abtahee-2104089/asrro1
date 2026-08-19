"use client"

import { useQuery } from "convex/react"
import { CheckCircle2, Clock3, Search, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { useState, type FormEvent } from "react"

import { api } from "@/convex/_generated/api"

export function ApplicationTracker() {
  const [formCode, setFormCode] = useState("")
  const [formToken, setFormToken] = useState("")
  const [credentials, setCredentials] = useState<{
    applicationCode: string
    trackingToken: string
  } | null>(null)
  const result = useQuery(
    api.membership.trackApplication,
    credentials ?? "skip"
  )

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCredentials({
      applicationCode: formCode.trim(),
      trackingToken: formToken.trim(),
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form
        onSubmit={submit}
        className="space-y-5 rounded-2xl border border-[#2359d4]/15 bg-white p-6 shadow-[0_16px_45px_rgba(25,55,90,.08)] sm:p-8 dark:border-white/10 dark:bg-[#09182a]"
      >
        <div>
          <p className="font-mono text-[10px] tracking-[.2em] text-[#007d89] uppercase dark:text-[#65f2f1]">
            Private application lookup
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">
            Check your review status.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#587084] dark:text-[#9fb1c5]">
            Enter both references issued when you submitted your application.
          </p>
        </div>
        <label className="block text-sm">
          Application code
          <input
            value={formCode}
            onChange={(event) => setFormCode(event.target.value)}
            required
            className="mt-2 h-12 w-full border border-[#2359d4]/15 bg-[#f4f7fb] px-4 font-mono outline-none focus:border-[#00a6b2] dark:border-white/10 dark:bg-[#06101f]"
          />
        </label>
        <label className="block text-sm">
          Tracking token
          <input
            value={formToken}
            onChange={(event) => setFormToken(event.target.value)}
            required
            className="mt-2 h-12 w-full border border-[#2359d4]/15 bg-[#f4f7fb] px-4 font-mono outline-none focus:border-[#00a6b2] dark:border-white/10 dark:bg-[#06101f]"
          />
        </label>
        <button className="inline-flex min-h-11 items-center gap-2 bg-[#07111f] px-5 font-semibold text-white dark:bg-[#65f2f1] dark:text-[#03101e]">
          <Search className="size-4" /> Check status
        </button>
      </form>

      {credentials && result === undefined ? (
        <p className="mt-5 text-center text-sm text-[#587084]">Checking…</p>
      ) : null}
      {credentials && result === null ? (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200">
          No application matched both references. Check them and try again.
        </p>
      ) : null}
      {result ? (
        <div className="mt-6 rounded-2xl border border-[#2359d4]/15 bg-white p-6 dark:border-white/10 dark:bg-[#09182a]">
          {result.status === "approved" ? (
            <CheckCircle2 className="size-8 text-emerald-600" />
          ) : result.status === "rejected" ? (
            <ShieldAlert className="size-8 text-rose-600" />
          ) : (
            <Clock3 className="size-8 text-amber-600" />
          )}
          <h2 className="mt-4 text-xl font-semibold capitalize">
            Application {result.status}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#587084] dark:text-[#9fb1c5]">
            Submitted {new Date(result.submittedAt).toLocaleDateString("en-BD")}
            {result.memberUuid ? ` · Member UUID ${result.memberUuid}` : ""}
          </p>
          {result.reviewNote ? (
            <p className="mt-4 rounded-lg bg-slate-100 p-4 text-sm dark:bg-white/5">
              {result.reviewNote}
            </p>
          ) : null}
          <Link
            href="/login?next=/applicant-status"
            className="mt-5 inline-flex text-sm font-semibold text-[#007d89] dark:text-[#65f2f1]"
          >
            Sign in to link this application →
          </Link>
        </div>
      ) : null}
    </div>
  )
}
