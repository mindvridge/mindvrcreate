"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CREDIT_COSTS,
  CREDIT_PACKS,
  SERVICE_LABELS,
  WON_PER_CREDIT,
  type Service,
} from "@/lib/credits";

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

const TYPE_LABEL: Record<string, string> = {
  signup_bonus: "가입 보너스",
  spend: "사용",
  grant: "충전",
  refund: "환불",
  coupon: "쿠폰",
};

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

export default function AccountPanel({
  initialCredits,
  unlimited,
  name,
  email,
}: {
  initialCredits: number;
  unlimited: boolean;
  name: string;
  email: string;
}) {
  const [credits, setCredits] = useState(initialCredits);
  const [logs, setLogs] = useState<Log[]>([]);
  const [usage, setUsage] = useState<Usage[]>([]);

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
  }, [loadUsage]);

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
      setCouponMsg({ ok: false, text: json.error ?? "쿠폰을 사용할 수 없습니다." });
      return;
    }
    setCredits(json.balance);
    setCoupon("");
    setCouponMsg({ ok: true, text: `${json.credits.toLocaleString()} 크레딧이 충전되었습니다!` });
    await loadUsage();
  };

  return (
    <div className="space-y-14">
      {/* 잔액 */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border border-ink-line bg-ink-soft p-8">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-paper-faint">현재 잔액</p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight">
              {unlimited ? (
                <span className="text-lime">무제한</span>
              ) : (
                <>
                  {credits.toLocaleString()}
                  <span className="ml-2 text-lg font-medium text-paper-faint">크레딧</span>
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-paper-faint">
              {name} · {email}
            </p>
          </div>
          <a href="/test" className="bg-lime px-6 py-3 text-sm font-bold text-ink hover:bg-lime-deep">
            테스트 랩에서 사용하기
          </a>
        </div>
      </section>

      {/* 쿠폰 등록 */}
      <section>
        <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-paper-faint">COUPON · 쿠폰 등록</h2>
        <form onSubmit={redeem} className="flex flex-wrap items-center gap-3 border border-ink-line bg-ink p-5">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="쿠폰 코드 입력 (예: WELCOME50)"
            className="min-w-[220px] flex-1 border border-ink-line bg-ink px-4 py-3 text-sm uppercase tracking-wider text-paper placeholder:text-paper-faint placeholder:normal-case focus:border-lime focus:outline-none"
          />
          <button
            type="submit"
            disabled={couponBusy || !coupon.trim()}
            className="bg-lime px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-lime-deep disabled:opacity-50"
          >
            {couponBusy ? "확인 중…" : "등록"}
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
        <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-paper-faint">PRICE · 서비스별 크레딧 단가</h2>
        <div className="grid grid-cols-2 gap-px border border-ink-line bg-ink-line sm:grid-cols-3 lg:grid-cols-5">
          {(["llm", "tts", "image", "video", "avatar"] as Service[]).map((s) => (
            <div key={s} className="bg-ink p-5">
              <p className="font-mono text-[10px] tracking-[0.15em] text-paper-faint">
                {SERVICE_LABELS[s]}
              </p>
              <p className="mt-2 text-2xl font-extrabold">{CREDIT_COSTS[s]}</p>
              <p className="mt-0.5 text-xs text-paper-faint">크레딧 / 회</p>
            </div>
          ))}
        </div>
      </section>

      {/* 충전 패키지 */}
      <section>
        <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-paper-faint">RECHARGE · 충전 패키지</h2>
        <div className="grid gap-px border border-ink-line bg-ink-line sm:grid-cols-3">
          {CREDIT_PACKS.map((p) => {
            const total = p.credits + Math.round((p.credits * p.bonusPct) / 100);
            return (
              <div key={p.id} className="bg-ink p-6">
                <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint">{p.name}</p>
                <p className="mt-3 text-2xl font-extrabold tracking-tight">
                  ₩{p.krw.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-paper-dim">
                  {total.toLocaleString()} 크레딧
                  {p.bonusPct > 0 && <span className="ml-1 text-lime">+{p.bonusPct}%</span>}
                </p>
                <p className="mt-1 text-xs text-paper-faint">
                  크레딧당 약 ₩{(p.krw / total).toFixed(1)}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-paper-faint">
          * 기준 단가 1크레딧 ≈ ₩{WON_PER_CREDIT}. 현재는 결제 연동 전이라 충전은 쿠폰 또는 관리자에게
          문의해 주세요.
        </p>
      </section>

      {/* 사용 내역 */}
      <section>
        <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-paper-faint">HISTORY · 내 사용 내역</h2>
        <div className="overflow-x-auto border border-ink-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-line bg-ink-soft font-mono text-[11px] uppercase tracking-[0.15em] text-paper-faint">
                <th className="px-4 py-3 font-medium">시각</th>
                <th className="px-4 py-3 font-medium">구분</th>
                <th className="px-4 py-3 font-medium">서비스</th>
                <th className="px-4 py-3 font-medium">크레딧</th>
                <th className="px-4 py-3 font-medium">잔액</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-ink-line/60 last:border-0">
                  <td className="px-4 py-2.5 text-xs text-paper-faint">{fmtTime(l.created_at)}</td>
                  <td className="px-4 py-2.5">{TYPE_LABEL[l.type] ?? l.type}</td>
                  <td className="px-4 py-2.5 text-paper-dim">
                    {l.service ? SERVICE_LABELS[l.service as Service] ?? l.service : "—"}
                  </td>
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
                    아직 사용 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {usage.length > 0 && (
          <p className="mt-3 text-xs text-paper-faint">
            누적: {usage.map((u) => `${SERVICE_LABELS[u.service as Service] ?? u.service} ${u.count}회`).join(" · ")}
          </p>
        )}
      </section>
    </div>
  );
}
