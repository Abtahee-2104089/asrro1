#!/usr/bin/env bash
set -euo pipefail

# Prevent Chromium from retaining a renderer for every captured route.
export AGENT_BROWSER_ARGS="${AGENT_BROWSER_ARGS:---disable-features=BackForwardCache,--remote-allow-origins=*}"

BASE_URL="${ASRRO_SCREENSHOT_BASE_URL:-http://localhost:3000}"
OUTPUT_DIR="${ASRRO_SCREENSHOT_OUTPUT_DIR:-screenshots/pages}"
PUBLIC_SESSION="asrro-capture-public"
DASHBOARD_SESSION="asrro-capture-dashboard"
APPLICANT_SESSION="asrro-capture-applicant"

mkdir -p "$OUTPUT_DIR"

public_routes=(
  "public-home|/"
  "public-about|/about"
  "public-alumni|/alumni"
  "public-committee|/committee"
  "public-contact|/contact"
  "public-gallery|/gallery"
  "gallery-riverwatch-field-tests|/gallery/riverwatch-field-tests"
  "public-membership|/membership"
  "public-membership-status|/membership/status"
  "public-membership-verification|/membership/verify/AR-901"
  "public-publications|/publications"
  "public-search|/search"
  "public-projects|/projects"
  "project-riverwatch-rover|/projects/riverwatch-rover"
  "public-events|/events"
  "event-robotics-foundations|/events/robotics-foundations-workshop-2026"
  "event-space-tech-bootcamp|/events/chattogram-space-tech-bootcamp-2026"
  "event-bangladesh-rover-challenge|/events/bangladesh-rover-challenge-2026"
  "public-news|/news"
  "news-riverwatch-field-notes|/news/riverwatch-field-notes"
  "auth-login|/login"
  "auth-forgot-password|/forgot-password"
  "auth-reset-password-invalid|/reset-password?error=INVALID_TOKEN"
  "not-found|/this-route-does-not-exist"
)

dashboard_routes=(
  "dashboard-overview|/dashboard"
  "dashboard-profile|/dashboard/profile"
  "dashboard-membership|/dashboard/membership"
  "dashboard-events|/dashboard/events"
  "dashboard-notifications|/dashboard/notifications"
  "dashboard-members|/dashboard/members"
  "dashboard-event-management|/dashboard/event-management"
  "dashboard-committee|/dashboard/committee"
  "dashboard-finance|/dashboard/finance"
  "dashboard-projects|/dashboard/projects"
  "dashboard-content|/dashboard/content"
  "dashboard-reports|/dashboard/reports"
  "dashboard-settings|/dashboard/settings"
  "dashboard-files|/dashboard/files"
)

capture_routes() {
  local session="$1"
  local viewport="$2"
  shift 2
  local entries=("$@")

  for entry in "${entries[@]}"; do
    local name="${entry%%|*}"
    local route="${entry#*|}"
    agent-browser --session "$session" open "${BASE_URL}${route}" >/dev/null
    agent-browser --session "$session" wait 1200 >/dev/null
    capture_current_page "$session" \
      "${OUTPUT_DIR}/${name}-light-${viewport}.png"
    echo "Captured ${route}"
  done
}

capture_current_page() {
  local session="$1"
  local output="$2"
  local cdp_url
  cdp_url="$(agent-browser --session "$session" get cdp-url)"
  node scripts/capture-current-page.mjs "$cdp_url" "$output"
}

agent-browser --session "$PUBLIC_SESSION" open "$BASE_URL" >/dev/null
agent-browser --session "$PUBLIC_SESSION" set viewport 1440 1000 >/dev/null
agent-browser --session "$PUBLIC_SESSION" eval \
  'localStorage.setItem("theme", "light")' >/dev/null
capture_routes "$PUBLIC_SESSION" "desktop" "${public_routes[@]}"

agent-browser --session "$PUBLIC_SESSION" open "$BASE_URL" >/dev/null
agent-browser --session "$PUBLIC_SESSION" eval \
  'localStorage.setItem("theme", "dark")' >/dev/null
agent-browser --session "$PUBLIC_SESSION" open "$BASE_URL" >/dev/null
agent-browser --session "$PUBLIC_SESSION" wait 1200 >/dev/null
capture_current_page "$PUBLIC_SESSION" \
  "${OUTPUT_DIR}/public-home-dark-desktop.png"
agent-browser --session "$PUBLIC_SESSION" open "${BASE_URL}/login" >/dev/null
agent-browser --session "$PUBLIC_SESSION" wait 1200 >/dev/null
capture_current_page "$PUBLIC_SESSION" \
  "${OUTPUT_DIR}/auth-login-dark-desktop.png"

agent-browser --session "$PUBLIC_SESSION" set viewport 768 1024 >/dev/null
agent-browser --session "$PUBLIC_SESSION" eval \
  'localStorage.setItem("theme", "light")' >/dev/null
