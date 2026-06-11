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
      <div className="border-t border-ink-line/60 py-5 text-center text-xs text-paper-faint">
        © {new Date().getFullYear()} MindVR. All rights reserved.
      </div>
    </footer>
  );
}
