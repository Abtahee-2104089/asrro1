"use client"

import { useMutation, useQuery } from "convex/react"
import { Save } from "lucide-react"
import { useMemo, useState } from "react"

import { AssetUploader } from "@/components/dashboard/asset-uploader"
import { ActionButton } from "@/components/dashboard/dashboard-kit"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

const fields = [
  {
    key: "organization.name",
    label: "Organization name",
    group: "Identity",
    public: true,
  },
  {
    key: "home.about.title",
    label: "Homepage About title",
    group: "Homepage",
    public: true,
  },
  {
    key: "home.about.copy",
    label: "Homepage About summary",
    group: "Homepage",
    public: true,
    multiline: true,
  },
  {
    key: "home.mission",
    label: "Homepage mission",
    group: "Homepage",
    public: true,
    multiline: true,
  },
  {
    key: "home.vision",
    label: "Homepage vision",
    group: "Homepage",
    public: true,
    multiline: true,
  },
  {
    key: "home.highlights.enabled",
    label: "Show project highlights (true/false)",
    group: "Homepage",
    public: true,
  },
  {
    key: "theme.primary",
    label: "Primary color (#RRGGBB)",
    group: "Theme",
    public: true,
  },
  {
    key: "theme.accent",
    label: "Accent color (#RRGGBB)",
    group: "Theme",
    public: true,
  },
  {
    key: "contact.email",
    label: "Contact email",
    group: "Contact",
    public: true,
  },
  {
    key: "contact.phone",
    label: "Contact phone",
    group: "Contact",
    public: true,
  },
  {
    key: "contact.address",
    label: "Office address",
    group: "Contact",
    public: true,
  },
  {
    key: "contact.latitude",
    label: "Latitude",
    group: "Contact",
    public: true,
  },
  {
    key: "contact.longitude",
    label: "Longitude",
    group: "Contact",
    public: true,
  },
  {
    key: "social.facebook",
    label: "Facebook URL",
    group: "Social",
    public: true,
  },
  {
    key: "social.linkedin",
    label: "LinkedIn URL",
    group: "Social",
    public: true,
  },
  {
    key: "social.youtube",
    label: "YouTube URL",
    group: "Social",
    public: true,
  },
  { key: "social.github", label: "GitHub URL", group: "Social", public: true },
  {
    key: "social.instagram",
    label: "Instagram URL",
    group: "Social",
    public: true,
  },
  {
    key: "email.membership-approved.subject",
    label: "Approval email subject",
    group: "Email templates",
    public: false,
  },
  {
    key: "email.membership-approved.body",
    label: "Approval email body",
    group: "Email templates",
    public: false,
    multiline: true,
  },
  {
    key: "email.membership-rejected.subject",
    label: "Rejection email subject",
    group: "Email templates",
    public: false,
  },
  {
    key: "email.membership-rejected.body",
    label: "Rejection email body",
    group: "Email templates",
    public: false,
    multiline: true,
  },
  {
    key: "email.event-registration.subject",
    label: "Registration email subject",
    group: "Email templates",
    public: false,
  },
  {
    key: "email.event-registration.body",
    label: "Registration email body",
    group: "Email templates",
    public: false,
    multiline: true,
  },
] as const

export function SettingsForm() {
  const settings = useQuery(api.content.listSettingsAdmin)
  const saveSetting = useMutation(api.content.upsertSetting)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  )
  const values = useMemo(
    () => ({
      ...Object.fromEntries(
        (settings ?? []).map((item) => [item.key, item.value])
      ),
      ...edits,
    }),
    [settings, edits]
  )

  async function save() {
    setState("saving")
    try {
      await Promise.all(
        fields.flatMap((field) => {
          const value = values[field.key]?.trim() || defaultValue(field.key)
          return value
            ? [
                saveSetting({
                  key: field.key,
                  value,
                  isPublic: field.public,
                  description: field.label,
                }),
              ]
            : []
        })
      )
      setState("saved")
    } catch {
      setState("error")
    }
  }

  return (
    <div className="space-y-8 p-5">
      {[...new Set(fields.map((field) => field.group))].map((group) => (
        <section key={group}>
          <h2 className="mb-4 text-sm font-semibold">{group}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              if (field.group !== group) return null
              const multiline = "multiline" in field && field.multiline
              return (
                <label
                  key={field.key}
                  className={multiline ? "sm:col-span-2" : ""}
                >
                  <span className="mb-2 block text-xs font-medium">
                    {field.label}
                  </span>
                  {multiline ? (
                    <textarea
                      value={values[field.key] ?? ""}
                      onChange={(event) =>
                        setEdits((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-white/10 dark:bg-white/5"
                    />
                  ) : (
                    <input
                      value={values[field.key] ?? ""}
                      onChange={(event) =>
                        setEdits((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-white/10 dark:bg-white/5"
                    />
                  )}
                </label>
              )
            })}
          </div>
        </section>
      ))}
      <section className="grid gap-4 sm:grid-cols-2">
        <AssetSetting
          label="Public logo"
          settingKey="branding.logoassetid"
          value={values["branding.logoassetid"]}
          onUploaded={(key, value) =>
            setEdits((current) => ({ ...current, [key]: value }))
          }
        />
        <AssetSetting
          label="Homepage hero banner"
          settingKey="home.heroassetid"
          value={values["home.heroassetid"]}
          onUploaded={(key, value) =>
            setEdits((current) => ({ ...current, [key]: value }))
          }
        />
      </section>
      <div className="flex items-center justify-between border-t border-slate-100 pt-5 dark:border-white/8">
        <p
          role="status"
          className={
            state === "error"
              ? "text-xs text-rose-600"
              : "text-xs text-emerald-600"
          }
        >
          {state === "saved"
            ? "Settings saved."
            : state === "error"
              ? "Settings could not be saved."
              : ""}
        </p>
        <ActionButton disabled={state === "saving"} onClick={() => void save()}>
          <Save className="size-3.5" />{" "}
          {state === "saving" ? "Saving…" : "Save changes"}
        </ActionButton>
      </div>
    </div>
  )
}

function AssetSetting({
  label,
  settingKey,
  value,
  onUploaded,
}: {
  label: string
  settingKey: string
  value?: string
  onUploaded: (key: string, value: string) => void
}) {
  const saveSetting = useMutation(api.content.upsertSetting)
  async function handleUploaded(assetId: Id<"assets">) {
    const next = assetId
    onUploaded(settingKey, next)
    try {
      await saveSetting({
        key: settingKey,
        value: next,
        isPublic: true,
        description: label,
      })
    } catch {
      onUploaded(settingKey, "")
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-5 dark:border-white/15">
      <p className="mb-3 text-sm font-semibold">{label}</p>
      <AssetUploader
        kind="image"
        accept="image/*"
        onUploaded={(assetId) => void handleUploaded(assetId)}
      />
      {value ? (
        <p className="mt-2 text-xs text-emerald-600">Asset configured.</p>
      ) : null}
    </div>
  )
}

function defaultValue(key: string) {
  if (key === "home.highlights.enabled") return "true"
  if (key === "theme.primary") return "#2359d4"
  if (key === "theme.accent") return "#00a6b2"
  return ""
}
