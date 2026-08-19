import { cn } from "@/lib/utils"

const colors = ["#57e6e6", "#3d8bff", "#ffb84d"]

export function SignalVisual({
  code,
  className,
  compact = false,
}: {
  code: string
  className?: string
  compact?: boolean
}) {
  const seed = [...code].reduce(
    (total, char) => total + (char.codePointAt(0) ?? 0),
    0
  )
  const points = Array.from({ length: compact ? 5 : 8 }, (_, index) => ({
    x: 12 + ((seed * (index + 3) * 17) % 76),
    y: 12 + ((seed * (index + 5) * 11) % 70),
  }))
  return (
    <div
      className={cn("relative isolate overflow-hidden bg-[#08172a]", className)}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full"
        role="img"
        aria-label={`Abstract data map for ${code}`}
      >
        <defs>
          <pattern
            id={`grid-${seed}`}
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="#203551"
              strokeWidth=".35"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill={`url(#grid-${seed})`} />
        <ellipse
          cx="50"
          cy="50"
          rx="40"
          ry="22"
          fill="none"
          stroke="#3d8bff"
          strokeWidth=".7"
          strokeDasharray="3 3"
          transform="rotate(-18 50 50)"
        />
        <path
          d={points
            .map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`)
            .join(" ")}
          fill="none"
          stroke="#57e6e6"
          strokeOpacity=".35"
          strokeWidth=".6"
        />
        {points.map((point, index) => (
          <circle
            key={`${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r={index === 0 ? 2.1 : 1.1}
            fill={colors[index % colors.length]}
          />
        ))}
      </svg>
      <div className="absolute inset-x-4 bottom-3 flex items-end justify-between font-mono text-[9px] tracking-[0.18em] text-[#8fa7c0] uppercase">
        <span>{code}</span>
        <span className="text-[#57e6e6]">Signal locked</span>
      </div>
    </div>
  )
}
