export default function Footer() {
  return (
    <footer className="border-t border-ink-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-extrabold tracking-tight">MindVR</p>
          <p className="mt-1 text-sm text-paper-faint">
            마인드브이알 — 한국어 특화 AI 아바타 스튜디오
          </p>
          <a
            href="mailto:mindvridge.official@gmail.com"
            className="mt-3 inline-block text-sm text-paper-dim transition-colors hover:text-lime"
          >
            mindvridge.official@gmail.com
          </a>
        </div>

        <div className="font-mono text-[11px] leading-relaxed tracking-wider text-paper-faint">
          <p>GOV R&D RS-2026-25508342</p>
          <p>PATENT 10-2026-0007692 · 10-2026-0007697</p>
        </div>
      </div>

      {/* 사업자 정보 (전자상거래법 표기) */}
      <div className="border-t border-ink-line/60">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-faint">
            사업자 정보
          </p>
          <div className="mt-2 flex flex-col gap-x-5 gap-y-1 text-xs leading-relaxed text-paper-faint sm:flex-row sm:flex-wrap">
            <span>상호 <span className="text-paper-dim">주식회사 마인드브이알</span></span>
            <span>대표자 <span className="text-paper-dim">이대엽</span></span>
            <span>사업자등록번호 <span className="text-paper-dim">654-86-02376</span></span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-paper-faint">
            주소{" "}
            <span className="text-paper-dim">
              충청남도 천안시 서북구 천안천4길 32 (와촌동, 천안역세권 지역전략사업지원 행복주택)
            </span>
          </p>
        </div>
      </div>

      <div className="border-t border-ink-line/60 py-5 text-center text-xs text-paper-faint">
        © {new Date().getFullYear()} 주식회사 마인드브이알. All rights reserved.
      </div>
    </footer>
  );
}
