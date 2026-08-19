"use client"

import { useMutation, useQuery } from "convex/react"
import {
  CalendarRange,
  CheckCircle2,
  Download,
  TicketCheck,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import {
  MetricCard,
  PageHeader,
  Panel,
  StatusPill,
} from "@/components/dashboard/dashboard-kit"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/motion/tabs"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import {
  downloadParticipationCertificatePdf,
  downloadParticipationConfirmationPdf,
} from "@/lib/event-documents"

export function MemberEvents() {
  const [now] = useState(() => Date.now())
  const data = useQuery(api.events.memberDashboard, { now })
  const member = useQuery(api.members.me)
  const cancelMine = useMutation(api.events.cancelMine)
  const [message, setMessage] = useState("")
  const registrations = data?.registrations ?? []
  const active = registrations.filter((item) =>
    ["pending", "confirmed"].includes(item.status)
  )
  const attended = registrations.filter((item) => item.status === "attended")

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Member events"
        title="Events & registrations"
        description="Discover eligible programs, track your confirmations, and revisit attended events."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Open events"
          value={data?.openEvents.length ?? 0}
          detail="Eligible programs currently available"
          icon={CalendarRange}
          tone="blue"
        />
        <MetricCard
          label="Active registrations"
          value={active.length}
          detail="Pending and confirmed"
          icon={TicketCheck}
          tone="emerald"
        />
        <MetricCard
          label="Attended"
          value={attended.length}
          detail="Recorded participation"
          icon={CheckCircle2}
          tone="violet"
        />
      </div>
      {message && (
        <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-500/10 dark:text-blue-200">
          {message}
        </p>
      )}
      <Tabs defaultValue="upcoming" variant="underline">
        <TabsList className="w-full overflow-x-auto bg-transparent">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="registered">My registrations</TabsTrigger>
          <TabsTrigger value="attended">Attended</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {data?.openEvents.map((event) => (
              <EventTile key={event._id} event={event} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="registered">
          <Panel>
            <div className="divide-y divide-slate-100 dark:divide-white/8">
              {registrations.map((registration) => (
                <div
                  key={registration.registrationId}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold">{registration.event.name}</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {registration.registrationCode} ·{" "}
                      {new Date(registration.event.startsAt).toLocaleString()}
                    </p>
                  </div>
                  <StatusPill
                    tone={
                      registration.status === "confirmed" ||
                      registration.status === "attended"
                        ? "green"
                        : registration.status === "pending"
                          ? "amber"
                          : "slate"
                    }
                  >
                    {registration.status}
                  </StatusPill>
                  <button
                    onClick={() =>
                      void downloadParticipationConfirmationPdf({
                        registrationCode: registration.registrationCode,
                        status: registration.status,
                        participantName: member?.fullName ?? "ASRRO member",
                        eventName: registration.event.name,
                        startsAt: registration.event.startsAt,
                        venue: registration.event.venue,
                      })
                    }
                    className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600"
                  >
                    <Download className="size-3.5" /> Confirmation
                  </button>
                  {["pending", "confirmed"].includes(registration.status) &&
                    now <= registration.event.registrationDeadline && (
                      <button
                        onClick={() =>
                          void (async () => {
                            try {
                              await cancelMine({
                                registrationId: registration.registrationId,
                              })
                              setMessage("Registration cancelled.")
                            } catch (error) {
                              setMessage(
                                error instanceof Error
                                  ? error.message
                                  : "Cancellation failed"
                              )
                            }
                          })()
                        }
                        className="text-left text-xs font-semibold text-red-600"
                      >
                        Cancel
                      </button>
                    )}
                </div>
              ))}
              {data && registrations.length === 0 && (
                <p className="p-8 text-center text-sm text-slate-500">
                  You have no event registrations yet.
                </p>
              )}
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="attended">
          <Panel>
            <div className="divide-y divide-slate-100 dark:divide-white/8">
              {attended.map((registration) => (
                <div
                  key={registration.registrationId}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold">
                      {registration.event.name}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Attended ·{" "}
                      {new Date(
                        registration.event.startsAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  {registration.certificateCode &&
                  registration.certificateIssuedAt ? (
                    <button
                      type="button"
                      onClick={() =>
                        void downloadParticipationCertificatePdf({
                          registrationCode: registration.registrationCode,
                          status: registration.status,
                          participantName: member?.fullName ?? "ASRRO member",
                          eventName: registration.event.name,
                          startsAt: registration.event.startsAt,
                          venue: registration.event.venue,
                          certificateCode: registration.certificateCode!,
                          issuedAt: registration.certificateIssuedAt!,
                        })
                      }
                      className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600"
                    >
                      <Download className="size-3.5" /> Certificate
                    </button>
                  ) : null}
                </div>
              ))}
              {data && attended.length === 0 && (
                <p className="p-8 text-center text-sm text-slate-500">
                  No attendance has been recorded yet.
                </p>
              )}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EventTile({
  event,
}: {
  event: Doc<"events"> & { phase: "upcoming" | "ongoing" | "past" }
}) {
  const fill = Math.min(
    100,
    Math.round((event.activeRegistrationCount / event.capacity) * 100)
  )
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-slate-950/60">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">
          {event.category} · {event.scope.replaceAll("_", " ")}
        </p>
        <StatusPill tone="blue">{event.phase}</StatusPill>
      </div>
      <h2 className="mt-3 text-lg font-semibold">{event.name}</h2>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        {new Date(event.startsAt).toLocaleString()} · {event.venue}
      </p>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <span
          className="block h-full bg-blue-600"
          style={{ width: `${fill}%` }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {event.capacity - event.activeRegistrationCount} seats left
        </span>
        <Link
          href={`/events/${event.slug}`}
          className="text-xs font-semibold text-blue-600"
        >
          View & register
        </Link>
      </div>
    </article>
  )
}
