import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fuji Climb Diet",
    short_name: "FujiDiet",
    description: "富士山登山メタファーで継続を支えるAIダイエット伴走アプリ",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f8faf7",
    theme_color: "#1b728f",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
