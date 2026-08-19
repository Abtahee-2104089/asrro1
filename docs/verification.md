# Verification record

Last verified on 4 August 2026 against the configured development backend and
an optimized local production build.

## Automated gates

- Production build: passed for all 40 generated routes.
- Strict TypeScript: passed.
- ESLint with zero warnings: passed.
- Prettier check: passed.
- React Doctor changed-scope audit: no issues across bugs, performance,
  accessibility, and maintainability diagnostics.
- Backend and export tests: 15 passed. Coverage includes applicant isolation,
  duplicate membership payments, granular authorization, one-time
  administrator bootstrap, concurrent UUID allocation, email outbox behavior,
  event eligibility, duplicate event payments, comment moderation, branding
  defaults, branded password-recovery email safety, and valid CSV/XLSX/PDF
  event exports.
- Backend schema/function synchronization: passed.
- Capacity test: passed with 10,000 members, 500 events, and 100,000 event
  registrations; the in-memory run completed in 1.20 seconds.

## Browser verification

- All current public, applicant, member, executive, finance, file-management,
  and administration routes were opened and captured at desktop size.
- Representative home, login, and dashboard routes were captured in light, dark, and mobile layouts.
- The accessibility tree was inspected for representative public, event,
  authentication, and authenticated dashboard routes at 1440 × 1000 and
  390 × 844. Interactive controls exposed accessible names and the dashboard
  redirected unauthenticated visitors to login.
- Password recovery was exercised end to end with a real single-use token:
  request, callback, same-password reset, prior-session revocation, success,
  generic unknown-account response, and invalid-link states all passed.

## Performance acceptance

The acceptance run used an Apple M5 Pro with 48 GiB memory, macOS arm64, Bun
1.3.14, Node.js 24.19.0, an optimized `next start` build, loopback networking,
and the configured remote development database. These figures are local
release evidence rather than a hosting-provider SLA.

- Ten-sample public run: every public route passed its 2,000 ms p95 budget.
  Homepage p95 was 1,094 ms; the slowest passing public route was contact at
  1,752 ms.
- Authenticated five-sample run: dashboard p95 was 1,185 ms against the 3,000
  ms budget.
- Concurrent run: 500 requests at concurrency 10, zero failures, p50 536 ms,
  p95 1,272 ms, p99 1,623 ms.
- Authenticated mixed run: 100 requests at concurrency 10, zero failures, p50
  558 ms, p95 1,310 ms, p99 2,109 ms.

Reproduce with `bun run test:capacity` and `BASE_URL=http://localhost:3000 bun
run verify:runtime`. Add `RUNTIME_EMAIL` and `RUNTIME_PASSWORD` to include the
authenticated dashboard budget without storing credentials in the script.

## Operational checks

- `/api/health` verifies that the web runtime can read the backend and returns a degraded `503` response when it cannot.
- Authentication origins are configured per deployment through `SITE_URL` and `TRUSTED_ORIGINS`.
- Outbound email uses a durable outbox and records provider delivery status.
  Configure an organization-owned sender/provider as described in the README;
  dashboard notifications remain operational without it.
- The monthly availability target, health-check calculation, error budget,
  escalation path, and incident record are defined in `docs/operations.md`.