capture_routes "$PUBLIC_SESSION" "tablet" "${public_routes[@]}"

agent-browser --session "$PUBLIC_SESSION" set viewport 390 844 >/dev/null
capture_routes "$PUBLIC_SESSION" "mobile" "${public_routes[@]}"

if [[ -z "${ASRRO_SCREENSHOT_EMAIL:-}" || -z "${ASRRO_SCREENSHOT_PASSWORD:-}" ]]; then
  echo "Public screenshots complete. Set ASRRO_SCREENSHOT_EMAIL and ASRRO_SCREENSHOT_PASSWORD to capture dashboard routes."
  agent-browser --session "$PUBLIC_SESSION" close >/dev/null
  exit 0
fi

agent-browser --session "$DASHBOARD_SESSION" open "${BASE_URL}/login" >/dev/null
agent-browser --session "$DASHBOARD_SESSION" set viewport 1440 1000 >/dev/null
agent-browser --session "$DASHBOARD_SESSION" eval \
  'localStorage.setItem("theme", "light")' >/dev/null
agent-browser --session "$DASHBOARD_SESSION" open "${BASE_URL}/login" >/dev/null
agent-browser --session "$DASHBOARD_SESSION" find label "Email address" fill \
  "$ASRRO_SCREENSHOT_EMAIL" >/dev/null
agent-browser --session "$DASHBOARD_SESSION" find label "Password" fill \
  "$ASRRO_SCREENSHOT_PASSWORD" >/dev/null
agent-browser --session "$DASHBOARD_SESSION" find role button click \
  --name "Enter mission portal" >/dev/null
agent-browser --session "$DASHBOARD_SESSION" wait --text "Overview" >/dev/null

capture_routes "$DASHBOARD_SESSION" "desktop" "${dashboard_routes[@]}"

agent-browser --session "$DASHBOARD_SESSION" eval \
  'localStorage.setItem("theme", "dark")' >/dev/null
agent-browser --session "$DASHBOARD_SESSION" open "${BASE_URL}/dashboard" >/dev/null
agent-browser --session "$DASHBOARD_SESSION" wait 1200 >/dev/null
capture_current_page "$DASHBOARD_SESSION" \
  "${OUTPUT_DIR}/dashboard-overview-dark-desktop.png"

agent-browser --session "$DASHBOARD_SESSION" set viewport 768 1024 >/dev/null
agent-browser --session "$DASHBOARD_SESSION" eval \
  'localStorage.setItem("theme", "light")' >/dev/null
capture_routes "$DASHBOARD_SESSION" "tablet" "${dashboard_routes[@]}"

agent-browser --session "$DASHBOARD_SESSION" set viewport 390 844 >/dev/null
capture_routes "$DASHBOARD_SESSION" "mobile" "${dashboard_routes[@]}"

if [[ -n "${ASRRO_SCREENSHOT_PENDING_EMAIL:-}" && -n "${ASRRO_SCREENSHOT_PENDING_PASSWORD:-}" ]]; then
  agent-browser --session "$APPLICANT_SESSION" open "${BASE_URL}/login" >/dev/null
  agent-browser --session "$APPLICANT_SESSION" set viewport 1440 1000 >/dev/null
  agent-browser --session "$APPLICANT_SESSION" find label "Email address" fill \
    "$ASRRO_SCREENSHOT_PENDING_EMAIL" >/dev/null
  agent-browser --session "$APPLICANT_SESSION" find label "Password" fill \
    "$ASRRO_SCREENSHOT_PENDING_PASSWORD" >/dev/null
  agent-browser --session "$APPLICANT_SESSION" find role button click \
    --name "Enter mission portal" >/dev/null
  agent-browser --session "$APPLICANT_SESSION" wait 1200 >/dev/null
  agent-browser --session "$APPLICANT_SESSION" open \
    "${BASE_URL}/applicant-status" >/dev/null
  agent-browser --session "$APPLICANT_SESSION" wait 1200 >/dev/null
  capture_current_page "$APPLICANT_SESSION" \
    "${OUTPUT_DIR}/applicant-status-light-desktop.png"
  agent-browser --session "$APPLICANT_SESSION" set viewport 768 1024 >/dev/null
  capture_current_page "$APPLICANT_SESSION" \
    "${OUTPUT_DIR}/applicant-status-light-tablet.png"
  agent-browser --session "$APPLICANT_SESSION" set viewport 390 844 >/dev/null
  capture_current_page "$APPLICANT_SESSION" \
    "${OUTPUT_DIR}/applicant-status-light-mobile.png"
  agent-browser --session "$APPLICANT_SESSION" close >/dev/null
fi

agent-browser --session "$PUBLIC_SESSION" close >/dev/null
agent-browser --session "$DASHBOARD_SESSION" close >/dev/null
echo "Screenshots saved to ${OUTPUT_DIR}"
