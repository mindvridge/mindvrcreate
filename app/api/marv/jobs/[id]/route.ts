import { getCurrentUser } from "@/lib/auth";
import { refundForFailedJob } from "@/lib/ledger";
import { MARV_BASE, marvHeaders } from "@/lib/marv";

const UUID_RE = /^[0-9a-f-]{36}$/;

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) {
    return Response.json({ detail: "잘못된 잡 ID" }, { status: 400 });
  }
  const res = await fetch(`${MARV_BASE}/v1/jobs/${id}`, {
    headers: marvHeaders(),
    cache: "no-store",
  });
  const text = await res.text();

  // 실패한 잡은 차감된 크레딧을 환불 (멱등)
  let refundedBalance: number | null = null;
  try {
    const job = JSON.parse(text) as { status?: string };
    if (job.status === "failed") {
      const user = await getCurrentUser();
      if (user) refundedBalance = refundForFailedJob(user.id, id);
    }
  } catch {
    /* ignore */
  }

  const headers = new Headers({ "content-type": "application/json" });
  if (refundedBalance !== null) headers.set("X-MV-Balance", String(refundedBalance));
  return new Response(text, { status: res.status, headers });
}
