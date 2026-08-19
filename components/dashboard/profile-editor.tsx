"use client"

import { useMutation } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import type { Id } from "@/convex/_generated/dataModel"
import { Camera, Mail, MapPin, Phone, Save, ShieldCheck } from "lucide-react"
import { useRef, useState, type ChangeEvent, type FormEvent } from "react"

import { ActionButton } from "@/components/dashboard/dashboard-kit"
import { Input } from "@/components/motion/input"
import { api } from "@/convex/_generated/api"

type Member = Exclude<FunctionReturnType<typeof api.members.me>, null>

export function ProfileEditor({ member }: { member: Member }) {
  const updateProfile = useMutation(api.members.updateMyProfile)
  const generateUploadUrl = useMutation(api.assets.generateUploadUrl)
  const registerUpload = useMutation(api.assets.registerUpload)
  const profileAssetIdRef = useRef(member.profileAssetId)
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setMessage("Uploading profile photo…")
    try {
      const uploadUrl = await generateUploadUrl({})
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })
      if (!response.ok) throw new Error("Profile photo upload failed")
      const { storageId } = (await response.json()) as { storageId: string }
      const assetId = await registerUpload({
        storageId: storageId as Id<"_storage">,
        kind: "image",
        fileName: file.name,
        altText: `${member.fullName} profile photo`,
        visibility: "private",
      })
      profileAssetIdRef.current = assetId
      setMessage("Photo uploaded. Save changes to use it.")
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Upload failed")
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    setSaving(true)
    setMessage(null)
    try {
      await updateProfile({
        email: String(values.get("email") ?? ""),
        phone: String(values.get("phone") ?? ""),
        address: String(values.get("address") ?? ""),
        emergencyContact: String(values.get("emergencyContact") ?? ""),
        ...(profileAssetIdRef.current
          ? { profileAssetId: profileAssetIdRef.current }
          : {}),
      })
      setMessage("Profile changes saved.")
    } catch (cause) {
      setMessage(
        cause instanceof Error ? cause.message : "Profile update failed"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(event) => void save(event)}
      className="grid gap-5 p-5 sm:grid-cols-2"
    >
      <Input
        name="email"
        label="Email address"
        defaultValue={member.email}
        leftIcon={<Mail />}
        success
        classNames={{ field: "rounded-xl bg-slate-50 dark:bg-white/5" }}
      />
      <Input
        name="phone"
        label="Phone number"
        defaultValue={member.phone}
        leftIcon={<Phone />}
        classNames={{ field: "rounded-xl bg-slate-50 dark:bg-white/5" }}
      />
      <Input
        name="address"
        label="Current address"
        defaultValue={member.address ?? ""}
        leftIcon={<MapPin />}
        className="sm:col-span-2"
        classNames={{ field: "rounded-xl bg-slate-50 dark:bg-white/5" }}
      />
      <Input
        name="emergencyContact"
        label="Emergency contact"
        defaultValue={member.emergencyContact ?? ""}
        leftIcon={<Phone />}
        className="sm:col-span-2"
        classNames={{ field: "rounded-xl bg-slate-50 dark:bg-white/5" }}
      />
      <label className="sm:col-span-2">
        <span className="mb-2 block text-xs font-medium">Profile photo</span>
        <span className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 text-xs text-slate-600 dark:border-white/15 dark:text-slate-300">
          <Camera className="size-4" /> Choose an image (maximum 5 MB)
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => void uploadPhoto(event)}
          />
        </span>
      </label>
      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between dark:border-white/8">
        <p
          aria-live="polite"
          className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
        >
          {message ? (
            <>
              <ShieldCheck className="size-4 text-emerald-600" />
              {message}
            </>
          ) : (
            "Contact and profile-photo changes are editable here."
          )}
        </p>
        <ActionButton type="submit" disabled={saving}>
          <Save className="size-3.5" /> {saving ? "Saving…" : "Save changes"}
        </ActionButton>
      </div>
    </form>
  )
}
