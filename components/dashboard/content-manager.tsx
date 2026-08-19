"use client"

import { useMutation, useQuery } from "convex/react"
import { useRef, useState, type FormEvent } from "react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { AssetUploader } from "@/components/dashboard/asset-uploader"
import {
  ActionButton,
  Panel,
  StatusPill,
} from "@/components/dashboard/dashboard-kit"

const fieldClass =
  "h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-white/5"

export function ContentManager() {
  const blogs = useQuery(api.blogs.listAdmin)
  const publications = useQuery(api.publications.listAdmin)
  const albums = useQuery(api.gallery.listAdmin)
  const events = useQuery(api.events.listManagedEvents)
  const pages = useQuery(api.content.listPagesAdmin)
  const saveBlog = useMutation(api.blogs.upsert)
  const savePublication = useMutation(api.publications.upsert)
  const saveAlbum = useMutation(api.gallery.upsertAlbum)
  const savePage = useMutation(api.content.upsertPage)
  const [publicationAsset, setPublicationAsset] = useState<Id<"assets">>()
  const galleryCover = useRef<Id<"assets"> | undefined>(undefined)
  const [message, setMessage] = useState("")

  const data = (event: FormEvent<HTMLFormElement>) =>
    new FormData(event.currentTarget)
  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <CmsForm
          title="News / field note"
          onSubmit={async (event) => {
            const d = data(event)
            await saveBlog({
              slug: String(d.get("slug")),
              title: String(d.get("title")),
              excerpt: String(d.get("summary")),
              body: String(d.get("body")),
              category: String(d.get("category")),
              tags: String(d.get("tags"))
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean),
              authorName: String(d.get("author")),
              status: String(d.get("status")) as
                "draft" | "published" | "archived",
              featured: d.get("featured") === "on",
            })
            event.currentTarget.reset()
            setMessage("News saved.")
          }}
        >
          <CommonFields includeBody />
          <Input name="category" label="Category" />
          <Input name="tags" label="Tags (comma separated)" />
          <Input name="author" label="Author" />
          <PublishFields />
        </CmsForm>
        <CmsForm
          title="Publication"
          onSubmit={async (event) => {
            const d = data(event)
            await savePublication({
              slug: String(d.get("slug")),
              title: String(d.get("title")),
              abstract: String(d.get("body")),
              type: String(d.get("type")) as
                "research_paper" | "magazine" | "report" | "annual_publication",
              authors: String(d.get("authors"))
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean),
              publicationDate: new Date(String(d.get("date"))).getTime(),
              externalUrl: String(d.get("externalUrl")) || undefined,
              assetId: publicationAsset,
              status: String(d.get("status")) as
                "draft" | "published" | "archived",
              featured: d.get("featured") === "on",
            })
            event.currentTarget.reset()
            setPublicationAsset(undefined)
            setMessage("Publication saved.")
          }}
        >
          <Input name="title" label="Title" />
          <Input name="slug" label="URL slug" />
          <label className="text-xs font-medium">
            Abstract
            <textarea
              name="body"
              required
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 dark:border-white/10 dark:bg-white/5"
            />
          </label>
          <Input name="authors" label="Authors (comma separated)" />
          <Input name="date" label="Publication date" type="date" />
          <Input name="externalUrl" label="External URL" required={false} />
          <select name="type" className={fieldClass}>
            {["research_paper", "magazine", "report", "annual_publication"].map(
              (v) => (
                <option key={v}>{v}</option>
              )
            )}
          </select>
          <AssetUploader
            kind="pdf"
            accept="application/pdf"
            label="Upload publication PDF"
            onUploaded={setPublicationAsset}
          />
          <PublishFields />
        </CmsForm>
        <CmsForm
          title="Public page"
          onSubmit={async (event) => {
            const d = data(event)
            await savePage({
              slug: String(d.get("slug")),
              title: String(d.get("title")),
              summary: String(d.get("summary")),
              body: String(d.get("body")),
              status: String(d.get("status")) as
                "draft" | "published" | "archived",
            })
            event.currentTarget.reset()
            setMessage("Page saved.")
          }}
        >
          <CommonFields includeBody />
          <PublishFields />
        </CmsForm>
        <CmsForm
          title="Gallery album"
          onSubmit={async (event) => {
            const d = data(event)
            await saveAlbum({
              slug: String(d.get("slug")),
              title: String(d.get("title")),
              description: String(d.get("summary")),
              eventId: (String(d.get("eventId")) || undefined) as
                Id<"events"> | undefined,
              coverAssetId: galleryCover.current,
              occurredAt: new Date(String(d.get("date"))).getTime(),
              status: String(d.get("status")) as
                "draft" | "published" | "archived",
            })
            event.currentTarget.reset()
            galleryCover.current = undefined
            setMessage("Album saved.")
          }}
        >
          <Input name="title" label="Title" />
          <Input name="slug" label="URL slug" />
          <Input name="summary" label="Description" />
          <Input name="date" label="Occurred date" type="date" />
          <label className="text-xs font-medium">
            Related event (optional)
            <select name="eventId" className={`mt-1 ${fieldClass}`}>
              <option value="">Independent album</option>
              {events?.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>
          <AssetUploader
            kind="image"
            accept="image/*"
            label="Upload album cover"
            onUploaded={(assetId) => {
              galleryCover.current = assetId
            }}
          />
          <PublishFields />
        </CmsForm>
      </div>
      <p role="status" className="text-sm text-emerald-600">
        {message}
      </p>
      <Panel
        title="CMS inventory"
        description="Published and draft website records"
      >
        <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-4 dark:bg-white/8">
          <Inventory label="News" records={blogs} />
          <Inventory label="Publications" records={publications} />
          <Inventory label="Albums" records={albums} />
          <Inventory label="Pages" records={pages} />
        </div>
      </Panel>
    </div>
  )
}

