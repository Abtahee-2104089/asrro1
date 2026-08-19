import type { Metadata } from "next"
import {
  Mail,
  MapPin,
  Phone,
  Code2,
  BriefcaseBusiness,
  MessageCircle,
  Video,
  Camera,
} from "lucide-react"
import Link from "next/link"
import { fetchQuery } from "convex/nextjs"

import { ContactForm } from "@/components/site/contact-form"
import { PageHero } from "@/components/shared/page-hero"
import { api } from "@/convex/_generated/api"

const socialChannels = [
  [MessageCircle, "Facebook", "social.facebook"],
  [BriefcaseBusiness, "LinkedIn", "social.linkedin"],
  [Video, "YouTube", "social.youtube"],
  [Code2, "GitHub", "social.github"],
  [Camera, "Instagram", "social.instagram"],
] as const

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact ASRRO at CUET for research, events, partnerships, and membership.",
}
export default async function ContactPage() {
  const settings = await fetchQuery(api.content.publicSettings)
  const value = (key: string, fallback: string) =>
    settings.find((item) => item.key === key)?.value || fallback
  const email = value("contact.email", "hello@asrro.org")
  const phone = value("contact.phone", "+880 1700 000 000")
  const address = value("contact.address", "Student Activity Centre, CUET")
  const latitude = value("contact.latitude", "23.4607")
  const longitude = value("contact.longitude", "91.9710")
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}&z=15&output=embed`
  const channels = [
    [Mail, "Email", email, `mailto:${email}`],
    [Phone, "Phone", phone, `tel:${phone.replaceAll(" ", "")}`],
    [MapPin, "Office", address, "#map"],
  ] as const
  return (
    <>
      <PageHero
        eyebrow="Ground station / contact"
        title="Open a channel."
        intro="Tell us whether you are asking about membership, an event, research collaboration, sponsorship, or a media request."
      />
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <div className="space-y-3">
              {channels.map(([Icon, label, value, href]) => {
                const content = (
                  <>
                    <span className="grid size-11 place-items-center rounded-full bg-[#00a6b2]/10 text-[#007d89] dark:bg-[#65f2f1]/8 dark:text-[#65f2f1]">
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <span className="block font-mono text-[9px] tracking-[.16em] text-[#587084] uppercase dark:text-[#71869e]">
                        {label}
                      </span>
                      <span className="mt-1 block text-[#182b3d] dark:text-[#dbe7f3]">
                        {value}
                      </span>
                    </span>
                  </>
                )
                const className =
                  "flex items-center gap-4 rounded-xl border border-[#2359d4]/15 bg-white/80 p-5 shadow-[0_12px_35px_rgba(35,89,212,.05)] transition hover:border-[#00a6b2]/40 dark:border-white/10 dark:bg-[#09182a] dark:shadow-none dark:hover:border-[#65f2f1]/40"

                return href.startsWith("#") ? (
                  <Link href={href} key={label} className={className}>
                    {content}
                  </Link>
                ) : (
                  <a href={href} key={label} className={className}>
                    {content}
                  </a>
                )
              })}
            </div>
            <div
              id="map"
              className="relative mt-5 min-h-64 overflow-hidden rounded-2xl border border-[#2359d4]/15 bg-[#e8f0f7] dark:border-white/10 dark:bg-[#08172a]"
            >
              <iframe
                title="ASRRO office at CUET on Google Maps"
                src={mapUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts allow-popups allow-forms"
                className="absolute inset-0 h-full min-h-64 w-full border-0"
                allowFullScreen
              />
            </div>
            <div className="mt-5 flex gap-3">
              {socialChannels.map(([Icon, label, key]) => (
                <a
                  href={value(key, "#")}
                  aria-label={label}
                  key={label}
                  className="grid size-10 place-items-center rounded-full border border-[#2359d4]/15 text-[#587084] transition hover:border-[#00a6b2]/40 hover:text-[#007d89] dark:border-white/10 dark:text-[#8296ad] dark:hover:text-[#65f2f1]"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  )
}
