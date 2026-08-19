"use client"

import { usePaginatedQuery, useQuery } from "convex/react"
import { Download, FileBarChart } from "lucide-react"
import { useMemo, useState } from "react"

import {
  ActionButton,
  PageHeader,
  Panel,
} from "@/components/dashboard/dashboard-kit"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  exportCsv,
  exportExcel,
  exportPdf,
  type ExportRow,
} from "@/lib/export-data"

type ReportKey =
  | "members"
  | "pending"
  | "committee"
  | "projects"
  | "event_registrations"
  | "attendance"

const reports: Array<{ key: ReportKey; title: string; description: string }> = [
  {
    key: "members",
    title: "Active member list",
    description: "Current member directory and academic records",
  },
  {
    key: "pending",
    title: "Pending membership applications",
    description: "Applications awaiting an executive decision",
  },
  {
    key: "committee",
    title: "Executive committee list",
    description: "Current published committee roster",
  },
  {
    key: "projects",
    title: "Project inventory",
    description: "Published project portfolio and delivery state",
  },
  {
    key: "event_registrations",
    title: "Event registrations",
    description: "Complete participant and payment records by event",
  },
  {
    key: "attendance",
    title: "Event attendance",
    description: "Present and absent participant records by event",
  },
]

export function ReportsWorkspace() {
  const [selected, setSelected] = useState<ReportKey>("members")
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reporting centre"
        title="Reports & exports"
        description="Generate live operational records in PDF, CSV, and Excel-compatible formats."
      />
      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <Panel title="Available reports">
          <div className="divide-y divide-slate-100 p-2 dark:divide-white/8">
            {reports.map((report) => (
              <button
                key={report.key}
                type="button"
                onClick={() => setSelected(report.key)}
                className={`w-full rounded-xl p-3 text-left transition ${selected === report.key ? "bg-blue-50 text-blue-950 dark:bg-blue-500/10 dark:text-blue-100" : "hover:bg-slate-50 dark:hover:bg-white/5"}`}
              >
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <FileBarChart className="size-3.5" />
                  {report.title}
                </span>
                <span className="mt-1 block text-[10px] leading-4 text-slate-500">
                  {report.description}
                </span>
              </button>
            ))}
          </div>
        </Panel>
        {selected === "members" ? <MembersReport /> : null}
        {selected === "pending" ? <PendingReport /> : null}
        {selected === "committee" ? <CommitteeReport /> : null}
        {selected === "projects" ? <ProjectsReport /> : null}
        {selected === "event_registrations" ? (
          <EventRegistrationReport attendanceOnly={false} />
        ) : null}
        {selected === "attendance" ? (
          <EventRegistrationReport attendanceOnly />
        ) : null}
      </div>
    </div>
  )
}

function MembersReport() {
  const query = usePaginatedQuery(
    api.reports.memberRoster,
    { status: "active" },
    { initialNumItems: 100 }
  )
  const rows = useMemo<ExportRow[]>(
    () =>
      query.results.map((member) => ({
        UUID: member.uuid,
        Name: member.fullName,
        Email: member.email,
        Phone: member.phone,
        Department: member.department,
        "HSC batch": member.hscBatch,
        "Student ID": member.studentId,
        Institute: member.institute,
      })),
    [query.results]
  )
  return (
    <ReportOutput
      title="Active member list"
      rows={rows}
      status={query.status}
      loadMore={() => query.loadMore(100)}
    />
  )
}

function PendingReport() {
  const query = usePaginatedQuery(
    api.reports.pendingApplications,
    {},
    { initialNumItems: 100 }
  )
  const rows = useMemo<ExportRow[]>(
    () =>
      query.results.map((application) => ({
        Code: application.applicationCode,
        Name: application.fullName,
        Email: application.email,
        Phone: application.phone,
        Department: application.department,
        Batch: application.hscBatch,
        "Student ID": application.studentId,
        Payment: application.paymentMethod,
        Transaction: application.transactionId,
        Submitted: new Date(application.submittedAt).toISOString(),
      })),
    [query.results]
  )
  return (
    <ReportOutput
      title="Pending membership applications"
      rows={rows}
      status={query.status}
      loadMore={() => query.loadMore(100)}
    />
  )
}

function ProjectsReport() {
  const query = usePaginatedQuery(
    api.reports.projectInventory,
    { status: "published" },
    { initialNumItems: 100 }
  )
  const rows = useMemo<ExportRow[]>(
    () =>
      query.results.map((project) => ({
        Title: project.title,
        Category: project.category,
        Domain: project.domain,
        State: project.projectState,
        Technologies: project.technologyStack.join(", "),
        Featured: project.featured ? "Yes" : "No",
        Updated: new Date(project.updatedAt).toISOString(),
      })),
    [query.results]
  )
  return (
    <ReportOutput
      title="Project inventory"
      rows={rows}
      status={query.status}
      loadMore={() => query.loadMore(100)}
    />
  )
}

