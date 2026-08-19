"use client"

import { useMutation, useQuery } from "convex/react"
import { Check, MessageCircle, ShieldX } from "lucide-react"
import { useState } from "react"

import { ActionButton, Panel } from "@/components/dashboard/dashboard-kit"
import { api } from "@/convex/_generated/api"

export function CommentModeration() {
  const comments = useQuery(api.blogs.listCommentsAdmin, { status: "pending" })
  const moderate = useMutation(api.blogs.moderateComment)
  const [message, setMessage] = useState("")

  async function decide(
    commentId: NonNullable<typeof comments>[number]["_id"],
    status: "approved" | "spam"
  ) {
    setMessage("Updating…")
    try {
      await moderate({ commentId, status })
      setMessage(
        status === "approved" ? "Comment approved." : "Comment hidden."
      )
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Update failed")
    }
  }

  return (
    <Panel
      title="Comment moderation"
      description="Reader comments stay private until an executive approves them."
    >
      <div className="divide-y divide-slate-100 dark:divide-white/8">
        {comments?.map((comment) => (
          <article
            key={comment._id}
            className="flex flex-col gap-4 p-5 sm:flex-row"
          >
            <MessageCircle className="size-4 shrink-0 text-blue-600" />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold">{comment.name}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {comment.body}
              </p>
            </div>
            <div className="flex gap-2">
              <ActionButton
                variant="quiet"
                onClick={() => void decide(comment._id, "spam")}
              >
                <ShieldX className="size-3.5" /> Hide
              </ActionButton>
              <ActionButton
                onClick={() => void decide(comment._id, "approved")}
              >
                <Check className="size-3.5" /> Approve
              </ActionButton>
            </div>
          </article>
        ))}
        {comments?.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No comments await review.
          </p>
        ) : null}
      </div>
      <p
        role="status"
        className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500 dark:border-white/8"
      >
        {message}
      </p>
    </Panel>
  )
}
