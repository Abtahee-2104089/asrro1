"use client"

import { useState } from "react"

import { AssetUploader } from "@/components/dashboard/asset-uploader"
import type { Id } from "@/convex/_generated/dataModel"

export function FileManager() {
  const [uploaded, setUploaded] = useState<
    Array<{ kind: string; id: Id<"assets"> }>
  >([])
  const remember = (kind: string) => (id: Id<"assets">) =>
    setUploaded((items) => [{ kind, id }, ...items].slice(0, 12))
  return (
    <div className="space-y-5 p-5">
      <div className="flex flex-wrap gap-3">
        <AssetUploader
          kind="image"
          accept="image/*"
          label="Upload image"
          onUploaded={remember("image")}
        />
        <AssetUploader
          kind="video"
          accept="video/*"
          label="Upload video"
          onUploaded={remember("video")}
        />
        <AssetUploader
          kind="pdf"
          accept="application/pdf"
          label="Upload PDF"
          onUploaded={remember("pdf")}
        />
        <AssetUploader
          kind="document"
          accept="text/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf,.zip"
          label="Upload document"
          onUploaded={remember("document")}
        />
      </div>
      <p className="text-xs text-slate-500">
        Images: 5 MB; PDFs/documents: 10 MB; videos: 100 MB. MIME types are
        verified after upload and files remain owned by the uploader.
      </p>
      {uploaded.length ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {uploaded.map((item) => (
            <li
              key={item.id}
              className="rounded-lg bg-slate-50 p-3 font-mono text-xs dark:bg-white/5"
            >
              {item.kind} · {item.id}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
