"use client"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useQuery } from "convex/react"
import { Search, ArrowUpRight } from "lucide-react"
import { api } from "@/convex/_generated/api"
export function SearchSurface() {
  const [query, setQuery] = useState("")
  const [type, setType] = useState("All")
  const data = useQuery(
    api.search.publicSearch,
    query.trim().length >= 2
      ? { search: query.trim(), limitPerType: 12 }
      : "skip"
  )
  const searchIndex = useMemo(
    () => [
      ...(data?.projects ?? []).map((item) => ({
        type: "Project",
        title: item.title,
        href: `/projects/${item.slug}`,
      })),
      ...(data?.alumni ?? []).map((item) => ({
        type: "Alumni",
        title: item.name,
        href: "/alumni",
      })),
      ...(data?.blogs ?? []).map((item) => ({
        type: "News",
        title: item.title,
        href: `/news/${item.slug}`,
      })),
      ...(data?.committee ?? []).map((item) => ({
        type: "Committee",
        title: item.name,
        href: "/committee",
      })),
      ...(data?.publications ?? []).map((item) => ({
        type: "Publication",
        title: item.title,
        href: "/publications",
      })),
      ...(data?.events ?? []).map((item) => ({
        type: "Event",
        title: item.name,
        href: `/events/${item.slug}`,
      })),
    ],
    [data]
  )
  const types = ["All", ...new Set(searchIndex.map((i) => i.type))]
  const list = useMemo(
    () => searchIndex.filter((item) => type === "All" || item.type === type),
    [searchIndex, type]
  )
  return (
    <>
      <div className="rounded-xl border border-[#2359d4]/15 bg-white p-4 shadow-[0_14px_40px_rgba(25,55,90,.07)] dark:border-white/10 dark:bg-[#09182a] dark:shadow-none">
        <label className="relative block">
          <Search className="absolute top-1/2 left-5 size-5 -translate-y-1/2 text-[#587084] dark:text-[#71869e]" />
          <span className="sr-only">Search ASRRO</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, events, people, research…"
            className="h-16 w-full border border-[#2359d4]/15 bg-[#f4f7fb] pr-5 pl-14 text-lg text-[#07111f] outline-none placeholder:text-[#6b7f91] focus:border-[#00a6b2] dark:border-white/10 dark:bg-[#06101f] dark:text-white dark:placeholder:text-[#52677e] dark:focus:border-[#65f2f1]"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          {types.map((item) => (
            <button
              key={item}
              onClick={() => setType(item)}
              aria-pressed={type === item}
              className={
                type === item
                  ? "bg-[#07111f] px-3 py-1.5 text-xs font-semibold text-white dark:bg-[#65f2f1] dark:text-[#03101e]"
                  : "border border-[#2359d4]/15 px-3 py-1.5 text-xs text-[#4b6175] dark:border-white/10 dark:text-[#9fb1c5]"
              }
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <p className="my-6 font-mono text-[10px] tracking-[.18em] text-[#587084] uppercase dark:text-[#71869e]">
        {list.length} indexed records
      </p>
      <div className="divide-y divide-[#2359d4]/15 border-y border-[#2359d4]/15 dark:divide-white/10 dark:border-white/10">
        {list.map((item, index) => (
          <Link
            key={`${item.type}-${item.title}`}
            href={item.href}
            className="group grid gap-2 py-5 sm:grid-cols-[3rem_8rem_1fr_auto] sm:items-center"
          >
            <span className="font-mono text-[9px] text-[#6b7f91] dark:text-[#52677e]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-mono text-[9px] tracking-[.16em] text-[#007d89] uppercase dark:text-[#65f2f1]">
              {item.type}
            </span>
            <span className="text-lg font-semibold group-hover:text-[#007d89] dark:group-hover:text-[#65f2f1]">
              {item.title}
            </span>
            <ArrowUpRight className="size-4 text-[#587084] dark:text-[#71869e]" />
          </Link>
        ))}
      </div>
      {query.trim().length < 2 ? (
        <div className="rounded-xl border border-dashed border-[#2359d4]/25 p-12 text-center text-[#4b6175] dark:border-white/15 dark:text-[#9fb1c5]">
          Enter at least two characters to search the public archive.
        </div>
      ) : list.length ? null : (
        <div className="rounded-xl border border-dashed border-[#2359d4]/25 p-12 text-center text-[#4b6175] dark:border-white/15 dark:text-[#9fb1c5]">
          No indexed records match that search. Try a broader term or select
          “All”.
        </div>
      )}
    </>
  )
}
