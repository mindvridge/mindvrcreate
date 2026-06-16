import { getDict } from "@/lib/i18n-server";

export default async function Footer() {
  const t = await getDict();
  const f = t.footer;
  return (
    <footer className="border-t border-ink-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-extrabold tracking-tight">MindVR</p>
          <p className="mt-1 text-sm text-paper-faint">{f.tagline}</p>
          <a
            href="tel:1688-0623"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-paper-dim transition-colors hover:text-lime"
          >
            <span className="font-mono tracking-wider">{f.phoneLabel} 1688-0623</span>
          </a>
          <a
            href="mailto:mindvridge.official@gmail.com"
            className="mt-1 inline-block text-sm text-paper-dim transition-colors hover:text-lime"
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
            {f.bizInfo}
          </p>
          <div className="mt-2 flex flex-col gap-x-5 gap-y-1 text-xs leading-relaxed text-paper-faint sm:flex-row sm:flex-wrap">
            <span>{f.company} <span className="text-paper-dim">{f.companyName}</span></span>
            <span>{f.ceo} <span className="text-paper-dim">{f.ceoName}</span></span>
            <span>{f.bizNo} <span className="text-paper-dim">654-86-02376</span></span>
            <span>{f.phoneLabel} <span className="text-paper-dim">1688-0623</span></span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-paper-faint">
            {f.address} <span className="text-paper-dim">{f.addressValue}</span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-paper-faint">
            {f.hq} <span className="text-paper-dim">{f.hqValue}</span>
          </p>
        </div>
      </div>

      <div className="border-t border-ink-line/60 py-5 text-center text-xs text-paper-faint">
        © {new Date().getFullYear()} {f.companyName}. {f.rights}
      </div>
    </footer>
  );
}
