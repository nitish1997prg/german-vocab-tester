
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",

    name: "German Vocabulary Tester",
    short_name: "German Vocab",

    description:
      "Practice German vocabulary from A1 to B2 with AI-generated questions, progressive difficulty, and fun challenges.",

    start_url: "/",
    scope: "/",

    display: "standalone",

    background_color: "#FFFFFF",
    theme_color: "#176B63",
    
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],


    lang: "en",
  };
}
