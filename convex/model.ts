import { v } from "convex/values"

export const publishStatus = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived")
)

export const memberStatus = v.union(
  v.literal("pending"),
  v.literal("active"),
  v.literal("suspended"),
  v.literal("alumni"),
  v.literal("rejected")
)

export const applicationStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected")
)

export const systemRole = v.union(
  v.literal("member"),
  v.literal("executive"),
  v.literal("super_admin")
)

export const executivePosition = v.union(
  v.literal("president"),
  v.literal("vice_president"),
  v.literal("general_secretary"),
  v.literal("joint_general_secretary"),
  v.literal("organizing_secretary"),
  v.literal("financial_secretary"),
  v.literal("public_relations_secretary"),
  v.literal("research_publication_secretary"),
  v.literal("technical_secretary"),
  v.literal("office_secretary"),
  v.literal("education_secretary"),
  v.literal("publication_secretary"),
  v.literal("it_secretary"),
  v.literal("event_coordinator"),
  v.literal("membership_coordinator"),
  v.literal("executive_member")
)

export const portalPermission = v.union(
  v.literal("membership_manage"),
  v.literal("events_manage"),
  v.literal("committee_manage"),
  v.literal("projects_manage"),
  v.literal("content_manage"),
  v.literal("reports_view"),
  v.literal("files_manage"),
  v.literal("notifications_send"),
  v.literal("finance_manage"),
  v.literal("finance_summary")
)

export const eventStatus = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("cancelled"),
  v.literal("completed"),
  v.literal("archived")
)

export const registrationStatus = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("rejected"),
  v.literal("cancelled"),
  v.literal("attended"),
  v.literal("absent")
)

export const audience = v.union(
  v.literal("public"),
  v.literal("members"),
  v.literal("executives")
)

export const moneyDirection = v.union(v.literal("income"), v.literal("expense"))

export const assetKind = v.union(
  v.literal("image"),
  v.literal("video"),
  v.literal("pdf"),
  v.literal("document")
)

export const contentPageFields = {
  slug: v.string(),
  title: v.string(),
  summary: v.optional(v.string()),
  body: v.string(),
  status: publishStatus,
  heroAssetId: v.optional(v.id("assets")),
  publishedAt: v.optional(v.number()),
  updatedAt: v.number(),
  updatedBy: v.optional(v.id("members")),
}

export const applicationFields = {
  applicationCode: v.string(),
  trackingTokenHash: v.string(),
  identityToken: v.optional(v.string()),
  fullName: v.string(),
  profileAssetId: v.optional(v.id("assets")),
  dateOfBirth: v.optional(v.string()),
  gender: v.string(),
  bloodGroup: v.optional(v.string()),
  email: v.string(),
  emailNormalized: v.string(),
  phone: v.string(),
  institute: v.string(),
  universityName: v.optional(v.string()),
  department: v.string(),
  semester: v.optional(v.string()),
  studentId: v.string(),
  hscBatch: v.string(),
  address: v.string(),
  emergencyContact: v.string(),
  paymentMethod: v.union(
    v.literal("bkash"),
    v.literal("nagad"),
    v.literal("rocket")
  ),
  transactionId: v.string(),
  paymentAssetId: v.optional(v.id("assets")),
  amountPaid: v.optional(v.number()),
  currency: v.optional(v.string()),
  status: applicationStatus,
  submittedAt: v.number(),
  reviewedAt: v.optional(v.number()),
  reviewedBy: v.optional(v.id("members")),
  reviewNote: v.optional(v.string()),
  memberId: v.optional(v.id("members")),
}

export const memberFields = {
  identityToken: v.optional(v.string()),
  authUserId: v.optional(v.string()),
  applicationId: v.optional(v.id("membershipApplications")),
  uuid: v.string(),
  fullName: v.string(),
  email: v.string(),
  emailNormalized: v.string(),
  phone: v.string(),
  department: v.string(),
  hscBatch: v.string(),
  studentId: v.string(),
  institute: v.string(),
  dateOfBirth: v.optional(v.string()),
  bloodGroup: v.optional(v.string()),
  profileAssetId: v.optional(v.id("assets")),
  address: v.optional(v.string()),
  emergencyContact: v.optional(v.string()),
  status: memberStatus,
  systemRole,
  executivePosition: v.optional(executivePosition),
  permissions: v.optional(v.array(portalPermission)),
  joinedAt: v.number(),
  membershipValidUntil: v.optional(v.number()),
  updatedAt: v.number(),
}

