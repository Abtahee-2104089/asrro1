"use node"

import { ConvexError, v } from "convex/values"
import nodemailer from "nodemailer"
import { internal } from "./_generated/api"
import { internalAction } from "./_generated/server"

async function sendWithGmail(email: {
  recipient: string
  subject: string
  textBody: string
  htmlBody?: string
}) {
  const user = process.env.GMAIL_SMTP_USER
  const password = process.env.GMAIL_SMTP_APP_PASSWORD?.replaceAll(" ", "")
  if (!user || !password) {
    throw new ConvexError(
      "Gmail SMTP is not configured (GMAIL_SMTP_USER and GMAIL_SMTP_APP_PASSWORD are required)"
    )
  }
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass: password },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
    disableFileAccess: true,
    disableUrlAccess: true,
  })
  const result = await transporter.sendMail({
    from: {
      name: process.env.EMAIL_FROM_NAME?.trim() || "ASRRO",
      address: user,
    },
    to: email.recipient,
    subject: email.subject,
    text: email.textBody,
    html: email.htmlBody,
  })
  return result.messageId
}

async function sendWithHttpProvider(email: {
  recipient: string
  subject: string
  textBody: string
  htmlBody?: string
}) {
  const providerUrl =
    process.env.EMAIL_PROVIDER_URL ?? "https://api.resend.com/emails"
  const apiKey =
    process.env.EMAIL_PROVIDER_API_KEY ?? process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) {
    throw new ConvexError(
      "HTTP email provider is not configured (EMAIL_FROM and EMAIL_PROVIDER_API_KEY or RESEND_API_KEY are required)"
    )
  }
  const response = await fetch(providerUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email.recipient],
      subject: email.subject,
      text: email.textBody,
      html: email.htmlBody,
    }),
  })
  if (!response.ok) {
    const errorBody = await response.text().catch(() => "")
    let providerMessage = ""
    try {
      providerMessage =
        (JSON.parse(errorBody) as { message?: string }).message ?? ""
    } catch {
      providerMessage = errorBody
    }
    throw new ConvexError(
      providerMessage || `Email provider returned HTTP ${response.status}`
    )
  }
  const body = (await response.json().catch(() => null)) as {
    id?: string
  } | null
  return body?.id
}

export const deliver = internalAction({
  args: { outboxId: v.id("emailOutbox") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const email = await ctx.runMutation(internal.emails.claimForDelivery, args)
    if (!email) return null
    try {
      const providerMessageId =
        process.env.EMAIL_TRANSPORT === "gmail_smtp"
          ? await sendWithGmail(email)
          : await sendWithHttpProvider(email)
      await ctx.runMutation(internal.emails.completeDelivery, {
        outboxId: email._id,
        success: true,
        providerMessageId,
      })
    } catch (error) {
      const code =
        typeof error === "object" && error && "code" in error
          ? String(error.code)
          : undefined
      await ctx.runMutation(internal.emails.completeDelivery, {
        outboxId: email._id,
        success: false,
        error: code
          ? `Email delivery failed (${code})`
          : error instanceof ConvexError
            ? String(error.data)
            : "Email delivery failed",
      })
    }
    return null
  },
})
