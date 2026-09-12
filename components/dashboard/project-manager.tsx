"use client"

import { useMutation, useQuery } from "convex/react"
import { useEffect, useRef, useState, type FormEvent } from "react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { AssetUploader } from "@/components/dashboard/asset-uploader"
import {
  ActionButton,
  Panel,
  StatusPill,
} from "@/components/dashboard/dashboard-kit"

type ResearcherRow = { key: string; name: string; role: string }

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function ProjectManager() {
  const projects = useQuery(api.projects.listAdmin)
  const upsert = useMutation(api.projects.upsert)
  const replaceTeam = useMutation(api.projects.replaceTeam)

  const [editingId, setEditingId] = useState<Id<"projects"> | null>(null)
  const editData = useQuery(
    api.projects.getAdminById,
    editingId ? { projectId: editingId } : "skip"
  )

  const [coverAssetId, setCoverAssetId] = useState<Id<"assets"> | undefined>(
    undefined
  )
  const [researchers, setResearchers] = useState<ResearcherRow[]>([])
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Populate form when editing - syncs external Convex data to local form state
  useEffect(() => {
    if (!editData?.project) return
    setCoverAssetId(editData.project.coverAssetId ?? undefined)
    setResearchers(
      editData.team.map((m) => ({
        key: m._id,
        name: m.name,
        role: m.role,
      }))
    )
    // populate uncontrolled inputs via ref - direct DOM sync (allowed in effects)
    if (formRef.current) {
      const f = formRef.current
      const set = (name: string, value: string) => {
        const el = f.elements.namedItem(name) as HTMLInputElement | null
        if (el) el.value = value
      }
      const setTextarea = (name: string, value: string) => {
        const el = f.elements.namedItem(name) as HTMLTextAreaElement | null
        if (el) el.value = value
      }
      const setSelect = (name: string, value: string) => {
        const el = f.elements.namedItem(name) as HTMLSelectElement | null
        if (el) el.value = value
      }
      const setCheckbox = (name: string, checked: boolean) => {
        const el = f.elements.namedItem(name) as HTMLInputElement | null
        if (el) el.checked = checked
      }
      set("title", editData.project.title)
      set("slug", editData.project.slug)
      set("domain", editData.project.domain)
      setTextarea("summary", editData.project.summary)
      setTextarea("description", editData.project.description)
      set("githubUrl", editData.project.githubUrl ?? "")
      set("awards", editData.project.awards ?? "")
      set("technologyStack", editData.project.technologyStack.join(", "))
      setSelect("category", editData.project.category)
      setSelect("projectState", editData.project.projectState)
      setSelect("status", editData.project.status)
      setCheckbox("featured", editData.project.featured)
    }
  }, [editData])

  function resetForm() {
    setEditingId(null)
    setCoverAssetId(undefined)
    setResearchers([])
    setMessage("")
    formRef.current?.reset()
  }

  function startEdit(id: Id<"projects">) {
    setMessage("")
    setEditingId(id)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setMessage("Saving…")
    setSubmitting(true)
    try {
      const tech = String(data.get("technologyStack"))
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
      const filteredResearchers = researchers
        .map((r) => ({ name: r.name.trim(), role: r.role.trim() }))
        .filter((r) => r.name.length > 0 && r.role.length > 0)

      const id = await upsert({
        projectId: editingId ?? undefined,
        slug: String(data.get("slug")),
        title: String(data.get("title")),
        summary: String(data.get("summary")),
        description: String(data.get("description")),
        domain: String(data.get("domain")),
        category: String(data.get("category")) as
          | "completed"
          | "ongoing"
          | "research"
          | "competition"
          | "industry_collaboration",
        projectState: String(data.get("projectState")) as
          "planned" | "ongoing" | "completed" | "paused",
        status: String(data.get("status")) as
          "draft" | "published" | "archived",
        technologyStack: tech,
        githubUrl: String(data.get("githubUrl")) || undefined,
        awards: String(data.get("awards")) || undefined,
        coverAssetId,
        featured: data.get("featured") === "on",
      })

      const targetId = (editingId ?? id) as Id<"projects">
      if (filteredResearchers.length > 0 || editingId) {
        // Replace team atomically – even empty array clears on edit
        await replaceTeam({
          projectId: targetId,
          members: filteredResearchers.map((r, idx) => ({
            name: r.name,
            role: r.role,
            displayOrder: idx,
          })),
        })
      }

      setMessage(editingId ? "Project updated." : "Project created.")
      if (editingId) {
        // stay in edit mode but refresh
        setEditingId(targetId)
      } else {
        form.reset()
        setCoverAssetId(undefined)
        setResearchers([])
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save project"
      )
    } finally {
      setSubmitting(false)
    }
  }

  const panelTitle = editingId
    ? `Edit project${editData?.project ? ` — ${editData.project.title}` : ""}`
    : "Create project"
  const panelDesc = editingId
    ? "Update repository, award, and technical metadata. Save to keep your edits."
    : "Publish repository, award, and technical metadata. Markdown is supported for summary & description."

  return (
    <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
      <Panel title={panelTitle} description={panelDesc}>
        <form
          ref={formRef}
          onSubmit={(event) => void submit(event)}
          className="grid gap-3 p-5"
        >
          {[
            ["title", "Title *"],
            ["slug", "URL slug * (lowercase, hyphen separated)"],
            ["domain", "Domain * (e.g. Robotics, AI, Space)"],
          ].map(([name, label]) => (
            <label key={name} className="text-xs font-medium">
              {label}
              <input
                name={name}
                required
                placeholder={name === "slug" ? "riverwatch-rover" : undefined}
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 dark:border-white/10 dark:bg-white/5"
              />
            </label>
          ))}

          <label className="text-xs font-medium">
            Summary * — Markdown supported
            <textarea
              name="summary"
              required
              rows={3}
              maxLength={500}
              placeholder="Short overview — **bold**, `code`, [link](https://...), - list"
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm dark:border-white/10 dark:bg-white/5"
            />
            <span className="mt-1 block text-[11px] font-normal text-slate-500">
              Supports Markdown: **bold**, *italic*, `code`, [link](url), lists,
              &gt; quote. Max 500 chars.
            </span>
          </label>

          <label className="text-xs font-medium">
            Description * — Markdown supported
            <textarea
              name="description"
              required
              rows={7}
              placeholder={
                "## Approach\n\nDetailed story with **Markdown**:\n- Headings ## ###\n- Lists\n- `code` & [links](https://...)\n- > blockquotes"
              }
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm dark:border-white/10 dark:bg-white/5"
            />
            <span className="mt-1 block text-[11px] font-normal text-slate-500">
              Full description supports Markdown (headings, bold, lists, code,
              links, quotes). Rendered on the public project page.
            </span>
          </label>

          {[
            ["githubUrl", "Repository URL"],
            ["awards", "Awards / outcome"],
            ["technologyStack", "Technology stack (comma separated) *"],
          ].map(([name, label]) => (
            <label key={name} className="text-xs font-medium">
              {label}
              <input
                name={name}
                required={name === "technologyStack"}
                placeholder={
                  name === "technologyStack" ? "ROS 2, Python, LoRa" : undefined
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 dark:border-white/10 dark:bg-white/5"
              />
            </label>
          ))}

          <div className="grid grid-cols-3 gap-2">
            <label className="text-xs font-medium">
              Category
              <select
                name="category"
                defaultValue="research"
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 dark:border-white/10 dark:bg-slate-900"
              >
                {[
                  "ongoing",
                  "completed",
                  "research",
                  "competition",
                  "industry_collaboration",
                ].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium">
              State
              <select
                name="projectState"
                defaultValue="ongoing"
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 dark:border-white/10 dark:bg-slate-900"
              >
                {["planned", "ongoing", "completed", "paused"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium">
              Status
              <select
                name="status"
                defaultValue="draft"
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-2 dark:border-white/10 dark:bg-slate-900"
              >
                {["draft", "published", "archived"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" name="featured" className="size-4" />
            Featured on homepage
          </label>

          {/* Researchers section */}
          <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold">
                Researchers — {researchers.length} added
              </h3>
              <button
                type="button"
                onClick={() =>
                  setResearchers((prev) => [
                    ...prev,
                    { key: uid(), name: "", role: "" },
                  ])
                }
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
              >
                + Add researcher
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Give the number of researchers by adding rows. Each row needs name
              and role. Count is saved with the project.
            </p>
            {researchers.length === 0 ? (
              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500 dark:bg-white/5">
                No researchers added yet. Click &quot;Add researcher&quot; to
                specify team size.
              </p>
            ) : (
              <div className="mt-3 grid gap-2">
                {researchers.map((row, idx) => (
                  <div
                    key={row.key}
                    className="grid grid-cols-[1fr_1fr_auto] gap-2"
                  >
                    <input
                      value={row.name}
                      onChange={(e) =>
                        setResearchers((prev) =>
                          prev.map((r) =>
                            r.key === row.key
                              ? { ...r, name: e.target.value }
                              : r
                          )
                        )
                      }
                      placeholder={`Researcher ${idx + 1} name`}
                      className="h-9 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-white/5"
                    />
                    <input
                      value={row.role}
                      onChange={(e) =>
                        setResearchers((prev) =>
                          prev.map((r) =>
                            r.key === row.key
                              ? { ...r, role: e.target.value }
                              : r
                          )
                        )
                      }
                      placeholder="Role (e.g. Lead, Vision)"
                      className="h-9 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-white/5"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setResearchers((prev) =>
                          prev.filter((r) => r.key !== row.key)
                        )
                      }
                      className="rounded-lg border border-rose-200 px-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
            <p className="text-xs font-semibold">Cover photo</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <AssetUploader
                kind="image"
                accept="image/*"
                label={coverAssetId ? "Replace cover" : "Upload cover"}
                onUploaded={setCoverAssetId}
              />
              {coverAssetId ? (
                <span className="text-xs text-emerald-600">Cover selected</span>
              ) : editingId && editData?.project.coverAssetId ? (
                <span className="text-xs text-slate-500">
                  Existing cover kept
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-[11px] leading-4 text-slate-500">
              Recommended size: <strong>1600 × 900 px</strong> (16:9). Any
              size fits without cropping on the card and detail page.
              Formats: JPEG, PNG, WebP. Max <strong>5 MB</strong>. Larger
              images are rejected.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <ActionButton
              type="submit"
              disabled={submitting}
              className="min-w-32"
            >
              {submitting
                ? "Saving…"
                : editingId
                  ? "Update project"
                  : "Save project"}
            </ActionButton>
            {editingId ? (
              <ActionButton
                type="button"
                variant="secondary"
                onClick={resetForm}
              >
                Cancel edit
              </ActionButton>
            ) : null}
          </div>
          <p role="status" className="text-xs text-slate-500">
            {message}
          </p>
          {editingId ? (
            <p className="text-[11px] text-slate-400">
              Editing existing record. Slug, status, and researchers can all be
              changed and re-saved.
            </p>
          ) : null}
        </form>
      </Panel>

      <Panel
        title="Project inventory"
        description={`${projects?.length ?? 0} bounded records loaded — click Edit to modify any project`}
      >
        <div className="divide-y divide-slate-100 dark:divide-white/8">
          {projects?.map((project) => (
            <article key={project._id} className="p-5">
              <div className="flex justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{project.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {project.domain} · {project.githubUrl ?? "No repository"} ·{" "}
                    {project.slug}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {project.summary.slice(0, 120)}
                    {project.summary.length > 120 ? "…" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <StatusPill
                    tone={project.status === "published" ? "green" : "slate"}
                  >
                    {project.status}
                  </StatusPill>
                  <button
                    type="button"
                    onClick={() => startEdit(project._id)}
                    className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${editingId === project._id ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"}`}
                  >
                    {editingId === project._id ? "Editing…" : "Edit"}
                  </button>
                </div>
              </div>
              {project.awards ? (
                <p className="mt-2 text-xs text-amber-700">{project.awards}</p>
              ) : null}
              <p className="mt-2 text-[11px] text-slate-400">
                Featured: {project.featured ? "yes" : "no"} · Category:{" "}
                {project.category} · State: {project.projectState}
              </p>
            </article>
          ))}
          {projects?.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No projects yet.
            </p>
          ) : null}
          {projects === undefined ? (
            <p className="p-8 text-center text-sm text-slate-500">Loading…</p>
          ) : null}
        </div>
      </Panel>
    </div>
  )
}
