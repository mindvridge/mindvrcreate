"use client";

import { useEffect, useRef, useState } from "react";
import Waveform from "./waveform";

/**
 * 히어로 아바타 스테이지.
 * videoSrc가 주어지면 무음 자동재생 루프 + "소리 켜기" 토글로 동작하고,
 * 없으면(데모 확정 전) 프로덕션 모니터 톤의 플레이스홀더를 보여준다.
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

  return (
    // 모바일은 세로(4:5), 데스크톱은 16:9 — 9:16 세로 데모 영상 확보 시 모바일 비율을 9/16로 조정
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg border border-ink-line bg-ink-soft sm:aspect-video">
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <Placeholder />
      )}

      {/* 프레임 코너 마커 */}
      <FrameCorners />

      {/* 상단 좌: 라이브 도트 + 라벨 / 상단 우: 해상도 */}
      <div className="absolute left-4 top-4 flex items-center gap-2 font-mono text-[11px] tracking-widest text-paper-dim">
        <span className="live-dot h-2 w-2 rounded-full bg-lime" />
        KO · AVATAR DEMO
      </div>
      <div className="absolute right-4 top-4 font-mono text-[11px] tracking-widest text-paper-faint">
        1080p · 24fps
      </div>

      {/* 하단 좌: 타임코드 / 하단 우: 소리 토글 */}
      <div className="absolute bottom-4 left-4 font-mono text-[12px] tracking-widest text-paper-dim">
        TC {timecode}
      </div>
      {videoSrc && (
        <button
          onClick={toggleSound}
          className="absolute bottom-3 right-3 rounded-md border border-ink-line bg-ink/70 px-3 py-1.5 font-mono text-[11px] tracking-wider text-paper-dim transition-colors hover:border-lime hover:text-lime"
        >
          {muted ? "SOUND ON · 소리 켜기" : "SOUND OFF · 소리 끄기"}
        </button>
      )}
    </div>
  );
}

function FrameCorners() {
  const corner = "absolute h-5 w-5 border-paper-faint/50";
  return (
    <div aria-hidden>
      <span className={`${corner} left-2 top-2 border-l border-t`} />
      <span className={`${corner} right-2 top-2 border-r border-t`} />
      <span className={`${corner} bottom-2 left-2 border-b border-l`} />
      <span className={`${corner} bottom-2 right-2 border-b border-r`} />
    </div>
  );
}

/** 데모 영상 확정 전 플레이스홀더 — 얼굴 랜드마크 + 파형, 절제된 톤. */
function Placeholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 pb-10">
      <svg
        viewBox="0 0 120 150"
        className="h-36 w-auto text-paper-faint/60 sm:h-48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden
      >
        {/* 절제된 얼굴 랜드마크 — 윤곽 */}
        <path d="M22 62 C22 24 98 24 98 62 C98 100 86 126 60 132 C34 126 22 100 22 62 Z" opacity="0.7" />
        {/* 눈 */}
        <path d="M38 64 Q46 58 54 64" />
        <path d="M66 64 Q74 58 82 64" />
        {/* 코 */}
        <path d="M60 66 L58 86 L64 88" opacity="0.7" />
        {/* 입 — 립싱크 포인트 강조 */}
        <path d="M44 104 Q60 114 76 104 Q60 122 44 104 Z" className="text-lime" stroke="currentColor" />
        {/* 랜드마크 도트 */}
        {[
          [38, 64], [54, 64], [66, 64], [82, 64], [60, 88],
          [44, 104], [60, 110], [76, 104], [60, 118],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.6" fill="currentColor" stroke="none" />
        ))}
      </svg>

      <Waveform bars={36} className="text-lime/80" />

      <p className="px-6 text-center font-mono text-[11px] tracking-widest text-paper-faint">
        HERO DEMO — IN PRODUCTION · LONGCAT-VIDEO-AVATAR 1.5 + COSYVOICE 2 (KO)
      </p>
    </div>
  );
}
