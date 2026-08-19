import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ASRRO Portal",
    short_name: "ASRRO",
    description:
      "The digital home of the Andromeda Space and Robotics Research Organization at CUET.",
    start_url: "/",
    display: "standalone",
    background_color: "#060b18",
    theme_color: "#39bff8",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
