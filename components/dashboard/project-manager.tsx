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

export function ProjectManager() {
  const projects = useQuery(api.projects.listAdmin)
  const upsert = useMutation(api.projects.upsert)
  const [coverAssetId, setCoverAssetId] = useState<Id<"assets">>()
  const [message, setMessage] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setMessage("Saving…")
    try {
      await upsert({
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
        technologyStack: String(data.get("technologyStack"))
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        githubUrl: String(data.get("githubUrl")) || undefined,
        awards: String(data.get("awards")) || undefined,
        coverAssetId,
        featured: data.get("featured") === "on",
      })
      form.reset()
      setCoverAssetId(undefined)
      setMessage("Project saved.")
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save project"
      )
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <Panel
        title="Create project"
        description="Publish repository, award, and technical metadata."
      >
        <form
          onSubmit={(event) => void submit(event)}
          className="grid gap-3 p-5"
        >
          {[
            ["title", "Title"],
            ["slug", "URL slug"],
            ["domain", "Domain"],
            ["summary", "Summary"],
            ["githubUrl", "Repository URL"],
            ["awards", "Awards / outcome"],
            ["technologyStack", "Technology stack (comma separated)"],
          ].map(([name, label]) => (
            <label key={name} className="text-xs font-medium">
              {label}
              <input
                name={name}
                required={!["githubUrl", "awards"].includes(name)}
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 dark:border-white/10 dark:bg-white/5"
              />
            </label>
          ))}
          <label className="text-xs font-medium">
            Description
            <textarea
              name="description"
              required
              rows={5}
              className="mt-1 w-full rounded-lg border border-slate-200 p-3 dark:border-white/10 dark:bg-white/5"
            />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <select
              name="category"
              className="h-10 rounded-lg border border-slate-200 px-2 dark:border-white/10 dark:bg-slate-900"
            >
              {[
                "ongoing",
                "completed",
                "research",
                "competition",
                "industry_collaboration",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <select
              name="projectState"
              className="h-10 rounded-lg border border-slate-200 px-2 dark:border-white/10 dark:bg-slate-900"
            >
              {["planned", "ongoing", "completed", "paused"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <select
              name="status"
              className="h-10 rounded-lg border border-slate-200 px-2 dark:border-white/10 dark:bg-slate-900"
            >
              {["draft", "published", "archived"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <label className="text-xs">
            <input type="checkbox" name="featured" className="mr-2" />
            Featured
          </label>
          <AssetUploader
            kind="image"
            accept="image/*"
            label="Upload cover"
            onUploaded={setCoverAssetId}
          />
          <ActionButton type="submit">Save project</ActionButton>
          <p role="status" className="text-xs text-slate-500">
            {message}
          </p>
        </form>
      </Panel>
      <Panel
        title="Project inventory"
        description={`${projects?.length ?? 0} bounded records loaded`}
      >
        <div className="divide-y divide-slate-100 dark:divide-white/8">
          {projects?.map((project) => (
            <article key={project._id} className="p-5">
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{project.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {project.domain} · {project.githubUrl ?? "No repository"}
                  </p>
                </div>
                <StatusPill
                  tone={project.status === "published" ? "green" : "slate"}
                >
                  {project.status}
                </StatusPill>
              </div>
              {project.awards ? (
                <p className="mt-3 text-xs text-amber-700">{project.awards}</p>
              ) : null}
            </article>
          ))}
          {projects?.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No projects yet.
            </p>
          ) : null}
        </div>
      </Panel>
    </div>
  )
}
