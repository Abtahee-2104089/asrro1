import type { Metadata, Viewport } from "next"
import { Geist_Mono, Manrope, Sora } from "next/font/google"

import "./globals.css"
import { AppProviders } from "@/components/providers/app-providers"
import { getToken } from "@/lib/auth-server"
import { cn } from "@/lib/utils"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
})

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://asrro.org"),
  title: {
    default: "ASRRO — Engineering beyond the horizon",
    template: "%s · ASRRO",
  },
  description:
    "The official portal of the Andromeda Space and Robotics Research Organization at CUET, Bangladesh.",
  applicationName: "ASRRO Portal",
  keywords: [
    "ASRRO",
    "CUET",
    "robotics",
    "space science",
    "artificial intelligence",
    "Bangladesh",
  ],
  authors: [{ name: "Andromeda Space and Robotics Research Organization" }],
  creator: "ASRRO",
  openGraph: {
    type: "website",
    locale: "en_BD",
    siteName: "ASRRO",
    title: "ASRRO — Engineering beyond the horizon",
    description:
      "Research, build, and explore frontier technology with ASRRO at CUET.",
    images: [
      { url: "/asrro-logo.png", width: 725, height: 725, alt: "ASRRO emblem" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ASRRO — Engineering beyond the horizon",
    description:
      "Research, build, and explore frontier technology with ASRRO at CUET.",
    images: ["/asrro-logo.png"],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#060b18" },
    { media: "(prefers-color-scheme: light)", color: "#f4f8ff" },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialToken = await getToken()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(
        "font-sans antialiased",
        manrope.variable,
        sora.variable,
        fontMono.variable
      )}
    >
      <body className="min-h-svh overflow-x-clip bg-background text-foreground">
        <AppProviders initialToken={initialToken}>{children}</AppProviders>
      </body>
    </html>
  )
}
