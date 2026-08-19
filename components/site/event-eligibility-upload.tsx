"use client"

import { useMutation } from "convex/react"
import { FileCheck2, Upload } from "lucide-react"
import { useState } from "react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

export function EventEligibilityUpload({ required }: { required: boolean }) {
  const generateUploadUrl = useMutation(api.assets.generateApplicationUploadUrl)
  const registerUpload = useMutation(api.assets.registerApplicationUpload)
  const [assetId, setAssetId] = useState<Id<"assets"> | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  return (
    <div className="grid gap-2 text-sm sm:col-span-2">
      <span className="font-medium">
        Eligibility evidence {required ? "(required)" : "(optional)"}
      </span>
      <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-[#2359d4]/25 px-4 dark:border-white/20">
        {assetId ? (
          <FileCheck2 className="size-4 text-emerald-600" />
        ) : (
          <Upload className="size-4 text-[#007d89]" />
        )}
        <span>
          {busy
            ? "Uploading…"
            : assetId
              ? "Evidence uploaded"
              : "Upload student ID or eligibility letter"}
        </span>
        <input
          type="file"
          accept="image/*,application/pdf"
          required={required && !assetId}
          disabled={busy}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            setBusy(true)
            setMessage("")
            void (async () => {
              try {
                const uploadUrl = await generateUploadUrl()
                const response = await fetch(uploadUrl, {
                  method: "POST",
                  headers: { "Content-Type": file.type },
                  body: file,
                })
                if (!response.ok) throw new Error("Evidence upload failed")
                const payload = (await response.json()) as {
                  storageId: Id<"_storage">
                }
                const nextAssetId = await registerUpload({
                  storageId: payload.storageId,
                  kind: file.type === "application/pdf" ? "pdf" : "image",
                  fileName: file.name,
                })
                setAssetId(nextAssetId)
                setMessage("Evidence uploaded securely")
              } catch (error) {
                setMessage(
                  error instanceof Error ? error.message : "Upload failed"
                )
              } finally {
                setBusy(false)
              }
            })()
          }}
        />
      </label>
      <input
        type="hidden"
        name="eligibilityEvidenceAssetId"
        value={assetId ?? ""}
      />
      {message ? (
        <span className="text-xs text-[#587084]">{message}</span>
      ) : null}
    </div>
  )
}
