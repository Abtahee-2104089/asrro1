"use client"

import { usePaginatedQuery } from "convex/react"
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"

const eventMonthFormatter = new Intl.DateTimeFormat("en-BD", {
  month: "short",
  timeZone: "Asia/Dhaka",
})
const eventDayFormatter = new Intl.DateTimeFormat("en-BD", {
  day: "numeric",
  timeZone: "Asia/Dhaka",
})
const eventMonthYearFormatter = new Intl.DateTimeFormat("en-BD", {
  month: "long",
  year: "numeric",
  timeZone: "Asia/Dhaka",
})
const eventTimeFormatter = new Intl.DateTimeFormat("en-BD", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Dhaka",
})

type DirectoryEvent = Doc<"events"> & {
  phase: "upcoming" | "ongoing" | "past"
}

export function EventExplorer() {
  const [now] = useState(() => Date.now())
  const publishedQuery = usePaginatedQuery(
    api.events.listDirectoryPage,
    { status: "published", now },
    { initialNumItems: 50 }
  )
  const completedQuery = usePaginatedQuery(
    api.events.listDirectoryPage,
    { status: "completed", now },
    { initialNumItems: 50 }
  )
  const events = useMemo(
    () =>
      [...publishedQuery.results, ...completedQuery.results].toSorted(
        (a, b) => b.startsAt - a.startsAt
      ),
    [completedQuery.results, publishedQuery.results]
  )
  const [status, setStatus] = useState("upcoming")
  const [mode, setMode] = useState<"cards" | "calendar">("cards")
  const list = useMemo(
    () =>
      (events ?? []).filter(
        (event) => status === "all" || event.phase === status
      ),
    [events, status]
  )

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 rounded-xl border border-[#2359d4]/15 bg-white p-4 shadow-[0_14px_40px_rgba(25,55,90,.07)] sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#09182a] dark:shadow-none">
        <Tabs value={status} onValueChange={setStatus} variant="pill">
          <TabsList className="flex-wrap bg-[#eef3f8] dark:bg-[#06101f]">
            {["upcoming", "ongoing", "past", "all"].map((item) => (
              <TabsTrigger
                key={item}
                value={item}
                className={cn(
                  "text-[#587084] capitalize dark:text-[#8296ad]",
                  status === item && "text-[#03101e]"
                )}
                indicatorClassName="bg-[#57e6e6]"
              >
                {item}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div
          className="flex border border-[#2359d4]/15 bg-[#eef3f8] p-1 dark:border-white/10 dark:bg-[#06101f]"
          aria-label="Event view"
        >
          {(["cards", "calendar"] as const).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setMode(item)}
              className={cn(
                "flex min-h-10 items-center gap-2 px-3 text-sm capitalize",
                mode === item
                  ? "bg-white text-[#07111f] shadow-sm dark:bg-white/10 dark:text-white"
                  : "text-[#587084] dark:text-[#8296ad]"
              )}
              aria-pressed={mode === item}
            >
              {item === "cards" ? (
                <Grid2X2 className="size-4" />
              ) : (
                <CalendarDays className="size-4" />
              )}
              {item}
            </button>
          ))}
        </div>
      </div>

      {publishedQuery.status === "LoadingFirstPage" ||
      completedQuery.status === "LoadingFirstPage" ? (
        <EventGridSkeleton />
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2359d4]/25 p-12 text-center text-sm text-[#587084] dark:border-white/15 dark:text-[#8296ad]">
          No {status === "all" ? "" : status} events are available.
        </div>
      ) : mode === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((event) => (
            <PublicEventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <CalendarMode list={list} />
      )}
      {publishedQuery.status === "CanLoadMore" ||
      completedQuery.status === "CanLoadMore" ? (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              if (publishedQuery.status === "CanLoadMore") {
                publishedQuery.loadMore(50)
              }
              if (completedQuery.status === "CanLoadMore") {
                completedQuery.loadMore(50)
              }
            }}
            className="min-h-10 border border-[#2359d4]/20 px-5 text-sm font-semibold text-[#007d89] dark:border-white/15 dark:text-[#65f2f1]"
          >
            Load more events
          </button>
        </div>
      ) : null}
    </div>
  )
}

