# Operations and service objectives

## Availability objective

The production service objective is **99.9% monthly availability** for public pages, authentication, and authenticated dashboard reads. Scheduled maintenance announced at least 48 hours in advance is reported separately and is not silently excluded from incident records.

Availability is calculated as successful health checks divided by total scheduled health checks during the calendar month. A successful check requires an HTTP `200` from `/api/health` within five seconds. A `503`, timeout, DNS failure, TLS failure, or malformed response counts as downtime.

At 99.9%, the monthly error budget is approximately 43 minutes in a 30-day month. Exhausting 75% of that budget triggers a release freeze for non-remediation changes; exhausting 100% triggers an incident review and reliability plan.

## Monitoring

Configure the organization’s uptime monitor to request `https://asrro.vercel.app/api/health` every minute from at least two regions. Alert the current President and Technical Secretary after two consecutive failures and escalate after five minutes. Retain check history for at least thirteen months and attach the monthly export to the committee operations archive.

The health endpoint verifies both the web runtime and a backend read. It returns `503` when the backend is unavailable, so an apparently healthy frontend cannot mask a database outage.

## Performance and load checks

Run the application in production mode before releases:

```bash
bun run build
bun run start
BASE_URL=http://localhost:3000 bun run verify:runtime
RUN_CAPACITY=1 bun run test:capacity
```

`verify:runtime` checks representative routes against the SRS response budgets and executes concurrent HTTP requests. `test:capacity` creates 10,000 members, 500 events, and 100,000 registrations in the in-memory backend and proves indexed reads still return bounded pages.

Record the machine, region, network, dataset, sample count, concurrency, p50, p95, p99, error rate, and commit in `docs/verification.md` for every release candidate.

## Incident record

For every customer-visible incident, record start/end time, affected routes, detection source, impact, root cause, recovery, and follow-up owner. Monthly availability reports must include all incidents and the remaining error budget.
