import { marvFetch } from "@/lib/marv";

export async function GET() {
  try {
    const res = await marvFetch("/v1/voices", { cache: "no-store" }, 15_000);
    const body = await res.text();
    return new Response(body, { status: res.status, headers: { "content-type": "application/json" } });
  } catch {
    return Response.json([], { status: 200 }); // 보이스 목록 실패는 빈 목록으로 폴백
  }
}
