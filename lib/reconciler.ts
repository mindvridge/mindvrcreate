import { marvFetch } from "./marv";
import {
  cleanupExpiredSessions,
  markSettled,
  pendingChargedJobs,
  refundForFailedJobByJobId,
} from "./ledger";

/*
 * 서버측 정산 리컨실러.
 * 클라이언트가 탭을 닫아 잡 상태 폴링이 끊겨도, 비동기 잡의 최종 상태를
 * 주기적으로 확인해 성공은 정산 완료 처리하고 실패는 자동 환불한다.
 */
let started = false;

export function startBackgroundJobs() {
  if (started) return;
  started = true;

  const reconcile = async () => {
    let pend: { job_id: string }[];
    try {
      pend = await pendingChargedJobs();
    } catch {
      return;
    }
    for (const { job_id } of pend) {
      try {
        const res = await marvFetch(`/v1/jobs/${job_id}`, { cache: "no-store" }, 10_000);
        if (!res.ok) continue;
        const job = (await res.json()) as { status?: string };
        if (job.status === "finished") await markSettled(job_id);
        else if (job.status === "failed") await refundForFailedJobByJobId(job_id);
      } catch {
        /* 다음 주기에 재시도 */
      }
    }
  };

  setInterval(() => void reconcile(), 60_000).unref?.();
  setInterval(() => {
    void cleanupExpiredSessions().catch(() => {});
  }, 3600_000).unref?.();
}