function PublicEventCard({ event }: { event: DirectoryEvent }) {
  const fill = Math.min(
    100,
    Math.round((event.activeRegistrationCount / event.capacity) * 100)
  )
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex min-h-[24rem] flex-col rounded-xl border border-[#2359d4]/15 bg-white p-6 shadow-[0_12px_35px_rgba(25,55,90,.06)] transition hover:-translate-y-1 hover:border-[#00a6b2]/55 motion-reduce:transform-none dark:border-white/10 dark:bg-[#09182a] dark:shadow-none dark:hover:border-[#65f2f1]/45"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid size-17 place-items-center border border-[#2359d4]/25 bg-[#eef3f8] text-center dark:border-[#3d8bff]/35 dark:bg-[#0b2138]">
          <span>
            <span className="block font-mono text-[9px] tracking-[.18em] text-[#007d89] uppercase dark:text-[#65f2f1]">
              {eventMonthFormatter.format(event.startsAt)}
            </span>
            <span className="block text-3xl font-semibold">
              {eventDayFormatter.format(event.startsAt)}
            </span>
          </span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="border border-[#d97706]/25 px-3 py-1 font-mono text-[9px] tracking-[.14em] text-[#a95000] uppercase dark:border-white/10 dark:text-[#ffb84d]">
            {event.scope.replaceAll("_", " ")}
          </span>
          <span className="font-mono text-[9px] tracking-[.14em] text-[#587084] uppercase dark:text-[#8296ad]">
            {event.phase}
          </span>
        </div>
      </div>
      <p className="mt-7 font-mono text-[9px] tracking-[.14em] text-[#007d89] uppercase dark:text-[#65f2f1]">
        {event.category}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-.035em] group-hover:text-[#007d89] dark:group-hover:text-[#65f2f1]">
        {event.name}
      </h2>
      <p className="mt-4 flex items-center gap-2 text-sm text-[#587084] dark:text-[#8fa7c0]">
        <MapPin className="size-4 shrink-0" />
        {event.venue}
      </p>
      <div className="mt-auto pt-7">
        <div className="mb-2 flex justify-between font-mono text-[9px] tracking-[.14em] text-[#587084] uppercase dark:text-[#71869e]">
          <span>
            {event.activeRegistrationCount}/{event.capacity} registered
          </span>
          <span>{fill}%</span>
        </div>
        <div className="h-1 overflow-hidden bg-[#2359d4]/10 dark:bg-white/10">
          <span
            className="block h-full bg-[#57e6e6]"
            style={{ width: `${fill}%` }}
          />
        </div>
        <p className="mt-4 flex items-center justify-between text-sm text-[#425a70] dark:text-[#b9c8d9]">
          View event brief <ArrowUpRight className="size-4" />
        </p>
      </div>
    </Link>
  )
}

function CalendarMode({ list }: { list: DirectoryEvent[] }) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const anchor = list.find((event) => event.startsAt >= Date.now())?.startsAt
    const date = new Date(anchor ?? Date.now())
    return new Date(date.getFullYear(), date.getMonth(), 1)
  })
  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()
  const leadingDays = new Date(year, month, 1).getDay()
  const cells = Array.from(
    { length: 42 },
    (_, index) => new Date(year, month, index - leadingDays + 1)
  )
  const eventsByDay = new Map<string, DirectoryEvent[]>()
  for (const event of list) {
    const date = new Date(event.startsAt)
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    eventsByDay.set(key, [...(eventsByDay.get(key) ?? []), event])
  }
  return (
    <section className="overflow-hidden rounded-xl border border-[#2359d4]/15 bg-white dark:border-white/10 dark:bg-[#09182a]">
      <div className="flex items-center justify-between border-b border-[#2359d4]/15 px-4 py-3 dark:border-white/10">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setVisibleMonth(new Date(year, month - 1, 1))}
          className="grid size-10 place-items-center hover:bg-[#2359d4]/5 dark:hover:bg-white/5"
        >
          <ChevronLeft className="size-4" />
        </button>
        <h2 className="text-sm font-semibold">
          {eventMonthYearFormatter.format(visibleMonth)}
        </h2>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setVisibleMonth(new Date(year, month + 1, 1))}
          className="grid size-10 place-items-center hover:bg-[#2359d4]/5 dark:hover:bg-white/5"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 border-b border-[#2359d4]/10 text-center font-mono text-[9px] tracking-[.14em] text-[#587084] uppercase dark:border-white/8 dark:text-[#8296ad]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="px-1 py-3">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date) => {
          const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
          const dayEvents = eventsByDay.get(key) ?? []
          const inMonth = date.getMonth() === month
          return (
            <div
              key={date.toISOString()}
              className={cn(
                "min-h-24 border-r border-b border-[#2359d4]/10 p-1.5 sm:min-h-32 sm:p-2 dark:border-white/8",
                !inMonth &&
                  "bg-[#eef3f8]/55 text-[#8296ad] dark:bg-[#06101f]/60"
              )}
            >
              <span className="text-xs font-semibold">{date.getDate()}</span>
              <div className="mt-1 grid gap-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <Link
                    key={event._id}
                    href={`/events/${event.slug}`}
                    title={`${event.name} · ${event.venue}`}
                    className="block truncate rounded-sm bg-[#57e6e6]/25 px-1.5 py-1 text-[9px] font-semibold text-[#075f68] hover:bg-[#57e6e6]/45 sm:text-[10px] dark:text-[#9effff]"
                  >
                    <span className="hidden sm:inline">
                      {eventTimeFormatter.format(event.startsAt)} ·{" "}
                    </span>
                    {event.name}
                  </Link>
                ))}
                {dayEvents.length > 3 ? (
                  <span className="text-[9px] text-[#587084] dark:text-[#8296ad]">
                    +{dayEvents.length - 3} more
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function EventGridSkeleton() {
  return (
    <div
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      aria-label="Loading events"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="min-h-96 animate-pulse rounded-xl bg-[#2359d4]/8 dark:bg-white/5"
        />
      ))}
    </div>
  )
}
