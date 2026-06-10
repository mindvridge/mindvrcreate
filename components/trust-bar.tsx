const items = [
  { label: "정부 R&D 수행", value: "RS-2026-25508342" },
  { label: "특허 출원", value: "2건" },
  { label: "운영 중 제품", value: "마인드프랩" },
  { label: "자체 GPU", value: "NVIDIA B200 192GB" },
  { label: "엔진 라이선스", value: "MIT / Apache 2.0" },
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
