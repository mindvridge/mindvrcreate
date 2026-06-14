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

function fmtDate(iso: string | null): string {
  if (!iso) return "무기한";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

const inputCls =
  "w-full border border-ink-line bg-ink px-3 py-2.5 text-sm text-paper placeholder:text-paper-faint focus:border-lime focus:outline-none";

export default function AdminCoupons() {
  const [now] = useState(() => Date.now());
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState("");
  const [credits, setCredits] = useState("");
  const [maxRed, setMaxRed] = useState("");
  const [expires, setExpires] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      setError(json.error ?? "생성 실패");
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
    if (!confirm(`쿠폰 ${c.code} 을(를) 삭제할까요? (지급 이력은 유지됩니다)`)) return;
    await fetch(`/api/admin/coupons/${encodeURIComponent(c.code)}`, { method: "DELETE" });
    await load();
  };

  return (
    <section>
      <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-paper-faint">
        COUPONS · 쿠폰 {coupons.length}개
      </h2>

      {/* 생성 폼 */}
      <form
        onSubmit={create}
        className="grid gap-3 border border-ink-line bg-ink-soft p-5 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
      >
        <div className="lg:col-span-1">
          <p className="mb-1 font-mono text-[10px] tracking-[0.15em] text-paper-faint">코드(빈칸=자동)</p>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME50" className={inputCls} />
        </div>
        <div>
          <p className="mb-1 font-mono text-[10px] tracking-[0.15em] text-paper-faint">지급 크레딧 *</p>
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
          <p className="mb-1 font-mono text-[10px] tracking-[0.15em] text-paper-faint">최대 사용(빈칸=무제한)</p>
          <input value={maxRed} onChange={(e) => setMaxRed(e.target.value)} type="number" min={1} placeholder="100" className={inputCls} />
        </div>
        <div>
          <p className="mb-1 font-mono text-[10px] tracking-[0.15em] text-paper-faint">만료일(선택)</p>
          <input value={expires} onChange={(e) => setExpires(e.target.value)} type="date" className={inputCls} />
        </div>
        <div>
          <p className="mb-1 font-mono text-[10px] tracking-[0.15em] text-paper-faint">메모(선택)</p>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="신규 가입 프로모션" className={inputCls} />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="bg-lime px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-lime-deep disabled:opacity-50"
        >
          쿠폰 생성
        </button>
      </form>
      {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}

      {/* 목록 */}
      <div className="mt-4 overflow-x-auto border border-ink-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-line bg-ink-soft font-mono text-[11px] uppercase tracking-[0.15em] text-paper-faint">
              <th className="px-4 py-3 font-medium">코드</th>
              <th className="px-4 py-3 font-medium">크레딧</th>
              <th className="px-4 py-3 font-medium">사용/한도</th>
              <th className="px-4 py-3 font-medium">만료</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">관리</th>
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
                        활성
                      </button>
                    ) : (
                      <button
                        onClick={() => toggle(c)}
                        className="border border-ink-line px-2.5 py-1 text-xs font-semibold text-paper-faint hover:border-lime"
                        title={expired ? "만료됨" : exhausted ? "소진됨" : "중지됨"}
                      >
                        {expired ? "만료" : exhausted ? "소진" : "중지"}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(c)} className="text-xs text-paper-faint hover:text-red-600">
                      삭제
                    </button>
                  </td>
                </tr>
              );
            })}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-paper-faint">
                  생성된 쿠폰이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
