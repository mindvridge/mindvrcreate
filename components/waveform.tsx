/** 오디오 파형 모티프 — 장식은 프로덕션 도구의 언어로만 한다. */
export default function Waveform({
  bars = 28,
  className = "",
  animated = true,
}: {
  bars?: number;
  className?: string;
  animated?: boolean;
}) {
  return (
    <div className={`flex items-center gap-[3px] ${className}`} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`w-[2px] rounded-full bg-current ${animated ? "wave-bar" : ""}`}
          style={{
            height: `${8 + ((i * 37) % 17)}px`,
            animationDelay: `${(i % 9) * 0.09}s`,
          }}
        />
      ))}
    </div>
  );
}
