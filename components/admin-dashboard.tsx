"use client";

import { useCallback, useEffect, useState } from "react";
import { type Service } from "@/lib/credits";
import AdminCoupons, { type CouponsT } from "./admin-coupons";

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

export type AdminT = {
  loading: string;
  usageTitle: string;
  usageCount: string;
  usersTitle: string;
  thNameEmail: string;
  thBalance: string;
  thSpent: string;
  thUnlimited: string;
  thJoined: string;
  thManage: string;
  viewUserLogs: string;
  unlimited: string;
  grantBtn: string;
  grantPrompt: string;
  grantFail: string;
  logsTitle: string;
  filtered: string;
  viewAll: string;
  thTime: string;
  thUser: string;
  thType: string;
  thService: string;
  thCredits: string;
  noLogs: string;
  typeLabels: Record<string, string>;
  coupons: CouponsT;
};

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

export default function AdminDashboard({
  t,
  serviceLabels,
}: {
  t: AdminT;
  serviceLabels: Record<Service, string>;
}) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usage, setUsage] = useState<Usage[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [filterUser, setFilterUser] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const svc = (s: string | null) => (s ? serviceLabels[s as Service] ?? s : "—");

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
    const input = prompt(t.grantPrompt);
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
      alert((await res.json()).error ?? t.grantFail);
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

  if (loading) return <p className="font-mono text-sm text-paper-faint">{t.loading}</p>;

  return (
    <div className="space-y-14">
      {/* 서비스별 소모 집계 */}
      <section>
        <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-paper-faint">{t.usageTitle}</h2>
        <div className="grid grid-cols-2 gap-px border border-ink-line bg-ink-line sm:grid-cols-3 lg:grid-cols-5">
          {(["llm", "tts", "image", "video", "avatar"] as Service[]).map((s) => {
            const row = usage.find((u) => u.service === s);
            return (
              <div key={s} className="bg-ink-soft p-5">
                <p className="font-mono text-[10px] tracking-[0.15em] text-paper-faint">{serviceLabels[s]}</p>
                <p className="mt-2 text-2xl font-extrabold">{row?.credits ?? 0}</p>
                <p className="mt-0.5 text-xs text-paper-faint">
                  {t.usageCount.replace("{n}", String(row?.count ?? 0))}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 사용자 테이블 */}
      <section>
        <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-paper-faint">
          {t.usersTitle.replace("{n}", String(users.length))}
        </h2>
        <div className="overflow-x-auto border border-ink-line">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-line bg-ink-soft font-mono text-[11px] uppercase tracking-[0.15em] text-paper-faint">
                <th className="px-4 py-3 font-medium">{t.thNameEmail}</th>
                <th className="px-4 py-3 font-medium">{t.thBalance}</th>
                <th className="px-4 py-3 font-medium">{t.thSpent}</th>
                <th className="px-4 py-3 font-medium">{t.thUnlimited}</th>
                <th className="px-4 py-3 font-medium">{t.thJoined}</th>
                <th className="px-4 py-3 font-medium">{t.thManage}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-ink-line/60 last:border-0">
                  <td className="px-4 py-3">
                    <button onClick={() => setFilterUser(u.id)} className="text-left hover:text-lime" title={t.viewUserLogs}>
                      <span className="font-semibold">{u.name}</span>
                      {u.is_admin === 1 && <span className="ml-1.5 text-[10px] text-lime">ADMIN</span>}
                      <br />
                      <span className="text-xs text-paper-faint">{u.email}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {u.unlimited ? <span className="text-lime">{t.unlimited}</span> : u.credits.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-paper-dim">{u.spent.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleUnlimited(u)}
                      className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
                        u.unlimited ? "bg-lime text-ink" : "border border-ink-line text-paper-dim hover:border-lime"
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
                      {t.grantBtn}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 쿠폰 관리 */}
      <AdminCoupons t={t.coupons} />

      {/* 사용 로그 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-xs tracking-[0.2em] text-paper-faint">
            {t.logsTitle} {filterUser && t.filtered}
          </h2>
          {filterUser && (
            <button onClick={() => setFilterUser("")} className="text-xs text-lime hover:underline">
              {t.viewAll}
            </button>
          )}
        </div>
        <div className="overflow-x-auto border border-ink-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-line bg-ink-soft font-mono text-[11px] uppercase tracking-[0.15em] text-paper-faint">
                <th className="px-4 py-3 font-medium">{t.thTime}</th>
                <th className="px-4 py-3 font-medium">{t.thUser}</th>
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
                  <td className="px-4 py-2.5 text-xs">{l.name ?? l.email}</td>
                  <td className="px-4 py-2.5">
                    {t.typeLabels[l.type] ?? l.type}
                    {l.unlimited === 1 && l.type === "spend" && (
                      <span className="ml-1 text-[10px] text-lime">{t.unlimited}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-paper-dim">{svc(l.service)}</td>
                  <td className={`px-4 py-2.5 font-mono ${l.amount < 0 ? "text-paper-dim" : "text-lime"}`}>
                    {l.amount > 0 ? "+" : ""}
                    {l.amount}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-paper-faint">{l.balance_after}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-paper-faint">
                    {t.noLogs}
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
