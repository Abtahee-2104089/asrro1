"use client"

import { useMutation, useQuery } from "convex/react"
import { useState, type FormEvent } from "react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { AssetUploader } from "@/components/dashboard/asset-uploader"
import {
  ActionButton,
  Panel,
  StatusPill,
} from "@/components/dashboard/dashboard-kit"

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-white/5"
export function CommitteeManager() {
  const data = useQuery(api.committee.listAdmin)
  const saveTerm = useMutation(api.committee.upsertTerm)
  const saveMember = useMutation(api.committee.upsertMember)
  const sendAnnouncement = useMutation(api.committee.sendAnnouncement)
  const [photo, setPhoto] = useState<Id<"assets">>()
  const [message, setMessage] = useState("")
  const current = data?.terms.find((term) => term.status === "current")

  async function submitTerm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const d = new FormData(form)
    await saveTerm({
      name: String(d.get("name")),
      startsAt: new Date(String(d.get("startsAt"))).getTime(),
      endsAt: new Date(String(d.get("endsAt"))).getTime(),
      status: String(d.get("status")) as "draft" | "current" | "past",
    })
    form.reset()
    setMessage("Committee term saved.")
  }
  async function submitMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!current) return setMessage("Create a current term first.")
    const form = event.currentTarget
    const d = new FormData(form)
    await saveMember({
      termId: current._id,
      name: String(d.get("name")),
      position: String(d.get("position")),
      positionKey: String(d.get("positionKey")),
      department: String(d.get("department")),
      session: String(d.get("session")),
      email: String(d.get("email")) || undefined,
      phone: String(d.get("phone")) || undefined,
      photoAssetId: photo,
      displayOrder: Number(d.get("order")),
      isPublic: d.get("isPublic") === "on",
    })
    form.reset()
    setPhoto(undefined)
    setMessage("Committee member saved.")
  }
  async function emailCommittee() {
    const subject = prompt("Committee announcement subject")
    if (!subject) return
    const body = prompt("Committee announcement")
    if (!body) return
    try {
      const result = await sendAnnouncement({ subject, message: body })
      setMessage(
        `Queued ${result.queued} committee email${result.queued === 1 ? "" : "s"}.`
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Announcement failed")
    }
  }
  const field = (name: string, placeholder: string, type = "text") => (
    <input
      name={name}
      type={type}
      required={!["email", "phone"].includes(name)}
      placeholder={placeholder}
      className={inputClass}
    />
  )
  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Committee term">
          <form onSubmit={(e) => void submitTerm(e)} className="grid gap-3 p-5">
            {field("name", "2026–27")}
            {field("startsAt", "Starts", "date")}
            {field("endsAt", "Ends", "date")}
            <select name="status" className={inputClass}>
              {["draft", "current", "past"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <ActionButton type="submit">Save term</ActionButton>
          </form>
        </Panel>
        <Panel title="Assign current-term member">
          <form
            onSubmit={(e) => void submitMember(e)}
            className="grid gap-3 p-5"
          >
            {field("name", "Full name")}
            {field("position", "Position")}
            {field("positionKey", "Position key")}
            {field("department", "Department")}
            {field("session", "Session")}
            {field("email", "Email")}
            {field("phone", "Phone")}
            {field("order", "Display order", "number")}
            <label className="text-xs">
              <input
                name="isPublic"
                type="checkbox"
                defaultChecked
                className="mr-2"
              />
              Public profile
            </label>
            <AssetUploader
              kind="image"
              accept="image/*"
              label="Upload portrait"
              onUploaded={setPhoto}
            />
            <ActionButton type="submit">Assign member</ActionButton>
          </form>
        </Panel>
      </div>
      <p role="status" className="text-sm text-emerald-600">
        {message}
      </p>
      <ActionButton variant="secondary" onClick={() => void emailCommittee()}>
        Email current committee
      </ActionButton>
      <Panel
        title={current ? `Current roster · ${current.name}` : "Current roster"}
      >
        <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-3 dark:bg-white/8">
          {data?.currentMembers.map((member) => (
            <article
              key={member._id}
              className="bg-white p-5 dark:bg-slate-950"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{member.name}</h2>
                  <p className="mt-1 text-xs text-blue-600">
                    {member.position}
                  </p>
                </div>
                <StatusPill tone={member.isPublic ? "green" : "slate"}>
                  {member.isPublic ? "Public" : "Hidden"}
                </StatusPill>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {member.department} · {member.session}
              </p>
            </article>
          ))}
          {data?.currentMembers.length === 0 ? (
            <p className="p-8 text-sm text-slate-500">No assignments yet.</p>
          ) : null}
        </div>
      </Panel>
    </div>
  )
}
