"use client";

import { useCallback, useEffect, useState } from "react";
import { SERVICE_LABELS, type Service } from "@/lib/credits";
import AdminCoupons from "./admin-coupons";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  credits: number;
  unlimited: number;
  is_admin: number;
  created_at: string;
  spent: number;
};

type Usage = { service: string; count: number; credits: number };

type Log = {
  id: number;
  email?: string;
  name?: string;
  type: string;
  service: string | null;
  amount: number;
  unlimited: number;
  balance_after: number;
  job_id: string | null;
  note: string | null;
  created_at: string;
};

const TYPE_LABEL: Record<string, string> = {
  signup_bonus: "가입 보너스",
  spend: "사용",
  grant: "충전",
  refund: "환불",
  coupon: "쿠폰",
};

function serviceLabel(s: string | null): string {
  if (!s) return "—";
  return SERVICE_LABELS[s as Service] ?? s;
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usage, setUsage] = useState<Usage[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [filterUser, setFilterUser] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(
    () =>
      fetch("/api/admin/users", { cache: "no-store" })
        .then((r) => r.json())
        .then((json) => {
          if (json.users) {
            setUsers(json.users);
            setUsage(json.usage);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false)),
    []
  );

  const loadLogs = useCallback(
    (userId: string) =>
      fetch(`/api/admin/logs${userId ? `?user_id=${userId}` : ""}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((json) => json.logs && setLogs(json.logs))
        .catch(() => {}),
    []
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);
  useEffect(() => {
    loadLogs(filterUser);
  }, [filterUser, loadLogs]);

  const grant = async (id: string) => {
    const input = prompt("충전할 크레딧 (차감은 음수, 예: 1000 또는 -500)");
    if (input === null) return;
    const amount = parseInt(input, 10);
    if (!Number.isFinite(amount) || amount === 0) return;
    const res = await fetch(`/api/admin/users/${id}/credits`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    if (res.ok) {
      await loadUsers();
      await loadLogs(filterUser);
    } else {
      alert((await res.json()).error ?? "실패");
    }
  };

  const toggleUnlimited = async (u: AdminUser) => {
    const res = await fetch(`/api/admin/users/${u.id}/unlimited`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ unlimited: !u.unlimited }),
    });
    if (res.ok) await loadUsers();
  };

  if (loading) return <p className="font-mono text-sm text-paper-faint">로딩 중…</p>;

  return (
    <div className="space-y-14">
      {/* 서비스별 소모 집계 */}
      <section>
        <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-paper-faint">SERVICE USAGE · 서비스별 소모</h2>
        <div className="grid grid-cols-2 gap-px border border-ink-line bg-ink-line sm:grid-cols-3 lg:grid-cols-5">
          {(["llm", "tts", "image", "video", "avatar"] as Service[]).map((s) => {
            const row = usage.find((u) => u.service === s);
            return (
              <div key={s} className="bg-ink-soft p-5">
                <p className="font-mono text-[10px] tracking-[0.15em] text-paper-faint">
                  {SERVICE_LABELS[s]}
                </p>
                <p className="mt-2 text-2xl font-extrabold">{row?.credits ?? 0}</p>
                <p className="mt-0.5 text-xs text-paper-faint">{row?.count ?? 0}회 · 크레딧</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 사용자 테이블 */}
      <section>
        <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-paper-faint">
          USERS · 사용자 {users.length}명
        </h2>
        <div className="overflow-x-auto border border-ink-line">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-line bg-ink-soft font-mono text-[11px] uppercase tracking-[0.15em] text-paper-faint">
                <th className="px-4 py-3 font-medium">이름 · 이메일</th>
                <th className="px-4 py-3 font-medium">잔액</th>
                <th className="px-4 py-3 font-medium">누적 소모</th>
                <th className="px-4 py-3 font-medium">무제한</th>
                <th className="px-4 py-3 font-medium">가입일</th>
                <th className="px-4 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-ink-line/60 last:border-0">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setFilterUser(u.id)}
                      className="text-left hover:text-lime"
                      title="이 사용자 로그 보기"
                    >
                      <span className="font-semibold">{u.name}</span>
                      {u.is_admin === 1 && <span className="ml-1.5 text-[10px] text-lime">ADMIN</span>}
                      <br />
                      <span className="text-xs text-paper-faint">{u.email}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {u.unlimited ? <span className="text-lime">무제한</span> : u.credits.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-paper-dim">{u.spent.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleUnlimited(u)}
                      className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
                        u.unlimited
                          ? "bg-lime text-ink"
                          : "border border-ink-line text-paper-dim hover:border-lime"
                      }`}
                    >
                      {u.unlimited ? "ON" : "OFF"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-paper-faint">{fmtTime(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => grant(u.id)}
                      className="border border-ink-line px-3 py-1 text-xs font-semibold hover:border-lime hover:text-lime"
                    >
                      크레딧 충전
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 쿠폰 관리 */}
      <AdminCoupons />

      {/* 사용 로그 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-xs tracking-[0.2em] text-paper-faint">
            LOGS · 사용 로그 {filterUser && "(필터됨)"}
          </h2>
          {filterUser && (
            <button onClick={() => setFilterUser("")} className="text-xs text-lime hover:underline">
              전체 보기
            </button>
          )}
        </div>
        <div className="overflow-x-auto border border-ink-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-line bg-ink-soft font-mono text-[11px] uppercase tracking-[0.15em] text-paper-faint">
                <th className="px-4 py-3 font-medium">시각</th>
                <th className="px-4 py-3 font-medium">사용자</th>
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
                  <td className="px-4 py-2.5 text-xs">{l.name ?? l.email}</td>
                  <td className="px-4 py-2.5">
                    {TYPE_LABEL[l.type] ?? l.type}
                    {l.unlimited === 1 && l.type === "spend" && (
                      <span className="ml-1 text-[10px] text-lime">무제한</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-paper-dim">{serviceLabel(l.service)}</td>
                  <td
                    className={`px-4 py-2.5 font-mono ${
                      l.amount < 0 ? "text-paper-dim" : "text-lime"
                    }`}
                  >
                    {l.amount > 0 ? "+" : ""}
                    {l.amount}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-paper-faint">{l.balance_after}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-paper-faint">
                    로그가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
