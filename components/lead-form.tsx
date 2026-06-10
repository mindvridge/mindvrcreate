"use client";

import { useState } from "react";

const CONTACT_EMAIL = "mindvridge.official@gmail.com";

/**
 * 무료 데모 신청 폼 — 백엔드 연동 전까지는 mailto로 신청 내용을 전달한다.
 * 폼은 짧게: 이름 / 연락처 / 제품 한 줄 / 원하는 것 (홈페이지 전략 4.4)
 */
export default function LeadForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const lines = [
      `이름: ${data.get("name")}`,
      `연락처: ${data.get("contact")}`,
      `만들고 있는 제품: ${data.get("product")}`,
      `원하는 것: ${data.get("want")}`,
      `모두의창업 1차 통과: ${data.get("modoo") ? "예" : "아니오"}`,
    ];
    const subject = encodeURIComponent("[마인드브이알] 무료 아바타 데모 신청");
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  const inputCls =
    "w-full rounded-md border border-ink-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-faint focus:border-lime focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="mt-10 grid gap-4 text-left sm:grid-cols-2">
      <input name="name" required placeholder="이름" className={inputCls} />
      <input name="contact" required placeholder="연락처 (이메일 또는 전화)" className={inputCls} />
      <input
        name="product"
        required
        placeholder="만들고 있는 제품 한 줄 소개"
        className={`${inputCls} sm:col-span-2`}
      />
      <select name="want" required defaultValue="" className={`${inputCls} sm:col-span-2`}>
        <option value="" disabled>
          원하는 것을 선택하세요
        </option>
        <option>사람형 아바타 · 디지털휴먼</option>
        <option>대화형 AI에 얼굴 입히기</option>
        <option>영상 콘텐츠 생성</option>
        <option>이미지 · 광고 소재</option>
        <option>아직 모르겠어요 — 상담 원함</option>
      </select>

      <label className="flex items-center gap-2.5 text-sm text-paper-dim sm:col-span-2">
        <input type="checkbox" name="modoo" className="h-4 w-4 accent-(--color-lime)" />
        모두의창업 1차 통과 창업자입니다 (전용 혜택 적용)
      </label>

      <button
        type="submit"
        className="rounded-md bg-lime px-6 py-3.5 text-base font-bold text-ink transition-colors hover:bg-lime-deep sm:col-span-2"
      >
        무료 아바타 데모 신청하기
      </button>

      {submitted && (
        <p className="text-sm text-paper-dim sm:col-span-2">
          메일 앱이 열리지 않았다면{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-lime">
            {CONTACT_EMAIL}
          </a>
          로 직접 보내주세요. 영업일 기준 1일 내에 회신드립니다.
        </p>
      )}
    </form>
  );
}
