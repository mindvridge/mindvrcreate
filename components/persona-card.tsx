"use client";

import { useRef, useState } from "react";

/**
 * 페르소나 카드 — videoSrc가 있으면 호버(모바일: 탭) 시 음성과 함께 재생.
 * 정지 상태에서는 포스터 이미지를 보여준다.
 */
export default function PersonaCard({
  label,
  en,
  tc,
  img,
  videoSrc,
}: {
  label: string;
  en: string;
  tc: string;
  img: string;
  videoSrc?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
    setPlaying(true);
  };
  const stop = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    setPlaying(false);
  };

  return (
    <div
      className="group relative aspect-[3/4] overflow-hidden bg-ink"
      onMouseEnter={videoSrc ? play : undefined}
      onMouseLeave={videoSrc ? stop : undefined}
      onTouchStart={videoSrc ? (playing ? stop : play) : undefined}
    >
      <img
        src={img}
        alt={`AI 생성 가상 인물 — ${label}`}
        className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${
          playing ? "opacity-0" : "opacity-100"
        }`}
      />
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          loop
          playsInline
          preload="metadata"
          className={`absolute inset-0 h-full w-full object-cover ${
            playing ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
        <div>
          <p className="text-sm font-bold text-white">{label}</p>
          <p className="font-mono text-[10px] tracking-[0.2em] text-white/70">{en}</p>
        </div>
        <p className="font-mono text-[10px] text-white/70">
          {videoSrc && !playing ? "HOVER · 재생" : tc}
        </p>
      </div>

      <span className="absolute right-3 top-3 rounded-sm bg-black/45 px-2 py-0.5 font-mono text-[9px] tracking-widest text-white/85 backdrop-blur-sm">
        AI GENERATED
      </span>
      <span
        className={`absolute left-3 top-3 live-dot h-1.5 w-1.5 rounded-full bg-lime transition-opacity ${
          playing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />
    </div>
  );
}
