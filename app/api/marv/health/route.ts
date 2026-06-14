import { marvFetch } from "@/lib/marv";

export async function GET() {
  try {
    const res = await marvFetch("/v1/health", { cache: "no-store" }, 10_000);
    const body = await res.text();
    return new Response(body, { status: res.status, headers: { "content-type": "application/json" } });
  } catch {
    return Response.json({ status: "unreachable", queue_depth: null }, { status: 200 });
  }
}
