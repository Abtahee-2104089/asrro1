import { convexTest } from "convex-test"
import { describe, expect, it } from "vitest"

import { api } from "./_generated/api"
import schema from "./schema"
import { modules } from "./test.setup"

const APPLICATION = {
  fullName: "Test Applicant",
  gender: "Prefer not to say",
  email: "applicant@example.com",
  phone: "+8801700000000",
  institute: "CUET",
  department: "CSE",
  studentId: "2104001",
  hscBatch: "21",
  address: "Chattogram",
  emergencyContact: "+8801800000000",
  paymentMethod: "bkash" as const,
  transactionId: "TXN-TEST-001",
}

async function privatePaymentAsset(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const storageId = await ctx.storage.store(
      new Blob(["test payment proof"], { type: "image/png" })
    )
    return await ctx.db.insert("assets", {
      storageId,
      kind: "image",
      fileName: "payment-proof.png",
      visibility: "private",
      createdAt: 1_800_000_000_000,
    })
  })
}

describe("membership lifecycle", () => {
  it("tracks an authenticated applicant without granting member access", async () => {
    const t = convexTest(schema, modules)
    const identity = {
      subject: "applicant-1",
      issuer: "https://test.invalid",
      tokenIdentifier: "https://test.invalid|applicant-1",
      email: APPLICATION.email,
      name: APPLICATION.fullName,
    }
    const asApplicant = t.withIdentity(identity)
    const paymentAssetId = await privatePaymentAsset(t)

    const submitted = await asApplicant.mutation(
      api.membership.submitApplication,
      { ...APPLICATION, paymentAssetId }
    )
    const status = await asApplicant.query(api.membership.accountStatus)
    const member = await asApplicant.query(api.members.me)

    expect(submitted.status).toBe("pending")
    expect(status).toMatchObject({
      state: "applicant",
      application: {
        applicationCode: submitted.applicationCode,
        status: "pending",
        linked: true,
      },
    })
    expect(member).toBeNull()
  })

  it("rejects duplicate membership payment references", async () => {
    const t = convexTest(schema, modules)
    const paymentAssetId = await privatePaymentAsset(t)

    await t.mutation(api.membership.submitApplication, {
      ...APPLICATION,
      paymentAssetId,
    })

    await expect(
      t.mutation(api.membership.submitApplication, {
        ...APPLICATION,
        email: "another@example.com",
        paymentAssetId,
      })
    ).rejects.toThrow("transaction ID has already been submitted")
  })

  it("rejects unauthenticated administrative member reads", async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.query(api.members.list, {
        status: "active",
        paginationOpts: { cursor: null, numItems: 20 },
      })
    ).rejects.toThrow()
  })

  it("allows exactly one authenticated first-administrator bootstrap", async () => {
    const t = convexTest(schema, modules)
    const first = t.withIdentity({
      subject: "first-admin",
      issuer: "https://test.invalid",
      tokenIdentifier: "https://test.invalid|first-admin",
      email: "first-admin@example.com",
      name: "First Admin",
    })
    const second = t.withIdentity({
      subject: "second-admin",
      issuer: "https://test.invalid",
      tokenIdentifier: "https://test.invalid|second-admin",
      email: "second-admin@example.com",
      name: "Second Admin",
    })
    const details = {
      phone: "+8801700000099",
      institute: "CUET",
      department: "CSE",
      studentId: "2104099",
      hscBatch: "21",
    }

    await expect(
      t.mutation(api.membership.initializeFirstAdmin, details)
    ).rejects.toThrow()
    await expect(
      first.mutation(api.membership.initializeFirstAdmin, details)
    ).resolves.toEqual({ uuid: "AR-001" })
    await expect(
      second.mutation(api.membership.initializeFirstAdmin, details)
    ).rejects.toThrow("already configured")
    await expect(first.query(api.members.me)).resolves.toMatchObject({
      systemRole: "super_admin",
      status: "active",
    })
  })

  it("allocates unique mapped UUIDs under concurrent approvals and sets validity", async () => {
    const t = convexTest(schema, modules)
    const adminIdentity = {
      subject: "uuid-admin",
      issuer: "https://test.invalid",
      tokenIdentifier: "https://test.invalid|uuid-admin",
      email: "uuid-admin@example.com",
      name: "UUID Admin",
    }
    const admin = t.withIdentity(adminIdentity)
    await admin.mutation(api.membership.initializeFirstAdmin, {
      phone: "+8801700000099",
      institute: "CUET",
      department: "CSE",
      studentId: "2104099",
      hscBatch: "21",
    })
    const first = await t.mutation(api.membership.submitApplication, {
      ...APPLICATION,
      email: "uuid-one@example.com",
      transactionId: "TXN-UUID-001",
    })
    const second = await t.mutation(api.membership.submitApplication, {
      ...APPLICATION,
      fullName: "Second Applicant",
      email: "uuid-two@example.com",
      studentId: "2104002",
      transactionId: "TXN-UUID-002",
    })

    const approvals = await Promise.all([
      admin.mutation(api.membership.reviewApplication, {
        applicationId: first.applicationId,
        decision: "approve",
      }),
      admin.mutation(api.membership.reviewApplication, {
        applicationId: second.applicationId,
        decision: "approve",
      }),
    ])

    expect(new Set(approvals.map((approval) => approval.uuid)).size).toBe(2)
    expect(approvals.map((approval) => approval.uuid).sort()).toEqual([
      "AR-002",
      "AR-003",
    ])
    const records = await t.run(
      async (ctx) =>
        await Promise.all(
          approvals.map((approval) => ctx.db.get("members", approval.memberId!))
        )
    )
    for (const record of records) {
      expect(record?.membershipValidUntil).toBeGreaterThan(
        record?.joinedAt ?? 0
      )
    }
    const outbox = await t.run(
      async (ctx) => await ctx.db.query("emailOutbox").collect()
    )
    expect(outbox).toHaveLength(2)
    expect(
      outbox.every((email) => email.template === "membership_approved")
    ).toBe(true)
  })

  it("enforces granular membership permissions for executives", async () => {
    const t = convexTest(schema, modules)
    const now = 1_800_000_000_000
    await t.run(async (ctx) => {
      await ctx.db.insert("members", {
        identityToken: "https://test.invalid|allowed-executive",
        uuid: "TEST-EXEC-1",
        fullName: "Allowed Executive",
        email: "allowed@example.com",
        emailNormalized: "allowed@example.com",
        phone: "1",
        department: "CSE",
        hscBatch: "21",
        studentId: "1",
        institute: "CUET",
        status: "active",
        systemRole: "executive",
        executivePosition: "membership_coordinator",
        permissions: ["membership_manage"],
        joinedAt: now,
        updatedAt: now,
      })
      await ctx.db.insert("members", {
        identityToken: "https://test.invalid|denied-executive",
        uuid: "TEST-EXEC-2",
        fullName: "Denied Executive",
        email: "denied@example.com",
        emailNormalized: "denied@example.com",
        phone: "2",
        department: "EEE",
        hscBatch: "21",
        studentId: "2",
        institute: "CUET",
        status: "active",
        systemRole: "executive",
        executivePosition: "executive_member",
        permissions: [],
        joinedAt: now,
        updatedAt: now,
      })
    })
    const paginationOpts = { cursor: null, numItems: 10 }
    const allowed = t.withIdentity({
      subject: "allowed-executive",
      issuer: "https://test.invalid",
      tokenIdentifier: "https://test.invalid|allowed-executive",
    })
    const denied = t.withIdentity({
      subject: "denied-executive",
      issuer: "https://test.invalid",
      tokenIdentifier: "https://test.invalid|denied-executive",
    })
    await expect(
      allowed.query(api.membership.listApplications, {
        status: "pending",
        paginationOpts,
      })
    ).resolves.toMatchObject({ page: [] })
    await expect(
      denied.query(api.membership.listApplications, {
        status: "pending",
        paginationOpts,
      })
    ).rejects.toThrow("membership_manage")
  })
})

