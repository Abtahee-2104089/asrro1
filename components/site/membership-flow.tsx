"use client"
import { useMutation } from "convex/react"
import type { Id } from "@/convex/_generated/dataModel"
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useRef, useState, type FormEvent } from "react"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"

const steps = ["Identity", "Academic", "Contact", "Payment"]
export function MembershipFlow() {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{
    applicationCode: string
    trackingToken: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const profilePhotoRef = useRef<File | null>(null)
  const paymentProofRef = useRef<File | null>(null)
  const submitApplication = useMutation(api.membership.submitApplication)
  const generateUploadUrl = useMutation(api.assets.generateApplicationUploadUrl)
  const registerUpload = useMutation(api.assets.registerApplicationUpload)

  async function upload(file: File, kind: "image" | "pdf") {
    const uploadUrl = await generateUploadUrl({})
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    })
    if (!response.ok) throw new Error(`Could not upload ${file.name}`)
    const { storageId } = (await response.json()) as { storageId: string }
    return await registerUpload({
      storageId: storageId as Id<"_storage">,
      kind,
      fileName: file.name,
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const values = Object.fromEntries(
      [...new FormData(event.currentTarget)].map(([key, value]) => [
        key,
        String(value),
      ])
    )
    const nextDraft = { ...draft, ...values }
    setDraft(nextDraft)

    if (step < 3) {
      setStep((currentStep) => currentStep + 1)
      return
    }

    setSubmitting(true)
    try {
      const profilePhoto = profilePhotoRef.current
      const paymentProof = paymentProofRef.current
      const profileAssetId = profilePhoto
        ? await upload(profilePhoto, "image")
        : undefined
      const paymentAssetId = paymentProof
        ? await upload(
            paymentProof,
            paymentProof.type === "application/pdf" ? "pdf" : "image"
          )
        : undefined
      const response = await submitApplication({
        fullName: nextDraft.fullName,
        ...(nextDraft.dob ? { dateOfBirth: nextDraft.dob } : {}),
        gender: nextDraft.gender,
        ...(nextDraft.blood ? { bloodGroup: nextDraft.blood } : {}),
        email: nextDraft.email,
        phone: nextDraft.phone,
        institute: nextDraft.institute,
        ...(nextDraft.universityName
          ? { universityName: nextDraft.universityName }
          : {}),
        department: nextDraft.department,
        semester: nextDraft.semester,
        studentId: nextDraft.studentId,
        hscBatch: nextDraft.hsc,
        address: nextDraft.address,
        emergencyContact: nextDraft.emergency,
        paymentMethod: paymentMethod(nextDraft.payment),
        transactionId: nextDraft.transaction,
        profileAssetId,
        paymentAssetId,
      })
      setResult({
        applicationCode: response.applicationCode,
        trackingToken: response.trackingToken,
      })
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The application could not be submitted. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (result)
    return (
      <div className="rounded-2xl border border-[#00a6b2]/30 bg-white p-10 text-center shadow-[0_20px_60px_rgba(25,55,90,.1)] sm:p-16 dark:border-[#65f2f1]/35 dark:bg-[#0a1c2f] dark:shadow-none">
        <div className="mx-auto grid size-16 place-items-center bg-[#00a6b2]/10 text-[#007d89] dark:bg-[#65f2f1]/10 dark:text-[#65f2f1]">
          <Check className="size-7" />
        </div>
        <p className="mt-6 font-mono text-[10px] tracking-[.2em] text-[#a95000] uppercase dark:text-[#ffb84d]">
          Application received
        </p>
        <h2 className="mt-4 text-3xl font-semibold">
          Your record is queued for review.
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-[#4b6175] dark:text-[#9fb1c5]">
          Keep both references somewhere private. You will need them to check
          the status of this application.
        </p>
        <dl className="mx-auto mt-6 grid max-w-lg gap-3 rounded-xl border border-[#2359d4]/15 bg-[#f4f7fb] p-5 text-left sm:grid-cols-2 dark:border-white/10 dark:bg-[#06101f]">
          <div>
            <dt className="font-mono text-[10px] tracking-[.16em] text-[#587084] uppercase dark:text-[#8296ad]">
              Application code
            </dt>
            <dd className="mt-2 font-mono text-sm text-[#07111f] dark:text-white">
              {result.applicationCode}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-[.16em] text-[#587084] uppercase dark:text-[#8296ad]">
              Tracking token
            </dt>
            <dd className="mt-2 font-mono text-sm break-all text-[#07111f] dark:text-white">
              {result.trackingToken}
            </dd>
          </div>
        </dl>
        <Link
          href="/membership/status"
          className="mt-5 inline-flex text-sm font-semibold text-[#007d89] underline dark:text-[#65f2f1]"
        >
          Open application tracker
        </Link>
        <button
          type="button"
          onClick={() => {
            setStep(0)
            setDraft({})
            setResult(null)
            profilePhotoRef.current = null
            paymentProofRef.current = null
          }}
          className="mt-7 text-sm text-[#007d89] underline dark:text-[#65f2f1]"
        >
          Start over
        </button>
      </div>
    )
  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
      <aside>
        <ol className="grid grid-cols-4 gap-2 lg:grid-cols-1">
          {steps.map((label, index) => (
            <li
              key={label}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3",
                index === step
                  ? "border-[#00a6b2]/40 bg-[#00a6b2]/5 dark:border-[#65f2f1]/40 dark:bg-[#65f2f1]/5"
                  : "border-[#2359d4]/15 dark:border-white/10"
              )}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full font-mono text-[10px]",
                  index < step
                    ? "bg-[#07111f] text-white dark:bg-[#65f2f1] dark:text-[#03101e]"
                    : "bg-[#2359d4]/7 text-[#587084] dark:bg-white/5 dark:text-[#9fb1c5]"
                )}
              >
                {index < step ? <Check className="size-3" /> : index + 1}
              </span>
              <span className="hidden text-sm lg:block">{label}</span>
            </li>
          ))}
        </ol>
        <div className="mt-6 hidden rounded-lg border border-[#2359d4]/15 bg-white/60 p-4 text-xs leading-5 text-[#587084] lg:block dark:border-white/10 dark:bg-transparent dark:text-[#8296ad]">
          <ShieldCheck className="mb-3 size-5 text-[#007d89] dark:text-[#65f2f1]" />
          Your personal and payment records are visible only to authorized
          committee reviewers.
        </div>
      </aside>
      <form
        onSubmit={(event) => {
          void handleSubmit(event)
        }}
        className="rounded-xl border border-[#2359d4]/15 bg-white p-6 shadow-[0_16px_45px_rgba(25,55,90,.08)] sm:p-8 dark:border-white/10 dark:bg-[#09182a] dark:shadow-none"
      >
        <p className="font-mono text-[10px] tracking-[.2em] text-[#007d89] uppercase dark:text-[#65f2f1]">
          Step {step + 1} of 4
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">
          {
            [
              "Tell us who you are.",
              "Your CUET journey.",
              "How can we reach you?",
              "Confirm membership fee.",
            ][step]
          }
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {step === 0 && (
            <>
              <Field
                label="Full name"
                name="fullName"
                defaultValue={draft.fullName}
              />
              <Field
                label="Date of birth (optional)"
                name="dob"
                type="date"
                required={false}
                defaultValue={draft.dob}
              />
              <Select
                label="Gender"
                name="gender"
                defaultValue={draft.gender}
                options={["Female", "Male", "Non-binary", "Prefer not to say"]}
              />
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm">
                  Profile photo (optional)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    profilePhotoRef.current = event.target.files?.[0] ?? null
                  }}
                  className="w-full border border-[#2359d4]/15 bg-[#f4f7fb] p-3 text-sm dark:border-white/10 dark:bg-[#06101f]"
                />
              </label>
              <Select
                label="Blood group"
                name="blood"
                defaultValue={draft.blood}
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
              />
            </>
          )}
          {step === 1 && (
            <>
              <Field
                label="Institute"
                name="institute"
                defaultValue={draft.institute ?? "CUET"}
              />
              <Field
                label="University name (optional)"
                name="universityName"
                required={false}
                defaultValue={
                  draft.universityName ??
                  "Chittagong University of Engineering & Technology"
                }
              />
              <Field
                label="Student ID"
                name="studentId"
                defaultValue={draft.studentId}
              />
              <Select
                label="Department"
                name="department"
                defaultValue={draft.department}
                options={[
                  "CSE",
                  "EEE",
                  "ME",
                  "ETE",
                  "CE",
                  "MIE",
                  "URP",
                  "Architecture",
                  "PME",
                  "WRE",
                ]}
              />
              <Field
                label="Current semester"
                name="semester"
                defaultValue={draft.semester}
              />
              <Field label="HSC batch" name="hsc" defaultValue={draft.hsc} />
            </>
          )}
          {step === 2 && (
            <>
              <Field
                label="Email"
                name="email"
                type="email"
                defaultValue={draft.email}
              />
              <Field
                label="Phone number"
                name="phone"
                type="tel"
                defaultValue={draft.phone}
              />
              <div className="sm:col-span-2">
                <Field
                  label="Current address"
                  name="address"
                  defaultValue={draft.address}
                />
              </div>
              <Field
                label="Emergency contact"
                name="emergency"
                type="tel"
                defaultValue={draft.emergency}
              />
            </>
          )}
          {step === 3 && (
            <>
              <Select
                label="Payment method"
                name="payment"
                defaultValue={draft.payment}
                options={["bKash", "Nagad", "Rocket"]}
              />
              <Field
                label="Transaction ID"
                name="transaction"
                defaultValue={draft.transaction}
              />
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm">
                  Payment proof (optional)
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(event) => {
                    paymentProofRef.current = event.target.files?.[0] ?? null
                  }}
                  className="w-full border border-[#2359d4]/15 bg-[#f4f7fb] p-3 text-sm dark:border-white/10 dark:bg-[#06101f]"
                />
              </label>
              <div className="rounded-lg border border-[#d97706]/25 bg-[#d97706]/5 p-4 text-sm leading-6 text-[#72400d] sm:col-span-2 dark:border-[#ffb84d]/25 dark:bg-[#ffb84d]/5 dark:text-[#d8c29f]">
                Membership fee:{" "}
                <strong className="text-[#07111f] dark:text-white">
                  BDT 300
                </strong>
                . Send payment using your phone number as the reference, then
                enter the transaction ID.
              </div>
            </>
          )}
        </div>
        {error ? (
          <p
            role="alert"
            className="mt-5 text-sm leading-6 text-red-700 dark:text-red-300"
          >
            {error}
          </p>
        ) : null}
        <div className="mt-9 flex items-center justify-between border-t border-[#2359d4]/15 pt-6 dark:border-white/10">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
            className="inline-flex min-h-11 items-center gap-2 px-4 text-sm text-[#4b6175] disabled:opacity-30 dark:text-[#9fb1c5]"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 items-center gap-2 bg-[#07111f] px-5 font-semibold text-white transition hover:bg-[#2359d4] disabled:cursor-wait disabled:opacity-60 dark:bg-[#65f2f1] dark:text-[#03101e] dark:hover:bg-[#8bf7f5]"
          >
            {submitting
              ? "Submitting…"
              : step === 3
                ? "Submit application"
                : "Continue"}
            <ArrowRight className="size-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
function Field({
  label,
  ...props
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  defaultValue?: string
}) {
  const { required = true, ...fieldProps } = props
  return (
    <label>
      <span className="mb-2 block text-sm">{label}</span>
      <input
        required={required}
        className="h-12 w-full border border-[#2359d4]/15 bg-[#f4f7fb] px-4 text-[#07111f] outline-none focus:border-[#00a6b2] dark:border-white/10 dark:bg-[#06101f] dark:text-white dark:focus:border-[#65f2f1]"
        {...fieldProps}
      />
    </label>
  )
}
function Select({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string
  name: string
  options: string[]
  defaultValue?: string
}) {
  return (
    <label>
      <span className="mb-2 block text-sm">{label}</span>
      <select
        required
        name={name}
        defaultValue={defaultValue ?? ""}
        className="h-12 w-full border border-[#2359d4]/15 bg-[#f4f7fb] px-4 text-[#07111f] outline-none focus:border-[#00a6b2] dark:border-white/10 dark:bg-[#06101f] dark:text-white dark:focus:border-[#65f2f1]"
      >
        <option value="" disabled>
          Select one
        </option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}

function paymentMethod(value: string | undefined) {
  if (value === "bKash") return "bkash" as const
  if (value === "Nagad") return "nagad" as const
  return "rocket" as const
}
