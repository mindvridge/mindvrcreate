import Reveal from "./reveal";

/**
 * 에디토리얼 섹션 헤더 — 모노 인덱스 + 라벨을 헤어라인 위에 얹는 공통 규칙.
 * 모든 섹션이 같은 리듬을 갖게 해 템플릿 카드 반복 대신 지면(紙面)의 질서를 만든다.
 */
export default function SectionHeader({
  index,
  label,
  title,
  lede,
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
}) {
  return (
    <Reveal>
      <div className="flex items-baseline justify-between border-b border-ink-line pb-4">
        <p className="font-mono text-xs tracking-[0.25em] text-paper-faint">
          <span className="text-lime">{index}</span>
          <span className="mx-2">—</span>
          {label}
        </p>
        <span className="hidden font-mono text-[10px] tracking-[0.25em] text-paper-faint/60 sm:block">
          MINDVR
        </span>
      </div>
      <h2 className="mt-10 max-w-3xl text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">
        {title}
      </h2>
      {lede && <p className="mt-5 max-w-2xl leading-relaxed text-paper-dim">{lede}</p>}
    </Reveal>
  );
}
