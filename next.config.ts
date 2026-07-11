import type { NextConfig } from "next";

const noIndexHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "Cache-Control", value: "private, no-store" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/landing", destination: "/", permanent: true },
      { source: "/landing/index.html", destination: "/", permanent: true },
      { source: "/landing/quiz-demo", destination: "/vaktarprov/vu1-ovningsfragor", permanent: true },
      { source: "/landing/quiz-demo.html", destination: "/vaktarprov/vu1-ovningsfragor", permanent: true },
      { source: "/quiz-demo", destination: "/vaktarprov/vu1-ovningsfragor", permanent: true },
      { source: "/landing/studieteknik", destination: "/studieteknik", permanent: true },
      { source: "/landing/studieteknik.html", destination: "/studieteknik", permanent: true },
      { source: "/studieteknik.html", destination: "/studieteknik", permanent: true },
      { source: "/platform", destination: "/plattform", permanent: true },
      { source: "/login.html", destination: "/login", permanent: true },
      { source: "/sign-in", destination: "/login?mode=sign-in", permanent: false },
      { source: "/sign-up", destination: "/login?mode=sign-up", permanent: false },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/plattform", destination: "/legacy-platform/index.html" },
        { source: "/login", destination: "/legacy-platform/login.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      { source: "/plattform", headers: noIndexHeaders },
      { source: "/login", headers: noIndexHeaders },
      { source: "/legacy-platform/:path*", headers: noIndexHeaders },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
