import { ViewTransition, type ReactNode } from "react"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-svh overflow-x-clip bg-[#f4f7fb] text-[#07111f] selection:bg-[#00a6b2] selection:text-white dark:bg-[#06101f] dark:text-[#eef8ff] dark:selection:bg-[#65f2f1] dark:selection:text-[#03101e]">
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-[200] -translate-y-20 bg-[#07111f] px-4 py-2 text-sm font-semibold text-white shadow-xl focus:translate-y-0 dark:bg-[#65f2f1] dark:text-[#03101e]"
      >
        Skip to content
      </a>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-0 z-[60] hidden w-8 border-r border-[#2359d4]/20 bg-[#eef3f8]/75 2xl:block dark:border-[#65f2f1]/15 dark:bg-[#071322]/75"
      >
        <div className="absolute top-28 left-1/2 h-28 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#00a6b2] to-transparent dark:via-[#65f2f1]" />
        <span className="absolute top-44 left-1/2 size-1.5 -translate-x-1/2 bg-[#d97706] shadow-[0_0_12px_#d97706]" />
        <span className="absolute bottom-24 left-1/2 -translate-x-1/2 -rotate-90 font-mono text-[8px] tracking-[.22em] whitespace-nowrap text-[#476076] uppercase dark:text-[#7890a8]">
          Ground link · 23.4607 N
        </span>
      </div>
      <SiteHeader />
      <ViewTransition name="asrro-public-page" default="asrro-public-page">
        <main
          id="main-content"
          className="relative bg-[linear-gradient(to_right,rgba(35,89,212,.045)_1px,transparent_1px)] bg-[size:calc((100vw-2rem)/6)_100%] 2xl:ml-8 dark:bg-[linear-gradient(to_right,rgba(101,242,241,.025)_1px,transparent_1px)]"
        >
          {children}
        </main>
      </ViewTransition>
      <SiteFooter />
    </div>
  )
}
