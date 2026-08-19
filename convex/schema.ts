import { defineSchema, defineTable } from "convex/server"
import {
  alumniFields,
  applicationFields,
  assetFields,
  auditLogFields,
  blogFields,
  blogCommentFields,
  committeeMemberFields,
  committeeTermFields,
  contactMessageFields,
  contentPageFields,
  counterFields,
  eventFields,
  emailOutboxFields,
  financeTransactionFields,
  galleryAlbumFields,
  galleryItemFields,
  memberFields,
  notificationFields,
  projectFields,
  publicationFields,
  registrationFields,
  settingFields,
  uuidCounterFields,
  uuidMappingFields,
} from "./model"
import { v } from "convex/values"

export default defineSchema({
  contentPages: defineTable(contentPageFields)
    .index("by_slug", ["slug"])
    .index("by_status_and_publishedAt", ["status", "publishedAt"]),

  membershipApplications: defineTable(applicationFields)
    .index("by_applicationCode", ["applicationCode"])
    .index("by_emailNormalized_and_submittedAt", [
      "emailNormalized",
      "submittedAt",
    ])
    .index("by_identityToken_and_submittedAt", ["identityToken", "submittedAt"])
    .index("by_status_and_submittedAt", ["status", "submittedAt"])
    .index("by_transactionId", ["transactionId"]),

  members: defineTable(memberFields)
    .index("by_identityToken", ["identityToken"])
    .index("by_authUserId", ["authUserId"])
    .index("by_uuid", ["uuid"])
    .index("by_emailNormalized", ["emailNormalized"])
    .index("by_status_and_joinedAt", ["status", "joinedAt"])
    .index("by_department_and_joinedAt", ["department", "joinedAt"])
    .index("by_hscBatch_and_joinedAt", ["hscBatch", "joinedAt"])
    .searchIndex("search_members", {
      searchField: "fullName",
      filterFields: ["status", "department"],
    }),

  events: defineTable(eventFields)
    .index("by_slug", ["slug"])
    .index("by_status_and_startsAt", ["status", "startsAt"])
    .index("by_audience_and_status_and_startsAt", [
      "audience",
      "status",
      "startsAt",
    ])
    .index("by_category_and_status_and_startsAt", [
      "category",
      "status",
      "startsAt",
    ])
    .searchIndex("search_public_events", {
      searchField: "name",
      filterFields: ["status", "category"],
    }),

  eventRegistrations: defineTable(registrationFields)
    .index("by_registrationCode", ["registrationCode"])
    .index("by_eventId_and_registeredAt", ["eventId", "registeredAt"])
    .index("by_eventId_and_status_and_registeredAt", [
      "eventId",
      "status",
      "registeredAt",
    ])
    .index("by_eventId_and_memberId", ["eventId", "memberId"])
    .index("by_eventId_and_guestEmailNormalized", [
      "eventId",
      "guestEmailNormalized",
    ])
    .index("by_eventId_and_transactionId", ["eventId", "transactionId"])
    .index("by_eventId_and_status_and_reminderSentAt_and_registeredAt", [
      "eventId",
      "status",
      "reminderSentAt",
      "registeredAt",
    ])
    .index("by_memberId_and_registeredAt", ["memberId", "registeredAt"]),

  committeeTerms: defineTable(committeeTermFields).index(
    "by_status_and_startsAt",
    ["status", "startsAt"]
  ),
  committeeMembers: defineTable(committeeMemberFields)
    .index("by_termId_and_displayOrder", ["termId", "displayOrder"])
    .index("by_termId_and_isPublic_and_displayOrder", [
      "termId",
      "isPublic",
      "displayOrder",
    ])
    .index("by_memberId_and_termId", ["memberId", "termId"])
    .searchIndex("search_committee", {
      searchField: "name",
      filterFields: ["termId", "isPublic"],
    }),

  alumni: defineTable(alumniFields)
    .index("by_slug", ["slug"])
    .index("by_status_and_graduationYear", ["status", "graduationYear"])
    .index("by_status_and_department_and_graduationYear", [
      "status",
      "department",
      "graduationYear",
    ])
    .index("by_status_and_batch_and_graduationYear", [
      "status",
      "batch",
      "graduationYear",
    ])
    .searchIndex("search_public_alumni", {
      searchField: "name",
      filterFields: ["status", "department"],
    }),

  projects: defineTable(projectFields)
    .index("by_slug", ["slug"])
    .index("by_status_and_publishedAt", ["status", "publishedAt"])
    .index("by_status_and_featured_and_publishedAt", [
      "status",
      "featured",
      "publishedAt",
    ])
    .index("by_status_and_domain_and_publishedAt", [
      "status",
      "domain",
      "publishedAt",
    ])
    .index("by_status_and_category_and_publishedAt", [
      "status",
      "category",
      "publishedAt",
    ])
    .searchIndex("search_public_projects", {
      searchField: "title",
      filterFields: ["status", "domain"],
    }),
  projectMembers: defineTable({
    projectId: v.id("projects"),
    memberId: v.optional(v.id("members")),
    name: v.string(),
    role: v.string(),
    displayOrder: v.number(),
  }).index("by_projectId_and_displayOrder", ["projectId", "displayOrder"]),

  publications: defineTable(publicationFields)
    .index("by_slug", ["slug"])
    .index("by_status_and_publicationDate", ["status", "publicationDate"])
    .index("by_status_and_type_and_publicationDate", [
      "status",
      "type",
      "publicationDate",
    ])
    .index("by_projectId_and_publicationDate", ["projectId", "publicationDate"])
    .index("by_projectId_and_status_and_publicationDate", [
      "projectId",
      "status",
      "publicationDate",
    ])
    .searchIndex("search_public_publications", {
      searchField: "title",
      filterFields: ["status", "type"],
    }),

  blogs: defineTable(blogFields)
    .index("by_slug", ["slug"])
    .index("by_status_and_publishedAt", ["status", "publishedAt"])
    .index("by_status_and_category_and_publishedAt", [
      "status",
      "category",
      "publishedAt",
    ])
    .index("by_status_and_featured_and_publishedAt", [
      "status",
      "featured",
      "publishedAt",
    ])
    .searchIndex("search_public_blogs", {
      searchField: "title",
      filterFields: ["status", "category"],
    }),
  blogComments: defineTable(blogCommentFields)
    .index("by_blogId_and_status_and_createdAt", [
      "blogId",
      "status",
      "createdAt",
    ])
    .index("by_status_and_createdAt", ["status", "createdAt"])
    .index("by_emailNormalized_and_createdAt", [
      "emailNormalized",
      "createdAt",
    ]),

  contactMessages: defineTable(contactMessageFields)
    .index("by_status_and_submittedAt", ["status", "submittedAt"])
    .index("by_emailNormalized_and_submittedAt", [
      "emailNormalized",
      "submittedAt",
    ]),

  notifications: defineTable(notificationFields)
    .index("by_memberId_and_createdAt", ["memberId", "createdAt"])
    .index("by_memberId_and_read_and_createdAt", [
      "memberId",
      "read",
      "createdAt",
    ])
    .index("by_identityToken_and_createdAt", ["identityToken", "createdAt"])
    .index("by_identityToken_and_read_and_createdAt", [
      "identityToken",
      "read",
      "createdAt",
    ]),

  emailOutbox: defineTable(emailOutboxFields)
    .index("by_status_and_createdAt", ["status", "createdAt"])
    .index("by_memberId_and_createdAt", ["memberId", "createdAt"])
    .index("by_applicationId_and_createdAt", ["applicationId", "createdAt"])
    .index("by_eventId_and_createdAt", ["eventId", "createdAt"])
    .index("by_registrationId_and_createdAt", ["registrationId", "createdAt"]),

  financeTransactions: defineTable(financeTransactionFields)
    .index("by_status_and_occurredAt", ["status", "occurredAt"])
    .index("by_status_and_monthKey_and_occurredAt", [
      "status",
      "monthKey",
      "occurredAt",
    ])
    .index("by_status_and_direction_and_occurredAt", [
      "status",
      "direction",
      "occurredAt",
    ])
    .index("by_eventId_and_occurredAt", ["eventId", "occurredAt"]),
  financeMonthlySummaries: defineTable({
    monthKey: v.string(),
    currency: v.string(),
    income: v.number(),
    expense: v.number(),
    updatedAt: v.number(),
  })
    .index("by_monthKey_and_currency", ["monthKey", "currency"])
    .index("by_currency_and_monthKey", ["currency", "monthKey"]),
  financeBudgets: defineTable({
    eventId: v.optional(v.id("events")),
    fiscalYear: v.number(),
    name: v.string(),
    currency: v.string(),
    plannedIncome: v.number(),
    plannedExpense: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("approved"),
      v.literal("closed")
    ),
    notes: v.optional(v.string()),
    createdBy: v.id("members"),
    updatedAt: v.number(),
  })
    .index("by_fiscalYear_and_status", ["fiscalYear", "status"])
    .index("by_eventId_and_fiscalYear", ["eventId", "fiscalYear"]),

  assets: defineTable(assetFields)
    .index("by_storageId", ["storageId"])
    .index("by_ownerMemberId_and_createdAt", ["ownerMemberId", "createdAt"])
    .index("by_visibility_and_createdAt", ["visibility", "createdAt"]),
  galleryAlbums: defineTable(galleryAlbumFields)
    .index("by_slug", ["slug"])
    .index("by_status_and_occurredAt", ["status", "occurredAt"])
    .index("by_eventId_and_occurredAt", ["eventId", "occurredAt"]),
  galleryItems: defineTable(galleryItemFields)
    .index("by_albumId_and_displayOrder", ["albumId", "displayOrder"])
    .index("by_albumId_and_isPublic_and_displayOrder", [
      "albumId",
      "isPublic",
      "displayOrder",
    ]),

  settings: defineTable(settingFields)
    .index("by_key", ["key"])
    .index("by_isPublic_and_key", ["isPublic", "key"]),
  counters: defineTable(counterFields).index("by_key", ["key"]),
  uuidMappings: defineTable(uuidMappingFields)
    .index("by_hscBatch_and_department", ["hscBatch", "department"])
    .index("by_active_and_hscBatch", ["active", "hscBatch"]),
  uuidCounters: defineTable(uuidCounterFields).index("by_key", ["key"]),
  auditLogs: defineTable(auditLogFields)
    .index("by_actorMemberId_and_createdAt", ["actorMemberId", "createdAt"])
    .index("by_entityType_and_createdAt", ["entityType", "createdAt"]),
})
