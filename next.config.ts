import type { NextConfig } from "next";

// Railway 등 서버 호스팅 기준 — npm run build 후 next start로 서빙.
const nextConfig: NextConfig = {
  // pg 는 번들링하지 않고 서버에서 직접 require (동적 require 경고 회피).
  serverExternalPackages: ["pg"],
};

export default nextConfig;
