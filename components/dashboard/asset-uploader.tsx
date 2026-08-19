"use client"

import { useMutation } from "convex/react"
import { Upload } from "lucide-react"
import { useState } from "react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

export function AssetUploader({
  kind,
  label = "Upload file",
  accept,
  onUploaded,
}: {
  kind: "image" | "video" | "pdf" | "document"
  label?: string
  accept?: string
  onUploaded: (assetId: Id<"assets">) => void
}) {
  const generateUploadUrl = useMutation(api.assets.generateUploadUrl)
  const registerUpload = useMutation(api.assets.registerUpload)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-white/10">
      <Upload className="size-3.5" />
      {busy ? "Uploading…" : label}
      <input
        className="sr-only"
        type="file"
        accept={accept}
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          setBusy(true)
          setMessage(null)
          void (async () => {
            try {
              const uploadUrl = await generateUploadUrl()
              const response = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
              })
              if (!response.ok) throw new Error("Upload failed")
              const payload = (await response.json()) as {
                storageId: Id<"_storage">
              }
              const assetId = await registerUpload({
                storageId: payload.storageId,
                kind,
                fileName: file.name,
                visibility: "public",
              })
              onUploaded(assetId)
              setMessage("Uploaded")
            } catch (error) {
              setMessage(
                error instanceof Error ? error.message : "Upload failed"
              )
            } finally {
              setBusy(false)
              event.target.value = ""
            }
          })()
        }}
      />
      {message ? (
        <span className="sr-only" role="status">
          {message}
        </span>
      ) : null}
    </label>
  )
}
