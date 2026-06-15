import { getCurrentUser } from "@/lib/auth";
import { deleteCreationByJob } from "@/lib/creations";
import { ownsJob, refundForFailedJobByJobId } from "@/lib/ledger";
import { marvFetch } from "@/lib/marv";

const UUID_RE = /^[0-9a-f-]{36}$/;

// 생성 잡 취소 → 마브 잡 삭제 + 차감 크레딧 환불(정산 대기 건만) + 갤러리 기록 제거.
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ detail: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return Response.json({ detail: "잘못된 잡 ID" }, { status: 400 });

  // 본인 잡인지 확인
  if (!(await ownsJob(user.id, id))) {
    return Response.json({ detail: "취소할 수 없는 작업입니다." }, { status: 404 });
  }

  // 마브 잡 취소(베스트 에포트)
  try {
    await marvFetch(`/v1/jobs/${id}`, { method: "DELETE" }, 15_000);
  } catch {
    /* 이미 끝났거나 삭제 불가 — 환불은 정산 상태로 판단 */
  }

  // 정산 대기(settled=0) 건이면 환불, 갤러리 기록 제거
  const balance = await refundForFailedJobByJobId(id, "cancelled");
  await deleteCreationByJob(user.id, id);

  const headers = new Headers({ "content-type": "application/json" });
  if (balance !== null) headers.set("X-MV-Balance", String(balance));
  return new Response(JSON.stringify({ ok: true, refunded: balance !== null, balance }), {
    status: 200,
    headers,
  });
}
