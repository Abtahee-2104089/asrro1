/// <reference types="vite/client" />

import { convexTest } from "convex-test"
import { expect, test } from "vitest"

import { api } from "./_generated/api"
import type { PortalPermission } from "./_lib/auth"
import schema from "./schema"

const modules = import.meta.glob("./**/*.ts")
const now = 1_786_000_000_000

function identity(tokenIdentifier: string) {
  return {
    subject: tokenIdentifier,
    tokenIdentifier,
    issuer: "https://test.example",
  }
}

test("finance separates summary access from detailed management", async () => {
  const t = convexTest(schema, modules)
  await t.run(async (ctx) => {
    const records: Array<{
      token: string
      uuid: string
      role: "member" | "executive" | "super_admin"
      permissions?: PortalPermission[]
    }> = [
      {
        token: "test|admin",
        uuid: "AR-001",
        role: "super_admin" as const,
      },
      {
        token: "test|summary",
        uuid: "AR-002",
        role: "executive" as const,
        permissions: ["finance_summary"],
      },
      {
        token: "test|member",
        uuid: "AR-003",
        role: "member" as const,
      },
    ]
    for (const [index, record] of records.entries()) {
      await ctx.db.insert("members", {
        identityToken: record.token,
        uuid: record.uuid,
        fullName: `Finance User ${index + 1}`,
        email: `finance-${index + 1}@example.test`,
        emailNormalized: `finance-${index + 1}@example.test`,
        phone: `0170000000${index}`,
        department: "CSE",
        hscBatch: "21",
        studentId: `FIN-${index + 1}`,
        institute: "CUET",
        status: "active",
        systemRole: record.role,
        permissions: record.permissions,
        joinedAt: now,
        updatedAt: now,
      })
    }
  })

  const admin = t.withIdentity(identity("test|admin"))
  const summary = t.withIdentity(identity("test|summary"))
  const member = t.withIdentity(identity("test|member"))

  await expect(admin.query(api.finance.access, {})).resolves.toMatchObject({
    level: "manage",
  })
  await expect(summary.query(api.finance.access, {})).resolves.toMatchObject({
    level: "summary",
  })
  await expect(member.query(api.finance.access, {})).resolves.toMatchObject({
    level: "none",
  })

  await expect(
    summary.query(api.finance.summaryView, {
      currency: "BDT",
      from: now - 1_000,
      to: now + 1_000,
      fromMonth: "2026-01",
      toMonth: "2026-12",
    })
  ).resolves.toMatchObject({ income: 0, expense: 0, net: 0 })

  await expect(
    summary.mutation(api.finance.createTransaction, {
      direction: "expense",
      category: "Travel",
      amount: 100,
      currency: "BDT",
      occurredAt: now,
      description: "Should be denied",
      status: "posted",
    })
  ).rejects.toThrow(/Finance access/i)

  const budgetId = await admin.mutation(api.financeBudgets.upsert, {
    fiscalYear: 2026,
    name: "National event budget",
    currency: "BDT",
    plannedIncome: 100_000,
    plannedExpense: 80_000,
    status: "approved",
  })
  expect(budgetId).toBeTruthy()
  await expect(
    admin.query(api.financeBudgets.list, { fiscalYear: 2026 })
  ).resolves.toHaveLength(1)
  await expect(
    summary.query(api.financeBudgets.list, { fiscalYear: 2026 })
  ).rejects.toThrow(/Finance access/i)
})
