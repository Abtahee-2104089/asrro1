"use client"

import { useMutation, usePaginatedQuery } from "convex/react"
import { Bell, CheckCheck, Megaphone } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { ActionButton } from "@/components/dashboard/dashboard-kit"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/motion/tabs"
import { api } from "@/convex/_generated/api"

const notificationDateFormatter = new Intl.DateTimeFormat("en-BD", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Dhaka",
})

function NotificationList({ unreadOnly }: { unreadOnly: boolean }) {
  const router = useRouter()
  const markRead = useMutation(api.notifications.markRead)
  const [actionError, setActionError] = useState<string | null>(null)
  const { results, status, loadMore } = usePaginatedQuery(
    api.notifications.listForAccount,
    { unreadOnly },
    { initialNumItems: 20 }
  )

  async function openNotification(
    notificationId: (typeof results)[number]["_id"],
    link?: string
  ) {
    setActionError(null)
    try {
      await markRead({ notificationId })
      if (link) router.push(link)
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : "Could not update notification"
      )
    }
  }
  if (status === "LoadingFirstPage")
    return (
      <p className="p-8 text-center text-sm text-slate-500">
        Loading notifications…
      </p>
    )
  if (!results.length)
    return (
      <div className="grid min-h-56 place-items-center p-8 text-center">
        <div>
          <CheckCheck className="mx-auto size-7 text-emerald-600" />
          <p className="mt-3 text-sm font-semibold">You are all caught up</p>
          <p className="mt-1 text-xs text-slate-500">
            New membership and portal updates appear here.
          </p>
        </div>
      </div>
    )
  return (
    <div className="divide-y divide-slate-100 dark:divide-white/8">
      {actionError ? (
        <p role="alert" className="px-5 py-3 text-xs text-rose-600">
          {actionError}
        </p>
      ) : null}
      {results.map((notification) => (
        <article
          key={notification._id}
          className={`flex gap-4 p-5 ${notification.read ? "" : "bg-blue-50/35 dark:bg-blue-500/[0.04]"}`}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-blue-600 ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10">
            {notification.kind.startsWith("membership") ? (
              <Bell className="size-4" />
            ) : (
              <Megaphone className="size-4" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex gap-2">
              <h2 className="text-sm font-semibold">{notification.title}</h2>
              {notification.read ? null : (
                <span className="mt-2 size-1.5 rounded-full bg-blue-600" />
              )}
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {notification.body}
            </p>
            <p className="mt-2 text-[10px] text-slate-400">
              {notificationDateFormatter.format(notification.createdAt)}
            </p>
          </div>
          <button
            type="button"
            className="self-start text-[10px] font-semibold text-blue-600"
            onClick={() =>
              void openNotification(notification._id, notification.link)
            }
          >
            {notification.link
              ? "Open"
              : notification.read
                ? "Read"
                : "Mark read"}
          </button>
        </article>
      ))}
      {status === "CanLoadMore" ? (
        <button
          type="button"
          className="w-full p-4 text-xs font-semibold text-blue-600"
          onClick={() => loadMore(20)}
        >
          Load more
        </button>
      ) : null}
    </div>
  )
}

export function NotificationCenter() {
  const markAllRead = useMutation(api.notifications.markAllRead)
  const [actionError, setActionError] = useState<string | null>(null)

  async function readAllNotifications() {
    setActionError(null)
    try {
      await markAllRead()
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : "Could not update notifications"
      )
    }
  }

  return (
    <Tabs defaultValue="all" variant="underline">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 pt-2 sm:flex-row sm:items-end sm:justify-between dark:border-white/8">
        <TabsList className="bg-transparent">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
        <ActionButton
          variant="quiet"
          className="mb-2 self-start"
          onClick={() => void readAllNotifications()}
        >
          <CheckCheck className="size-3.5" />
          Mark all read
        </ActionButton>
      </div>
      {actionError ? (
        <p role="alert" className="px-5 py-3 text-xs text-rose-600">
          {actionError}
        </p>
      ) : null}
      <TabsContent value="all" className="mt-0">
        <NotificationList unreadOnly={false} />
      </TabsContent>
      <TabsContent value="unread" className="mt-0">
        <NotificationList unreadOnly />
      </TabsContent>
    </Tabs>
  )
}
