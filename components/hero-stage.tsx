"use client";

import { useEffect, useRef, useState } from "react";
import Waveform from "./waveform";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 히어로 아바타 스테이지.
 * videoSrc가 주어지면 무음 자동재생 루프 + "소리 켜기" 토글로 동작하고,
 * 없으면 AI 생성 휴먼 이미지에 프로덕션 오버레이를 얹은 정지 스테이지를 보여준다.
 * (마브 API로 토킹헤드 데모가 나오면 videoSrc만 지정하면 됨)
 */
export default function HeroStage({ videoSrc }: { videoSrc?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [timecode, setTimecode] = useState("00:00:00:00");

  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => {
      const elapsed = (performance.now() - start) / 1000;
      const h = Math.floor(elapsed / 3600);
      const m = Math.floor((elapsed % 3600) / 60);
      const s = Math.floor(elapsed % 60);
      const f = Math.floor((elapsed % 1) * 24);
      const pad = (n: number) => String(n).padStart(2, "0");
      setTimecode(`${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`);
    }, 1000 / 24);
    return () => clearInterval(id);
  }, []);

  const toggleSound = () => {
    setMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  };

  const chip =
    "rounded-sm bg-black/45 px-2.5 py-1 font-mono text-[11px] tracking-widest text-white backdrop-blur-sm";

  return (
    // 모바일은 세로(4:5), 데스크톱은 16:9 — 9:16 세로 데모 영상 확보 시 모바일 비율을 9/16로 조정
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-ink-line bg-ink-soft shadow-[0_24px_60px_-30px_rgb(0_0_0/0.25)] sm:aspect-video">
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={`${BASE}/images/hero.jpg`}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={`${BASE}/images/hero.jpg`}
          alt="마인드브이알이 제작한 AI 휴먼 프레젠터"
          className="h-full w-full object-cover"
        />
      )}

      {/* 하단 그라데이션 — 오버레이 가독용 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />

      {/* 상단 좌: 라이브 도트 + 라벨 / 상단 우: 해상도 */}
      <div className={`absolute left-4 top-4 flex items-center gap-2 ${chip}`}>
        <span className="live-dot h-2 w-2 rounded-full bg-lime" />
        KO · AI HUMAN
      </div>
      <div className={`absolute right-4 top-4 ${chip}`}>1080p · 24fps</div>

      {/* 하단 좌: 타임코드 / 하단 중앙: 파형 / 하단 우: AI 생성 표기 */}
      <div className="absolute bottom-4 left-4 font-mono text-[12px] tracking-widest text-white/90">
        TC {timecode}
      </div>
      <Waveform
        bars={22}
        className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-white/85 sm:flex"
      />
      {videoSrc ? (
        <button
          onClick={toggleSound}
          className="absolute bottom-3 right-3 rounded-sm border border-white/30 bg-black/45 px-3 py-1.5 font-mono text-[11px] tracking-wider text-white backdrop-blur-sm transition-colors hover:border-lime hover:text-lime"
        >
          {muted ? "SOUND ON · 소리 켜기" : "SOUND OFF · 소리 끄기"}
        </button>
      ) : (
        <div className="absolute bottom-4 right-4 font-mono text-[10px] tracking-widest text-white/75">
          AI GENERATED
        </div>
      )}
    </div>
  );
}
