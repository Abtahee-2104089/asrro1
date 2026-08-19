"use client"

import { useMutation, useQuery } from "convex/react"
import { MessageCircle, Send } from "lucide-react"
import { useState, type FormEvent } from "react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

const commentDateFormatter = new Intl.DateTimeFormat("en-BD", {
  dateStyle: "medium",
  timeZone: "Asia/Dhaka",
})

export function ArticleComments({ blogId }: { blogId: Id<"blogs"> }) {
  const comments = useQuery(api.blogs.listComments, { blogId })
  const submit = useMutation(api.blogs.submitComment)
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  )

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setState("sending")
    try {
      await submit({
        blogId,
        name: String(data.get("name")),
        email: String(data.get("email")),
        body: String(data.get("body")),
        website: String(data.get("website") || "") || undefined,
      })
      form.reset()
      setState("sent")
    } catch {
      setState("error")
    }
  }

  return (
    <section className="border-t border-[#2359d4]/15 px-5 py-16 sm:px-8 lg:px-12 dark:border-white/10">
      <div className="mx-auto grid max-w-3xl gap-10 lg:grid-cols-[1fr_.9fr]">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] tracking-[.18em] text-[#007d89] uppercase dark:text-[#65f2f1]">
            <MessageCircle className="size-4" /> Discussion
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            Field notes from readers.
          </h2>
          <div className="mt-7 space-y-4">
            {comments?.map((comment) => (
              <article
                key={comment._id}
                className="rounded-xl border border-[#2359d4]/15 bg-white p-5 dark:border-white/10 dark:bg-[#09182a]"
              >
                <div className="flex justify-between gap-3 text-sm">
                  <h3 className="font-semibold">{comment.name}</h3>
                  <time className="text-xs text-[#587084] dark:text-[#8296ad]">
                    {commentDateFormatter.format(comment.createdAt)}
                  </time>
                </div>
                <p className="mt-3 text-sm leading-6 whitespace-pre-line text-[#425a70] dark:text-[#b9c8d9]">
                  {comment.body}
                </p>
              </article>
            ))}
            {comments?.length === 0 ? (
              <p className="text-sm text-[#587084] dark:text-[#8296ad]">
                No approved comments yet. Start the discussion.
              </p>
            ) : null}
          </div>
        </div>
        <form
          onSubmit={(event) => void submitComment(event)}
          className="rounded-xl border border-[#2359d4]/15 bg-white p-5 dark:border-white/10 dark:bg-[#09182a]"
        >
          <h3 className="font-semibold">Leave a comment</h3>
          <p className="mt-1 text-xs text-[#587084] dark:text-[#8296ad]">
            Comments are reviewed before they appear. Email stays private.
          </p>
          <div className="mt-5 grid gap-3">
            <Field label="Name" name="name" />
            <Field label="Email" name="email" type="email" />
            <label className="hidden" aria-hidden="true">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <label className="text-xs font-medium">
              Comment
              <textarea
                name="body"
                required
                rows={5}
                maxLength={2000}
                className="mt-1 w-full rounded-lg border border-[#2359d4]/15 bg-[#f4f7fb] p-3 dark:border-white/10 dark:bg-[#06101f]"
              />
            </label>
            <button
              type="submit"
              disabled={state === "sending"}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#07111f] px-4 text-sm font-semibold text-white disabled:opacity-60 dark:bg-[#65f2f1] dark:text-[#03101e]"
            >
              <Send className="size-4" />
              {state === "sending" ? "Sending…" : "Send for review"}
            </button>
            <p
              role="status"
              className={
                state === "error"
                  ? "text-xs text-red-600"
                  : "text-xs text-emerald-600"
              }
            >
              {state === "sent"
                ? "Comment received for moderation."
                : state === "error"
                  ? "Comment could not be sent. Check the fields and try again."
                  : ""}
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string
  name: string
  type?: string
}) {
  return (
    <label className="text-xs font-medium">
      {label}
      <input
        name={name}
        type={type}
        required
        maxLength={type === "email" ? 254 : 120}
        className="mt-1 h-11 w-full rounded-lg border border-[#2359d4]/15 bg-[#f4f7fb] px-3 dark:border-white/10 dark:bg-[#06101f]"
      />
    </label>
  )
}
