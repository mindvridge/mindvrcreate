"use client";

import { useCallback, useEffect, useState } from "react";
import { CREDIT_COSTS, CREDIT_PACKS, WON_PER_CREDIT, type Service } from "@/lib/credits";

type Log = {
  id: number;
  type: string;
  service: string | null;
  amount: number;
  unlimited: number;
  balance_after: number;
  created_at: string;
};
type Usage = { service: string; count: number; credits: number };
type Creation = {
  id: number;
  job_id: string;
  service: string;
  kind: "image" | "video" | "audio";
  prompt: string | null;
  created_at: string;
};

type ServiceLabels = Record<Service, string>;
type AccountT = {
  balance: string;
  unlimited: string;
  creditsUnit: string;
  useInLab: string;
  galleryTitle: string;
  refresh: string;
  emptyLead: string;
  testLab: string;
  emptyTail: string;
  galleryNote: string;
  couponTitle: string;
  couponPlaceholder: string;
  couponChecking: string;
  couponSubmit: string;
  couponFail: string;
  couponSuccess: string;
  priceTitle: string;
  creditPerRun: string;
  rechargeTitle: string;
  perCredit: string;
  packNote: string;
  historyTitle: string;
  thTime: string;
  thType: string;
  thService: string;
  thCredits: string;
  thBalance: string;
  noHistory: string;
  cumulative: string;
  usageUnit: string;
  typeLabels: Record<string, string>;
  kindLabels: Record<string, string>;
  creationErr: string;
  creationAlt: string;
  save: string;
};

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

