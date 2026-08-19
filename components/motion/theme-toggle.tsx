"use client"

// Adapted from beui.dev/components/motion/theme-toggle.

import { Moon, Sun } from "lucide-react"
import { useReducedMotion } from "motion/react"
import { useTheme } from "next-themes"
import {
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
} from "react"

import { ActionSwapIcon } from "@/components/motion/action-swap"
import { cn } from "@/lib/utils"

export type ThemeVariant = "rectangle" | "circle" | "circle-blur"

export type ThemeTransitionStart =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center"
  | "bottom-up"

export interface MotionThemeToggleProps
  extends Omit<ComponentPropsWithoutRef<"button">, "children" | "onClick"> {
  variant?: ThemeVariant
  start?: ThemeTransitionStart
  iconClassName?: string
}

const viewTransitionStyleId = "beui-theme-toggle-vt"

const viewTransitionCss = [
  'html[data-beui-vt="rect"]::view-transition-old(root) { animation: none; mix-blend-mode: normal; }',
  'html[data-beui-vt="rect"]::view-transition-new(root) { mix-blend-mode: normal; animation: beui-rect-reveal 400ms ease-out; }',
  'html[data-beui-vt="circle"]::view-transition-old(root), html[data-beui-vt="circle-blur"]::view-transition-old(root) { animation: none; mix-blend-mode: normal; }',
  'html[data-beui-vt="circle"]::view-transition-new(root) { mix-blend-mode: normal; animation: beui-circle-reveal 700ms cubic-bezier(0.4, 0, 0.2, 1); }',
  'html[data-beui-vt="circle-blur"]::view-transition-new(root) { mix-blend-mode: normal; animation: beui-circle-blur-reveal 700ms cubic-bezier(0.4, 0, 0.2, 1); }',
  '@keyframes beui-rect-reveal { from { clip-path: var(--beui-vt-from, inset(100% 0 0 0)); } to { clip-path: inset(0 0 0 0); } }',
  '@keyframes beui-circle-reveal { from { clip-path: circle(0% at var(--beui-vt-origin, 50% 100%)); } to { clip-path: circle(150% at var(--beui-vt-origin, 50% 100%)); } }',
  '@keyframes beui-circle-blur-reveal { from { clip-path: circle(0% at var(--beui-vt-origin, 50% 100%)); filter: blur(8px); } to { clip-path: circle(150% at var(--beui-vt-origin, 50% 100%)); filter: blur(0px); } }',
].join("\n")

const rectangleOrigins: Record<ThemeTransitionStart, string> = {
  "top-left": "inset(0 100% 100% 0)",
  "top-right": "inset(0 0 100% 100%)",
  "bottom-left": "inset(100% 100% 0 0)",
  "bottom-right": "inset(100% 0 0 100%)",
  center: "inset(50% 50% 50% 50%)",
  "bottom-up": "inset(100% 0 0 0)",
}

const circleOrigins: Record<ThemeTransitionStart, string> = {
  "top-left": "0% 0%",
  "top-right": "100% 0%",
  "bottom-left": "0% 100%",
  "bottom-right": "100% 100%",
  center: "50% 50%",
  "bottom-up": "50% 100%",
}

function useThemeToggle({
  variant,
  start,
}: {
  variant: ThemeVariant
  start: ThemeTransitionStart
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const reduceMotion = useReducedMotion() ?? false
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (document.getElementById(viewTransitionStyleId)) return

    const style = document.createElement("style")
    style.id = viewTransitionStyleId
    style.textContent = viewTransitionCss
    document.head.appendChild(style)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  function toggle() {
    const nextTheme = isDark ? "light" : "dark"

    if (reduceMotion || !("startViewTransition" in document)) {
      setTheme(nextTheme)
      return
    }

    const root = document.documentElement
    if (variant === "rectangle") {
      root.style.setProperty("--beui-vt-from", rectangleOrigins[start])
      root.dataset.beuiVt = "rect"
    } else {
      root.style.setProperty("--beui-vt-origin", circleOrigins[start])
      root.dataset.beuiVt = variant
    }

    const transition = (
      document as Document & {
        startViewTransition(callback: () => void): {
          finished: Promise<void>
        }
      }
    ).startViewTransition(() => setTheme(nextTheme))

    void transition.finished.finally(() => {
      delete root.dataset.beuiVt
    })
  }

  return { isDark, mounted, toggle }
}

export function MotionThemeToggle({
  variant = "rectangle",
  start = "bottom-up",
  className,
  iconClassName,
  ...buttonProps
}: MotionThemeToggleProps) {
  const { isDark, mounted, toggle } = useThemeToggle({ variant, start })

  return (
    <button
      type="button"
      aria-label={
        mounted && isDark ? "Switch to light mode" : "Switch to dark mode"
      }
      onClick={toggle}
      className={cn("grid place-items-center", className)}
      {...buttonProps}
    >
      {mounted ? (
        <ActionSwapIcon
          value={isDark ? "dark" : "light"}
          className={iconClassName}
        >
          {isDark ? (
            <Sun className={iconClassName} />
          ) : (
            <Moon className={iconClassName} />
          )}
        </ActionSwapIcon>
      ) : (
        <span className={iconClassName} aria-hidden />
      )}
    </button>
  )
}

