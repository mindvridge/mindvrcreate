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
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "content-type": "application/json" },
  });
}
