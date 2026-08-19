"use client"
import { useMemo, useState } from "react"
import { usePaginatedQuery, useQuery } from "convex/react"
import { Search, ExternalLink } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { PersonOrb } from "@/components/shared/person-orb"

export function AlumniDirectory() {
  const [query, setQuery] = useState("")
  const [department, setDepartment] = useState("All")
  const [batch, setBatch] = useState("All")
  const [graduationYear, setGraduationYear] = useState("All")
  const { results, status, loadMore } = usePaginatedQuery(
    api.alumni.listPublic,
    {},
    { initialNumItems: 60 }
  )
  const departments = ["All", ...new Set(results.map((a) => a.department))]
  const batches = ["All", ...new Set(results.map((a) => a.batch))]
  const graduationYears = [
    "All",
    ...new Set(results.map((a) => String(a.graduationYear))),
  ]
  const list = useMemo(
    () =>
      results.filter(
        (a) =>
          (department === "All" || a.department === department) &&
          (batch === "All" || a.batch === batch) &&
          (graduationYear === "All" ||
            String(a.graduationYear) === graduationYear) &&
          `${a.name} ${a.currentWorkplace ?? ""} ${a.researchInterests ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [results, query, department, batch, graduationYear]
  )
  return (
    <>
      <div className="mb-8 grid gap-3 rounded-xl border border-[#2359d4]/15 bg-white p-4 shadow-[0_14px_40px_rgba(25,55,90,.07)] md:grid-cols-[1fr_auto_auto_auto] dark:border-white/10 dark:bg-[#09182a] dark:shadow-none">
        <label className="relative">
          <span className="sr-only">Search alumni</span>
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#587084] dark:text-[#71869e]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, workplaces, or interests"
            className="h-12 w-full border border-[#2359d4]/15 bg-[#f4f7fb] pr-4 pl-11 text-[#07111f] outline-none placeholder:text-[#6b7f91] focus:border-[#00a6b2] dark:border-white/10 dark:bg-[#06101f] dark:text-white dark:focus:border-[#65f2f1]"
          />
        </label>
        <Select
          label="Department"
          value={department}
          options={departments}
          set={setDepartment}
        />
        <Select label="Batch" value={batch} options={batches} set={setBatch} />
        <Select
          label="Graduation year"
          value={graduationYear}
          options={graduationYears}
          set={setGraduationYear}
        />
      </div>
      <p className="mb-5 font-mono text-[10px] tracking-[.18em] text-[#587084] uppercase dark:text-[#8296ad]">
        {list.length} alumni in view
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((person) => (
          <AlumniCard key={person._id} person={person} />
        ))}
      </div>
      {status === "CanLoadMore" ? (
        <button
          type="button"
          onClick={() => loadMore(60)}
          className="mx-auto mt-8 block border border-[#2359d4]/20 px-5 py-2.5 text-sm font-semibold text-[#007d89] dark:border-white/15 dark:text-[#65f2f1]"
        >
          Load more alumni
        </button>
      ) : null}
      {status !== "LoadingFirstPage" && list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2359d4]/25 p-12 text-center text-[#4b6175] dark:border-white/15 dark:text-[#9fb1c5]">
          No published alumni match those filters yet.
        </div>
      ) : null}
    </>
  )
}

type AlumniRecord = {
  _id: Id<"alumni">
  name: string
  department: string
  batch: string
  session: string
  graduationYear: number
  currentWorkplace?: string
  higherStudies?: string
  researchInterests?: string
  linkedInUrl?: string
  photoAssetId?: Id<"assets">
}

function AlumniCard({ person }: { person: AlumniRecord }) {
  const photoUrl = useQuery(
    api.assets.getPublicUrl,
    person.photoAssetId ? { assetId: person.photoAssetId } : "skip"
  )
  const interests = (person.researchInterests ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
  const content = (
    <article className="h-full rounded-xl border border-[#2359d4]/15 bg-white p-6 shadow-[0_12px_35px_rgba(25,55,90,.06)] dark:border-white/10 dark:bg-[#09182a] dark:shadow-none">
      <div className="flex items-start gap-4">
        <PersonOrb
          initials={person.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
          src={photoUrl}
          alt={person.name}
          className="size-16 shrink-0 text-lg"
        />
        <div>
          <h2 className="text-xl font-semibold">{person.name}</h2>
          <p className="mt-1 text-sm text-[#007d89] dark:text-[#65f2f1]">
            {person.currentWorkplace ?? "Alumni profile"}
          </p>
        </div>
        <ExternalLink className="ml-auto size-4 text-[#587084] dark:text-[#71869e]" />
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[#2359d4]/15 pt-5 text-sm dark:border-white/10">
        <div>
          <dt className="font-mono text-[9px] tracking-[.15em] text-[#587084] uppercase dark:text-[#71869e]">
            Department
          </dt>
          <dd className="mt-1 text-[#425a70] dark:text-[#b9c8d9]">
            {person.department}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[9px] tracking-[.15em] text-[#587084] uppercase dark:text-[#71869e]">
            Batch / grad
          </dt>
          <dd className="mt-1 text-[#425a70] dark:text-[#b9c8d9]">
            {person.batch} / {person.graduationYear}
          </dd>
        </div>
      </dl>
      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="font-mono text-[9px] tracking-[.15em] text-[#587084] uppercase dark:text-[#71869e]">
            Academic session
          </dt>
          <dd className="mt-1 text-[#425a70] dark:text-[#b9c8d9]">
            {person.session}
          </dd>
        </div>
        {person.higherStudies ? (
          <div>
            <dt className="font-mono text-[9px] tracking-[.15em] text-[#587084] uppercase dark:text-[#71869e]">
              Higher studies
            </dt>
            <dd className="mt-1 text-[#425a70] dark:text-[#b9c8d9]">
              {person.higherStudies}
            </dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-5 flex flex-wrap gap-2">
        {interests.map((i) => (
          <span
            key={i}
            className="border border-[#2359d4]/20 bg-[#eef3f8] px-2.5 py-1 text-xs text-[#425a70] dark:border-[#3d8bff]/25 dark:bg-transparent dark:text-[#9fb1c5]"
          >
            {i}
          </span>
        ))}
      </div>
    </article>
  )
  return person.linkedInUrl ? (
    <a href={person.linkedInUrl} target="_blank" rel="noreferrer">
      {content}
    </a>
  ) : (
    content
  )
}
function Select({
  label,
  value,
  options,
  set,
}: {
  label: string
  value: string
  options: string[]
  set: (v: string) => void
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => set(e.target.value)}
        className="h-12 min-w-44 border border-[#2359d4]/15 bg-[#f4f7fb] px-4 text-[#07111f] outline-none focus:border-[#00a6b2] dark:border-white/10 dark:bg-[#06101f] dark:text-white dark:focus:border-[#65f2f1]"
      >
        <option value="All">All {label.toLowerCase()}s</option>
        {options.slice(1).map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}