function CreationCard({ c, t }: { c: Creation; t: AccountT }) {
  const [err, setErr] = useState(false);
  const url = `/api/account/creations/${c.id}/file`;
  const ext = c.kind === "image" ? "png" : c.kind === "video" ? "mp4" : "wav";

  return (
    <div className="flex flex-col border border-ink-line bg-ink">
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-ink-soft">
        {err ? (
          <span className="px-3 text-center text-xs text-paper-faint">{t.creationErr}</span>
        ) : c.kind === "image" ? (
          <a href={url} target="_blank" rel="noreferrer" className="h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={c.prompt ?? t.creationAlt} onError={() => setErr(true)} className="h-full w-full cursor-zoom-in object-cover" />
          </a>
        ) : c.kind === "video" ? (
          <video src={url} controls playsInline onError={() => setErr(true)} className="h-full w-full object-cover" />
        ) : (
          <div className="flex w-full flex-col items-center gap-3 px-4">
            <span className="text-3xl">♪</span>
            <audio src={url} controls onError={() => setErr(true)} className="w-full" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.15em] text-paper-faint">{t.kindLabels[c.kind]}</p>
          {c.prompt && (
            <p className="truncate text-xs text-paper-dim" title={c.prompt}>
              {c.prompt}
            </p>
          )}
        </div>
        {!err && (
          <a
            href={url}
            download={`mindvr-${c.id}.${ext}`}
            className="shrink-0 text-[11px] font-semibold text-paper-faint hover:text-lime"
          >
            {t.save}
          </a>
        )}
      </div>
    </div>
  );
}

export default function AccountPanel({
  initialCredits,
  unlimited,
  name,
  email,
  t,
  serviceLabels,
  packNames,
}: {
  initialCredits: number;
  unlimited: boolean;
  name: string;
  email: string;
  t: AccountT;
  serviceLabels: ServiceLabels;
  packNames: Record<string, string>;
}) {
  const [credits, setCredits] = useState(initialCredits);
  const [logs, setLogs] = useState<Log[]>([]);
  const [usage, setUsage] = useState<Usage[]>([]);
  const [creations, setCreations] = useState<Creation[]>([]);

  const loadCreations = useCallback(
    () =>
      fetch("/api/account/creations", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d.items)) setCreations(d.items);
        })
        .catch(() => {}),
    []
  );

  // 쿠폰
  const [coupon, setCoupon] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const loadUsage = useCallback(
    () =>
      fetch("/api/account/usage", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (d.logs) setLogs(d.logs);
          if (d.usage) setUsage(d.usage);
        })
        .catch(() => {}),
    []
  );
  useEffect(() => {
    loadUsage();
    loadCreations();
  }, [loadUsage, loadCreations]);

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponBusy(true);
    setCouponMsg(null);
    const res = await fetch("/api/coupons/redeem", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: coupon }),
    });
    const json = await res.json();
    setCouponBusy(false);
    if (!res.ok) {
      setCouponMsg({ ok: false, text: json.error ?? t.couponFail });
      return;
    }
    setCredits(json.balance);
    setCoupon("");
    setCouponMsg({ ok: true, text: t.couponSuccess.replace("{n}", json.credits.toLocaleString()) });
    await loadUsage();
  };

  const svc = (s: string) => serviceLabels[s as Service] ?? s;

  return (
    <div className="space-y-14">
      {/* 잔액 */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border border-ink-line bg-ink-soft p-8">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-paper-faint">{t.balance}</p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight">
              {unlimited ? (
                <span className="text-lime">{t.unlimited}</span>
              ) : (
                <>
                  {credits.toLocaleString()}
                  <span className="ml-2 text-lg font-medium text-paper-faint">{t.creditsUnit}</span>
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-paper-faint">
              {name} · {email}
            </p>
          </div>
          <a href="/test" className="bg-lime px-6 py-3 text-sm font-bold text-ink hover:bg-lime-deep">
            {t.useInLab}
          </a>
        </div>
      </section>

      {/* 내 갤러리 — 테스트 랩 생성물 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-xs tracking-[0.2em] text-paper-faint">{t.galleryTitle}</h2>
          <button
            onClick={loadCreations}
            className="font-mono text-[11px] tracking-[0.15em] text-paper-faint transition-colors hover:text-lime"
          >
            {t.refresh}
          </button>
        </div>
        {creations.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {creations.map((c) => (
              <CreationCard key={c.id} c={c} t={t} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-ink-line p-10 text-center">
            <p className="text-sm text-paper-faint">
              {t.emptyLead}
              <a href="/test" className="font-semibold text-lime underline-offset-4 hover:underline">
                {t.testLab}
              </a>
              {t.emptyTail}
            </p>
          </div>
        )}
        <p className="mt-3 text-xs text-paper-faint">{t.galleryNote}</p>
      </section>

      {/* 쿠폰 등록 */}
      <section>
        <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-paper-faint">{t.couponTitle}</h2>
        <form onSubmit={redeem} className="flex flex-wrap items-center gap-3 border border-ink-line bg-ink p-5">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder={t.couponPlaceholder}
            className="min-w-[220px] flex-1 border border-ink-line bg-ink px-4 py-3 text-sm uppercase tracking-wider text-paper placeholder:text-paper-faint placeholder:normal-case focus:border-lime focus:outline-none"
          />
          <button
            type="submit"
            disabled={couponBusy || !coupon.trim()}
            className="bg-lime px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-lime-deep disabled:opacity-50"
          >
            {couponBusy ? t.couponChecking : t.couponSubmit}
          </button>
          {couponMsg && (
            <p className={`w-full text-sm font-semibold ${couponMsg.ok ? "text-lime" : "text-red-600"}`}>
              {couponMsg.text}
            </p>
          )}
        </form>
      </section>

      {/* 서비스별 단가 */}
      <section>
        <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-paper-faint">{t.priceTitle}</h2>
        <div className="grid grid-cols-2 gap-px border border-ink-line bg-ink-line sm:grid-cols-3 lg:grid-cols-6">
          {(["llm", "tts", "image", "video", "music", "avatar"] as Service[]).map((s) => (
            <div key={s} className="bg-ink p-5">
              <p className="font-mono text-[10px] tracking-[0.15em] text-paper-faint">{serviceLabels[s]}</p>
              <p className="mt-2 text-2xl font-extrabold">{CREDIT_COSTS[s]}</p>
              <p className="mt-0.5 text-xs text-paper-faint">{t.creditPerRun}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 충전 패키지 */}
      <section>
        <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-paper-faint">{t.rechargeTitle}</h2>
        <div className="grid gap-px border border-ink-line bg-ink-line sm:grid-cols-3">
          {CREDIT_PACKS.map((p) => {
            const total = p.credits + Math.round((p.credits * p.bonusPct) / 100);
            return (
              <div key={p.id} className="bg-ink p-6">
                <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint">{packNames[p.id] ?? p.name}</p>
                <p className="mt-3 text-2xl font-extrabold tracking-tight">₩{p.krw.toLocaleString()}</p>
                <p className="mt-2 text-sm text-paper-dim">
                  {total.toLocaleString()} {t.creditsUnit}
                  {p.bonusPct > 0 && <span className="ml-1 text-lime">+{p.bonusPct}%</span>}
                </p>
                <p className="mt-1 text-xs text-paper-faint">
                  {t.perCredit.replace("{x}", (p.krw / total).toFixed(1))}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-paper-faint">{t.packNote.replace("{won}", String(WON_PER_CREDIT))}</p>
      </section>

      {/* 사용 내역 */}
      <section>
        <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-paper-faint">{t.historyTitle}</h2>
        <div className="overflow-x-auto border border-ink-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-line bg-ink-soft font-mono text-[11px] uppercase tracking-[0.15em] text-paper-faint">
                <th className="px-4 py-3 font-medium">{t.thTime}</th>
                <th className="px-4 py-3 font-medium">{t.thType}</th>
                <th className="px-4 py-3 font-medium">{t.thService}</th>
                <th className="px-4 py-3 font-medium">{t.thCredits}</th>
                <th className="px-4 py-3 font-medium">{t.thBalance}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-ink-line/60 last:border-0">
                  <td className="px-4 py-2.5 text-xs text-paper-faint">{fmtTime(l.created_at)}</td>
                  <td className="px-4 py-2.5">{t.typeLabels[l.type] ?? l.type}</td>
                  <td className="px-4 py-2.5 text-paper-dim">{l.service ? svc(l.service) : "—"}</td>
                  <td className={`px-4 py-2.5 font-mono ${l.amount < 0 ? "text-paper-dim" : "text-lime"}`}>
                    {l.amount > 0 ? "+" : ""}
                    {l.amount}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-paper-faint">{l.balance_after}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-paper-faint">
                    {t.noHistory}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {usage.length > 0 && (
          <p className="mt-3 text-xs text-paper-faint">
            {t.cumulative}
            {usage.map((u) => `${svc(u.service)} ${u.count}${t.usageUnit}`).join(" · ")}
          </p>
        )}
      </section>
    </div>
  );
}
