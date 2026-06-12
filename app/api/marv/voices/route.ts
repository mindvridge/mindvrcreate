import { MARV_BASE, marvHeaders } from "@/lib/marv";

export async function GET() {
  const res = await fetch(`${MARV_BASE}/v1/voices`, {
    headers: marvHeaders(),
    cache: "no-store",
  });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "content-type": "application/json" },
  });
}
