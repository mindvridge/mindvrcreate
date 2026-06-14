import { markSettled, refundForFailedJobByJobId } from "@/lib/ledger";
import { marvFetch } from "@/lib/marv";

const UUID_RE = /^[0-9a-f-]{36}$/;

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return Response.json({ detail: "잘못된 잡 ID" }, { status: 400 });

  let text: string;
  try {
    const res = await marvFetch(`/v1/jobs/${id}`, { cache: "no-store" }, 15_000);
    text = await res.text();
  } catch {
    return Response.json({ detail: "상태 조회 실패" }, { status: 503 });
  }

  // 정산: 성공 → settled 표시, 실패 → 환불 (세션 불필요, 로그의 user_id 사용 / 멱등)
  let refundedBalance: number | null = null;
  try {
    const job = JSON.parse(text) as { status?: string };
    if (job.status === "finished") markSettled(id);
    else if (job.status === "failed") refundedBalance = refundForFailedJobByJobId(id);
  } catch {
    /* ignore */
  }

  const headers = new Headers({ "content-type": "application/json" });
  if (refundedBalance !== null) headers.set("X-MV-Balance", String(refundedBalance));
  return new Response(text, { status: 200, headers });
}