function CmsForm({
  title,
  onSubmit,
  children,
}: {
  title: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  children: React.ReactNode
}) {
  const [error, setError] = useState("")
  return (
    <Panel title={title}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setError("")
          void onSubmit(event).catch((cause) =>
            setError(cause instanceof Error ? cause.message : "Save failed")
          )
        }}
        className="grid gap-3 p-5"
      >
        {children}
        <ActionButton type="submit">Save {title.toLowerCase()}</ActionButton>
        {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      </form>
    </Panel>
  )
}
function Input({
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
        className={`mt-1 ${fieldClass}`}
      />
    </label>
  )
}
function CommonFields({ includeBody = false }: { includeBody?: boolean }) {
  return (
    <>
      <Input name="title" label="Title" />
      <Input name="slug" label="URL slug" />
      <Input name="summary" label="Summary" />
      {includeBody ? (
        <label className="text-xs font-medium">
          Rich content / body (Markdown supported)
          <textarea
            name="body"
            required
            rows={5}
            className="mt-1 w-full rounded-lg border border-slate-200 p-3 dark:border-white/10 dark:bg-white/5"
          />
        </label>
      ) : null}
    </>
  )
}
function PublishFields() {
  return (
    <div className="flex items-center gap-3">
      <select name="status" className={fieldClass}>
        {["draft", "published", "archived"].map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
      <label className="shrink-0 text-xs">
        <input name="featured" type="checkbox" className="mr-2" />
        Featured
      </label>
    </div>
  )
}
function Inventory({
  label,
  records,
}: {
  label: string
  records?: Array<{
    _id: string
    title: string
    status: "draft" | "published" | "archived"
  }>
}) {
  return (
    <div className="bg-white p-5 dark:bg-slate-950">
      <h2 className="font-semibold">{label}</h2>
      <p className="mt-2 text-3xl font-semibold">{records?.length ?? 0}</p>
      <div className="mt-4 space-y-2">
        {records?.slice(0, 4).map((record) => (
          <div key={record._id} className="flex justify-between gap-2 text-xs">
            <span className="truncate">{record.title}</span>
            <StatusPill
              tone={record.status === "published" ? "green" : "slate"}
            >
              {record.status}
            </StatusPill>
          </div>
        ))}
      </div>
    </div>
  )
}
