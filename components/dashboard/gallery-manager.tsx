"use client"

import { useMutation, useQuery } from "convex/react"
import { useRef, useState, type FormEvent } from "react"

import { AssetUploader } from "@/components/dashboard/asset-uploader"
import { ActionButton, Panel } from "@/components/dashboard/dashboard-kit"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

export function GalleryManager() {
  const albums = useQuery(api.gallery.listAdmin)
  const addItem = useMutation(api.gallery.upsertItem)
  const assetIdRef = useRef<Id<"assets"> | undefined>(undefined)
  const [kind, setKind] = useState<"image" | "video">("image")
  const [message, setMessage] = useState("")

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const assetId = assetIdRef.current
    if (!assetId) {
      setMessage("Upload an image or video first.")
      return
    }
    const form = event.currentTarget
    const data = new FormData(form)
    setMessage("Saving…")
    try {
      await addItem({
        albumId: String(data.get("albumId")) as Id<"galleryAlbums">,
        assetId,
        caption: String(data.get("caption") || "") || undefined,
        displayOrder: Number(data.get("displayOrder")),
        isPublic: data.get("isPublic") === "on",
      })
      form.reset()
      assetIdRef.current = undefined
      setMessage("Gallery media saved.")
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Save failed")
    }
  }

  return (
    <Panel
      title="Gallery media"
      description="Attach public images or videos to an album, including event-linked albums."
    >
      <form
        onSubmit={(event) => void save(event)}
        className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"
      >
        <label className="text-xs font-medium">
          Album
          <select
            name="albumId"
            required
            className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 dark:border-white/10 dark:bg-slate-900"
          >
            <option value="">Select album</option>
            {albums?.map((album) => (
              <option key={album._id} value={album._id}>
                {album.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium">
          Caption
          <input
            name="caption"
            className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 dark:border-white/10 dark:bg-white/5"
          />
        </label>
        <label className="text-xs font-medium">
          Order
          <input
            name="displayOrder"
            type="number"
            min="0"
            defaultValue="0"
            className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 dark:border-white/10 dark:bg-white/5"
          />
        </label>
        <label className="text-xs font-medium">
          Media type
          <select
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as "image" | "video")
            }
            className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 dark:border-white/10 dark:bg-slate-900"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </label>
        <div className="flex items-end">
          <AssetUploader
            kind={kind}
            accept={kind === "image" ? "image/*" : "video/*"}
            label={`Upload ${kind}`}
            onUploaded={(assetId) => {
              assetIdRef.current = assetId
            }}
          />
        </div>
        <label className="flex items-end pb-2 text-xs">
          <input
            name="isPublic"
            type="checkbox"
            defaultChecked
            className="mr-2"
          />{" "}
          Public
        </label>
        <ActionButton type="submit" className="lg:col-span-3">
          Add media to album
        </ActionButton>
        <p role="status" className="text-xs text-slate-500 lg:col-span-3">
          {message}
        </p>
      </form>
    </Panel>
  )
}
