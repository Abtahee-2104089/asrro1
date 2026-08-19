/// <reference types="vite/client" />

import { convexTest } from "convex-test"
import { expect, test } from "vitest"

import type { Id } from "./_generated/dataModel"
import schema from "./schema"

const modules = import.meta.glob("./**/*.ts")
const runCapacity = process.env.RUN_CAPACITY === "1"

test.skipIf(!runCapacity)(
  "supports the SRS capacity dataset with indexed reads",
  async () => {
    const t = convexTest(schema, modules)
    const now = 1_786_000_000_000
    const memberIds: Id<"members">[] = []

    for (let batch = 0; batch < 20; batch += 1) {
      const ids = await t.run(async (ctx) => {
        const inserted = []
        for (let offset = 0; offset < 500; offset += 1) {
          const number = batch * 500 + offset
          inserted.push(
            await ctx.db.insert("members", {
              uuid: `LT-${String(number + 1).padStart(5, "0")}`,
              fullName: `Load Member ${number + 1}`,
              email: `load-${number + 1}@example.test`,
              emailNormalized: `load-${number + 1}@example.test`,
              phone: `017${String(number).padStart(8, "0")}`,
              department: number % 2 === 0 ? "CSE" : "EEE",
              hscBatch: "23",
              studentId: `LOAD-${number + 1}`,
              institute: "Capacity University",
              status: "active",
              systemRole: "member",
              joinedAt: now + number,
              updatedAt: now + number,
            })
          )
        }
        return inserted
      })
      memberIds.push(...ids)
    }

    const eventIds = await t.run(async (ctx) => {
      const createdBy = memberIds[0]
      const inserted = []
      for (let index = 0; index < 500; index += 1) {
        inserted.push(
          await ctx.db.insert("events", {
            slug: `capacity-event-${index + 1}`,
            name: `Capacity Event ${index + 1}`,
            summary: "Capacity verification",
            description: "Representative scale record",
            category: "training",
            scope: "national",
            audience: "public",
            status: "published",
            startsAt: now + index * 86_400_000,
            endsAt: now + index * 86_400_000 + 3_600_000,
            registrationDeadline: now + index * 86_400_000 - 3_600_000,
            venue: "Capacity Lab",
            organizer: "ASRRO",
            capacity: 1_000,
            activeRegistrationCount: 200,
            eligibility: "Open",
            registrationFee: 0,
            currency: "BDT",
            contactName: "Capacity Operator",
            publishedAt: now,
            createdBy,
            updatedAt: now,
          })
        )
      }
      return inserted
    })

    for (let batch = 0; batch < 100; batch += 1) {
      await t.run(async (ctx) => {
        for (let offset = 0; offset < 1_000; offset += 1) {
          const number = batch * 1_000 + offset
          const eventId = eventIds[number % eventIds.length]
          const memberId = memberIds[number % memberIds.length]
          await ctx.db.insert("eventRegistrations", {
            eventId,
            memberId,
            registrationCode: `CAP-${String(number + 1).padStart(6, "0")}`,
            cancellationTokenHash: `capacity-${number + 1}`,
            status: "confirmed",
            amountPaid: 0,
            registeredAt: now + number,
          })
        }
      })
    }

    const evidence = await t.run(async (ctx) => {
      const members = await ctx.db
        .query("members")
        .withIndex("by_status_and_joinedAt", (q) => q.eq("status", "active"))
        .take(25)
      const events = await ctx.db
        .query("events")
        .withIndex("by_status_and_startsAt", (q) => q.eq("status", "published"))
        .take(25)
      const registrations = await ctx.db
        .query("eventRegistrations")
        .withIndex("by_eventId_and_registeredAt", (q) =>
          q.eq("eventId", eventIds[0])
        )
        .take(25)
      return {
        members: members.length,
        events: events.length,
        registrations: registrations.length,
      }
    })

    expect(memberIds).toHaveLength(10_000)
    expect(eventIds).toHaveLength(500)
    expect(evidence).toEqual({ members: 25, events: 25, registrations: 25 })
  },
  180_000
)
