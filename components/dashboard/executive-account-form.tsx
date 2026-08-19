"use client"

import { useAction } from "convex/react"
import { useState, type FormEvent } from "react"

import { ActionButton } from "@/components/dashboard/dashboard-kit"
import { api } from "@/convex/_generated/api"

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-white/5"
const permissions = [
  "membership_manage",
  "events_manage",
  "committee_manage",
  "projects_manage",
  "content_manage",
  "reports_view",
  "files_manage",
  "notifications_send",
  "finance_manage",
  "finance_summary",
] as const

export function ExecutiveAccountForm() {
  const createExecutive = useAction(api.adminAccounts.createExecutive)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true)
    setMessage("")
    try {
      const result = await createExecutive({
        fullName: String(data.get("fullName")),
        email: String(data.get("email")),
        password: String(data.get("password")),
        phone: String(data.get("phone")),
        institute: String(data.get("institute")),
        department: String(data.get("department")),
        studentId: String(data.get("studentId")),
        hscBatch: String(data.get("hscBatch")),
        executivePosition: String(data.get("executivePosition")) as
          | "president"
          | "vice_president"
          | "general_secretary"
          | "joint_general_secretary"
          | "organizing_secretary"
          | "financial_secretary"
          | "public_relations_secretary"
          | "research_publication_secretary"
          | "technical_secretary"
          | "office_secretary"
          | "education_secretary"
          | "publication_secretary"
          | "it_secretary"
          | "event_coordinator"
          | "membership_coordinator"
          | "executive_member",
        permissions: permissions.filter(
          (permission) => data.get(permission) === "on"
        ),
      })
      form.reset()
      setMessage(
        `Created executive ${result.uuid}. Share the temporary password securely.`
      )
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Account creation failed"
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="grid gap-3 p-5 sm:grid-cols-2"
    >
      {[
        ["fullName", "Full name", "text"],
        ["email", "Email", "email"],
        ["password", "Temporary password", "password"],
        ["phone", "Phone", "tel"],
        ["institute", "Institute", "text"],
        ["department", "Department", "text"],
        ["studentId", "Student ID", "text"],
        ["hscBatch", "HSC batch", "text"],
      ].map(([name, placeholder, type]) => (
        <input
          key={name}
          name={name}
          type={type}
          required
          minLength={name === "password" ? 8 : undefined}
          placeholder={placeholder}
          className={inputClass}
        />
      ))}
      <label className="grid gap-1 text-xs font-medium">
        Executive position
        <select name="executivePosition" required className={inputClass}>
          {[
            "president",
            "vice_president",
            "general_secretary",
            "joint_general_secretary",
            "organizing_secretary",
            "financial_secretary",
            "public_relations_secretary",
            "research_publication_secretary",
            "technical_secretary",
            "office_secretary",
            "education_secretary",
            "publication_secretary",
            "it_secretary",
            "event_coordinator",
            "membership_coordinator",
            "executive_member",
          ].map((position) => (
            <option key={position} value={position}>
              {position.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:col-span-2 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10">
        <legend className="px-1 text-xs font-semibold">
          Granular permissions
        </legend>
        {permissions.map((permission) => (
          <label key={permission} className="text-xs">
            <input name={permission} type="checkbox" className="mr-2" />
            {permission.replaceAll("_", " ")}
          </label>
        ))}
      </fieldset>
      <ActionButton type="submit" disabled={busy}>
        {busy ? "Creating…" : "Create executive account"}
      </ActionButton>
      <p role="status" className="self-center text-xs text-emerald-600">
        {message}
      </p>
    </form>
  )
}
