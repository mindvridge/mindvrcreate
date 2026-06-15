import { getCurrentUser } from "@/lib/auth";
import { listCreations } from "@/lib/creations";

// 내 생성물 목록 (테스트 랩에서 만든 이미지/영상/오디오)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ detail: "로그인이 필요합니다." }, { status: 401 });
  try {
    const items = await listCreations(user.id);
    return Response.json({ items });
  } catch {
    return Response.json({ detail: "목록을 불러오지 못했습니다.", items: [] }, { status: 503 });
  }
}