describe("event registration rules", () => {
  it("enforces CUET eligibility and prevents payment reference reuse", async () => {
    const t = convexTest(schema, modules)
    const eventId = await t.run(async (ctx) => {
      const now = 1_800_000_000_000
      const ownerId = await ctx.db.insert("members", {
        uuid: "ASRRO-TEST-001",
        fullName: "Event Owner",
        email: "owner@example.com",
        emailNormalized: "owner@example.com",
        phone: "+8801700000001",
        department: "CSE",
        hscBatch: "20",
        studentId: "2004001",
        institute: "CUET",
        status: "active",
        systemRole: "executive",
        joinedAt: now,
        updatedAt: now,
      })
      return await ctx.db.insert("events", {
        slug: "test-rover-challenge",
        name: "Test Rover Challenge",
        summary: "A test event",
        description: "Used to verify registration rules.",
        category: "Competition",
        scope: "intra_cuet",
        audience: "public",
        status: "published",
        startsAt: 2_000_000_000_000,
        endsAt: 2_000_003_600_000,
        registrationDeadline: 1_999_900_000_000,
        venue: "CUET",
        organizer: "ASRRO",
        capacity: 20,
        activeRegistrationCount: 0,
        eligibility: "Current CUET students",
        eligibilityEvidenceRequired: false,
        registrationFee: 100,
        currency: "BDT",
        contactName: "Event Owner",
        createdBy: ownerId,
        publishedAt: now,
        updatedAt: now,
      })
    })

    await expect(
      t.mutation(api.events.registerGuest, {
        eventId,
        name: "Outside Student",
        email: "outside@example.com",
        phone: "+8801700000002",
        institution: "Another University",
        studentId: "123",
        eligibilityConfirmed: true,
        transactionId: "EVENT-TXN-001",
      })
    ).rejects.toThrow("limited to CUET students")

    const first = await t.mutation(api.events.registerGuest, {
      eventId,
      name: "CUET Student",
      email: "student@example.com",
      phone: "+8801700000003",
      institution: "CUET",
      institutionEmail: "student@cuet.ac.bd",
      studentId: "2104002",
      eligibilityConfirmed: true,
      transactionId: "EVENT-TXN-001",
    })
    expect(first.status).toBe("pending")

    await expect(
      t.mutation(api.events.registerGuest, {
        eventId,
        name: "Second CUET Student",
        email: "second@example.com",
        phone: "+8801700000004",
        institution: "CUET",
        institutionEmail: "second@cuet.ac.bd",
        studentId: "2104003",
        eligibilityConfirmed: true,
        transactionId: "EVENT-TXN-001",
      })
    ).rejects.toThrow("transaction ID has already been used")
  })
})
