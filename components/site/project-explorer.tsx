"use client"
import Link from "next/link"
import { useMemo, useState } from "react"
import { usePaginatedQuery, useQuery } from "convex/react"
import { ArrowUpRight, Search } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { SignalVisual } from "@/components/shared/signal-visual"
import Image from "next/image"
import type { Id } from "@/convex/_generated/dataModel"

export function ProjectExplorer() {
  const [domain, setDomain] = useState("All")
  const [state, setState] = useState("All")
  const [query, setQuery] = useState("")
  const { results, status, loadMore } = usePaginatedQuery(
    api.projects.listPublic,
    {},
    { initialNumItems: 60 }
  )
  const domains = ["All", ...new Set(results.map((item) => item.domain))]
  const states = ["All", ...new Set(results.map((item) => item.projectState))]
  const filtered = useMemo(
    () =>
      results.filter(
        (project) =>
          (domain === "All" || project.domain === domain) &&
          (state === "All" || project.projectState === state) &&
          `${project.title} ${project.summary} ${project.technologyStack.join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [results, domain, state, query]
  )
  return (
    <div>
      <div className="mb-8 grid gap-4 rounded-xl border border-[#2359d4]/15 bg-white p-4 shadow-[0_14px_40px_rgba(25,55,90,.07)] lg:grid-cols-[1fr_auto_auto] lg:items-center dark:border-white/10 dark:bg-[#09182a] dark:shadow-none">
        <label className="relative">
          <span className="sr-only">Search projects</span>
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#587084] dark:text-[#71869e]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or technology"
            className="h-12 w-full border border-[#2359d4]/15 bg-[#f4f7fb] pr-4 pl-11 text-sm text-[#07111f] outline-none placeholder:text-[#6b7f91] focus:border-[#00a6b2] dark:border-white/10 dark:bg-[#06101f] dark:text-white dark:placeholder:text-[#60758c] dark:focus:border-[#65f2f1]"
          />
        </label>
        <FilterGroup
          label="Domain"
          options={domains}
          value={domain}
          onChange={setDomain}
        />
        <FilterGroup
          label="Project state"
          options={states}
          value={state}
          onChange={setState}
        />
      </div>
      <p className="mb-5 font-mono text-[10px] tracking-[.18em] text-[#587084] uppercase dark:text-[#8296ad]">
        {filtered.length} mission records
      </p>
      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project, index) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group overflow-hidden rounded-xl border border-[#2359d4]/15 bg-white shadow-[0_12px_35px_rgba(25,55,90,.06)] transition hover:-translate-y-1 hover:border-[#00a6b2]/55 motion-reduce:transform-none dark:border-white/10 dark:bg-[#09182a] dark:shadow-none dark:hover:border-[#65f2f1]/50"
            >
              <ProjectCover
                assetId={project.coverAssetId}
                title={project.title}
                code={`R&D—${String(index + 1).padStart(2, "0")}`}
              />
              <div className="p-6">
                <div className="flex items-center justify-between font-mono text-[9px] tracking-[.17em] text-[#587084] uppercase dark:text-[#8296ad]">
                  <span>{project.domain}</span>
                  <span className="text-[#a95000] dark:text-[#ffb84d]">
                    {project.projectState.replaceAll("_", " ")}
                  </span>
                </div>
                <h2 className="mt-5 flex items-start justify-between gap-4 text-2xl font-semibold tracking-[-.035em] group-hover:text-[#007d89] dark:group-hover:text-[#65f2f1]">
                  {project.title}
                  <ArrowUpRight className="mt-1 size-4 shrink-0" />
                </h2>
                <p className="mt-3 leading-7 text-[#4b6175] dark:text-[#9fb1c5]">
                  {project.summary}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.technologyStack.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="border border-[#2359d4]/15 bg-[#eef3f8] px-2.5 py-1 font-mono text-[9px] text-[#4b6175] dark:border-white/10 dark:bg-transparent dark:text-[#8fa7c0]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#2359d4]/25 p-12 text-center text-[#4b6175] dark:border-white/15 dark:text-[#9fb1c5]">
          No project records match those filters. Try another discipline or
          clear the search.
        </div>
      )}
      {status === "CanLoadMore" ? (
        <button
          type="button"
          onClick={() => loadMore(60)}
          className="mx-auto mt-8 block border border-[#2359d4]/20 px-5 py-2.5 text-sm font-semibold text-[#007d89] dark:border-white/15 dark:text-[#65f2f1]"
        >
          Load more projects
        </button>
      ) : null}
    </div>
  )
}

function ProjectCover({
  assetId,
  title,
  code,
}: {
  assetId?: Id<"assets">
  title: string
  code: string
}) {
  const url = useQuery(api.assets.getPublicUrl, assetId ? { assetId } : "skip")
  return (
    <div className="relative aspect-[16/9] border-b border-[#2359d4]/15 dark:border-white/10">
      {url ? (
        <Image
          src={url}
          alt={title}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          unoptimized
          className="object-cover"
        />
      ) : (
        <SignalVisual code={code} className="absolute inset-0" compact />
      )}
    </div>
  )
}
function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 min-w-40 border border-[#2359d4]/15 bg-[#f4f7fb] px-4 text-sm text-[#07111f] outline-none focus:border-[#00a6b2] dark:border-white/10 dark:bg-[#06101f] dark:text-[#dce9f5] dark:focus:border-[#65f2f1]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}