export const eventFields = {
  slug: v.string(),
  name: v.string(),
  summary: v.string(),
  description: v.string(),
  category: v.string(),
  scope: v.union(
    v.literal("intra_cuet"),
    v.literal("divisional"),
    v.literal("national")
  ),
  audience,
  status: eventStatus,
  startsAt: v.number(),
  endsAt: v.number(),
  registrationDeadline: v.number(),
  venue: v.string(),
  organizer: v.string(),
  capacity: v.number(),
  activeRegistrationCount: v.number(),
  rules: v.optional(v.string()),
  eligibility: v.string(),
  eligibilityEvidenceRequired: v.optional(v.boolean()),
  allowedInstitutionEmailDomains: v.optional(v.array(v.string())),
  registrationFee: v.number(),
  currency: v.string(),
  contactName: v.string(),
  contactEmail: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
  bannerAssetId: v.optional(v.id("assets")),
  reminderHoursBefore: v.optional(v.number()),
  certificatesEnabled: v.optional(v.boolean()),
  publishedAt: v.optional(v.number()),
  createdBy: v.id("members"),
  updatedAt: v.number(),
}

export const registrationFields = {
  eventId: v.id("events"),
  memberId: v.optional(v.id("members")),
  identityToken: v.optional(v.string()),
  guestName: v.optional(v.string()),
  guestEmail: v.optional(v.string()),
  guestEmailNormalized: v.optional(v.string()),
  guestPhone: v.optional(v.string()),
  institution: v.optional(v.string()),
  institutionDivision: v.optional(v.string()),
  institutionEmail: v.optional(v.string()),
  studentId: v.optional(v.string()),
  eligibilityConfirmed: v.optional(v.boolean()),
  eligibilityEvidenceAssetId: v.optional(v.id("assets")),
  eligibilityEvidenceNote: v.optional(v.string()),
  eligibilityVerifiedAt: v.optional(v.number()),
  eligibilityVerifiedBy: v.optional(v.id("members")),
  registrationCode: v.string(),
  cancellationTokenHash: v.string(),
  status: registrationStatus,
  amountPaid: v.number(),
  transactionId: v.optional(v.string()),
  registeredAt: v.number(),
  reviewedAt: v.optional(v.number()),
  reviewedBy: v.optional(v.id("members")),
  attendanceMarkedAt: v.optional(v.number()),
  reminderSentAt: v.optional(v.number()),
  certificateCode: v.optional(v.string()),
  certificateIssuedAt: v.optional(v.number()),
  certificateIssuedBy: v.optional(v.id("members")),
}

export const committeeTermFields = {
  name: v.string(),
  startsAt: v.number(),
  endsAt: v.number(),
  status: v.union(v.literal("draft"), v.literal("current"), v.literal("past")),
  publishedAt: v.optional(v.number()),
}

export const committeeMemberFields = {
  termId: v.id("committeeTerms"),
  memberId: v.optional(v.id("members")),
  name: v.string(),
  position: v.string(),
  positionKey: v.string(),
  department: v.string(),
  session: v.string(),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  photoAssetId: v.optional(v.id("assets")),
  displayOrder: v.number(),
  isPublic: v.boolean(),
}

export const alumniFields = {
  slug: v.string(),
  name: v.string(),
  department: v.string(),
  session: v.string(),
  batch: v.string(),
  graduationYear: v.number(),
  currentWorkplace: v.optional(v.string()),
  higherStudies: v.optional(v.string()),
  linkedInUrl: v.optional(v.string()),
  researchInterests: v.optional(v.string()),
  photoAssetId: v.optional(v.id("assets")),
  status: publishStatus,
  publishedAt: v.optional(v.number()),
  updatedAt: v.number(),
}

export const projectFields = {
  slug: v.string(),
  title: v.string(),
  summary: v.string(),
  description: v.string(),
  category: v.union(
    v.literal("completed"),
    v.literal("ongoing"),
    v.literal("research"),
    v.literal("competition"),
    v.literal("industry_collaboration")
  ),
  domain: v.string(),
  status: publishStatus,
  projectState: v.union(
    v.literal("planned"),
    v.literal("ongoing"),
    v.literal("completed"),
    v.literal("paused")
  ),
  technologyStack: v.array(v.string()),
  startedAt: v.optional(v.number()),
  endedAt: v.optional(v.number()),
  githubUrl: v.optional(v.string()),
  awards: v.optional(v.string()),
  coverAssetId: v.optional(v.id("assets")),
  featured: v.boolean(),
  publishedAt: v.optional(v.number()),
  updatedAt: v.number(),
}

export const publicationFields = {
  slug: v.string(),
  title: v.string(),
  abstract: v.string(),
  type: v.union(
    v.literal("research_paper"),
    v.literal("magazine"),
    v.literal("report"),
    v.literal("annual_publication")
  ),
  authors: v.array(v.string()),
  publicationDate: v.number(),
  externalUrl: v.optional(v.string()),
  assetId: v.optional(v.id("assets")),
  projectId: v.optional(v.id("projects")),
  status: publishStatus,
  featured: v.boolean(),
  publishedAt: v.optional(v.number()),
  updatedAt: v.number(),
}

