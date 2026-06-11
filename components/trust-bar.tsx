const items = [
  { label: "정부 R&D 수행", value: "국가 과제 수행 기업" },
  { label: "특허 출원", value: "2건" },
  { label: "운영 중 제품", value: "마인드프랩" },
  { label: "제작 방식", value: "100% 맞춤 제작" },
  { label: "캐릭터 IP", value: "100% 고객 소유" },
];

export default function TrustBar() {
  return (
    <section className="border-y border-ink-line bg-ink-soft/60">
      <div className="mx-auto grid max-w-6xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-ink-line">
        {items.map((item) => (
          <div key={item.label} className="px-5 py-6 lg:px-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-faint">
              {item.label}
            </p>
            <p className="mt-1.5 font-mono text-sm font-medium text-paper-dim">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
