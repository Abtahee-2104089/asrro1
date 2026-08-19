import { cn } from "@/lib/utils"
import Image from "next/image"

export function PersonOrb({
  initials,
  src,
  alt,
  className,
}: {
  initials: string
  src?: string | null
  alt?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative grid aspect-square place-items-center overflow-hidden rounded-full border border-[#3d8bff]/35 bg-[#0b2138] text-2xl font-semibold text-[#dffcff]",
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          sizes="96px"
          className="object-cover"
          unoptimized
        />
      ) : (
        <>
          <span className="absolute h-[150%] w-[60%] rotate-[32deg] border-x border-[#57e6e6]/20" />
          <span className="relative">{initials}</span>
        </>
      )}
    </div>
  )
}
