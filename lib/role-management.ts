import type { FunctionReturnType } from "convex/server"

import type { api } from "@/convex/_generated/api"

export const positionOptions = [
  "president",
  "vice_president_(admin)",
  "vice_president_(logistics)",
  "vice_president_(technical)",
  "vice_president_(r&d)",
  "general_secretary",
  "joint_general_secretary",
  "organizing_secretary",
  "joint_organizing_secretary",
  "finance_secretary",
  "joint_finance_secretary",
  "robotics_secretary",
  "space_astronomy_secretary",
  "research_publication_secretary",
  "joint_research_publication_secretary",
  "programming_software_secretary",
  "joint_programming_software_secretary",
  "office_secretary",
  "event_management_secretary",
  "graphics_design_secretary",
  "media_secretary",
  "outreach_sponsor_management_secretary",
  "executive_member"
] as const

export type ExecutivePosition = (typeof positionOptions)[number]
export type AdminMember = FunctionReturnType<
  typeof api.members.searchAdmin
>[number]
