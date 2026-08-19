"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function ActionSwapIcon({
  value,
  children,
  className,
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <span className={cn("inline-grid place-items-center", className)}>
        {children}
      </span>
    )
  }

  return (
    <span
      className={cn("relative inline-grid place-items-center", className)}
      aria-hidden
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          className="absolute inset-0 grid place-items-center"
          initial={{ opacity: 0, scale: 0.25, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.25, filter: "blur(8px)" }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

