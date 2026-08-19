import { convexTest } from "convex-test"
import { describe, expect, it } from "vitest"

import { api } from "./_generated/api"
import schema from "./schema"
import { modules } from "./test.setup"

const now = 1_800_000_000_000

describe("public content workflows", () => {
  it("keeps comments private until an executive approves them", async () => {
    const t = convexTest(schema, modules)
    const { blogId } = await t.run(async (ctx) => {
      const executiveId = await ctx.db.insert("members", {
        identityToken: "test|content-admin",
        uuid: "AR-CONTENT-001",
        fullName: "Content Admin",
        email: "content-admin@example.test",
        emailNormalized: "content-admin@example.test",
        phone: "+8801700000001",
        department: "CSE",
        hscBatch: "20",
        studentId: "CONTENT-1",
        institute: "CUET",
        status: "active",
        systemRole: "executive",
        joinedAt: now,
        updatedAt: now,
      })
      const blogId = await ctx.db.insert("blogs", {
        slug: "moderated-discussion",
        title: "Moderated discussion",
        excerpt: "A published article for comment workflow testing.",
        body: "Article body",
        category: "Research",
        tags: ["testing"],
        authorName: "Content Admin",
        authorMemberId: executiveId,
        status: "published",
        featured: false,
        publishedAt: now,
        updatedAt: now,
      })
      return { blogId }
    })

    await expect(
      t.mutation(api.blogs.submitComment, {
        blogId,
        name: "Reader",
        email: "reader@example.test",
        body: "A thoughtful response.",
      })
    ).resolves.toEqual({ status: "pending" })
    await expect(t.query(api.blogs.listComments, { blogId })).resolves.toEqual(
      []
    )

    const executive = t.withIdentity({
      subject: "content-admin",
      issuer: "https://test.invalid",
      tokenIdentifier: "test|content-admin",
      email: "content-admin@example.test",
    })
    const pending = await executive.query(api.blogs.listCommentsAdmin, {
      status: "pending",
    })
    expect(pending).toHaveLength(1)
    await executive.mutation(api.blogs.moderateComment, {
      commentId: pending[0]._id,
      status: "approved",
    })
    await expect(
      t.query(api.blogs.listComments, { blogId })
    ).resolves.toMatchObject([
      { name: "Reader", body: "A thoughtful response.", status: "approved" },
    ])
  })

  it("returns safe branding defaults without requiring authentication", async () => {
    const t = convexTest(schema, modules)
    await expect(
      t.query(api.content.publicBranding, {})
    ).resolves.toMatchObject({
      organizationName: "Andromeda Space and Robotics Research Organization",
      logoUrl: null,
      heroUrl: null,
      primaryColor: "#2359d4",
      accentColor: "#00a6b2",
      highlightsEnabled: true,
    })
  })
})
