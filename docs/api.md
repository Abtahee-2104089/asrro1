# Application API guide

The generated client in `convex/_generated/api` exposes the typed backend
contract. Browser code calls queries and mutations through the application
provider; server-rendered routes use the authenticated server client. Internal
functions and actions are never callable directly from a browser.

## Authentication and password recovery

`authClient.requestPasswordReset` accepts an email address and the local
`/reset-password` callback URL. The response is deliberately identical whether
or not an account exists. Existing accounts receive a single-use link that
expires after 60 minutes through the durable email outbox. The callback
validates the token before exposing it to the reset form, and
`authClient.resetPassword` changes the credential and revokes existing
sessions. The email includes text and branded, escaped HTML alternatives from
`convex/_lib/passwordResetEmail.ts`.

## Public content and discovery

| Module         | Public functions                                                                  | Purpose                                                                   |
| -------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `content`      | `getPage`, `listPages`, `publicSettings`, `publicBranding`, `publicStatistics`    | Published pages, brand, home sections, contact/social data and statistics |
| `projects`     | `listPublic`, `getPublicBySlug`                                                   | Paginated project portfolio and detail                                    |
| `events`       | `listPublic`, `listPast`, `listDirectory`, `listDirectoryPage`, `getPublicBySlug` | Event cards, calendar, archive and detail                                 |
| `alumni`       | `listPublic`, `getPublicBySlug`                                                   | Alumni directory and profile detail                                       |
| `committee`    | `current`, `currentWithPhotos`                                                    | Current committee and photographs                                         |
| `publications` | `listPublic`, `getPublicBySlug`, `listPublicCards`                                | Downloadable publications                                                 |
| `blogs`        | `listPublic`, `searchPublic`, `getPublicBySlug`, `listComments`                   | Published news, rich content and approved comments                        |
| `gallery`      | `listPublicAlbums`, `getPublicAlbum`, `listPublicCards`                           | Event-linked albums, images and videos                                    |
| `search`       | `publicSearch`                                                                    | Bounded cross-content search                                              |

Public writes are `membership.submitApplication`,
`membership.trackApplication`, `events.registerGuest`,
`events.cancelGuest`, `events.getGuestRegistrationStatus`,
`blogs.submitComment`, and `contact.submit`. Each receives a complete typed
argument object, normalizes text/email values, validates scope-specific rules,
and returns only the record or receipt needed by the public workflow.

## Member API

| Module                     | Functions                                                     | Authorization                                                           |
| -------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `members`                  | `me`, `myMembership`, `updateMyProfile`, `linkMyIdentity`     | Current authenticated member only                                       |
| `membership`               | `accountStatus`, `linkApplicationToMyAccount`                 | Current authenticated account only                                      |
| `events`                   | `registerMember`, `cancelMine`, `listMine`, `memberDashboard` | Active member and own registrations                                     |
| `notifications`            | `listMine`, `listForAccount`, `markRead`, `markAllRead`       | Current account/member only                                             |
| `members.verifyMembership` | public UUID lookup                                            | Returns the bounded verification projection, never private contact data |

Pending or rejected applicants are redirected to the applicant-status surface;
the same restriction is enforced by backend member requirements.

## Administrative API

| Capability         | Functions                                                                                                                     | Required permission                                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Applications       | `membership.listApplications`, `reviewApplication`, `bulkApproveApplications`, `upsertUuidMapping`                            | `membership_manage` (mapping requires super admin)                    |
| Members            | `members.list`, `getByUuid`, `setStatus`, `searchAdmin`, `adminUpdate`, `remove`                                              | `membership_manage`                                                   |
| Roles              | `members.setRole`, `setExecutiveAccess`                                                                                       | Super admin                                                           |
| Accounts           | `adminAccounts.createExecutive`, `resetPassword`                                                                              | Super admin plus configured administrator account ID                  |
| Events             | `events.listManagedEvents`, `paginateManagedEvents`, `upsert`, `archive`, `remove`, `clone`                                   | `events_manage`                                                       |
| Registrations      | `events.listManagedRegistrations`, `paginateManagedRegistrations`, `reviewRegistration`, `markAttendance`, `issueCertificate` | `events_manage`                                                       |
| Committee          | `committee.listAdmin`, `upsertTerm`, `upsertMember`, `sendAnnouncement`                                                       | `committee_manage`; announcements also require notification authority |
| Alumni             | `alumni.listAdmin`, `upsert`                                                                                                  | `content_manage`                                                      |
| Projects           | `projects.listAdmin`, `upsert`, `upsertTeamMember`                                                                            | `projects_manage`                                                     |
| Publications       | `publications.listAdmin`, `upsert`                                                                                            | `content_manage`                                                      |
| News/comments      | `blogs.listAdmin`, `upsert`, `listCommentsAdmin`, `moderateComment`                                                           | `content_manage`                                                      |
| Gallery            | `gallery.listAdmin`, `upsertAlbum`, `upsertItem`                                                                              | `content_manage`                                                      |
| Contact inbox      | `contact.list`, `updateStatus`                                                                                                | `content_manage`                                                      |
| Site configuration | `content.listPagesAdmin`, `upsertPage`, `upsertSetting`, `listSettingsAdmin`                                                  | `content_manage` or super admin for private brand/template settings   |
| Reports            | `reports.memberRoster`, `pendingApplications`, `eventAttendance`, `committeeRoster`, `projectInventory`                       | `reports_view` plus domain permission where applicable                |

## Finance

`finance.access` returns `manage`, `summary`, or `none` for the authenticated
member. `finance.summaryView` exposes aggregate totals, monthly series, and
expense categories to explicit `finance_summary` holders. Detailed ledger
queries and `createTransaction`, `postDraft`, and `voidTransaction` require
`finance_manage`. `financeBudgets.list` and `financeBudgets.upsert` also require
detailed finance access. The distinction and denial behavior are covered by
`convex/finance.test.ts`.

## Files and email

`assets.generateUploadUrl` and `assets.registerUpload` require file authority;
application-specific upload functions accept only the public membership file
classes. Registration records enforce MIME type, size, role/ownership, and
public/private access. `getOwnedUrl`, `deleteOwned`, and `listAdmin` re-check
authorization before exposing or changing a stored object.

`emails.enqueue` and `emailActions.deliver` form the internal durable outbox.
Membership decisions, event reminders, registration confirmation,
certificates, bulk member mail, and committee announcements enqueue provider
messages while retaining dashboard notifications. Administrators with
`notifications_send` may inspect delivery state through `emails.list`.
Every production template has an escaped, responsive ASRRO HTML layout and a
plain-text alternative. Delivery supports Gmail SMTP over implicit TLS and the
existing Resend-compatible HTTP provider. The internal design-review batch is
confirmation-gated and covers the exact production template inventory without
changing any account, application, event, or certificate state.

## Pagination, errors and exports

Directory and administrative list functions use cursor pagination where data
can grow. Export controls continue loading pages before building CSV, XLSX, or
PDF artifacts, so an export is not limited to the visible table page.

User-correctable failures use concise `ConvexError` messages suitable for form
feedback. Authorization failures do not disclose whether another user's
private record exists. Database functions return bounded data; document
generation lives in `lib/dashboard-exports.ts`, `lib/event-documents.ts`,
`lib/committee-pdf.ts`, `lib/membership-pdf.ts`, and `lib/project-pdf.ts`.
