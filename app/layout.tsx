import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "마인드브이알 MindVR — 한국어 특화 AI 아바타 스튜디오",
  description:
    "한국어로 자연스럽게 말하는, 당신만의 AI 휴먼을 합리적 비용에. 자체 NVIDIA B200과 검증된 오픈소스 SOTA 엔진으로 만드는 맞춤형 디지털휴먼 스튜디오. 캐릭터 IP는 100% 고객 소유.",
  openGraph: {
    title: "마인드브이알 MindVR — 한국어 특화 AI 아바타 스튜디오",
    description:
      "한국어로 자연스럽게 말하는, 당신만의 AI 휴먼을 합리적 비용에. 무료 아바타 데모로 직접 확인하세요.",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
