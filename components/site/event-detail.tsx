"use client"

import { useMutation, useQuery } from "convex/react"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Download,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useState, type FormEvent, type InputHTMLAttributes } from "react"

import { EventEligibilityUpload } from "@/components/site/event-eligibility-upload"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  downloadParticipationCertificatePdf,
  downloadParticipationConfirmationPdf,
} from "@/lib/event-documents"

type Receipt = {
  registrationId: Id<"eventRegistrations">
  registrationCode: string
  status:
    "pending" | "confirmed" | "rejected" | "cancelled" | "attended" | "absent"
  registeredAt: number
  cancellationToken?: string
  participantName: string
}

export function EventDetail({ slug }: { slug: string }) {
  const event = useQuery(api.events.getPublicBySlug, { slug })
  const member = useQuery(api.members.me)
  const bannerUrl = useQuery(
    api.assets.getPublicUrl,
    event?.bannerAssetId ? { assetId: event.bannerAssetId } : "skip"
  )
  const registerGuest = useMutation(api.events.registerGuest)
  const registerMember = useMutation(api.events.registerMember)
  const cancelGuest = useMutation(api.events.cancelGuest)
  const cancelMine = useMutation(api.events.cancelMine)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [lookupCode, setLookupCode] = useState("")
  const [lookupToken, setLookupToken] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [now] = useState(() => Date.now())
  const lookedUp = useQuery(
    api.events.getGuestRegistrationStatus,
    lookupCode.trim() && lookupToken.trim()
      ? { registrationCode: lookupCode, cancellationToken: lookupToken }
      : "skip"
  )

  if (event === undefined) {
    return (
      <div className="mx-auto min-h-[60vh] max-w-[88rem] animate-pulse px-5 py-16" />
    )
  }
  if (event === null) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="text-4xl font-semibold">Event not found</h1>
        <Link className="mt-6 inline-block text-[#007d89]" href="/events">
          Return to events
        </Link>
      </div>
    )
  }
  const eventData = event

  const fill = Math.min(
    100,
    Math.round((event.activeRegistrationCount / event.capacity) * 100)
  )
  const registrationOpen =
    event.status === "published" &&
    now <= event.registrationDeadline &&
    event.activeRegistrationCount < event.capacity
  const date = new Date(event.startsAt)

  async function onGuestSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    setBusy(true)
    setMessage("")
    const form = new FormData(formEvent.currentTarget)
    try {
      const result = await registerGuest({
        eventId: eventData._id,
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        institution: String(form.get("institution") ?? ""),
        institutionDivision:
          String(form.get("institutionDivision") ?? "") || undefined,
        institutionEmail:
          String(form.get("institutionEmail") ?? "") || undefined,
        studentId: String(form.get("studentId") ?? "") || undefined,
        eligibilityConfirmed: form.get("eligibilityConfirmed") === "on",
        eligibilityEvidenceAssetId:
          (String(
            form.get("eligibilityEvidenceAssetId") ?? ""
          ) as Id<"assets">) || undefined,
        eligibilityEvidenceNote:
          String(form.get("eligibilityEvidenceNote") ?? "") || undefined,
        transactionId: String(form.get("transactionId") ?? "") || undefined,
      })
      const participantName = String(form.get("name") ?? "")
      setReceipt({ ...result, participantName })
      setLookupCode(result.registrationCode)
      setLookupToken(result.cancellationToken)
      setMessage("Registration received. Save the cancellation token below.")
      formEvent.currentTarget.reset()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setBusy(false)
    }
  }

  async function onMemberSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    if (!member) return
    setBusy(true)
    setMessage("")
    const form = new FormData(formEvent.currentTarget)
    try {
      const result = await registerMember({
        eventId: eventData._id,
        institutionDivision:
          String(form.get("institutionDivision") ?? "") || undefined,
        eligibilityConfirmed: form.get("eligibilityConfirmed") === "on",
        transactionId: String(form.get("transactionId") ?? "") || undefined,
      })
      setReceipt({ ...result, participantName: member.fullName })
      setMessage("Your member registration has been recorded.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setBusy(false)
    }
  }

  async function cancelGuestRegistration() {
    setBusy(true)
    try {
      await cancelGuest({
        registrationCode: lookupCode,
        cancellationToken: lookupToken,
      })
      setReceipt((current) =>
        current ? { ...current, status: "cancelled" } : current
      )
      setMessage("Registration cancelled.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cancellation failed")
    } finally {
      setBusy(false)
    }
  }

  async function downloadConfirmation(item: Receipt) {
    await downloadParticipationConfirmationPdf({
      registrationCode: item.registrationCode,
      status: item.status,
      participantName: item.participantName,
      eventName: eventData.name,
      startsAt: eventData.startsAt,
      venue: eventData.venue,
    })
  }

  return (
    <>
      <section className="px-5 pt-10 pb-16 sm:px-8 lg:px-12 lg:pb-20">
        <div className="mx-auto max-w-[88rem]">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-[#587084] hover:text-[#07111f] dark:text-[#8fa7c0] dark:hover:text-white"
          >
            <ArrowLeft className="size-4" /> Back to events
          </Link>
          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                {[
                  event.category,
                  event.scope.replaceAll("_", " "),
                  event.audience,
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-[#00a6b2]/30 px-3 py-1 font-mono text-[9px] tracking-[.16em] text-[#007d89] uppercase dark:border-[#65f2f1]/25 dark:text-[#65f2f1]"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <h1 className="max-w-5xl text-5xl leading-[.94] font-semibold tracking-[-.055em] sm:text-7xl">
                {event.name}
              </h1>
              <p className="mt-7 max-w-3xl text-xl leading-8 text-[#425a70] dark:text-[#b9c8d9]">
                {event.summary}
              </p>
            </div>
            <div className="rounded-2xl border border-[#2359d4]/25 bg-[#eef3ff] p-6 dark:border-[#3d8bff]/35 dark:bg-[#0b1d31]">
              <p className="font-mono text-[9px] tracking-[.17em] text-[#587084] uppercase dark:text-[#71869e]">
                Registration status
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {registrationOpen
                  ? "Registration open"
                  : event.activeRegistrationCount >= event.capacity
                    ? "Capacity reached"
                    : "Registration closed"}
              </p>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#2359d4]/10 dark:bg-white/10">
                <span
                  className="block h-full bg-[#00a6b2] dark:bg-[#65f2f1]"
                  style={{ width: `${fill}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[#587084] dark:text-[#8296ad]">
                {event.activeRegistrationCount} of {event.capacity} places
                claimed
              </p>
              <p className="mt-4 text-xs leading-5 text-[#587084] dark:text-[#8fa7c0]">
                Deadline:{" "}
                {new Date(event.registrationDeadline).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {bannerUrl ? (
        <div className="px-5 pb-14 sm:px-8 lg:px-12">
          <div
            role="img"
            aria-label={`${event.name} event banner`}
            className="mx-auto aspect-[21/8] max-w-[88rem] rounded-2xl bg-cover bg-center shadow-[0_20px_70px_rgba(7,17,31,.18)]"
            style={{ backgroundImage: `url(${bannerUrl})` }}
          />
        </div>
      ) : null}

      <section className="border-y border-[#2359d4]/15 bg-[#eaf0f6] px-5 py-10 sm:px-8 lg:px-12 dark:border-white/10 dark:bg-[#081524]">
        <dl className="mx-auto grid max-w-[88rem] gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [CalendarDays, "Date", date.toLocaleDateString()],
            [
              Clock,
              "Time",
              date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            ],
            [MapPin, "Venue", event.venue],
            [
              CircleDollarSign,
              "Fee",
              event.registrationFee === 0
                ? "Free"
                : `${event.currency} ${event.registrationFee}`,
            ],
          ].map(([Icon, label, value]) => (
            <div key={String(label)} className="flex gap-3">
              <Icon className="mt-1 size-5 shrink-0 text-[#007d89] dark:text-[#65f2f1]" />
              <div>
                <dt className="font-mono text-[9px] tracking-[.16em] text-[#587084] uppercase dark:text-[#71869e]">
                  {String(label)}
                </dt>
                <dd className="mt-1 text-[#182b3d] dark:text-[#dbe7f3]">
                  {String(value)}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[88rem] gap-12 lg:grid-cols-[1fr_24rem]">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-.04em]">
              Event brief
            </h2>
            <p className="mt-5 leading-8 whitespace-pre-line text-[#425a70] dark:text-[#9fb1c5]">
              {event.description}
            </p>
            <h3 className="mt-10 text-xl font-semibold">Eligibility</h3>
            <p className="mt-3 leading-7 text-[#425a70] dark:text-[#b9c8d9]">
              {event.eligibility}
            </p>
            <ScopeRule scope={event.scope} />
            <h3 className="mt-10 text-xl font-semibold">Participation rules</h3>
            <p className="mt-3 leading-7 whitespace-pre-line text-[#425a70] dark:text-[#9fb1c5]">
              {event.rules ??
                "Follow organizer instructions, venue safety requirements, and the published eligibility conditions."}
            </p>
          </div>
          <aside className="h-fit rounded-2xl border border-[#2359d4]/15 bg-white/85 p-6 dark:border-white/10 dark:bg-[#09182a]">
            <Users className="size-5 text-[#d97706] dark:text-[#ffb84d]" />
            <p className="mt-5 font-mono text-[9px] tracking-[.16em] text-[#587084] uppercase dark:text-[#71869e]">
              Organizer
            </p>
            <p className="mt-2 font-semibold">{event.organizer}</p>
            <p className="mt-6 font-mono text-[9px] tracking-[.16em] text-[#587084] uppercase dark:text-[#71869e]">
              Contact person
            </p>
            <p className="mt-2 text-[#425a70] dark:text-[#b9c8d9]">
              {event.contactName}
            </p>
            {event.contactEmail && (
              <a
                className="mt-1 block text-sm text-[#007d89] dark:text-[#65f2f1]"
                href={`mailto:${event.contactEmail}`}
              >
                {event.contactEmail}
              </a>
            )}
            {event.contactPhone && (
              <a
                className="mt-1 block text-sm text-[#007d89] dark:text-[#65f2f1]"
                href={`tel:${event.contactPhone}`}
              >
                {event.contactPhone}
              </a>
            )}
          </aside>
        </div>
      </section>

      <section className="border-t border-[#2359d4]/15 bg-[#f2f6fa] px-5 py-20 sm:px-8 lg:px-12 dark:border-white/10 dark:bg-[#06101f]">
        <div className="mx-auto grid max-w-[72rem] gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-.04em]">
              Register
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#587084] dark:text-[#8fa7c0]">
              Paid registrations remain pending until an executive verifies the
              transaction.
            </p>
            {registrationOpen ? (
              member && event.audience !== "public" ? (
                <RegistrationForm
                  onSubmit={onMemberSubmit}
                  scope={event.scope}
                  paid={event.registrationFee > 0}
                  evidenceRequired={false}
                  busy={busy}
                  member
                />
              ) : member ? (
                <div className="mt-6 space-y-5">
                  <p className="text-sm text-[#587084] dark:text-[#8fa7c0]">
                    Signed in as {member.fullName}. This registration will be
                    linked to your member record.
                  </p>
                  <RegistrationForm
                    onSubmit={onMemberSubmit}
                    scope={event.scope}
                    paid={event.registrationFee > 0}
                    evidenceRequired={false}
                    busy={busy}
                    member
                  />
                </div>
              ) : event.audience === "public" ? (
                <RegistrationForm
                  onSubmit={onGuestSubmit}
                  scope={event.scope}
                  paid={event.registrationFee > 0}
                  evidenceRequired={
                    event.eligibilityEvidenceRequired ??
                    event.scope !== "national"
                  }
                  busy={busy}
                />
              ) : (
                <p className="mt-6 rounded-xl border border-[#2359d4]/15 bg-white p-5 text-sm dark:border-white/10 dark:bg-[#09182a]">
                  <Link
                    href={`/login?next=/events/${event.slug}`}
                    className="font-semibold text-[#007d89]"
                  >
                    Sign in
                  </Link>{" "}
                  with an eligible member account to register.
                </p>
              )
            ) : (
              <p className="mt-6 rounded-xl border border-[#2359d4]/15 bg-white p-5 text-sm dark:border-white/10 dark:bg-[#09182a]">
                Registration is no longer available.
              </p>
            )}
            {message && (
              <p className="mt-4 rounded-lg bg-[#2359d4]/8 p-3 text-sm dark:bg-white/8">
                {message}
              </p>
            )}
            {receipt && (
              <ReceiptCard
                receipt={receipt}
                token={receipt.cancellationToken}
                onDownload={() => downloadConfirmation(receipt)}
                onCancel={
                  receipt.cancellationToken
                    ? cancelGuestRegistration
                    : async () => {
                        await cancelMine({
                          registrationId: receipt.registrationId,
                        })
                        setReceipt({ ...receipt, status: "cancelled" })
                      }
                }
                busy={busy}
              />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-[-.03em]">
              Guest registration status
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#587084] dark:text-[#8fa7c0]">
              Enter both values supplied after guest registration.
            </p>
            <div className="mt-6 space-y-3">
              <Field
                label="Registration code"
                value={lookupCode}
                onChange={setLookupCode}
              />
              <Field
                label="Cancellation token"
                value={lookupToken}
                onChange={setLookupToken}
              />
            </div>
            {lookedUp === null && lookupCode && lookupToken && (
              <p className="mt-4 text-sm text-red-600">
                No matching registration was found.
              </p>
            )}
            {lookedUp && (
              <>
                <ReceiptCard
                  receipt={{
                    ...lookedUp,
                    participantName: lookedUp.event.name,
                  }}
                  token={lookupToken}
                  onDownload={() =>
                    downloadParticipationConfirmationPdf({
                      registrationCode: lookedUp.registrationCode,
                      status: lookedUp.status,
                      participantName: "Registered participant",
                      eventName: lookedUp.event.name,
                      startsAt: lookedUp.event.startsAt,
                      venue: lookedUp.event.venue,
                    })
                  }
                  onCancel={cancelGuestRegistration}
                  busy={busy}
                />
                {lookedUp.certificateCode && lookedUp.certificateIssuedAt ? (
                  <button
                    type="button"
                    onClick={() =>
                      void downloadParticipationCertificatePdf({
                        registrationCode: lookedUp.registrationCode,
                        status: lookedUp.status,
                        participantName: "Registered participant",
                        eventName: lookedUp.event.name,
                        startsAt: lookedUp.event.startsAt,
                        venue: lookedUp.event.venue,
                        certificateCode: lookedUp.certificateCode!,
                        issuedAt: lookedUp.certificateIssuedAt!,
                      })
                    }
                    className="mt-3 inline-flex min-h-10 items-center gap-2 border border-[#2359d4]/20 px-4 text-xs font-semibold text-violet-600 dark:border-white/15"
                  >
                    <Download className="size-3.5" /> Download certificate
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function RegistrationForm({
  onSubmit,
  scope,
  paid,
  evidenceRequired,
  busy,
  member = false,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  scope: "intra_cuet" | "divisional" | "national"
  paid: boolean
  evidenceRequired: boolean
  busy: boolean
  member?: boolean
}) {
  return (
    <form
      onSubmit={(formEvent) => void onSubmit(formEvent)}
      className="mt-6 grid gap-4 rounded-2xl border border-[#2359d4]/15 bg-white p-5 sm:grid-cols-2 dark:border-white/10 dark:bg-[#09182a]"
    >
      {!member && (
        <>
          <Input name="name" label="Full name" required />
          <Input name="email" label="Email" type="email" required />
          <Input name="phone" label="Phone" required />
          <Input name="institution" label="Institution" required />
        </>
      )}
      {scope === "intra_cuet" && !member && (
        <>
          <Input name="studentId" label="CUET student ID" required />
          <Input
            name="institutionEmail"
            label="CUET institutional email"
            type="email"
            required
          />
        </>
      )}
      {scope === "divisional" && (
        <Input
          name="institutionDivision"
          label="Institution division"
          placeholder="Chattogram"
          required
        />
      )}
      {paid && (
        <Input name="transactionId" label="Payment transaction ID" required />
      )}
      {member ? null : (
        <>
          <EventEligibilityUpload required={evidenceRequired} />
          <Input
            name="eligibilityEvidenceNote"
            label="Evidence note"
            placeholder="Program, department, team, or other context"
          />
        </>
      )}
      <label className="flex gap-3 text-sm leading-5 sm:col-span-2">
        <input
          type="checkbox"
          name="eligibilityConfirmed"
          required
          className="mt-1 size-4"
        />
        <span>
          I confirm that the participant meets the event scope and published
          eligibility rules.
        </span>
      </label>
      <button
        disabled={busy}
        className="min-h-11 rounded-full bg-[#00a6b2] px-5 font-semibold text-white disabled:opacity-50 sm:col-span-2 dark:bg-[#65f2f1] dark:text-[#03101e]"
      >
        {busy
          ? "Submitting…"
          : paid
            ? "Submit for payment review"
            : "Confirm registration"}
      </button>
    </form>
  )
}

function Input({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        {...props}
        className="min-h-11 rounded-lg border border-[#2359d4]/20 bg-transparent px-3 outline-none focus:border-[#00a6b2] dark:border-white/15"
      />
    </label>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-lg border border-[#2359d4]/20 bg-white px-3 outline-none focus:border-[#00a6b2] dark:border-white/15 dark:bg-[#09182a]"
      />
    </label>
  )
}

function ReceiptCard({
  receipt,
  token,
  onDownload,
  onCancel,
  busy,
}: {
  receipt: Receipt
  token?: string
  onDownload: () => void | Promise<void>
  onCancel: () => void | Promise<void>
  busy: boolean
}) {
  const cancellable =
    receipt.status === "pending" || receipt.status === "confirmed"
  return (
    <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-50 p-5 dark:bg-emerald-500/8">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-5 text-emerald-700 dark:text-emerald-300" />
        <div>
          <p className="font-semibold">{receipt.registrationCode}</p>
          <p className="mt-1 text-sm text-emerald-800 capitalize dark:text-emerald-200">
            Status: {receipt.status}
          </p>
        </div>
      </div>
      {token && (
        <p className="mt-4 rounded-lg bg-white/70 p-3 font-mono text-xs break-all dark:bg-black/20">
          Cancellation token: {token}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void onDownload()}
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white"
        >
          <Download className="size-4" /> Download confirmation
        </button>
        {cancellable && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void onCancel()}
            className="min-h-10 rounded-full border border-red-500/30 px-4 text-sm font-semibold text-red-700 disabled:opacity-50 dark:text-red-300"
          >
            Cancel registration
          </button>
        )}
      </div>
    </div>
  )
}

function ScopeRule({
  scope,
}: {
  scope: "intra_cuet" | "divisional" | "national"
}) {
  const text =
    scope === "intra_cuet"
      ? "Only current CUET students may register; a student ID is required."
      : scope === "divisional"
        ? "Only universities located in Chattogram Division are eligible."
        : "Open nationally to everyone who meets the published event criteria."
  return (
    <p className="mt-4 flex gap-3 rounded-xl bg-[#00a6b2]/8 p-4 text-sm leading-6 text-[#24546a] dark:text-[#bdeff2]">
      <CheckCircle2 className="mt-1 size-4 shrink-0" />
      {text}
    </p>
  )
}