export const blogFields = {
  slug: v.string(),
  title: v.string(),
  excerpt: v.string(),
  body: v.string(),
  category: v.string(),
  tags: v.array(v.string()),
  authorName: v.string(),
  authorMemberId: v.optional(v.id("members")),
  coverAssetId: v.optional(v.id("assets")),
  status: publishStatus,
  featured: v.boolean(),
  publishedAt: v.optional(v.number()),
  updatedAt: v.number(),
}

export const blogCommentFields = {
  blogId: v.id("blogs"),
  name: v.string(),
  emailNormalized: v.string(),
  body: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("spam")
  ),
  createdAt: v.number(),
  moderatedAt: v.optional(v.number()),
  moderatedBy: v.optional(v.id("members")),
}

export const contactMessageFields = {
  name: v.string(),
  email: v.string(),
  emailNormalized: v.string(),
  subject: v.string(),
  message: v.string(),
  status: v.union(
    v.literal("new"),
    v.literal("in_progress"),
    v.literal("resolved"),
    v.literal("spam")
  ),
  submittedAt: v.number(),
  assignedTo: v.optional(v.id("members")),
  resolvedAt: v.optional(v.number()),
}

export const notificationFields = {
  memberId: v.optional(v.id("members")),
  identityToken: v.optional(v.string()),
  applicationId: v.optional(v.id("membershipApplications")),
  kind: v.string(),
  title: v.string(),
  body: v.string(),
  link: v.optional(v.string()),
  read: v.boolean(),
  createdAt: v.number(),
  readAt: v.optional(v.number()),
}

export const emailOutboxFields = {
  recipient: v.string(),
  recipientName: v.optional(v.string()),
  template: v.string(),
  subject: v.string(),
  textBody: v.string(),
  htmlBody: v.optional(v.string()),
  status: v.union(
    v.literal("queued"),
    v.literal("sending"),
    v.literal("sent"),
    v.literal("failed")
  ),
  memberId: v.optional(v.id("members")),
  applicationId: v.optional(v.id("membershipApplications")),
  eventId: v.optional(v.id("events")),
  registrationId: v.optional(v.id("eventRegistrations")),
  attempts: v.number(),
  lastError: v.optional(v.string()),
  providerMessageId: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  sentAt: v.optional(v.number()),
}

export const financeTransactionFields = {
  direction: moneyDirection,
  category: v.string(),
  amount: v.number(),
  currency: v.string(),
  occurredAt: v.number(),
  monthKey: v.string(),
  description: v.string(),
  reference: v.optional(v.string()),
  eventId: v.optional(v.id("events")),
  memberId: v.optional(v.id("members")),
  receiptAssetId: v.optional(v.id("assets")),
  status: v.union(v.literal("draft"), v.literal("posted"), v.literal("void")),
  createdBy: v.id("members"),
  createdAt: v.number(),
}

export const assetFields = {
  storageId: v.id("_storage"),
  kind: assetKind,
  fileName: v.string(),
  contentType: v.optional(v.string()),
  size: v.optional(v.number()),
  altText: v.optional(v.string()),
  ownerMemberId: v.optional(v.id("members")),
  visibility: v.union(v.literal("public"), v.literal("private")),
  createdAt: v.number(),
}

export const galleryAlbumFields = {
  slug: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  eventId: v.optional(v.id("events")),
  coverAssetId: v.optional(v.id("assets")),
  status: publishStatus,
  occurredAt: v.number(),
  publishedAt: v.optional(v.number()),
}

export const galleryItemFields = {
  albumId: v.id("galleryAlbums"),
  assetId: v.id("assets"),
  caption: v.optional(v.string()),
  displayOrder: v.number(),
  isPublic: v.boolean(),
}

export const settingFields = {
  key: v.string(),
  value: v.string(),
  isPublic: v.boolean(),
  description: v.optional(v.string()),
  updatedAt: v.number(),
  updatedBy: v.optional(v.id("members")),
}

export const counterFields = {
  key: v.string(),
  value: v.number(),
  updatedAt: v.number(),
}

export const uuidMappingFields = {
  hscBatch: v.string(),
  department: v.string(),
  galaxyName: v.string(),
  starName: v.string(),
  code: v.string(),
  active: v.boolean(),
  updatedAt: v.number(),
}

export const uuidCounterFields = {
  key: v.string(),
  nextNumber: v.number(),
  updatedAt: v.number(),
}

export const auditLogFields = {
  actorMemberId: v.id("members"),
  action: v.string(),
  entityType: v.string(),
  entityId: v.optional(v.string()),
  summary: v.string(),
  createdAt: v.number(),
}
