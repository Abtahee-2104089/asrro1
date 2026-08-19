# ASRRO Portal

The public website and organization-management workspace for the Andromeda Space and Robotics Research Organization at CUET, Bangladesh.

The application combines a public organizational website, a member portal, and
role-aware operational dashboards.

## Product areas

- Public pages for ASRRO's story, committee, alumni, projects, events, gallery, publications, news, and contact details.
- Membership application, approval, permanent ASRRO UUID allocation, profile, digital card, and notifications.
- Event administration, registration review, attendance, and export-ready datasets.
- Executive workflows for members, committees, projects, content, reports, and settings.
- Restricted finance views for income, expenses, budgets, trends, and reporting periods.

## Run locally

You need Bun 1.3 or newer and access to the project’s backend workspace.

1. Clone the repository and install dependencies.

```bash
git clone https://github.com/Seyamalam/asrro.git
cd asrro
bun install
```

2. Create or select a development backend. This command writes the generated
   public endpoints to `.env.local` and keeps the backend synchronized while
   you work.

```bash
bunx convex dev
```

3. In another terminal, configure the local frontend origin and authentication
   secret. Enter the secret interactively so it is not saved in shell history.

```bash
bunx convex env set SITE_URL http://localhost:3000
bunx convex env set TRUSTED_ORIGINS http://localhost:3000
bunx convex env set BETTER_AUTH_SECRET
```

To deliver password-reset links, approval/rejection messages, reminders, and
announcements through Gmail, enable two-step verification, create a revocable
Google app password, and enter it interactively. Do not use the mailbox's main
password. Without a configured transport, messages remain visible in the
administrative outbox with a failed-delivery reason while dashboard
notifications continue to work.

```bash
bunx convex env set EMAIL_TRANSPORT gmail_smtp
bunx convex env set GMAIL_SMTP_USER your-mailbox@gmail.com
bunx convex env set GMAIL_SMTP_APP_PASSWORD
bunx convex env set EMAIL_FROM_NAME ASRRO
```

The existing Resend-compatible HTTP transport remains available by omitting
`EMAIL_TRANSPORT` and setting `EMAIL_FROM` plus either
`EMAIL_PROVIDER_API_KEY` or `RESEND_API_KEY`.

4. Start the website.

```bash
bun dev
```

Open `http://localhost:3000`. Public pages work without signing in. Visit
`/login` to test authenticated areas; development authentication does not send
a verification code. On a completely empty deployment, create the first
account and open `/applicant-status`; the one-time initialization form creates
the initial administrator. It disappears permanently after the first member is
created.

## Public demo accounts

The configured ASRRO development deployment includes a test account for every
authenticated access level. Guests do not need an account.

| Access level      | Email                      | Password       | What it demonstrates                           |
| ----------------- | -------------------------- | -------------- | ---------------------------------------------- |
| Pending applicant | `demo.pending@asrro.org`   | `pending123`   | Submitted application awaiting review          |
| General member    | `demo.member@asrro.org`    | `demo12345`    | Member profile, events, card and notices       |
| Executive member  | `demo.executive@asrro.org` | `executive123` | Member and organizational operations           |
| Super admin       | `demo.admin@asrro.org`     | `admin12345`   | All modules, role management and site settings |

Sign in at `/login`; no email verification code is required. These credentials
are intentionally public and must never be used for personal, confidential, or
production data. A fresh Convex deployment has a separate database, so these
accounts must be created again when setting up another deployment.

## Environment variables

```dotenv
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
```

Never commit `.env.local`. `SITE_URL`, `TRUSTED_ORIGINS`, and
`BETTER_AUTH_SECRET` belong in the backend
deployment environment, not `.env.local`. `SITE_URL` must be one exact origin,
for example `https://asrro.vercel.app`, with no path or trailing slash.
`TRUSTED_ORIGINS` is a comma-separated list of any additional local or preview
origins allowed to authenticate. Gmail delivery uses `EMAIL_TRANSPORT`,
`GMAIL_SMTP_USER`, `GMAIL_SMTP_APP_PASSWORD`, and optionally
`EMAIL_FROM_NAME`. The HTTP provider alternative uses `EMAIL_FROM` and either
`EMAIL_PROVIDER_API_KEY` or `RESEND_API_KEY`; set `EMAIL_PROVIDER_URL` only for
a compatible endpoint. Set `BETTER_AUTH_ADMIN_USER_IDS` to the comma-separated
account IDs that may perform administrator account creation and password reset
operations.

## Quality checks

```bash
bun run lint
bun run typecheck
bun run format:check
bun run doctor
bun run build
bun run test:capacity
```

Run the complete local validation before opening a pull request:

```bash
bun run check
bun run build
BASE_URL=http://localhost:3000 bun run verify:runtime
```

## Screenshots

The complete public-site and authenticated-dashboard gallery is maintained in
[screenshots.md](screenshots.md).

See the [complete SRS checklist](checklist.md), [SRS traceability matrix](docs/traceability.md), [architecture](docs/architecture.md), [data model](docs/data-model.md), [API guide](docs/api.md), [user guide](docs/user-guide.md), and the [verification record](docs/verification.md).

## Deployment

The current public deployment is <https://asrro.vercel.app>.

1. Create the production backend and deploy its schema and functions.

```bash
bunx convex deploy
```

2. In the production backend environment, set the canonical website origin,
   any additional preview origins, and a unique production secret.

```bash
bunx convex env set --prod SITE_URL https://your-domain.example
bunx convex env set --prod TRUSTED_ORIGINS https://your-preview.example
bunx convex env set --prod BETTER_AUTH_SECRET
bunx convex env set --prod EMAIL_TRANSPORT gmail_smtp
bunx convex env set --prod GMAIL_SMTP_USER your-mailbox@gmail.com
bunx convex env set --prod GMAIL_SMTP_APP_PASSWORD
bunx convex env set --prod EMAIL_FROM_NAME ASRRO
bunx convex env set --prod BETTER_AUTH_ADMIN_USER_IDS
```

3. In the frontend hosting project, configure:

```dotenv
CONVEX_DEPLOYMENT=prod:<deployment-name>
NEXT_PUBLIC_CONVEX_URL=https://<deployment-name>.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://<deployment-name>.convex.site
```

4. Configure the host to install with `bun install --frozen-lockfile` and build
   with `bun run build`, then deploy. Redeploy after changing any
   `NEXT_PUBLIC_` value because those values are embedded during the build.

5. Confirm `/login`, `/api/auth/get-session`, and `/dashboard` on the final
   domain. If login reports `Invalid origin`, ensure `SITE_URL` contains only
   the final origin and add every preview origin to `TRUSTED_ORIGINS`.

## License

Copyright © ASRRO. Add the organization-approved license before accepting external contributions.
