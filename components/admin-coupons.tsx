"use client";

import { useCallback, useEffect, useState } from "react";

type Coupon = {
  code: string;
  credits: number;
  max_redemptions: number | null;
  redeemed_count: number;
  expires_at: string | null;
  active: number;
  note: string | null;
  created_at: string;
};

export type CouponsT = {
  title: string;
  codeLabel: string;
  creditsLabel: string;
  maxLabel: string;
  expiresLabel: string;
  noteLabel: string;
  notePlaceholder: string;
  createBtn: string;
  createFail: string;
  thCode: string;
  thCredits: string;
  thUses: string;
  thExpiry: string;
  thStatus: string;
  thManage: string;
  active: string;
  expired: string;
  exhausted: string;
  stopped: string;
  expiredTitle: string;
  exhaustedTitle: string;
  stoppedTitle: string;
  deleteBtn: string;
  deleteConfirm: string;
  noCoupons: string;
  noExpiry: string;
};

const inputCls =
  "w-full border border-ink-line bg-ink px-3 py-2.5 text-sm text-paper placeholder:text-paper-faint focus:border-lime focus:outline-none";

export default function AdminCoupons({ t }: { t: CouponsT }) {
  const [now] = useState(() => Date.now());
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState("");
  const [credits, setCredits] = useState("");
  const [maxRed, setMaxRed] = useState("");
  const [expires, setExpires] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fmtDate = (iso: string | null): string => {
    if (!iso) return t.noExpiry;
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const load = useCallback(
    () =>
      fetch("/api/admin/coupons", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => d.coupons && setCoupons(d.coupons))
        .catch(() => {}),
    []
  );
  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code: code.trim() || undefined,
        credits: Number(credits),
        maxRedemptions: maxRed.trim() === "" ? null : Number(maxRed),
        expiresAt: expires || null,
        note: note.trim() || undefined,
      }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? t.createFail);
      return;
    }
    setCode("");
    setCredits("");
    setMaxRed("");
    setExpires("");
    setNote("");
    await load();
  };

  const toggle = async (c: Coupon) => {
    await fetch(`/api/admin/coupons/${encodeURIComponent(c.code)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    await load();
  };

  const remove = async (c: Coupon) => {
    if (!confirm(t.deleteConfirm.replace("{code}", c.code))) return;
    await fetch(`/api/admin/coupons/${encodeURIComponent(c.code)}`, { method: "DELETE" });
    await load();
  };

  return (
    <section>
      <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-paper-faint">
        {t.title.replace("{n}", String(coupons.length))}
      </h2>

      {/* 생성 폼 */}
      <form
        onSubmit={create}
        className="grid gap-3 border border-ink-line bg-ink-soft p-5 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
      >
        <div className="lg:col-span-1">
          <p className="mb-1 font-mono text-[10px] tracking-[0.15em] text-paper-faint">{t.codeLabel}</p>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME50" className={inputCls} />
        </div>
        <div>
          <p className="mb-1 font-mono text-[10px] tracking-[0.15em] text-paper-faint">{t.creditsLabel}</p>
          <input
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            type="number"
            min={1}
            required
            placeholder="500"
            className={inputCls}
          />
        </div>
        <div>
          <p className="mb-1 font-mono text-[10px] tracking-[0.15em] text-paper-faint">{t.maxLabel}</p>
          <input value={maxRed} onChange={(e) => setMaxRed(e.target.value)} type="number" min={1} placeholder="100" className={inputCls} />
        </div>
        <div>
          <p className="mb-1 font-mono text-[10px] tracking-[0.15em] text-paper-faint">{t.expiresLabel}</p>
          <input value={expires} onChange={(e) => setExpires(e.target.value)} type="date" className={inputCls} />
        </div>
        <div>
          <p className="mb-1 font-mono text-[10px] tracking-[0.15em] text-paper-faint">{t.noteLabel}</p>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.notePlaceholder} className={inputCls} />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="bg-lime px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-lime-deep disabled:opacity-50"
        >
          {t.createBtn}
        </button>
      </form>
      {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}

      {/* 목록 */}
      <div className="mt-4 overflow-x-auto border border-ink-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-line bg-ink-soft font-mono text-[11px] uppercase tracking-[0.15em] text-paper-faint">
              <th className="px-4 py-3 font-medium">{t.thCode}</th>
              <th className="px-4 py-3 font-medium">{t.thCredits}</th>
              <th className="px-4 py-3 font-medium">{t.thUses}</th>
              <th className="px-4 py-3 font-medium">{t.thExpiry}</th>
              <th className="px-4 py-3 font-medium">{t.thStatus}</th>
              <th className="px-4 py-3 font-medium">{t.thManage}</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => {
              const expired = c.expires_at != null && new Date(c.expires_at).getTime() < now;
              const exhausted = c.max_redemptions != null && c.redeemed_count >= c.max_redemptions;
              return (
                <tr key={c.code} className="border-b border-ink-line/60 last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold">{c.code}</span>
                    {c.note && <p className="text-xs text-paper-faint">{c.note}</p>}
                  </td>
                  <td className="px-4 py-3 font-mono text-lime">+{c.credits.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-paper-dim">
                    {c.redeemed_count.toLocaleString()} / {c.max_redemptions == null ? "∞" : c.max_redemptions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-paper-faint">{fmtDate(c.expires_at)}</td>
                  <td className="px-4 py-3">
                    {c.active && !expired && !exhausted ? (
                      <button onClick={() => toggle(c)} className="bg-lime px-2.5 py-1 text-xs font-semibold text-ink">
                        {t.active}
                      </button>
                    ) : (
                      <button
                        onClick={() => toggle(c)}
                        className="border border-ink-line px-2.5 py-1 text-xs font-semibold text-paper-faint hover:border-lime"
                        title={expired ? t.expiredTitle : exhausted ? t.exhaustedTitle : t.stoppedTitle}
                      >
                        {expired ? t.expired : exhausted ? t.exhausted : t.stopped}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(c)} className="text-xs text-paper-faint hover:text-red-600">
                      {t.deleteBtn}
                    </button>
                  </td>
                </tr>
              );
            })}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-paper-faint">
                  {t.noCoupons}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
