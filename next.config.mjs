import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https?.*\/lesson\/.*/i,
      handler: "NetworkFirst",
      options: { cacheName: "lesson-pages", expiration: { maxEntries: 40, maxAgeSeconds: 7 * 24 * 60 * 60 } }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|css|js)$/i,
      handler: "StaleWhileRevalidate",
      options: { cacheName: "static-assets" }
    }
  ]
});

export default withPWA({
  reactStrictMode: true
});
