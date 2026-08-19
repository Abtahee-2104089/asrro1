import type { Id } from "../_generated/dataModel"
import type { MutationCtx } from "../_generated/server"
import { brandedEmailHtml } from "./emailDesign"
import { cleanText, normalizeEmail, optionalText } from "./validation"

export type EmailOutboxInput = {
  recipient: string
  recipientName?: string
  template: string
  subject: string
  textBody: string
  htmlBody?: string
  memberId?: Id<"members">
  applicationId?: Id<"membershipApplications">
  eventId?: Id<"events">
  registrationId?: Id<"eventRegistrations">
}

export async function enqueueEmail(ctx: MutationCtx, input: EmailOutboxInput) {
  const now = Date.now()
  return await ctx.db.insert("emailOutbox", {
    recipient: normalizeEmail(input.recipient),
    recipientName: optionalText(input.recipientName, "Recipient name", 120),
    template: cleanText(input.template, "Email template", 80),
    subject: cleanText(input.subject, "Email subject", 180),
    textBody: cleanText(input.textBody, "Email body", 20_000),
    htmlBody: optionalText(
      input.htmlBody ??
        brandedEmailHtml({
          template: input.template,
          subject: input.subject,
          textBody: input.textBody,
          recipientName: input.recipientName,
        }),
      "HTML email body",
      40_000
    ),
    status: "queued",
    memberId: input.memberId,
    applicationId: input.applicationId,
    eventId: input.eventId,
    registrationId: input.registrationId,
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  })
}

export function membershipDecisionEmail(input: {
  name: string
  decision: "approved" | "rejected"
  uuid?: string
  note?: string
}) {
  const name = input.name.trim()
  if (input.decision === "approved") {
    const textBody = `Hello ${name},\n\nYour ASRRO membership application has been approved. Your member UUID is ${input.uuid}. You can sign in to view your membership card.\n\nASRRO Membership Team`
    const subject = "Your ASRRO membership is approved"
    return {
      template: "membership_approved" as const,
      subject,
      textBody,
      htmlBody: brandedEmailHtml({
        template: "membership_approved",
        subject,
        textBody,
        recipientName: name,
      }),
    }
  }
  const reason = input.note?.trim()
  const textBody = `Hello ${name},\n\nYour ASRRO membership application was not approved.${reason ? `\n\nReview note: ${reason}` : ""}\n\nContact the membership team if you need help.\n\nASRRO Membership Team`
  const subject = "Update on your ASRRO membership application"
  return {
    template: "membership_rejected" as const,
    subject,
    textBody,
    htmlBody: brandedEmailHtml({
      template: "membership_rejected",
      subject,
      textBody,
      recipientName: name,
    }),
  }
}

export function announcementEmail(input: {
  name?: string
  subject: string
  message: string
  template?: "member_announcement" | "committee_announcement"
}) {
  const greeting = input.name?.trim() ? `Hello ${input.name.trim()},` : "Hello,"
  const textBody = `${greeting}\n\n${input.message.trim()}\n\nASRRO`
  const template = input.template ?? "member_announcement"
  return {
    template,
    subject: input.subject,
    textBody,
    htmlBody: brandedEmailHtml({
      template,
      subject: input.subject,
      textBody,
      recipientName: input.name,
    }),
  }
}
