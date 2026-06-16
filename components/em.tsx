/** 강조 텍스트 조각(lead + <em> + tail) 렌더 — 서버/클라이언트 양쪽에서 사용 가능. */
export default function Em({
  t,
  className = "text-lime",
}: {
  t: { lead: string; em: string; tail: string };
  className?: string;
}) {
  return (
    <>
      {t.lead}
      {t.em && <span className={className}>{t.em}</span>}
      {t.tail}
    </>
  );
}
