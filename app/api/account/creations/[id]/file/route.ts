import { getCurrentUser } from "@/lib/auth";
import { getCreationJobId } from "@/lib/creations";
import { marvFetch } from "@/lib/marv";

// 내 생성물 결과 파일 스트리밍 — 소유권 확인 후 마브 결과를 프록시한다.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ detail: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await ctx.params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return Response.json({ detail: "잘못된 요청" }, { status: 400 });
  }

  const jobId = await getCreationJobId(user.id, numId);
  if (!jobId) return Response.json({ detail: "찾을 수 없습니다." }, { status: 404 });

  let res: Response;
  try {
    res = await marvFetch(`/v1/jobs/${jobId}/result`, { cache: "no-store" }, 60_000);
  } catch {
    return Response.json({ detail: "결과 다운로드 실패" }, { status: 503 });
  }
  if (!res.ok || !res.body) {
    // 아직 처리 중이거나 결과가 만료됨
    return Response.json({ detail: "결과를 가져오지 못했습니다." }, { status: res.status || 404 });
  }
  return new Response(res.body, {
    status: 200,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/octet-stream",
      "cache-control": "private, max-age=3600",
    },
  });
}
