# SRS traceability matrix

This matrix links the acceptance items in [`checklist.md`](../checklist.md) to
the implementation and reproducible evidence. A checklist item is complete
only when its row has a usable product path; data-model fields alone are not
treated as completion.

## Public website

| Requirement group                                | Product surface                                        | Primary implementation                                                                                         |
| ------------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Home, mission, vision, highlights and statistics | `/`                                                    | `components/site/home-page.tsx`, `convex/content.ts`                                                           |
| History, values and journey                      | `/about`                                               | `app/(site)/about/page.tsx`, `convex/content.ts`                                                               |
| Committee                                        | `/committee`, `/dashboard/committee`                   | `components/site/committee-directory.tsx`, `components/dashboard/committee-manager.tsx`, `convex/committee.ts` |
| Alumni directory and administration              | `/alumni`, `/dashboard/content`                        | `components/site/alumni-directory.tsx`, `components/dashboard/alumni-manager.tsx`, `convex/alumni.ts`          |
| Project portfolio                                | `/projects`, `/projects/[slug]`, `/dashboard/projects` | `components/site/project-explorer.tsx`, `components/dashboard/project-manager.tsx`, `convex/projects.ts`       |
| Event discovery and details                      | `/events`, `/events/[slug]`                            | `components/site/event-explorer.tsx`, `components/site/event-detail.tsx`, `convex/events.ts`                   |
| Gallery albums, images and videos                | `/gallery`, `/gallery/[slug]`, `/dashboard/content`    | `components/dashboard/gallery-manager.tsx`, `convex/gallery.ts`                                                |
| Publications                                     | `/publications`, `/dashboard/content`                  | `components/site/publication-library.tsx`, `convex/publications.ts`                                            |
| News, rich content and comments                  | `/news`, `/news/[slug]`                                | `components/shared/rich-text.tsx`, `components/site/article-comments.tsx`, `convex/blogs.ts`                   |
| Contact details, map and messages                | `/contact`                                             | `components/site/contact-form.tsx`, `app/(site)/contact/page.tsx`, `convex/contact.ts`                         |
| Role-aware global search                         | `/search`                                              | `components/site/global-search.tsx`, `convex/search.ts`                                                        |

## Membership and access control

| Requirement group                                            | Product surface                                                            | Primary implementation and evidence                                                                           |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Password authentication, recovery and trusted origins        | `/login`, `/forgot-password`, `/reset-password`, `/api/auth/*`             | `convex/betterAuth/auth.ts`, `convex/_lib/passwordResetEmail.ts`, `app/api/auth/[...all]/route.ts`            |
| Application, payment and attachment intake                   | `/membership`                                                              | `components/site/membership-flow.tsx`, `convex/membership.ts`, `convex/assets.ts`                             |
| Applicant isolation and status                               | `/applicant-status`, `/membership/status`                                  | `app/(auth)/applicant-status/page.tsx`, `components/site/application-tracker.tsx`, `convex/workflows.test.ts` |
| Approval, rejection, suspension, editing and bulk operations | `/dashboard/members`                                                       | `components/dashboard/members-table.tsx`, `convex/members.ts`                                                 |
| Permanent UUID allocation                                    | approval workflow                                                          | `convex/_lib/uuid.ts`, `convex/membership.ts`, `convex/workflows.test.ts`                                     |
| Profile, card, QR verification, validity and receipt         | `/dashboard/profile`, `/dashboard/membership`, `/membership/verify/[uuid]` | `components/dashboard/membership-card.tsx`, `lib/membership-pdf.ts`, `convex/members.ts`                      |
| Executive positions and granular permissions                 | `/dashboard/members`, `/dashboard/settings`                                | `convex/_lib/auth.ts`, `components/dashboard/role-manager.tsx`, `convex/adminAccounts.ts`                     |
| Super-administrator bootstrap and account administration     | `/applicant-status`, `/dashboard/settings`                                 | `convex/membership.ts`, `convex/adminAccounts.ts`, `convex/workflows.test.ts`                                 |

