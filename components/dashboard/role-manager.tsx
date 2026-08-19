"use client"

import { useAction, useMutation, useQuery } from "convex/react"
import { Mail, Search } from "lucide-react"
import { useMemo, useState } from "react"

import { ActionButton } from "@/components/dashboard/dashboard-kit"
import { RoleMemberTable } from "@/components/dashboard/role-member-table"
import { Input } from "@/components/motion/input"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
  type AdminMember,
  type ExecutivePosition,
  positionOptions,
} from "@/lib/role-management"

const statusOptions = [
  "active",
  "suspended",
  "alumni",
  "pending",
  "rejected",
] as const
const positionOptionSet = new Set<string>(positionOptions)

export function RoleManager() {
  const me = useQuery(api.members.me)
  const [search, setSearch] = useState("")
  const [status, setStatusFilter] = useState<
    (typeof statusOptions)[number] | "all"
  >("active")
  const [department, setDepartment] = useState("")
  const [selected, setSelected] = useState<Set<Id<"members">>>(new Set())
  const [pending, setPending] = useState<Id<"members"> | null>(null)
  const [message, setMessage] = useState("")
  const members = useQuery(api.members.searchAdmin, {
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(status === "all" ? {} : { status }),
    ...(department.trim() ? { department: department.trim() } : {}),
  })
  const setMemberStatus = useMutation(api.members.setStatus)
  const updateMember = useMutation(api.members.adminUpdate)
  const removeMember = useMutation(api.members.remove)
  const setRole = useMutation(api.members.setRole)
  const setAccess = useMutation(api.members.setExecutiveAccess)
  const bulkEmail = useMutation(api.emails.bulkEmailMembers)
  const resetPassword = useAction(api.adminAccounts.resetPassword)
  const allSelected =
    members !== undefined &&
    members.length > 0 &&
    members.every((member) => selected.has(member._id))
  const selectedIds = useMemo(() => [...selected], [selected])

  function toggle(id: Id<"members">) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(
      allSelected ? new Set() : new Set(members?.map((member) => member._id))
    )
  }

  async function run(
    id: Id<"members">,
    operation: () => Promise<unknown>,
    success: string
  ) {
    setPending(id)
    setMessage("")
    try {
      await operation()
      setMessage(success)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Operation failed")
    } finally {
      setPending(null)
    }
  }

  async function edit(member: AdminMember) {
    const fullName = prompt("Full name", member.fullName)
    if (fullName === null) return
    const email = prompt("Email", member.email)
    if (email === null) return
    const phone = prompt("Phone", member.phone)
    if (phone === null) return
    await run(
      member._id,
      () => updateMember({ memberId: member._id, fullName, email, phone }),
      `Updated ${fullName}.`
    )
  }

  function changeAccess(member: AdminMember, value: string) {
    if (positionOptionSet.has(value)) {
      void run(
        member._id,
        () =>
          setAccess({
            memberId: member._id,
            executivePosition: value as ExecutivePosition,
            permissions: member.permissions ?? [],
          }),
        `Updated ${member.fullName}'s executive access.`
      )
      return
    }
    void run(
      member._id,
      () =>
        setRole({
          memberId: member._id,
          systemRole: value as "member" | "super_admin",
        }),
      `Updated ${member.fullName}'s role.`
    )
  }

  function resetMemberPassword(member: AdminMember) {
    const password = prompt(`New temporary password for ${member.fullName}`)
    if (!password) return
    void run(
      member._id,
      () => resetPassword({ memberId: member._id, newPassword: password }),
      `Password reset for ${member.fullName}.`
    )
  }

  function deleteMember(member: AdminMember) {
    if (!confirm(`Delete ${member.fullName}? This cannot be undone.`)) return
    void run(
      member._id,
      () => removeMember({ memberId: member._id }),
      `Deleted ${member.fullName}.`
    )
  }

  async function emailSelected() {
    if (!selectedIds.length) return
    const subject = prompt("Email subject")
    if (!subject) return
    const body = prompt("Email message")
    if (!body) return
    setMessage("")
    try {
      const result = await bulkEmail({
        memberIds: selectedIds,
        subject,
        message: body,
      })
      setMessage(
        `Queued ${result.queued} email${result.queued === 1 ? "" : "s"}.`
      )
      setSelected(new Set())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Bulk email failed")
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4 dark:border-white/8">
        <Input
          value={search}
          onChange={setSearch}
          placeholder="Search members by name…"
          leftIcon={<Search />}
          className="min-w-56 flex-1"
          classNames={{ field: "h-9 rounded-xl", input: "text-sm" }}
        />
        <select
          aria-label="Filter members by status"
          value={status}
          onChange={(event) =>
            setStatusFilter(event.target.value as typeof status)
          }
          className="h-9 rounded-lg border border-slate-200 px-2 text-xs dark:border-white/10 dark:bg-slate-900"
        >
          <option value="all">All statuses</option>
          {statusOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <Input
          value={department}
          onChange={setDepartment}
          placeholder="Department filter"
          className="w-44"
          classNames={{ field: "h-9 rounded-xl", input: "text-sm" }}
        />
        <ActionButton
          variant="secondary"
          disabled={!selectedIds.length}
          onClick={() => void emailSelected()}
        >
          <Mail className="size-3.5" /> Email selected ({selectedIds.length})
        </ActionButton>
      </div>
      <RoleMemberTable
        members={members}
        currentRole={me?.systemRole}
        selected={selected}
        pending={pending}
        allSelected={allSelected}
        onToggleAll={toggleAll}
        onToggle={toggle}
        onStatusChange={(member, nextStatus) =>
          void run(
            member._id,
            () =>
              setMemberStatus({
                memberId: member._id,
                status: nextStatus,
              }),
            `Changed ${member.fullName}'s status.`
          )
        }
        onAccessChange={changeAccess}
        onEdit={(member) => void edit(member)}
        onResetPassword={resetMemberPassword}
        onDelete={deleteMember}
      />
      <p role="status" className="px-5 py-4 text-xs text-emerald-600">
        {message}
      </p>
    </div>
  )
}
