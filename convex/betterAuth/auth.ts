import { createClient, type GenericCtx } from "@convex-dev/better-auth"
import { convex } from "@convex-dev/better-auth/plugins"
import { betterAuth, type BetterAuthOptions } from "better-auth"
import { admin } from "better-auth/plugins"

import { components, internal } from "../_generated/api"
import type { DataModel } from "../_generated/dataModel"
import { passwordResetEmail } from "../_lib/passwordResetEmail"
import authConfig from "../auth.config"
import schema from "./schema"

export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
  }
)

function getTrustedOrigins() {
  return [
    process.env.SITE_URL,
    ...(process.env.TRUSTED_ORIGINS?.split(",") ?? []),
  ]
    .map((origin) => origin?.trim())
    .filter((origin): origin is string => Boolean(origin))
}

function getBetterAuthAdminIds() {
  return (process.env.BETTER_AUTH_ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
}

export function createAuthOptions(ctx: GenericCtx<DataModel>) {
  return {
    appName: "ASRRO Portal",
    baseURL: process.env.SITE_URL,
    trustedOrigins: getTrustedOrigins(),
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        if (!("runMutation" in ctx)) {
          throw new Error("Password reset email requires a mutation context")
        }
        const siteUrl = process.env.SITE_URL
        if (!siteUrl) throw new Error("SITE_URL is required")
        const email = passwordResetEmail({
          name: user.name,
          resetUrl: url,
          siteUrl,
        })
        await ctx.runMutation(internal.emails.enqueue, {
          recipient: user.email,
          recipientName: user.name,
          ...email,
        })
      },
    },
    plugins: [
      admin({ adminUserIds: getBetterAuthAdminIds() }),
      convex({ authConfig }),
    ],
  } satisfies BetterAuthOptions
}

export const options = createAuthOptions({} as GenericCtx<DataModel>)

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth(createAuthOptions(ctx))
