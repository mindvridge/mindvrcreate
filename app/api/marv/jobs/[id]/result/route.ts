import { marvFetch } from "@/lib/marv";

const UUID_RE = /^[0-9a-f-]{36}$/;

// 결과 파일(이미지/오디오/영상) 스트리밍 프록시.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return Response.json({ detail: "잘못된 잡 ID" }, { status: 400 });

  let res: Response;
  try {
    res = await marvFetch(`/v1/jobs/${id}/result`, { cache: "no-store" }, 60_000);
  } catch {
    return Response.json({ detail: "결과 다운로드 실패" }, { status: 503 });
  }
  if (!res.ok || !res.body) {
    return Response.json({ detail: "결과를 가져오지 못했습니다." }, { status: res.status });
  }
  return new Response(res.body, {
    status: 200,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/octet-stream",
      "cache-control": "no-store",
    },
  });
}
