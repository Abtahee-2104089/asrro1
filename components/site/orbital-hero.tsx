import { AsrroMark } from "@/components/shared/asrro-mark"

export function OrbitalHero() {
  const nodes = [
    [50, 11],
    [81, 26],
    [88, 58],
    [65, 82],
    [29, 80],
    [11, 51],
    [23, 23],
  ]
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,166,178,.09),transparent_45%)] dark:bg-[radial-gradient(circle_at_center,rgba(101,242,241,.08),transparent_45%)]"
      aria-label="ASRRO research constellation: space, robotics, AI, electronics, and IoT"
    >
      <svg
        viewBox="0 0 100 100"
        className="size-full overflow-visible"
        role="img"
      >
        <defs>
          <radialGradient id="core">
            <stop offset="0" stopColor="#57e6e6" stopOpacity=".75" />
            <stop offset="1" stopColor="#3d8bff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          className="stroke-[#7890a8]/60 dark:stroke-[#203551]"
          strokeWidth=".3"
        />
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          className="stroke-[#7890a8]/60 dark:stroke-[#203551]"
          strokeWidth=".35"
          strokeDasharray="1 2"
        />
        <g
          className="motion-safe:animate-spin motion-reduce:transform-none"
          style={{
            transformOrigin: "50px 50px",
            animationDuration: "32s",
          }}
        >
          <ellipse
            cx="50"
            cy="50"
            rx="45"
            ry="22"
            fill="none"
            stroke="#2359d4"
            strokeWidth=".7"
            transform="rotate(-24 50 50)"
          />
          <circle cx="91" cy="33" r="1.5" fill="#ffb84d" />
        </g>
        <g
          className="motion-safe:animate-spin motion-reduce:transform-none"
          style={{
            transformOrigin: "50px 50px",
            animationDirection: "reverse",
            animationDuration: "44s",
          }}
        >
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="15"
            fill="none"
            stroke="#57e6e6"
            strokeOpacity=".6"
            strokeWidth=".5"
            transform="rotate(31 50 50)"
          />
          <circle cx="16" cy="32" r="1.2" fill="#57e6e6" />
        </g>
        <path
          d={
            nodes
              .map(([x, y], index) => `${index ? "L" : "M"}${x} ${y}`)
              .join(" ") + " Z"
          }
          fill="none"
          stroke="#57e6e6"
          strokeOpacity=".25"
          strokeWidth=".35"
        />
        {nodes.map(([x, y], index) => (
          <g key={`${x}-${y}`}>
            <circle
              cx={x}
              cy={y}
              r="2.5"
              className="fill-[#f4f7fb] dark:fill-[#06101f]"
              stroke={index % 3 === 0 ? "#ffb84d" : "#57e6e6"}
              strokeWidth=".6"
            />
            <circle
              className="motion-safe:animate-pulse"
              style={{
                transformOrigin: `${x}px ${y}px`,
                animationDuration: `${2 + index * 0.15}s`,
              }}
              cx={x}
              cy={y}
              r=".8"
              fill={index % 3 === 0 ? "#ffb84d" : "#57e6e6"}
            />
          </g>
        ))}
        <circle cx="50" cy="50" r="18" fill="url(#core)" opacity=".55" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <AsrroMark
          priority
          className="size-20 rounded-2xl border-[#2359d4]/20 p-2 shadow-[0_20px_70px_rgba(35,89,212,.22)] sm:size-24"
        />
      </div>
      <div className="absolute top-[43%] left-0 border-l border-[#00a6b2] pl-3 font-mono text-[9px] tracking-[.18em] text-[#587084] uppercase dark:border-[#65f2f1] dark:text-[#71869e]">
        23.4607° N<br />
        91.9710° E
      </div>
      <div className="absolute right-[2%] bottom-[5%] border-l border-[#d97706] pl-3 font-mono text-[9px] tracking-[.18em] text-[#425a70] uppercase dark:text-[#a8b9ca]">
        3 disciplines
        <br />
        <span className="text-[#b45f00] dark:text-[#ffb84d]">
          1 shared orbit
        </span>
      </div>
    </div>
  )
}
