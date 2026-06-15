import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "마인드브이알 MindVR — 한국어 특화 AI 아바타 스튜디오",
  description:
    "한국어로 자연스럽게 말하는, 당신만의 AI 휴먼을 합리적 비용에. 캐릭터·브랜드·페르소나 전용 디지털휴먼을 제작하는 스튜디오. 캐릭터 IP는 100% 고객 소유.",
  openGraph: {
    title: "마인드브이알 MindVR — 한국어 특화 AI 아바타 스튜디오",
    description:
      "한국어로 자연스럽게 말하는, 당신만의 AI 휴먼을 합리적 비용에. 테스트 랩에서 직접 만들어 보세요.",
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
