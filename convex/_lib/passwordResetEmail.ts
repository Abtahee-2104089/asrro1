function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function trustedHttpUrl(value: string, label: string) {
  const url = new URL(value)
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`${label} must use HTTP or HTTPS`)
  }
  return url.href
}

export function passwordResetEmail(input: {
  name: string
  resetUrl: string
  siteUrl: string
}) {
  const name = input.name.trim() || "ASRRO member"
  const resetUrl = trustedHttpUrl(input.resetUrl, "Password reset URL")
  const siteUrl = trustedHttpUrl(input.siteUrl, "Website URL")
  const logoUrl = new URL("/asrro-logo.png", siteUrl).href
  const safeName = escapeHtml(name)
  const safeResetUrl = escapeHtml(resetUrl)
  const safeLogoUrl = escapeHtml(logoUrl)

  return {
    template: "password_reset" as const,
    subject: "Reset your ASRRO portal password",
    textBody: `Hello ${name},\n\nWe received a request to reset your ASRRO portal password. This secure link expires in 60 minutes:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email. Your password will remain unchanged.\n\nASRRO · CUET, Bangladesh`,
    htmlBody: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset your ASRRO portal password</title>
  </head>
  <body style="margin:0;background:#eef3f5;color:#0f172a;font-family:Arial,'Helvetica Neue',sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your secure ASRRO password reset link expires in 60 minutes.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef3f5;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;overflow:hidden;border-radius:24px;background:#071321;box-shadow:0 20px 60px rgba(2,8,23,.18);">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid rgba(255,255,255,.10);">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-right:14px;"><img src="${safeLogoUrl}" width="52" height="52" alt="ASRRO" style="display:block;border-radius:14px;background:#ffffff;padding:4px;"></td>
                    <td>
                      <div style="font-size:18px;line-height:1.2;font-weight:800;letter-spacing:.12em;color:#ffffff;">ASRRO</div>
                      <div style="margin-top:5px;font-family:monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#67e8f9;">Secure member access</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:44px 32px 18px;">
                <div style="font-family:monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#67e8f9;">Account recovery</div>
                <h1 style="margin:14px 0 0;font-size:34px;line-height:1.15;letter-spacing:-.035em;color:#ffffff;">Reset your portal password.</h1>
                <p style="margin:22px 0 0;font-size:16px;line-height:1.7;color:#cbd5e1;">Hello ${safeName},</p>
                <p style="margin:10px 0 0;font-size:16px;line-height:1.7;color:#cbd5e1;">We received a request to reset the password for your ASRRO account. This secure link can be used once and expires in 60 minutes.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 30px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="border-radius:999px;background:#67e8f9;">
                      <a href="${safeResetUrl}" style="display:inline-block;padding:15px 26px;font-size:14px;font-weight:800;text-decoration:none;color:#071321;">Create new password&nbsp; →</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 42px;">
                <div style="border-radius:16px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);padding:18px;">
                  <p style="margin:0;font-size:13px;line-height:1.65;color:#94a3b8;">If you did not request this change, ignore this email. Your current password remains active. ASRRO will never ask you to send a password by email.</p>
                </div>
                <p style="margin:24px 0 8px;font-size:12px;line-height:1.5;color:#64748b;">Button not working? Copy this address into your browser:</p>
                <p style="margin:0;word-break:break-all;font-size:11px;line-height:1.6;color:#67e8f9;">${safeResetUrl}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 32px;border-top:1px solid rgba(255,255,255,.08);font-family:monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#64748b;">Andromeda Space &amp; Robotics Research Organization · CUET, Bangladesh</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  }
}
