const baseUrl = (process.env.BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
)
const sampleCount = Number(process.env.RUNTIME_SAMPLES ?? 5)
const loadRequests = Number(process.env.LOAD_REQUESTS ?? 500)
const loadConcurrency = Number(process.env.LOAD_CONCURRENCY ?? 20)
const runtimeEmail = process.env.RUNTIME_EMAIL
const runtimePassword = process.env.RUNTIME_PASSWORD

let authenticationCookie = ""

const pages = [
  { path: "/", budgetMs: 2000 },
  { path: "/about", budgetMs: 2000 },
  { path: "/projects", budgetMs: 2000 },
  { path: "/events", budgetMs: 2000 },
  { path: "/alumni", budgetMs: 2000 },
  { path: "/news", budgetMs: 2000 },
  { path: "/publications", budgetMs: 2000 },
  { path: "/gallery", budgetMs: 2000 },
  { path: "/contact", budgetMs: 2000 },
  { path: "/login", budgetMs: 3000 },
  { path: "/api/health", budgetMs: 1000 },
]

async function authenticateDashboard() {
  if (!runtimeEmail || !runtimePassword) return
  const response = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: baseUrl },
    body: JSON.stringify({ email: runtimeEmail, password: runtimePassword }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) {
    throw new Error(
      `Runtime account sign-in failed with HTTP ${response.status}`
    )
  }
  const setCookies = response.headers.getSetCookie?.() ?? []
  authenticationCookie = setCookies
    .map((cookie) => cookie.split(";", 1)[0])
    .join("; ")
  if (!authenticationCookie) {
    throw new Error("Runtime account sign-in did not return a session cookie")
  }
  pages.push({ path: "/dashboard", budgetMs: 3000, authenticated: true })
}

function percentile(values, fraction) {
  const sorted = values.toSorted((a, b) => a - b)
  return sorted[
    Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)
  ]
}

async function timedRequest(path, authenticated = false) {
  const startedAt = performance.now()
  const response = await fetch(`${baseUrl}${path}`, {
    headers:
      authenticated && authenticationCookie
        ? { cookie: authenticationCookie }
        : undefined,
    redirect: "manual",
    signal: AbortSignal.timeout(10_000),
  })
  await response.arrayBuffer()
  return {
    durationMs: Math.round(performance.now() - startedAt),
    status: response.status,
  }
}

async function verifyPages() {
  const results = []
  for (const page of pages) {
    const samples = []
    for (let index = 0; index < sampleCount; index += 1) {
      samples.push(await timedRequest(page.path, page.authenticated))
    }
    const statuses = new Set(samples.map((sample) => sample.status))
    const p95 = percentile(
      samples.map((sample) => sample.durationMs),
      0.95
    )
    const validStatus = [...statuses].every(
      (status) => status >= 200 && status < 400
    )
    results.push({
      path: page.path,
      p95Ms: p95,
      budgetMs: page.budgetMs,
      statuses: [...statuses],
      passed: validStatus && p95 < page.budgetMs,
    })
  }
  return results
}

async function runLoad() {
  let next = 0
  const durations = []
  let failures = 0
  async function worker() {
    while (next < loadRequests) {
      const index = next
      next += 1
      const page = pages[index % pages.length]
      try {
        const result = await timedRequest(page.path, page.authenticated)
        durations.push(result.durationMs)
        if (result.status < 200 || result.status >= 400) failures += 1
      } catch {
        failures += 1
      }
    }
  }
  await Promise.all(
    Array.from({ length: loadConcurrency }, async () => await worker())
  )
  return {
    requests: loadRequests,
    concurrency: loadConcurrency,
    failures,
    p50Ms: percentile(durations, 0.5),
    p95Ms: percentile(durations, 0.95),
    p99Ms: percentile(durations, 0.99),
    passed: failures === 0,
  }
}

await authenticateDashboard()
const pageResults = await verifyPages()
const loadResult = await runLoad()
const report = {
  testedAt: new Date().toISOString(),
  baseUrl,
  sampleCount,
  dashboardAuthenticated: Boolean(authenticationCookie),
  pages: pageResults,
  load: loadResult,
  passed: pageResults.every((page) => page.passed) && loadResult.passed,
}

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
if (!report.passed) process.exitCode = 1
