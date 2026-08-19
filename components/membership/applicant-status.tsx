"use client"

import { useMutation, useQuery } from "convex/react"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Link2,
  LogOut,
  ShieldAlert,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { api } from "@/convex/_generated/api"
import { authClient } from "@/lib/auth-client"

function formatDate(value: number) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value)
}

export function ApplicantStatus() {
  const router = useRouter()
  const status = useQuery(api.membership.accountStatus)
  const linkApplication = useMutation(api.membership.linkApplicationToMyAccount)
  const initializeAdmin = useMutation(api.membership.initializeFirstAdmin)
  const [applicationCode, setApplicationCode] = useState("")
  const [trackingToken, setTrackingToken] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [linking, setLinking] = useState(false)
  const [bootstrap, setBootstrap] = useState({
    phone: "",
    institute: "",
    department: "",
    studentId: "",
    hscBatch: "",
  })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLinking(true)
    try {
      const result = await linkApplication({
        applicationCode,
        trackingToken,
      })
      if (result.status === "approved") {
        router.replace("/dashboard")
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The application could not be linked."
      )
    } finally {
      setLinking(false)
    }
  }

  if (status === undefined) {
    return <p className="text-sm text-slate-500">Loading account status…</p>
  }

  if (status.state === "member" && status.memberStatus === "active") {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
        <h1 className="mt-5 text-3xl font-semibold">Membership active</h1>
        <p className="mt-3 text-sm text-slate-500">
          Your account is linked to {status.uuid}.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-cyan-300 dark:text-slate-950"
        >
          Open member dashboard <ArrowRight className="size-4" />
        </Link>
      </div>
    )
  }

  const application = status.state === "applicant" ? status.application : null
  const isRejected = application?.status === "rejected"
  const isApproved = application?.status === "approved"

  return (
    <div className="space-y-7">
      <div className="text-center">
        {isRejected ? (
          <ShieldAlert className="mx-auto size-10 text-rose-600" />
        ) : isApproved ? (
          <Link2 className="mx-auto size-10 text-blue-600" />
        ) : (
          <Clock3 className="mx-auto size-10 text-amber-600" />
        )}
        <p className="mt-5 font-mono text-[10px] tracking-[.18em] text-cyan-700 uppercase dark:text-cyan-300">
          Account access
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em]">
          {isRejected
            ? "Application not approved"
            : isApproved
              ? "Link your approved record"
              : application
                ? "Application under review"
                : status.state === "member"
                  ? `Membership ${status.memberStatus}`
                  : "Link your membership application"}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
          Full member tools unlock only after an approved, active membership is
          linked to this signed-in account.
        </p>
      </div>

      {application ? (
        <dl className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 dark:border-white/10 dark:bg-white/10">
          {[
            ["Application", application.applicationCode],
            ["Applicant", application.fullName],
            ["Status", application.status],
            ["Submitted", formatDate(application.submittedAt)],
          ].map(([label, value]) => (
            <div key={label} className="bg-white p-4 dark:bg-[#0a1626]">
              <dt className="font-mono text-[9px] tracking-wider text-slate-400 uppercase">
                {label}
              </dt>
              <dd className="mt-1.5 text-sm font-semibold capitalize">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {application?.reviewNote ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
          <strong>Review note:</strong> {application.reviewNote}
        </div>
      ) : null}

      {status.state !== "member" && (!application?.linked || isApproved) ? (
        <form
          onSubmit={(event) => void submit(event)}
          className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[.035]"
        >
          <div>
            <h2 className="text-sm font-semibold">
              Link with tracking details
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Use the private code and token shown after application submission.
            </p>
          </div>
          <label className="block text-xs font-medium">
            Application code
            <input
              value={applicationCode}
              onChange={(event) => setApplicationCode(event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-950"
            />
          </label>
          <label className="block text-xs font-medium">
            Tracking token
            <input
              value={trackingToken}
              onChange={(event) => setTrackingToken(event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-950"
            />
          </label>
          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          <button
            type="submit"
            disabled={linking}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-cyan-300 dark:text-slate-950"
          >
            <Link2 className="size-4" />
            {linking ? "Linking…" : "Link application"}
          </button>
        </form>
      ) : null}

      {status.state === "unlinked" && status.canBootstrap ? (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setError(null)
            setLinking(true)
            void initializeAdmin(bootstrap)
              .then(() => router.replace("/dashboard"))
              .catch((cause: unknown) =>
                setError(
                  cause instanceof Error
                    ? cause.message
                    : "The administrator could not be initialized."
                )
              )
              .finally(() => setLinking(false))
          }}
          className="space-y-4 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5 dark:border-cyan-400/20 dark:bg-cyan-400/[.06]"
        >
          <div>
            <h2 className="text-sm font-semibold">Initialize this workspace</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              This one-time setup is available only while the member database is
              empty. Your signed-in account becomes the first super
              administrator.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["phone", "Phone"],
                ["institute", "Institute"],
                ["department", "Department"],
                ["studentId", "Student ID"],
                ["hscBatch", "HSC batch"],
              ] as const
            ).map(([field, label]) => (
              <label key={field} className="text-xs font-medium">
                {label}
                <input
                  value={bootstrap[field]}
                  onChange={(event) =>
                    setBootstrap((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))
                  }
                  required
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-950"
                />
              </label>
            ))}
          </div>
          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          <button
            type="submit"
            disabled={linking}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-cyan-300 dark:text-slate-950"
          >
            <ShieldAlert className="size-4" />
            {linking ? "Initializing…" : "Create first administrator"}
          </button>
        </form>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-xs dark:border-white/10">
        <Link href="/membership" className="font-semibold text-blue-600">
          Submit a new application
        </Link>
        <button
          type="button"
          onClick={() =>
            void authClient.signOut().then(() => router.replace("/login"))
          }
          className="inline-flex items-center gap-1.5 text-slate-500"
        >
          <LogOut className="size-3.5" /> Sign out
        </button>
      </div>
    </div>
  )
}
