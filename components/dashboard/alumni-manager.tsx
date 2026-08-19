"use client"

import { useMutation, useQuery } from "convex/react"
import { useRef, useState, type FormEvent } from "react"

import { AssetUploader } from "@/components/dashboard/asset-uploader"
import {
  ActionButton,
  Panel,
  StatusPill,
} from "@/components/dashboard/dashboard-kit"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

const inputClass =
  "mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-white/5"

export function AlumniManager() {
  const alumni = useQuery(api.alumni.listAdmin)
  const saveAlumnus = useMutation(api.alumni.upsert)
  const photoAssetIdRef = useRef<Id<"assets"> | undefined>(undefined)
  const [message, setMessage] = useState("")

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setMessage("Saving…")
    try {
      await saveAlumnus({
        slug: String(data.get("slug")),
        name: String(data.get("name")),
        department: String(data.get("department")),
        session: String(data.get("session")),
        batch: String(data.get("batch")),
        graduationYear: Number(data.get("graduationYear")),
        currentWorkplace: optional(data, "currentWorkplace"),
        higherStudies: optional(data, "higherStudies"),
        linkedInUrl: optional(data, "linkedInUrl"),
        researchInterests: optional(data, "researchInterests"),
        photoAssetId: photoAssetIdRef.current,
        status: String(data.get("status")) as
          "draft" | "published" | "archived",
      })
      form.reset()
      photoAssetIdRef.current = undefined
      setMessage("Alumni profile saved.")
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Save failed")
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <Panel
        title="Alumni profile"
        description="Publish career, study, and research records."
      >
        <form
          onSubmit={(event) => void save(event)}
          className="grid gap-3 p-5 sm:grid-cols-2"
        >
          <Field name="name" label="Name" />
          <Field name="slug" label="URL slug" />
          <Field name="department" label="Department" />
          <Field name="session" label="Academic session" />
          <Field name="batch" label="Batch" />
          <Field name="graduationYear" label="Graduation year" type="number" />
          <Field
            name="currentWorkplace"
            label="Current workplace"
            required={false}
          />
          <Field name="higherStudies" label="Higher studies" required={false} />
          <Field
            name="linkedInUrl"
            label="LinkedIn URL"
            type="url"
            required={false}
          />
          <Field
            name="researchInterests"
            label="Research interests"
            required={false}
          />
          <label className="text-xs font-medium">
            Status
            <select name="status" className={inputClass}>
              {["draft", "published", "archived"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <AssetUploader
            kind="image"
            accept="image/*"
            label="Upload alumni photo"
            onUploaded={(assetId) => {
              photoAssetIdRef.current = assetId
            }}
          />
          <ActionButton type="submit" className="sm:col-span-2">
            Save alumni profile
          </ActionButton>
          <p role="status" className="text-xs text-slate-500 sm:col-span-2">
            {message}
          </p>
        </form>
      </Panel>
      <Panel
        title="Alumni inventory"
        description={`${alumni?.length ?? 0} profiles`}
      >
        <div className="divide-y divide-slate-100 dark:divide-white/8">
          {alumni?.map((person) => (
            <article
              key={person._id}
              className="flex items-center justify-between gap-4 p-5"
            >
              <div>
                <h3 className="text-sm font-semibold">{person.name}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {person.session} · {person.department} ·{" "}
                  {person.graduationYear}
                </p>
              </div>
              <StatusPill
                tone={person.status === "published" ? "green" : "slate"}
              >
                {person.status}
              </StatusPill>
            </article>
          ))}
          {alumni?.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No alumni profiles yet.
            </p>
          ) : null}
        </div>
      </Panel>
    </div>
  )
}

function optional(data: FormData, key: string) {
  return String(data.get(key) || "") || undefined
}

function Field({
  name,
  label,
  type = "text",
  required = true,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="text-xs font-medium">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className={inputClass}
      />
    </label>
  )
}
