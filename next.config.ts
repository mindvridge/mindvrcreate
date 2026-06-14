import type { NextConfig } from "next";

// Railway 등 서버 호스팅 기준 — npm run build 후 next start로 서빙.
const nextConfig: NextConfig = {
  // 네이티브 모듈(better-sqlite3)은 번들링하지 않고 서버에서 직접 require.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
