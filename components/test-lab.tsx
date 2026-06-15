"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CREDIT_COSTS, SERVICE_LABELS, type Service } from "@/lib/credits";

type TabId = Service;

const TABS: { id: TabId; label: string }[] = [
  { id: "tts", label: "음성 (TTS)" },
  { id: "llm", label: "대화 (LLM)" },
  { id: "image", label: "이미지 생성" },
  { id: "video", label: "영상 생성" },
  { id: "music", label: "음악 생성" },
  { id: "avatar", label: "아바타" },
];

// 서비스별 예상 소요 안내
const ESTIMATE: Record<Service, string> = {
  llm: "보통 몇 초",
  tts: "보통 10~60초",
  image: "보통 30초~2분",
  video: "보통 수 분",
  avatar: "보통 수 분",
  music: "보통 1~3분",
};

type ToastType = "success" | "error" | "info";
type Toast = { id: number; type: ToastType; msg: string };

type Me = { name: string; credits: number; unlimited: number };

type Lab = {
  unlimited: boolean;
  balance: number;
  setBalance: (n: number) => void;
  notify: (type: ToastType, msg: string) => void;
};

type Kind = "audio" | "image" | "video" | "file";

type JobState =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "polling"; jobId: string; status: string; seconds: number }
  | { phase: "done"; jobId: string; kind: Kind; url: string }
  | { phase: "error"; message: string; insufficient?: boolean };

function kindFromContentType(ct: string): Kind {
  if (ct.startsWith("audio/")) return "audio";
  if (ct.startsWith("image/")) return "image";
  if (ct.startsWith("video/")) return "video";
  return "file";
}

/* ── 작은 UI 조각 ─────────────────────────────────────── */

function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden
    />
  );
}

/** File → object URL (변경/언마운트 시 자동 해제) */
function useObjectUrl(file: File | null): string | null {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url]
  );
  return url;
}