function CommitteeReport() {
  const committee = useQuery(api.committee.current)
  const rows = useMemo<ExportRow[]>(
    () =>
      committee?.members.map((member) => ({
        Name: member.name,
        Position: member.position,
        Department: member.department,
        Session: member.session,
        Email: member.email ?? "",
        Phone: member.phone ?? "",
      })) ?? [],
    [committee]
  )
  return (
    <ReportOutput
      title={
        committee
          ? `Executive committee · ${committee.term.name}`
          : "Executive committee"
      }
      rows={rows}
      status={committee === undefined ? "LoadingFirstPage" : "Exhausted"}
    />
  )
}

function EventRegistrationReport({
  attendanceOnly,
}: {
  attendanceOnly: boolean
}) {
  const eventsQuery = usePaginatedQuery(
    api.events.paginateManagedEvents,
    {},
    { initialNumItems: 100 }
  )
  const [selectedId, setSelectedId] = useState<Id<"events"> | null>(null)
  const effectiveId = selectedId ?? eventsQuery.results[0]?._id ?? null
  const selectedEvent = eventsQuery.results.find(
    (event) => event._id === effectiveId
  )
  const registrationsQuery = usePaginatedQuery(
    api.events.paginateManagedRegistrations,
    effectiveId ? { eventId: effectiveId } : "skip",
    { initialNumItems: 100 }
  )
  const rows = useMemo<ExportRow[]>(
    () =>
      registrationsQuery.results.reduce<ExportRow[]>((result, registration) => {
        if (
          attendanceOnly &&
          registration.status !== "attended" &&
          registration.status !== "absent"
        ) {
          return result
        }

        result.push({
          Event: selectedEvent?.name ?? "",
          "Registration code": registration.registrationCode,
          Participant: registration.participantName,
          Email: registration.participantEmail,
          Phone: registration.participantPhone,
          Institution: registration.institution ?? "",
          Division: registration.institutionDivision ?? "",
          "Student ID": registration.studentId ?? "",
          Status: registration.status,
          "Amount paid": registration.amountPaid,
          "Transaction ID": registration.transactionId ?? "",
          Registered: new Date(registration.registeredAt).toISOString(),
        })
        return result
      }, []),
    [attendanceOnly, registrationsQuery.results, selectedEvent?.name]
  )

  return (
    <div className="space-y-4">
      <Panel
        title="Choose event"
        description="Reports are paginated to remain responsive for high-volume events."
      >
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <select
            aria-label="Event to report on"
            value={effectiveId ?? ""}
            onChange={(event) =>
              setSelectedId(event.target.value as Id<"events">)
            }
            className="min-h-10 flex-1 rounded-lg border border-slate-200 bg-transparent px-3 text-sm dark:border-white/10"
          >
            {eventsQuery.results.map((event) => (
              <option key={event._id} value={event._id}>
                {event.name} · {event.status}
              </option>
            ))}
          </select>
          {eventsQuery.status === "CanLoadMore" ? (
            <ActionButton
              variant="secondary"
              onClick={() => eventsQuery.loadMore(100)}
            >
              Load more events
            </ActionButton>
          ) : null}
        </div>
      </Panel>
      <ReportOutput
        title={`${selectedEvent?.name ?? "Event"} ${attendanceOnly ? "attendance" : "registrations"}`}
        rows={rows}
        status={registrationsQuery.status}
        loadMore={() => registrationsQuery.loadMore(100)}
      />
    </div>
  )
}

function ReportOutput({
  title,
  rows,
  status,
  loadMore,
}: {
  title: string
  rows: ExportRow[]
  status: string
  loadMore?: () => void
}) {
  const stem = title
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "")
  return (
    <Panel
      title={title}
      description={`${rows.length} loaded records`}
      action={
        rows.length ? (
          <div className="flex flex-wrap gap-2">
            <Export
              label="CSV"
              disabled={status !== "Exhausted"}
              onClick={() => exportCsv(rows, `${stem}.csv`)}
            />
            <Export
              label="Excel"
              disabled={status !== "Exhausted"}
              onClick={() => exportExcel(rows, `${stem}.xls`)}
            />
            <Export
              label="PDF"
              disabled={status !== "Exhausted"}
              onClick={() => void exportPdf(rows, `${stem}.pdf`, title)}
            />
          </div>
        ) : null
      }
    >
      {status === "LoadingFirstPage" ? (
        <p className="p-8 text-center text-sm text-slate-500">
          Loading verified records…
        </p>
      ) : rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase dark:border-white/8">
                {Object.keys(rows[0]).map((header) => (
                  <th key={header} className="px-4 py-3">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/8">
              {rows.slice(0, 100).map((row, index) => (
                <tr key={index}>
                  {Object.keys(rows[0]).map((header) => (
                    <td key={header} className="max-w-52 truncate px-4 py-3">
                      {String(row[header] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="p-8 text-center text-sm text-slate-500">
          No records are available for this report.
        </p>
      )}
      {status === "CanLoadMore" && loadMore ? (
        <div className="border-t border-slate-100 p-4 text-center dark:border-white/8">
          <ActionButton variant="secondary" onClick={loadMore}>
            Load more records
          </ActionButton>
        </div>
      ) : null}
    </Panel>
  )
}

function Export({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <ActionButton variant="secondary" onClick={onClick} disabled={disabled}>
      <Download className="size-3" />
      {label}
    </ActionButton>
  )
}
