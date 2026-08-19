import { Pencil, Shield, Trash2 } from "lucide-react"

import { ActionButton, StatusPill } from "@/components/dashboard/dashboard-kit"
import type { Id } from "@/convex/_generated/dataModel"
import { type AdminMember, positionOptions } from "@/lib/role-management"

export function RoleMemberTable({
  members,
  currentRole,
  selected,
  pending,
  allSelected,
  onToggleAll,
  onToggle,
  onStatusChange,
  onAccessChange,
  onEdit,
  onResetPassword,
  onDelete,
}: {
  members: AdminMember[] | undefined
  currentRole?: "member" | "executive" | "super_admin"
  selected: ReadonlySet<Id<"members">>
  pending: Id<"members"> | null
  allSelected: boolean
  onToggleAll: () => void
  onToggle: (id: Id<"members">) => void
  onStatusChange: (
    member: AdminMember,
    status: "active" | "suspended" | "alumni"
  ) => void
  onAccessChange: (member: AdminMember, value: string) => void
  onEdit: (member: AdminMember) => void
  onResetPassword: (member: AdminMember) => void
  onDelete: (member: AdminMember) => void
}) {
  if (!members) {
    return (
      <p className="p-8 text-center text-sm text-slate-500">Loading members…</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-xs">
        <thead>
          <tr className="border-b border-slate-100 text-[10px] tracking-wider text-slate-400 uppercase dark:border-white/8">
            <th className="px-5 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Select all visible members"
              />
            </th>
            <th className="py-3 pr-4">Member</th>
            <th className="py-3 pr-4">Academic</th>
            <th className="py-3 pr-4">Status</th>
            <th className="py-3 pr-4">Access</th>
            <th className="py-3 pr-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/8">
          {members.map((member) => (
            <tr key={member._id}>
              <td className="px-5 py-4">
                <input
                  type="checkbox"
                  checked={selected.has(member._id)}
                  onChange={() => onToggle(member._id)}
                  aria-label={`Select ${member.fullName}`}
                />
              </td>
              <td className="py-4 pr-4">
                <p className="font-semibold">{member.fullName}</p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {member.uuid} · {member.email}
                </p>
              </td>
              <td className="py-4 pr-4">
                {member.department}
                <p className="mt-1 text-[10px] text-slate-400">
                  HSC {member.hscBatch}
                </p>
              </td>
              <td className="py-4 pr-4">
                <select
                  aria-label={`Membership status for ${member.fullName}`}
                  value={member.status}
                  disabled={
                    pending === member._id ||
                    member.status === "pending" ||
                    member.status === "rejected"
                  }
                  onChange={(event) =>
                    onStatusChange(
                      member,
                      event.target.value as "active" | "suspended" | "alumni"
                    )
                  }
                  className="h-8 rounded-lg border border-slate-200 px-2 dark:border-white/10 dark:bg-slate-900"
                >
                  <option value="active">active</option>
                  <option value="suspended">suspended</option>
                  <option value="alumni">alumni</option>
                </select>
              </td>
              <td className="py-4 pr-4">
                <StatusPill
                  tone={
                    member.systemRole === "super_admin"
                      ? "violet"
                      : member.systemRole === "executive"
                        ? "blue"
                        : "slate"
                  }
                >
                  {member.executivePosition ?? member.systemRole}
                </StatusPill>
                {currentRole === "super_admin" ? (
                  <select
                    aria-label={`Portal access for ${member.fullName}`}
                    value={
                      member.systemRole === "executive"
                        ? (member.executivePosition ?? "executive_member")
                        : member.systemRole
                    }
                    onChange={(event) =>
                      onAccessChange(member, event.target.value)
                    }
                    className="mt-2 block h-8 max-w-48 rounded-lg border border-slate-200 px-2 dark:border-white/10 dark:bg-slate-900"
                  >
                    <option value="member">member</option>
                    <option value="super_admin">super admin</option>
                    {positionOptions.map((value) => (
                      <option key={value} value={value}>
                        {value.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                ) : null}
              </td>
              <td className="py-4 pr-5">
                <div className="flex justify-end gap-1">
                  <ActionButton
                    variant="quiet"
                    disabled={pending === member._id}
                    onClick={() => onEdit(member)}
                    aria-label={`Edit ${member.fullName}`}
                  >
                    <Pencil className="size-3.5" />
                  </ActionButton>
                  {currentRole === "super_admin" ? (
                    <ActionButton
                      variant="quiet"
                      disabled={pending === member._id}
                      onClick={() => onResetPassword(member)}
                      aria-label={`Reset password for ${member.fullName}`}
                    >
                      <Shield className="size-3.5" />
                    </ActionButton>
                  ) : null}
                  <ActionButton
                    variant="quiet"
                    disabled={pending === member._id}
                    onClick={() => onDelete(member)}
                    aria-label={`Delete ${member.fullName}`}
                  >
                    <Trash2 className="size-3.5 text-rose-600" />
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
