const DEFAULT_SITE_URL = "https://asrro.vercel.app"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function templateMeta(template: string) {
  if (template === "membership_approved") {
    return {
      eyebrow: "Membership approved",
      actionLabel: "Open membership card",
      actionPath: "/dashboard/membership",
    }
  }
  if (template === "membership_rejected") {
    return {
      eyebrow: "Application update",
      actionLabel: "View application status",
      actionPath: "/applicant-status",
    }
  }
  if (template === "event_certificate_ready") {
    return {
      eyebrow: "Certificate ready",
      actionLabel: "Open event records",
      actionPath: "/dashboard/events",
    }
  }
  if (template === "event_reminder") {
    return {
      eyebrow: "Mission reminder",
      actionLabel: "View event details",
      actionPath: "/events",
    }
  }
  if (template.startsWith("event_registration_")) {
    return {
      eyebrow: "Event registration",
      actionLabel: "Browse ASRRO events",
      actionPath: "/events",
    }
  }
  return {
    eyebrow:
      template === "committee_announcement"
        ? "Committee briefing"
        : "ASRRO update",
    actionLabel: "Open the ASRRO portal",
    actionPath: "/dashboard/notifications",
  }
}

export function brandedEmailHtml(input: {
  template: string
  subject: string
  textBody: string
  recipientName?: string
  siteUrl?: string
}) {
  const siteUrl = new URL(input.siteUrl ?? DEFAULT_SITE_URL)
  const logoUrl = new URL("/asrro-logo.png", siteUrl).href
  const meta = templateMeta(input.template)
  const actionUrl = new URL(meta.actionPath, siteUrl).href
  const greeting = input.recipientName?.trim()
    ? `Hello ${input.recipientName.trim()},`
    : "Hello,"
  const body = input.textBody
    .replace(/^Hello[^\n]*,?\n+/i, "")
    .replace(/\n+ASRRO(?: Membership Team)?\s*$/i, "")
    .trim()

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(input.subject)}</title>
  </head>
  <body style="margin:0;background:#eef3f5;color:#0f172a;font-family:Arial,'Helvetica Neue',sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.subject)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef3f5;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;overflow:hidden;border-radius:24px;background:#071321;box-shadow:0 20px 60px rgba(2,8,23,.18);">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid rgba(255,255,255,.10);">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-right:14px;"><img src="${escapeHtml(logoUrl)}" width="52" height="52" alt="ASRRO" style="display:block;border-radius:14px;background:#ffffff;padding:4px;"></td>
                    <td>
                      <div style="font-size:18px;line-height:1.2;font-weight:800;letter-spacing:.12em;color:#ffffff;">ASRRO</div>
                      <div style="margin-top:5px;font-family:monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#67e8f9;">CUET · Bangladesh</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:44px 32px 18px;">
                <div style="font-family:monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#67e8f9;">${escapeHtml(meta.eyebrow)}</div>
                <h1 style="margin:14px 0 0;font-size:34px;line-height:1.15;letter-spacing:-.035em;color:#ffffff;">${escapeHtml(input.subject)}</h1>
                <p style="margin:22px 0 0;font-size:16px;line-height:1.7;color:#cbd5e1;">${escapeHtml(greeting)}</p>
                <p style="margin:10px 0 0;font-size:16px;line-height:1.7;color:#cbd5e1;">${escapeHtml(body).replaceAll("\n", "<br>")}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 40px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="border-radius:999px;background:#67e8f9;">
                      <a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:15px 26px;font-size:14px;font-weight:800;text-decoration:none;color:#071321;">${escapeHtml(meta.actionLabel)}&nbsp; →</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 32px;border-top:1px solid rgba(255,255,255,.08);font-family:monospace;font-size:10px;line-height:1.6;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">Andromeda Space &amp; Robotics Research Organization · CUET, Bangladesh<br>This is an automated service message.</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
