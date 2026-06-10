import type { NextConfig } from "next";

// GitHub Pages 배포 시(프로젝트 페이지) 저장소 이름이 URL 경로에 들어가므로
// 워크플로에서 NEXT_PUBLIC_BASE_PATH=/mindvrcreate 를 주입한다.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
};

export default nextConfig;
