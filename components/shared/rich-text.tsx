import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

function safeHref(value: string) {
  if (value.startsWith("/") || value.startsWith("#")) return value
  try {
    const url = new URL(value)
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? value : null
  } catch {
    return null
  }
}

function stableEntries(values: string[]) {
  const occurrences = new Map<string, number>()
  return values.map((value) => {
    const occurrence = occurrences.get(value) ?? 0
    occurrences.set(value, occurrence + 1)
    return { value, key: `${value}\u{0000}${occurrence}` }
  })
}

function inline(value: string): ReactNode[] {
  const tokens = value.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g)
  return stableEntries(tokens).map(({ value: token, key }) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={key}>{token.slice(2, -2)}</strong>
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code key={key} className="rounded bg-current/8 px-1.5 py-0.5">
          {token.slice(1, -1)}
        </code>
      )
    }
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      const href = safeHref(link[2])
      return href ? (
        <a
          key={key}
          href={href}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
          className="font-semibold text-[#007d89] underline underline-offset-4 dark:text-[#65f2f1]"
        >
          {link[1]}
        </a>
      ) : (
        link[1]
      )
    }
    return token
  })
}

export function RichText({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const blocks = stableEntries(value.trim().split(/\n{2,}/))
  return (
    <div className={cn("space-y-6", className)}>
      {blocks.map(({ value: block, key }) => {
        const lines = block.split("\n")
        if (block.startsWith("### ")) {
          return (
            <h3 key={key} className="text-2xl font-semibold">
              {inline(block.slice(4))}
            </h3>
          )
        }
        if (block.startsWith("## ")) {
          return (
            <h2 key={key} className="text-3xl font-semibold">
              {inline(block.slice(3))}
            </h2>
          )
        }
        if (lines.every((line) => line.startsWith("- "))) {
          return (
            <ul key={key} className="list-disc space-y-2 pl-6">
              {lines.map((line) => (
                <li key={line}>{inline(line.slice(2))}</li>
              ))}
            </ul>
          )
        }
        if (lines.every((line) => /^\d+\. /.test(line))) {
          return (
            <ol key={key} className="list-decimal space-y-2 pl-6">
              {lines.map((line) => (
                <li key={line}>{inline(line.replace(/^\d+\. /, ""))}</li>
              ))}
            </ol>
          )
        }
        if (lines.every((line) => line.startsWith("> "))) {
          return (
            <blockquote
              key={key}
              className="border-l-2 border-[#00a6b2] pl-5 text-xl italic"
            >
              {inline(lines.map((line) => line.slice(2)).join(" "))}
            </blockquote>
          )
        }
        return (
          <p key={key} className="whitespace-pre-line">
            {inline(block)}
          </p>
        )
      })}
    </div>
  )
}