Authorization is enforced in Convex functions, not only by hiding navigation.
Run `bun run test:once` to exercise guest, pending-member, member, executive,
finance-summary, finance-manager and super-administrator boundaries.

## Event operations

| Requirement group                            | Product surface                                       | Primary implementation and evidence                                                                                                |
| -------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Eligibility and scoped registration          | `/events/[slug]`                                      | `components/site/event-detail.tsx`, `components/site/event-eligibility-upload.tsx`, `convex/events.ts`, `convex/workflows.test.ts` |
| Registration review, cancellation and status | public event detail and `/dashboard/event-management` | `convex/events.ts`, `components/dashboard/event-management.tsx`                                                                    |
| Attendance                                   | `/dashboard/event-management`                         | `components/dashboard/attendance-scanner.tsx`, `convex/events.ts`                                                                  |
| Participant and attendance exports           | `/dashboard/event-management`, `/dashboard/reports`   | `lib/event-documents.ts`, `components/dashboard/reports-workspace.tsx`, `lib/event-documents.test.ts`                              |
| Confirmation and certificate extension       | `/dashboard/events`                                   | `lib/event-documents.ts`, `components/dashboard/member-events.tsx`                                                                 |
| Reminders and notifications                  | scheduled backend job                                 | `convex/crons.ts`, `convex/events.ts`, `convex/emails.ts`                                                                          |

## Finance and organizational administration

| Requirement group                                    | Product surface                             | Primary implementation and evidence                                                                                             |
| ---------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Detailed ledger and structured categories            | `/dashboard/finance`                        | `components/dashboard/finance-workspace.tsx`, `components/dashboard/finance-transaction-form.tsx`, `convex/finance.ts`          |
| Explicit summary-only finance access                 | `/dashboard/finance`                        | `components/dashboard/finance-summary.tsx`, `convex/finance.ts`, `convex/finance.test.ts`                                       |
| Annual and event budgets                             | `/dashboard/finance`                        | `components/dashboard/finance-budgets.tsx`, `convex/financeBudgets.ts`                                                          |
| Period reports, category charts and exports          | `/dashboard/finance`, `/dashboard/reports`  | `components/dashboard/finance-summary.tsx`, `lib/dashboard-exports.ts`, `convex/reports.ts`                                     |
| Website, brand, homepage, gallery and email settings | `/dashboard/settings`, `/dashboard/content` | `components/dashboard/settings-form.tsx`, `components/dashboard/content-manager.tsx`, `convex/settings.ts`, `convex/content.ts` |
| Authorized file storage                              | upload controls throughout administration   | `convex/assets.ts`, `components/dashboard/asset-uploader.tsx`                                                                   |

## Quality attributes and reproducible evidence

| Requirement                                          | Command or record                                       |
| ---------------------------------------------------- | ------------------------------------------------------- |
| Strict lint, types, formatting and React health      | `bun run check`                                         |
| Production compilation                               | `bun run build`                                         |
| Backend workflow and authorization behavior          | `bun run test:once`                                     |
| 10,000 members, 500 events and 100,000 registrations | `bun run test:capacity`                                 |
| Runtime latency and concurrent HTTP load             | `BASE_URL=http://localhost:3000 bun run verify:runtime` |
| Availability target and incident handling            | `docs/operations.md`                                    |
| WCAG 2.2 AA review and exceptions                    | `docs/accessibility.md`                                 |
| Desktop, dark-theme and mobile captures              | `screenshots.md`, `scripts/capture-screenshots.sh`      |
| API and data relationships                           | `docs/api.md`, `docs/data-model.md`                     |

### Performance acceptance environment

The repository performance gate uses a production build served by `next
start`, a local Convex development deployment, loopback networking, and the
seeded representative dataset. `scripts/verify-runtime.mjs` records every
sample, reports p50/p95/max latency, and fails when public-page p95 exceeds two
seconds or login/dashboard p95 exceeds three seconds. The same command also
runs a configurable concurrent-request check. Release verification records the
machine, runtime version, sample count, concurrency and timestamp in
`docs/verification.md`; production monitoring remains responsible for the
monthly availability SLO.
