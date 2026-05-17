import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const clientUrl = (env.VITE_CLIENT_URL || "http://localhost:5173").replace(
    /\/+$/,
    ""
  );
  const ogImageUrl =
    env.VITE_OG_IMAGE_URL?.trim() || `${clientUrl}/thumb.jpeg`;

  return {
  plugins: [
    {
      name: "inject-html-meta-urls",
      transformIndexHtml(html) {
        return html
          .replaceAll("%META_CLIENT_URL%", clientUrl)
          .replaceAll("%META_OG_IMAGE_URL%", ogImageUrl);
      },
    },
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["echo.svg", "echologo.svg", "thumb.jpeg"],
      manifest: {
        name: "Echo - An Open QnA Platform",
        short_name: "Echo",
        description:
          "Echo is an open Q&A platform where you can ask questions, share knowledge, and connect with communities through spaces.",
        theme_color: "#171717",
        background_color: "#171717",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        mode: "development",
        runtimeCaching: [
          {
            urlPattern: ({ url }) => {
              const isLocalBackend =
                url.origin.includes("localhost:3001") &&
                url.pathname.match(/^\/(auth|users|questions|spaces|search)/);
              const isProdBackend = url.pathname.match(
                /^\/api\/(auth|users|questions|spaces|search)/
              );
              return !!(isLocalBackend || isProdBackend);
            },
            handler: "NetworkOnly",
            options: {
              cacheName: "api-cache",
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 2592000,
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router"],
          ui: ["@base-ui/react", "@hugeicons/react", "@hugeicons/core-free-icons"],
        },
      },
    },
  },
};
});
