import type { FunctionReturnType } from "convex/server"

import type { api } from "@/convex/_generated/api"

export const positionOptions = [
  "president",
  "vice_president",
  "general_secretary",
  "joint_general_secretary",
  "organizing_secretary",
  "financial_secretary",
  "public_relations_secretary",
  "research_publication_secretary",
  "technical_secretary",
  "office_secretary",
  "education_secretary",
  "publication_secretary",
  "it_secretary",
  "event_coordinator",
  "membership_coordinator",
  "executive_member",
] as const

export type ExecutivePosition = (typeof positionOptions)[number]
export type AdminMember = FunctionReturnType<
  typeof api.members.searchAdmin
>[number]
