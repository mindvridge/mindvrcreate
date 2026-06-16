import "server-only";
import { cookies, headers } from "next/headers";
import {
  dictionaries,
  isLocale,
  LOCALE_COOKIE,
  pickFromAcceptLanguage,
  type Dict,
  type Locale,
} from "./i18n";

/** 현재 요청의 언어 — 쿠키(명시적 선택) 우선, 없으면 브라우저 언어 자동 감지 */
export async function getLocale(): Promise<Locale> {
  const cookieLang = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLang)) return cookieLang;
  const h = await headers();
  return pickFromAcceptLanguage(h.get("accept-language"));
}

export async function getDict(): Promise<Dict> {
  return dictionaries[await getLocale()];
}