/** 공용 이미지 첨부 — 썸네일 미리보기 + 파일명 + 제거 */
function ImageDrop({
  file,
  fileUrl,
  onFile,
}: {
  file: File | null;
  fileUrl: string | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border-2 border-dashed border-ink-line text-paper-faint transition-colors hover:border-lime"
      >
        {fileUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fileUrl} alt="첨부 이미지" className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl leading-none">＋</span>
        )}
      </button>
      <div className="min-w-0 text-sm">
        {file ? (
          <>
            <p className="truncate font-semibold text-paper-dim">{file.name}</p>
            <button
              onClick={() => onFile(null)}
              className="mt-1 text-xs font-semibold text-paper-faint hover:text-lime"
            >
              제거
            </button>
          </>
        ) : (
          <p className="text-paper-faint">사진 선택 (JPG·PNG)</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

/** 잡 제출 → 폴링 → 결과 URL 확정까지의 공용 러너. 잔액·과금 헤더를 읽고 토스트를 띄운다. */
function useJobRunner(lab: Lab, service: Service) {
  const [state, setState] = useState<JobState>({ phase: "idle" });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const notify = lab.notify;

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);
  useEffect(() => stop, [stop]);

  const run = useCallback(
    async (path: string, form: FormData) => {
      stop();
      setState({ phase: "submitting" });
      try {
        const res = await fetch(`/api/marv/submit?path=${encodeURIComponent(path)}`, {
          method: "POST",
          body: form,
        });
        const b = res.headers.get("X-MV-Balance");
        if (b !== null) lab.setBalance(Number(b));

        if (res.status === 402) {
          setState({ phase: "error", message: "크레딧이 부족합니다.", insufficient: true });
          notify("error", "크레딧이 부족합니다. 충전 후 이용해 주세요.");
          return;
        }
        const json = await res.json();
        if (!res.ok || !json.job_id) {
          const msg = json.detail ?? "요청에 실패했습니다.";
          setState({ phase: "error", message: msg });
          notify("error", msg);
          return;
        }

        const charged = res.headers.get("X-MV-Charged");
        const unlimited = res.headers.get("X-MV-Unlimited") === "1";
        notify(
          "info",
          unlimited || !charged
            ? `${SERVICE_LABELS[service]} 생성을 시작했어요`
            : `${SERVICE_LABELS[service]} 생성 시작 · ${charged} 크레딧 사용`
        );

        const jobId: string = json.job_id;
        let seconds = 0;
        setState({ phase: "polling", jobId, status: "queued", seconds });

        timer.current = setInterval(async () => {
          seconds += 4;
          try {
            const jr = await fetch(`/api/marv/jobs/${jobId}`, { cache: "no-store" });
            const jb = jr.headers.get("X-MV-Balance");
            if (jb !== null) lab.setBalance(Number(jb));
            const job = await jr.json();
            if (job.status === "finished") {
              stop();
              const r = await fetch(`/api/marv/jobs/${jobId}/result`);
              const ct = r.headers.get("content-type") ?? "";
              const blob = await r.blob();
              setState({ phase: "done", jobId, kind: kindFromContentType(ct), url: URL.createObjectURL(blob) });
              notify("success", `${SERVICE_LABELS[service]} 생성이 완료됐어요!`);
            } else if (job.status === "failed") {
              stop();
              setState({ phase: "error", message: "생성에 실패했어요. 크레딧은 환불됐습니다." });
              notify("error", "생성에 실패했어요. 크레딧은 환불됐습니다.");
            } else {
              setState({ phase: "polling", jobId, status: job.status, seconds });
            }
          } catch {
            /* 일시 오류는 다음 폴링에서 재시도 */
          }
        }, 4000);
      } catch {
        setState({ phase: "error", message: "요청 중 오류가 발생했습니다." });
        notify("error", "요청 중 오류가 발생했습니다.");
      }
    },
    [stop, lab, notify, service]
  );

  return { state, run };
}

const inputCls =
  "w-full border border-ink-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-faint focus:border-lime focus:outline-none";

function CostButton({
  service,
  lab,
  onClick,
  busy,
  children,
}: {
  service: Service;
  lab: Lab;
  onClick: () => void;
  busy?: boolean;
  children: React.ReactNode;
}) {
  const cost = CREDIT_COSTS[service];
  const broke = !lab.unlimited && lab.balance < cost;
  return (
    <button
      onClick={onClick}
      disabled={busy || broke}
      className="inline-flex items-center gap-2 bg-lime px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-lime-deep disabled:opacity-50"
    >
      {busy && <Spinner className="h-4 w-4" />}
      {busy ? "생성 중…" : children}
      {!busy && <span className="font-mono text-xs opacity-70">· {cost} CR</span>}
    </button>
  );
}

/** 친절한 진행 인디케이터 (대기/생성 + 진행바 + 타이머 + 예상시간) */
function GenerationProgress({ state, service }: { state: JobState; service: Service }) {
  if (state.phase !== "submitting" && state.phase !== "polling") return null;
  const elapsed = state.phase === "polling" ? state.seconds : 0;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const queued = state.phase === "polling" && state.status === "queued";
  const title =
    state.phase === "submitting"
      ? "요청을 보내는 중…"
      : queued
        ? "대기열에서 순서를 기다리고 있어요"
        : "AI가 열심히 만들고 있어요";
  const sub = queued
    ? "GPU가 비는 대로 자동으로 시작됩니다"
    : `${ESTIMATE[service]} 걸려요 · 페이지를 열어 두세요`;

  return (
    <div className="mt-5 animate-fade border border-ink-line bg-ink-soft p-5">
      <div className="flex items-center gap-3">
        <span className="text-lime">
          <Spinner />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs text-paper-faint">{sub}</p>
        </div>
        <span className="font-mono text-sm tabular-nums text-paper-dim">
          {mm}:{ss}
        </span>
      </div>
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-ink-line">
        <div
          className="h-full w-1/3 rounded-full bg-lime"
          style={{ animation: "mv-slide 1.3s ease-in-out infinite" }}
        />
      </div>
    </div>
  );
}

function ResultCard({ state }: { state: JobState }) {
  const [zoom, setZoom] = useState(false);
  if (state.phase !== "done") return null;

  const ext = state.kind === "audio" ? "wav" : state.kind === "video" ? "mp4" : state.kind === "image" ? "png" : "bin";
  const fileName = `mindvr-${state.jobId.slice(0, 8)}.${ext}`;
  const zoomable = state.kind === "image" || state.kind === "video";

  return (
    <div className="mt-5 animate-pop border border-ink-line bg-ink-soft p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-bold text-lime">
          <span className="text-base leading-none">✓</span> 생성 완료
        </p>
        <div className="flex items-center gap-3">
          {zoomable && (
            <button onClick={() => setZoom(true)} className="text-xs font-semibold text-paper-dim hover:text-lime">
              크게 보기
            </button>
          )}
          <a href={state.url} download={fileName} className="text-xs font-semibold text-paper-dim hover:text-lime">
            다운로드
          </a>
        </div>
      </div>

      {state.kind === "audio" && <audio controls src={state.url} className="w-full" />}
      {state.kind === "image" && (
        <button onClick={() => setZoom(true)} className="block w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={state.url} alt="생성 결과" className="max-h-[420px] w-auto cursor-zoom-in" />
        </button>
      )}
      {state.kind === "video" && (
        <video controls autoPlay loop src={state.url} className="max-h-[420px] w-auto" />
      )}
      {state.kind === "file" && (
        <a href={state.url} download={fileName} className="font-semibold text-lime underline">
          결과 파일 다운로드
        </a>
      )}

      {zoom && zoomable && (
        <div
          className="fixed inset-0 z-[70] flex animate-fade items-center justify-center bg-black/85 p-4 sm:p-8"
          onClick={() => setZoom(false)}
        >
          {state.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={state.url} alt="생성 결과 크게 보기" className="max-h-[92vh] max-w-[92vw] object-contain" />
          ) : (
            <video
              controls
              autoPlay
              loop
              src={state.url}
              className="max-h-[92vh] max-w-[92vw]"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <button
            onClick={() => setZoom(false)}
            className="absolute right-4 top-4 border border-white/30 bg-black/50 px-3 py-1.5 font-mono text-xs tracking-wider text-white hover:border-lime hover:text-lime"
          >
            닫기 ✕
          </button>
        </div>
      )}
    </div>
  );
}

function ErrorLine({ state }: { state: JobState }) {
  if (state.phase !== "error") return null;
  return (
    <div className="mt-5 animate-fade border border-red-500/30 bg-red-500/5 p-4">
      <p className="text-sm font-semibold text-red-600">
        {state.message}{" "}
        {state.insufficient && (
          <Link href="/account" className="ml-1 text-lime underline">
            충전 안내
          </Link>
        )}
      </p>
    </div>
  );
}

/* ── 탭별 패널 ─────────────────────────────────────────── */

function TtsPanel({ lab }: { lab: Lab }) {
  const { state, run } = useJobRunner(lab, "tts");
  const [voices, setVoices] = useState<{ id: string; name: string }[]>([]);
  const [voiceId, setVoiceId] = useState("");
  const [text, setText] = useState("안녕하세요, 마인드브이알입니다. 이 음성은 방금 만들어졌습니다.");

  useEffect(() => {
    fetch("/api/marv/voices")
      .then((r) => r.json())
      .then((list) => Array.isArray(list) && setVoices(list))
      .catch(() => {});
  }, []);

  const submit = () => {
    const f = new FormData();
    f.set("model", "Qwen3-TTS");
    f.set("prompt_ko", text);
    f.set("language", "Korean");
    if (voiceId) f.set("saved_voice_id", voiceId);
    run("/v1/tts", f);
  };

  const busy = state.phase === "submitting" || state.phase === "polling";
  return (
    <div className="space-y-4">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={inputCls} placeholder="읽을 한국어 문장" />
      <div className="flex flex-wrap items-center gap-3">
        <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)} className={`${inputCls} max-w-xs`}>
          <option value="">기본 음성</option>
          {voices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <CostButton service="tts" lab={lab} onClick={submit} busy={busy}>
          음성 생성
        </CostButton>
      </div>
      <GenerationProgress state={state} service="tts" />
      <ResultCard key={state.phase === "done" ? state.jobId : "idle"} state={state} />
      <ErrorLine state={state} />
    </div>
  );
}

function LlmPanel({ lab }: { lab: Lab }) {
  const [message, setMessage] = useState("마인드브이알을 한 문장으로 소개해줘.");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; insufficient?: boolean } | null>(null);

  const submit = async () => {
    setBusy(true);
    setReply(null);
    setError(null);
    try {
      const f = new FormData();
      f.set("message", message);
      const res = await fetch("/api/marv/submit?path=%2Fv1%2Fchat", { method: "POST", body: f });
      const b = res.headers.get("X-MV-Balance");
      if (b !== null) lab.setBalance(Number(b));
      if (res.status === 402) {
        setError({ message: "크레딧이 부족합니다.", insufficient: true });
        lab.notify("error", "크레딧이 부족합니다.");
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        setError({ message: json.detail ?? "요청 실패" });
        lab.notify("error", json.detail ?? "요청 실패");
      } else {
        setReply(json.message_to_user ?? (json.job_id ? "생성 잡이 시작되었습니다." : JSON.stringify(json)));
        lab.notify("success", "응답이 도착했어요!");
      }
    } catch {
      setError({ message: "요청 중 오류가 발생했습니다." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className={inputCls} />
      <button
        onClick={submit}
        disabled={busy || (!lab.unlimited && lab.balance < CREDIT_COSTS.llm)}
        className="inline-flex items-center gap-2 bg-lime px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-lime-deep disabled:opacity-50"
      >
        {busy && <Spinner className="h-4 w-4" />}
        {busy ? "응답 생성 중…" : "보내기"}
        {!busy && <span className="font-mono text-xs opacity-70">· {CREDIT_COSTS.llm} CR</span>}
      </button>
      {error && (
        <div className="animate-fade border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm font-semibold text-red-600">
            {error.message}{" "}
            {error.insufficient && (
              <Link href="/account" className="ml-1 text-lime underline">
                충전 안내
              </Link>
            )}
          </p>
        </div>
      )}
      {reply && (
        <div className="animate-pop border border-ink-line bg-ink-soft p-5 text-sm leading-relaxed text-paper-dim">
          {reply}
        </div>
      )}
      <p className="text-xs text-paper-faint">
        * 마브 오케스트레이터에 직접 연결됩니다. &ldquo;~만들어줘&rdquo;라고 하면 실제 생성 잡이 시작될 수 있습니다.
      </p>
    </div>
  );
}

/** 4개 모델 동시 비교 — 한 번 제출로 여러 잡을 받아 각각 폴링/다운로드한다. */
type CompareItem = { jobId: string; model: string; phase: "polling" | "done" | "error"; url?: string };

function useCompareRunner(lab: Lab) {
  const [items, setItems] = useState<CompareItem[] | null>(null);
  const [phase, setPhase] = useState<"idle" | "submitting" | "running" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const notify = lab.notify;

  const stop = useCallback(() => {
    Object.values(timers.current).forEach((t) => clearInterval(t));
    timers.current = {};
  }, []);
  useEffect(() => stop, [stop]);

  const run = useCallback(
    async (form: FormData) => {
      stop();
      setItems(null);
      setErrMsg("");
      setPhase("submitting");
      try {
        const res = await fetch(`/api/marv/submit?path=${encodeURIComponent("/v1/image")}`, {
          method: "POST",
          body: form,
        });
        const b = res.headers.get("X-MV-Balance");
        if (b !== null) lab.setBalance(Number(b));
        if (res.status === 402) {
          setPhase("error");
          setErrMsg("크레딧이 부족합니다.");
          notify("error", "크레딧이 부족합니다. 충전 후 이용해 주세요.");
          return;
        }
        const json = await res.json();
        const jobs: { job_id: string; model?: string }[] = Array.isArray(json.jobs)
          ? json.jobs.filter((j: { job_id?: string }) => j?.job_id)
          : [];
        if (!res.ok || jobs.length === 0) {
          const m = json.detail ?? "요청에 실패했습니다.";
          setPhase("error");
          setErrMsg(m);
          notify("error", m);
          return;
        }
        const charged = res.headers.get("X-MV-Charged");
        notify("info", `이미지 ${jobs.length}장 생성 시작${charged ? ` · ${charged} 크레딧 사용` : ""}`);
        setItems(jobs.map((j) => ({ jobId: j.job_id, model: j.model ?? "모델", phase: "polling" as const })));
        setPhase("running");

        let done = 0;
        jobs.forEach((j) => {
          const id = j.job_id;
          timers.current[id] = setInterval(async () => {
            try {
              const jr = await fetch(`/api/marv/jobs/${id}`, { cache: "no-store" });
              const job = await jr.json();
              if (job.status === "finished") {
                clearInterval(timers.current[id]);
                delete timers.current[id];
                const r = await fetch(`/api/marv/jobs/${id}/result`);
                const url = URL.createObjectURL(await r.blob());
                setItems((prev) => prev?.map((it) => (it.jobId === id ? { ...it, phase: "done", url } : it)) ?? prev);
                if (++done === jobs.length) notify("success", "이미지 4장 생성이 완료됐어요!");
              } else if (job.status === "failed") {
                clearInterval(timers.current[id]);
                delete timers.current[id];
                setItems((prev) => prev?.map((it) => (it.jobId === id ? { ...it, phase: "error" } : it)) ?? prev);
                if (++done === jobs.length) notify("success", "이미지 4장 생성이 완료됐어요!");
              }
            } catch {
              /* 일시 오류는 다음 폴링에서 재시도 */
            }
          }, 4000);
        });
      } catch {
        setPhase("error");
        setErrMsg("요청 중 오류가 발생했습니다.");
        notify("error", "요청 중 오류가 발생했습니다.");
      }
    },
    [stop, lab, notify]
  );

  return { items, phase, errMsg, run };
}

function CompareGrid({ items, onZoom }: { items: CompareItem[]; onZoom: (url: string) => void }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it, i) => (
        <div key={it.jobId} className="animate-pop border border-ink-line bg-ink-soft">
          <div className="flex aspect-square items-center justify-center overflow-hidden bg-ink">
            {it.phase === "done" && it.url ? (
              <button onClick={() => onZoom(it.url!)} className="h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt={`생성 결과 ${i + 1}`} className="h-full w-full cursor-zoom-in object-cover" />
              </button>
            ) : it.phase === "error" ? (
              <span className="px-2 text-center text-xs text-red-600">생성 실패</span>
            ) : (
              <span className="text-lime">
                <Spinner />
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 px-2.5 py-2">
            <p className="font-mono text-[10px] text-paper-dim">이미지 {i + 1}</p>
            {it.phase === "done" && it.url && (
              <a
                href={it.url}
                download={`mindvr-${it.jobId.slice(0, 8)}.png`}
                className="shrink-0 text-[10px] font-semibold text-paper-faint hover:text-lime"
              >
                저장
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// 국적·국가·해외 지명이 명시되지 않은 프롬프트는 자동으로 한국인·한국 배경으로 보정한다.
const NATIONALITY_RE =
  /한국|국내|미국|일본|중국|대만|유럽|서양|동양|아시아|외국|이국|글로벌|흑인|백인|아프리카|인도|베트남|태국|필리핀|인도네시아|말레이|러시아|프랑스|영국|독일|이탈리아|스페인|네덜란드|스웨덴|멕시코|브라질|아르헨|라틴|히스패닉|아랍|중동|튀르키예|터키|이집트|몽골|뉴욕|파리|도쿄|런던|베이징|상하이|홍콩|방콕|싱가포르|두바이|로마|베를린|시드니|korean|american|japanese|chinese|western|european|african|asian/i;
const PERSON_RE =
  /사람|인물|여성|남성|여자|남자|아이|어린이|소녀|소년|학생|직원|모델|바리스타|의사|간호사|교사|선생|상담|면접|회사원|할머니|할아버지|엄마|아빠|부모|커플|친구|가족|인플루언서|크리에이터|점원|요리사|셰프|선수|아기|노인|청년|중년|얼굴|초상|남녀/;

function localizePrompt(p: string): string {
  const t = p.trim();
  if (!t || NATIONALITY_RE.test(t)) return t;
  const extra = PERSON_RE.test(t) ? "한국인, 한국 배경" : "한국 배경";
  return `${t}, ${extra}`;
}

function ImagePanel({ lab }: { lab: Lab }) {
  const compare = useCompareRunner(lab);
  const [prompt, setPrompt] = useState("밝은 스튜디오에서 카메라를 보고 미소 짓는 바리스타");
  const [aspect, setAspect] = useState("1:1");
  const [zoom, setZoom] = useState<string | null>(null);

  const submit = () => {
    const f = new FormData();
    f.set("model", "Z-Image-Turbo"); // compare_models 사용 시에도 필수 필드
    f.set("prompt_ko", localizePrompt(prompt));
    f.set("params_json", JSON.stringify({ aspect, compare_models: true }));
    compare.run(f);
  };

  const busy = compare.phase === "submitting" || compare.phase === "running";
  const cost = CREDIT_COSTS.image * 4;
  const broke = !lab.unlimited && lab.balance < cost;

  return (
    <div className="space-y-4">
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className={inputCls} />
      <div className="flex flex-wrap items-center gap-3">
        <select value={aspect} onChange={(e) => setAspect(e.target.value)} className={`${inputCls} max-w-[110px]`}>
          {["1:1", "16:9", "9:16", "3:4", "4:3"].map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <button
          onClick={submit}
          disabled={busy || broke}
          className="inline-flex items-center gap-2 bg-lime px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-lime-deep disabled:opacity-50"
        >
          {busy && <Spinner className="h-4 w-4" />}
          {busy ? "생성 중…" : "이미지 4장 생성"}
          {!busy && <span className="font-mono text-xs opacity-70">· {cost} CR</span>}
        </button>
      </div>
      <p className="text-xs text-paper-faint">
        * 한 번에 <span className="text-paper-dim">4개 AI 모델이 각 1장씩</span> 생성합니다. 마음에 드는 결과를 골라
        저장하세요. 국적을 따로 적지 않으면 <span className="text-paper-dim">한국인·한국 배경</span>으로 자동 생성됩니다.
      </p>

      {/* 4장 동시 생성 진행/결과 */}
      {compare.phase === "submitting" && (
        <div className="mt-5 flex animate-fade items-center gap-3 border border-ink-line bg-ink-soft p-5">
          <span className="text-lime">
            <Spinner />
          </span>
          <p className="text-sm font-semibold">이미지 4장을 동시에 만드는 중…</p>
        </div>
      )}
      {compare.items && <CompareGrid items={compare.items} onZoom={setZoom} />}
      {compare.phase === "error" && compare.errMsg && (
        <div className="mt-5 animate-fade border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm font-semibold text-red-600">{compare.errMsg}</p>
        </div>
      )}

      {zoom && (
        <div
          className="fixed inset-0 z-[70] flex animate-fade items-center justify-center bg-black/85 p-4 sm:p-8"
          onClick={() => setZoom(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="생성 결과 크게 보기" className="max-h-[92vh] max-w-[92vw] object-contain" />
        </div>
      )}
    </div>
  );
}

function VideoPanel({ lab }: { lab: Lab }) {
  const { state, run } = useJobRunner(lab, "video");
  const [prompt, setPrompt] = useState("햇살 좋은 한강공원에서 강아지와 산책하는 사람, 시네마틱");
  const [file, setFile] = useState<File | null>(null);
  const fileUrl = useObjectUrl(file);

  const submit = () => {
    const f = new FormData();
    // 이미지 첨부 시 image-to-video(I2V), 아니면 text-to-video(T2V)
    f.set("model", file ? "Wan 2.2 I2V" : "Wan 2.2 T2V");
    f.set("prompt_ko", localizePrompt(prompt));
    f.set("params_json", JSON.stringify({ duration_s: 5 }));
    if (file) f.set("ref_image", file);
    run("/v1/video", f);
  };

  const busy = state.phase === "submitting" || state.phase === "polling";
  return (
    <div className="space-y-4">
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className={inputCls} placeholder="만들고 싶은 영상을 설명하세요" />

      <div>
        <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-paper-faint">
          시작 이미지 (선택) — 첨부하면 그 이미지가 움직이는 영상으로 만듭니다
        </p>
        <ImageDrop file={file} fileUrl={fileUrl} onFile={setFile} />
      </div>

      <CostButton service="video" lab={lab} onClick={submit} busy={busy}>
        {file ? "이미지로 영상 생성 (5초)" : "영상 생성 (5초)"}
      </CostButton>
      <GenerationProgress state={state} service="video" />
      <ResultCard key={state.phase === "done" ? state.jobId : "idle"} state={state} />
      <ErrorLine state={state} />
    </div>
  );
}

const AVATAR_SAMPLES = [
  { label: "프레젠터", src: "/images/hero.jpg" },
  { label: "상담사", src: "/images/persona-counselor.jpg" },
  { label: "면접관", src: "/images/persona-interviewer.jpg" },
  { label: "인플루언서", src: "/images/persona-influencer.jpg" },
  { label: "디지털트윈", src: "/images/persona-twin.jpg" },
];

function AvatarPanel({ lab }: { lab: Lab }) {
  const { state, run } = useJobRunner(lab, "avatar");
  const [text, setText] = useState("안녕하세요! 이 영상은 테스트 페이지에서 방금 만들어졌습니다.");
  const [sample, setSample] = useState(AVATAR_SAMPLES[0].src);
  const [file, setFile] = useState<File | null>(null);
  const fileUrl = useObjectUrl(file);

  const submit = async () => {
    const f = new FormData();
    f.set("model", "daVinci-MagiHuman");
    f.set("prompt_ko", text);
    f.set("duration_s", "6");
    f.set("orientation", "portrait");
    if (file) {
      f.set("ref_image", file);
    } else {
      const blob = await fetch(sample).then((r) => r.blob());
      f.set("ref_image", new File([blob], "ref.jpg", { type: "image/jpeg" }));
    }
    run("/v1/talking_head", f);
  };

  const busy = state.phase === "submitting" || state.phase === "polling";
  return (
    <div className="space-y-4">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={inputCls} placeholder="아바타가 말할 한국어 대사" />
      <div>
        <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-paper-faint">인물 선택</p>
        <div className="flex flex-wrap gap-2">
          {AVATAR_SAMPLES.map((s) => (
            <button
              key={s.src}
              onClick={() => {
                setSample(s.src);
                setFile(null);
              }}
              className={`overflow-hidden border-2 transition-colors ${!file && sample === s.src ? "border-lime" : "border-ink-line"}`}
              title={s.label}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt={s.label} className="h-16 w-14 object-cover" />
            </button>
          ))}
        </div>
        <p className="mb-2 mt-4 font-mono text-[10px] tracking-[0.2em] text-paper-faint">
          또는 내 사진 첨부 — 첨부한 인물이 말하는 영상으로 만듭니다
        </p>
        <ImageDrop file={file} fileUrl={fileUrl} onFile={setFile} />
      </div>
      <CostButton service="avatar" lab={lab} onClick={submit} busy={busy}>
        말하는 아바타 생성 (6초)
      </CostButton>
      <GenerationProgress state={state} service="avatar" />
      <ResultCard key={state.phase === "done" ? state.jobId : "idle"} state={state} />
      <ErrorLine state={state} />
    </div>
  );
}

const MUSIC_GENRES = ["자동", "어쿠스틱", "팝", "발라드", "재즈", "Lo-Fi", "일렉트로닉", "시네마틱", "클래식", "힙합", "R&B", "록", "트로트"];
const MUSIC_MOODS = ["자동", "밝은", "차분한", "감성적인", "신나는", "웅장한", "슬픈", "몽환적인"];

function MusicPanel({ lab }: { lab: Lab }) {
  const { state, run } = useJobRunner(lab, "music");
  const [prompt, setPrompt] = useState("잔잔한 카페에서 어울리는 따뜻한 어쿠스틱 음악");
  const [genre, setGenre] = useState("자동");
  const [mood, setMood] = useState("자동");
  const [instrumental, setInstrumental] = useState(true);
  const [lyrics, setLyrics] = useState("");
  const [duration, setDuration] = useState(30);

  const submit = () => {
    const f = new FormData();
    f.set("model", "ACE-Step v1.5 XL");
    f.set("prompt_ko", prompt);
    if (genre !== "자동") f.set("genre", genre);
    if (mood !== "자동") f.set("mood", mood);
    f.set("instrumental", instrumental ? "true" : "false");
    if (!instrumental && lyrics.trim()) f.set("lyrics", lyrics);
    f.set("duration_s", String(duration));
    run("/v1/music", f);
  };

  const busy = state.phase === "submitting" || state.phase === "polling";
  return (
    <div className="space-y-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        className={inputCls}
        placeholder="만들고 싶은 음악을 설명하세요 (분위기·장면·악기 등)"
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs text-paper-faint">
          장르
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className={`${inputCls} mt-1 max-w-[150px]`}>
            {MUSIC_GENRES.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-paper-faint">
          분위기
          <select value={mood} onChange={(e) => setMood(e.target.value)} className={`${inputCls} mt-1 max-w-[150px]`}>
            {MUSIC_MOODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-paper-faint">
          길이
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className={`${inputCls} mt-1 max-w-[110px]`}
          >
            {[15, 30, 60].map((d) => (
              <option key={d} value={d}>
                {d}초
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-paper-dim">
        <input
          type="checkbox"
          checked={instrumental}
          onChange={(e) => setInstrumental(e.target.checked)}
          className="h-4 w-4 accent-lime"
        />
        연주곡 (보컬 없음)
      </label>
      {!instrumental && (
        <textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          rows={3}
          className={inputCls}
          placeholder="가사 (선택) — 비워두면 분위기에 맞춰 자동 작사됩니다"
        />
      )}

      <CostButton service="music" lab={lab} onClick={submit} busy={busy}>
        음악 생성
      </CostButton>
      <GenerationProgress state={state} service="music" />
      <ResultCard key={state.phase === "done" ? state.jobId : "idle"} state={state} />
      <ErrorLine state={state} />
    </div>
  );
}

/* ── 토스트 ───────────────────────────────────────────── */

function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-[min(92vw,340px)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-pop pointer-events-auto flex items-start gap-2.5 border bg-ink p-4 shadow-lg ${
            t.type === "success"
              ? "border-lime/50"
              : t.type === "error"
                ? "border-red-500/50"
                : "border-ink-line"
          }`}
        >
          <span
            className={`mt-0.5 text-sm ${
              t.type === "success" ? "text-lime" : t.type === "error" ? "text-red-600" : "text-paper-faint"
            }`}
          >
            {t.type === "success" ? "✓" : t.type === "error" ? "!" : "•"}
          </span>
          <p className="text-sm leading-relaxed text-paper">{t.msg}</p>
        </div>
      ))}
    </div>
  );
}

/* ── 메인 ─────────────────────────────────────────────── */

export default function TestLab() {
  const [tab, setTab] = useState<TabId>("tts");
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [balance, setBalance] = useState(0);
  const [queueDepth, setQueueDepth] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((type: ToastType, msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, type, msg }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4200);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setMe(d.user);
        if (d.user) setBalance(d.user.credits);
      })
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (!me) return;
    const tick = () =>
      fetch("/api/marv/health")
        .then((r) => r.json())
        .then((h) => setQueueDepth(typeof h.queue_depth === "number" ? h.queue_depth : null))
        .catch(() => {});
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, [me]);

  if (me === undefined)
    return (
      <p className="flex items-center gap-2 font-mono text-sm text-paper-faint">
        <Spinner className="h-4 w-4" /> 불러오는 중…
      </p>
    );

  if (!me) {
    return (
      <div className="border border-ink-line bg-ink-soft p-10 text-center">
        <p className="text-lg font-bold">로그인이 필요합니다</p>
        <p className="mt-2 text-sm text-paper-dim">
          회원가입하면 100 크레딧을 무료로 드립니다. 음성·이미지·영상·아바타를 직접 만들어 보세요.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/signup" className="bg-lime px-6 py-3 text-sm font-bold text-ink hover:bg-lime-deep">
            회원가입 (100 크레딧)
          </Link>
          <Link href="/login" className="border border-ink-line px-6 py-3 text-sm font-semibold text-paper-dim hover:border-lime">
            로그인
          </Link>
        </div>
      </div>
    );
  }

  const unlimited = me.unlimited === 1;
  const lab: Lab = { unlimited, balance, setBalance, notify };

  return (
    <div>
      {/* 잔액 바 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-ink-line bg-ink-soft px-5 py-3">
        <p className="text-sm">
          <span className="text-paper-faint">{me.name} 님 · </span>
          {unlimited ? (
            <span className="font-bold text-lime">무제한 사용</span>
          ) : (
            <>
              잔액 <span className="font-bold text-lime">{balance.toLocaleString()}</span> 크레딧
            </>
          )}
        </p>
        <Link href="/account" className="font-mono text-[11px] tracking-[0.15em] text-paper-faint hover:text-lime">
          사용 내역 · 충전 →
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-line">
        <div className="flex flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                tab === t.id ? "border-lime text-paper" : "border-transparent text-paper-faint hover:text-paper-dim"
              }`}
            >
              {t.label}
              <span className="ml-1.5 font-mono text-[10px] text-paper-faint">{CREDIT_COSTS[t.id]}CR</span>
            </button>
          ))}
        </div>
        <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-paper-faint">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-lime" />
          대기열 {queueDepth ?? "–"}
        </p>
      </div>

      {/* 모든 패널을 마운트 유지 → 탭을 바꿔도 생성이 계속 진행됨 */}
      <div className="pt-8">
        <div className={tab === "tts" ? "" : "hidden"}>
          <TtsPanel lab={lab} />
        </div>
        <div className={tab === "llm" ? "" : "hidden"}>
          <LlmPanel lab={lab} />
        </div>
        <div className={tab === "image" ? "" : "hidden"}>
          <ImagePanel lab={lab} />
        </div>
        <div className={tab === "video" ? "" : "hidden"}>
          <VideoPanel lab={lab} />
        </div>
        <div className={tab === "music" ? "" : "hidden"}>
          <MusicPanel lab={lab} />
        </div>
        <div className={tab === "avatar" ? "" : "hidden"}>
          <AvatarPanel lab={lab} />
        </div>
      </div>

      <Toasts toasts={toasts} />
    </div>
  );
}
