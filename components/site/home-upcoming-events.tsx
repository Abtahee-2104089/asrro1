"use client"

import { useQuery } from "convex/react"
import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { api } from "@/convex/_generated/api"

const eventDateFormatter = new Intl.DateTimeFormat("en-BD", {
  day: "2-digit",
  month: "short",
  timeZone: "Asia/Dhaka",
})
const eventTimeFormatter = new Intl.DateTimeFormat("en-BD", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Dhaka",
})

export function HomeUpcomingEvents() {
  const [now] = useState(() => Date.now())
  const events = useQuery(api.events.listDirectory, { now })
  const upcoming = (events ?? [])
    .filter((event) => event.phase === "upcoming")
    .slice(0, 4)

  if (events === undefined) {
    return (
      <div className="grid min-h-48 place-items-center border-y border-[#2359d4]/15 text-sm text-[#587084] dark:border-white/10 dark:text-[#8fa7c0]">
        Loading upcoming events…
      </div>
    )
  }

  if (!upcoming.length) {
    return (
      <div className="grid min-h-48 place-items-center border-y border-[#2359d4]/15 text-sm text-[#587084] dark:border-white/10 dark:text-[#8fa7c0]">
        New field dates will appear here when published.
      </div>
    )
  }

  return (
    <div className="divide-y divide-[#2359d4]/15 border-t border-[#2359d4]/15 dark:divide-white/10 dark:border-white/10">
      {upcoming.map((event) => {
        const [day, month] = eventDateFormatter
          .format(event.startsAt)
          .split(" ", 2)
        return (
          <Link
            key={event.slug}
            href={`/events/${event.slug}`}
            className="group grid gap-5 py-6 sm:grid-cols-[5rem_1fr_auto] sm:items-center"
          >
            <div>
              <span className="block font-mono text-[10px] tracking-[.18em] text-[#007d89] dark:text-[#65f2f1]">
                {month}
              </span>
              <span className="text-4xl font-semibold tracking-[-.05em]">
                {day}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold group-hover:text-[#007d89] dark:group-hover:text-[#65f2f1]">
                {event.name}
              </h3>
              <p className="mt-2 flex flex-wrap gap-4 text-sm text-[#587084] dark:text-[#8fa7c0]">
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-4" />
                  {eventTimeFormatter.format(event.startsAt)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  {event.venue}
                </span>
              </p>
            </div>
            <ArrowRight className="hidden size-5 text-[#007d89] sm:block dark:text-[#65f2f1]" />
          </Link>
        )
      })}
    </div>
  )
}
