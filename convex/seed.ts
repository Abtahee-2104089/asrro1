import { v } from "convex/values"

import { internalMutation } from "./_generated/server"

// Run against a development deployment with:
// npx convex run seed:demoContent
export const demoContent = internalMutation({
  args: {},
  returns: v.object({ inserted: v.number() }),
  handler: async (ctx) => {
    let inserted = 0
    const now = Date.now()
    const insert = async <
      T extends
        | "contentPages"
        | "settings"
        | "alumni"
        | "projects"
        | "publications"
        | "blogs"
        | "galleryAlbums"
        | "committeeTerms"
        | "committeeMembers",
    >(
      table: T,
      value: Parameters<typeof ctx.db.insert<T>>[1]
    ) => {
      await ctx.db.insert(table, value)
      inserted += 1
    }

    if (
      !(await ctx.db
        .query("contentPages")
        .withIndex("by_slug", (q) => q.eq("slug", "about"))
        .unique())
    ) {
      await insert("contentPages", {
        slug: "about",
        title: "A workshop for the possible",
        summary:
          "ASRRO gives CUET students room to turn curiosity into credible frontier-technology research.",
        body: "Our mission is to make frontier research practical, collaborative, and locally meaningful.\n\nWe bring students across disciplines together to test ambitious ideas, document what they learn, and share tools and credit openly.",
        status: "published",
        publishedAt: now,
        updatedAt: now,
      })
    }
    const publicSettings = [
      [
        "organization.name",
        "Andromeda Space and Robotics Research Organization",
      ],
      ["contact.email", "hello@asrro.org"],
      ["contact.phone", "+880 1700 000 000"],
      ["contact.address", "Student Activity Centre, CUET"],
      ["contact.latitude", "23.4607"],
      ["contact.longitude", "91.9710"],
      ["social.facebook", "https://facebook.com/asrrocuet"],
      ["social.linkedin", "https://linkedin.com/company/asrro"],
      ["social.youtube", "https://youtube.com/@asrro"],
      ["social.github", "https://github.com/asrro"],
      ["social.instagram", "https://instagram.com/asrrocuet"],
    ] as const
    for (const [key, value] of publicSettings) {
      if (
        !(await ctx.db
          .query("settings")
          .withIndex("by_key", (q) => q.eq("key", key))
          .unique())
      )
        await insert("settings", { key, value, isPublic: true, updatedAt: now })
    }
    if (
      !(await ctx.db
        .query("alumni")
        .withIndex("by_slug", (q) => q.eq("slug", "nusrat-jahan"))
        .unique())
    ) {
      await insert("alumni", {
        slug: "nusrat-jahan",
        name: "Nusrat Jahan",
        department: "Computer Science and Engineering",
        session: "2017–18",
        batch: "HSC 2016",
        graduationYear: 2022,
        currentWorkplace: "Robotics Research Engineer",
        higherStudies: "Graduate research in autonomous systems",
        linkedInUrl: "https://www.linkedin.com",
        researchInterests: "robotics, computer vision, autonomy",
        status: "published",
        publishedAt: now,
        updatedAt: now,
      })
    }
    let project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", "riverwatch-rover"))
      .unique()
    if (!project) {
      const id = await ctx.db.insert("projects", {
        slug: "riverwatch-rover",
        title: "RiverWatch Rover",
        summary:
          "A field rover for repeatable riverbank sensing in difficult terrain.",
        description:
          "RiverWatch combines a modular sensor mast, low-bandwidth telemetry, and a serviceable drivetrain for field deployments outside controlled lab conditions.",
        category: "research",
        domain: "Robotics",
        status: "published",
        projectState: "ongoing",
        technologyStack: ["ROS 2", "Python", "LoRa", "Computer vision"],
        startedAt: now - 180 * 86_400_000,
        githubUrl: "https://github.com/asrro/riverwatch",
        awards: "National student research showcase finalist",
        featured: true,
        publishedAt: now,
        updatedAt: now,
      })
      inserted += 1
      project = await ctx.db.get("projects", id)
    }
    if (
      !(await ctx.db
        .query("publications")
        .withIndex("by_slug", (q) => q.eq("slug", "riverwatch-field-report"))
        .unique())
    ) {
      await insert("publications", {
        slug: "riverwatch-field-report",
        title: "RiverWatch: A Modular Rover for Riverbank Observation",
        abstract:
          "Design notes and initial field observations from the RiverWatch research platform.",
        type: "report",
        authors: ["ASRRO RiverWatch Team"],
        publicationDate: now,
        externalUrl: "https://github.com/asrro/riverwatch",
        projectId: project?._id,
        status: "published",
        featured: true,
        publishedAt: now,
        updatedAt: now,
      })
    }
    if (
      !(await ctx.db
        .query("blogs")
        .withIndex("by_slug", (q) => q.eq("slug", "riverwatch-field-notes"))
        .unique())
    ) {
      await insert("blogs", {
        slug: "riverwatch-field-notes",
        title: "What the RiverWatch field tests changed",
        excerpt:
          "The first riverbank deployment turned several confident assumptions into a better test plan.",
        body: "Field evidence changes a project faster than another week at the whiteboard.\n\nOur first RiverWatch deployment exposed traction, telemetry, and enclosure constraints that were invisible indoors. The team has documented those decisions for the next test cycle.",
        category: "Field Notes",
        tags: ["robotics", "field-test", "riverwatch"],
        authorName: "ASRRO Editorial Desk",
        status: "published",
        featured: true,
        publishedAt: now,
        updatedAt: now,
      })
    }
    if (
      !(await ctx.db
        .query("galleryAlbums")
        .withIndex("by_slug", (q) => q.eq("slug", "riverwatch-field-tests"))
        .unique())
    ) {
      await insert("galleryAlbums", {
        slug: "riverwatch-field-tests",
        title: "RiverWatch field tests",
        description: "Public media from the first RiverWatch deployment.",
        status: "published",
        occurredAt: now,
        publishedAt: now,
      })
    }
    let term = await ctx.db
      .query("committeeTerms")
      .withIndex("by_status_and_startsAt", (q) => q.eq("status", "current"))
      .order("desc")
      .first()
    if (!term) {
      const id = await ctx.db.insert("committeeTerms", {
        name: "2026–27",
        startsAt: now - 30 * 86_400_000,
        endsAt: now + 335 * 86_400_000,
        status: "current",
        publishedAt: now,
      })
      inserted += 1
      term = await ctx.db.get("committeeTerms", id)
    }
    const executive = await ctx.db
      .query("members")
      .withIndex("by_uuid", (q) => q.eq("uuid", "AR-902"))
      .unique()
    if (
      term &&
      executive &&
      !(await ctx.db
        .query("committeeMembers")
        .withIndex("by_memberId_and_termId", (q) =>
          q.eq("memberId", executive._id).eq("termId", term._id)
        )
        .unique())
    ) {
      await insert("committeeMembers", {
        termId: term._id,
        memberId: executive._id,
        name: executive.fullName,
        position: "Organizing Secretary",
        positionKey: "organizing_secretary",
        department: executive.department,
        session: executive.hscBatch,
        email: executive.email,
        phone: executive.phone,
        displayOrder: 4,
        isPublic: true,
      })
    }
    return { inserted }
  },
})
