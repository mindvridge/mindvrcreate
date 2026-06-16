"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CREDIT_COSTS, type Service } from "@/lib/credits";
import type { Dict } from "@/lib/i18n";

type TabId = Service;
type LabT = Dict["lab"];
type ServiceLabels = Dict["serviceLabels"];

const TAB_IDS: TabId[] = ["tts", "llm", "image", "video", "music", "avatar"];

type ToastType = "success" | "error" | "info";
type Toast = { id: number; type: ToastType; msg: string };

type Me = { name: string; credits: number; unlimited: number };

type Lab = {
  unlimited: boolean;
  balance: number;
  setBalance: (n: number) => void;
  notify: (type: ToastType, msg: string) => void;
  t: LabT;
  serviceLabels: ServiceLabels;
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
  t,
}: {
  file: File | null;
  fileUrl: string | null;
  onFile: (f: File | null) => void;
  t: LabT;
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
          <img src={fileUrl} alt={t.attachedAlt} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl leading-none">＋</span>
        )}
      </button>
      <div className="min-w-0 text-sm">
        {file ? (
          <>
            <p className="truncate font-semibold text-paper-dim">{file.name}</p>
            <button onClick={() => onFile(null)} className="mt-1 text-xs font-semibold text-paper-faint hover:text-lime">
              {t.remove}
            </button>
          </>
        ) : (
          <p className="text-paper-faint">{t.choosePhoto}</p>
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

/**
 * 잡 제출 → 폴링 → 결과 확정까지의 공용 러너.
 * 진행 중 잡을 localStorage에 저장해, 다른 페이지로 이동했다 돌아와도 자동으로 폴링을 재개한다.
 * cancel() 호출 시 서버에서 잡을 취소하고 차감된 크레딧을 환불한다.
 */
function useJobRunner(lab: Lab, service: Service) {
  const [state, setState] = useState<JobState>({ phase: "idle" });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const jobIdRef = useRef<string | null>(null);
  const notify = lab.notify;
  const tr = lab.t;
  const svcLabel = lab.serviceLabels[service];
  const storeKey = `mv_job_${service}`;

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const clearStore = useCallback(() => {
    jobIdRef.current = null;
    try {
      localStorage.removeItem(storeKey);
    } catch {
      /* SSR/프라이빗 모드 */
    }
  }, [storeKey]);

  const poll = useCallback(
    (jobId: string, startedAt: number) => {
      stop();
      jobIdRef.current = jobId;
      setState({ phase: "polling", jobId, status: "queued", seconds: Math.floor((Date.now() - startedAt) / 1000) });
      timer.current = setInterval(async () => {
        const seconds = Math.floor((Date.now() - startedAt) / 1000);
        try {
          const jr = await fetch(`/api/marv/jobs/${jobId}`, { cache: "no-store" });
          const jb = jr.headers.get("X-MV-Balance");
          if (jb !== null) lab.setBalance(Number(jb));
          const job = await jr.json();
          if (job.status === "finished") {
            stop();
            clearStore();
            const r = await fetch(`/api/marv/jobs/${jobId}/result`);
            const ct = r.headers.get("content-type") ?? "";
            const blob = await r.blob();
            setState({ phase: "done", jobId, kind: kindFromContentType(ct), url: URL.createObjectURL(blob) });
            notify("success", tr.jobDone.replace("{s}", svcLabel));
          } else if (job.status === "failed") {
            stop();
            clearStore();
            setState({ phase: "error", message: tr.jobFailed });
            notify("error", tr.jobFailed);
          } else {
            setState({ phase: "polling", jobId, status: job.status, seconds });
          }
        } catch {
          /* 일시 오류는 다음 폴링에서 재시도 */
        }
      }, 4000);
    },
    [stop, clearStore, lab, notify, tr, svcLabel]
  );

  // 언마운트 시 타이머만 정리(스토리지는 유지 → 재방문 시 재개)
  useEffect(() => stop, [stop]);

  // 마운트 시 진행 중이던 잡이 있으면 폴링 재개
  useEffect(() => {
    let saved: { jobId: string; startedAt: number } | null = null;
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) saved = JSON.parse(raw);
    } catch {
      /* noop */
    }
    if (!saved?.jobId) return;
    const t = setTimeout(() => poll(saved!.jobId, saved!.startedAt), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          setState({ phase: "error", message: tr.insufficient, insufficient: true });
          notify("error", tr.insufficientToast);
          return;
        }
        const json = await res.json();
        if (!res.ok || !json.job_id) {
          const msg = json.detail ?? tr.requestFailed;
          setState({ phase: "error", message: msg });
          notify("error", msg);
          return;
        }

        const charged = res.headers.get("X-MV-Charged");
        const unlimited = res.headers.get("X-MV-Unlimited") === "1";
        notify(
          "info",
          unlimited || !charged
            ? tr.jobStarted.replace("{s}", svcLabel)
            : tr.jobStartedCharged.replace("{s}", svcLabel).replace("{c}", charged)
        );

        const jobId: string = json.job_id;
        const startedAt = Date.now();
        try {
          localStorage.setItem(storeKey, JSON.stringify({ jobId, startedAt }));
        } catch {
          /* noop */
        }
        poll(jobId, startedAt);
      } catch {
        setState({ phase: "error", message: tr.requestError });
        notify("error", tr.requestError);
      }
    },
    [stop, lab, notify, tr, svcLabel, poll, storeKey]
  );

  const cancel = useCallback(async () => {
    const jobId = jobIdRef.current;
    stop();
    clearStore();
    setState({ phase: "idle" });
    if (!jobId) return;
    try {
      const res = await fetch(`/api/marv/jobs/${jobId}/cancel`, { method: "POST" });
      const b = res.headers.get("X-MV-Balance");
      if (b !== null) lab.setBalance(Number(b));
      notify("info", tr.cancelled.replace("{s}", svcLabel));
    } catch {
      notify("error", tr.cancelError);
    }
  }, [stop, clearStore, lab, notify, tr, svcLabel]);

  return { state, run, cancel };
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
      {busy ? lab.t.generating : children}
      {!busy && <span className="font-mono text-xs opacity-70">· {cost} CR</span>}
    </button>
  );
}

/** 친절한 진행 인디케이터 (대기/생성 + 진행바 + 타이머 + 예상시간 + 취소) */
function GenerationProgress({
  state,
  service,
  t,
  onCancel,
}: {
  state: JobState;
  service: Service;
  t: LabT;
  onCancel?: () => void;
}) {
  if (state.phase !== "submitting" && state.phase !== "polling") return null;
  const elapsed = state.phase === "polling" ? state.seconds : 0;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const queued = state.phase === "polling" && state.status === "queued";
  const title =
    state.phase === "submitting" ? t.progressSubmitting : queued ? t.progressQueued : t.progressWorking;
  const sub = queued ? t.queuedSub : t.workingSub.replace("{est}", t.estimate[service]);

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
        {onCancel && state.phase === "polling" && (
          <button
            onClick={onCancel}
            className="shrink-0 border border-ink-line px-3 py-1.5 text-xs font-semibold text-paper-dim transition-colors hover:border-red-500 hover:text-red-600"
          >
            {t.cancel}
          </button>
        )}
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

function ResultCard({ state, t }: { state: JobState; t: LabT }) {
  const [zoom, setZoom] = useState(false);
  if (state.phase !== "done") return null;

  const ext = state.kind === "audio" ? "wav" : state.kind === "video" ? "mp4" : state.kind === "image" ? "png" : "bin";
  const fileName = `mindvr-${state.jobId.slice(0, 8)}.${ext}`;
  const zoomable = state.kind === "image" || state.kind === "video";

  return (
    <div className="mt-5 animate-pop border border-ink-line bg-ink-soft p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-bold text-lime">
          <span className="text-base leading-none">✓</span> {t.doneHeader}
        </p>
        <div className="flex items-center gap-3">
          {zoomable && (
            <button onClick={() => setZoom(true)} className="text-xs font-semibold text-paper-dim hover:text-lime">
              {t.viewLarge}
            </button>
          )}
          <a href={state.url} download={fileName} className="text-xs font-semibold text-paper-dim hover:text-lime">
            {t.download}
          </a>
        </div>
      </div>

      {state.kind === "audio" && <audio controls src={state.url} className="w-full" />}
      {state.kind === "image" && (
        <button onClick={() => setZoom(true)} className="block w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={state.url} alt={t.resultAlt} className="max-h-[420px] w-auto cursor-zoom-in" />
        </button>
      )}
      {state.kind === "video" && <video controls autoPlay loop src={state.url} className="max-h-[420px] w-auto" />}
      {state.kind === "file" && (
        <a href={state.url} download={fileName} className="font-semibold text-lime underline">
          {t.resultFileDownload}
        </a>
      )}

      {zoom && zoomable && (
        <div
          className="fixed inset-0 z-[70] flex animate-fade items-center justify-center bg-black/85 p-4 sm:p-8"
          onClick={() => setZoom(false)}
        >
          {state.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={state.url} alt={t.resultZoomAlt} className="max-h-[92vh] max-w-[92vw] object-contain" />
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
            {t.close}
          </button>
        </div>
      )}
    </div>
  );
}

function ErrorLine({ state, t }: { state: JobState; t: LabT }) {
  if (state.phase !== "error") return null;
  return (
    <div className="mt-5 animate-fade border border-red-500/30 bg-red-500/5 p-4">
      <p className="text-sm font-semibold text-red-600">
        {state.message}{" "}
        {state.insufficient && (
          <Link href="/account" className="ml-1 text-lime underline">
            {t.chargeInfo}
          </Link>
        )}
      </p>
    </div>
  );
}

/* ── 탭별 패널 ─────────────────────────────────────────── */

function TtsPanel({ lab }: { lab: Lab }) {
  const { state, run, cancel } = useJobRunner(lab, "tts");
  const [voices, setVoices] = useState<{ id: string; name: string }[]>([]);
  const [voiceId, setVoiceId] = useState("");
  const [text, setText] = useState(lab.t.ttsDefault);

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
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={inputCls} placeholder={lab.t.ttsPlaceholder} />
      <div className="flex flex-wrap items-center gap-3">
        <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)} className={`${inputCls} max-w-xs`}>
          <option value="">{lab.t.defaultVoice}</option>
          {voices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <CostButton service="tts" lab={lab} onClick={submit} busy={busy}>
          {lab.t.ttsGenerate}
        </CostButton>
      </div>
      <GenerationProgress state={state} service="tts" t={lab.t} onCancel={cancel} />
      <ResultCard key={state.phase === "done" ? state.jobId : "idle"} state={state} t={lab.t} />
      <ErrorLine state={state} t={lab.t} />
    </div>
  );
}

type ChatMsg = { role: "user" | "assistant"; content: string };

function LlmPanel({ lab }: { lab: Lab }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; insufficient?: boolean } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const broke = !lab.unlimited && lab.balance < CREDIT_COSTS.llm;

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || busy) return;
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const f = new FormData();
      f.set("message", msg);
      f.set("history", JSON.stringify(history));
      const res = await fetch("/api/marv/submit?path=%2Fv1%2Fchat", { method: "POST", body: f });
      const b = res.headers.get("X-MV-Balance");
      if (b !== null) lab.setBalance(Number(b));
      if (res.status === 402) {
        setError({ message: lab.t.insufficient, insufficient: true });
        lab.notify("error", lab.t.insufficientToast);
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        setError({ message: json.detail ?? lab.t.requestFailed });
        lab.notify("error", json.detail ?? lab.t.requestFailed);
        return;
      }
      const reply: string =
        json.message_to_user ?? (json.job_id ? lab.t.chatStartedReply : lab.t.chatNoReply);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setError({ message: lab.t.requestError });
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-[0.2em] text-paper-faint">
          {lab.t.chatHeader.replace("{c}", String(CREDIT_COSTS.llm))}
        </p>
        {messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            className="text-xs font-semibold text-paper-faint hover:text-lime"
          >
            {lab.t.clearChat}
          </button>
        )}
      </div>

      {/* 대화 영역 */}
      <div ref={scrollRef} className="h-[400px] space-y-3 overflow-y-auto border border-ink-line bg-ink-soft/40 p-4">
        {messages.length === 0 && !busy ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-paper-faint">{lab.t.chatEmpty}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {lab.t.chatExamples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => send(ex)}
                  className="border border-ink-line bg-ink px-3 py-1.5 text-xs text-paper-dim transition-colors hover:border-lime hover:text-lime"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-wrap px-4 py-2.5 text-sm leading-relaxed animate-pop ${
                    m.role === "user" ? "bg-lime text-ink" : "border border-ink-line bg-ink text-paper-dim"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 border border-ink-line bg-ink px-4 py-2.5 text-sm text-paper-faint">
                  <Spinner className="h-4 w-4" />
                  {lab.t.typing}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <div className="animate-fade border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm font-semibold text-red-600">
            {error.message}{" "}
            {error.insufficient && (
              <Link href="/account" className="ml-1 text-lime underline">
                {lab.t.chargeInfo}
              </Link>
            )}
          </p>
        </div>
      )}

      {/* 입력 */}
      <div className="flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={broke ? lab.t.insufficient : lab.t.chatPlaceholder}
          disabled={broke}
          className={`${inputCls} max-h-32 min-h-[48px] flex-1 resize-none`}
        />
        <button
          onClick={() => send(input)}
          disabled={busy || broke || !input.trim()}
          className="inline-flex h-[48px] items-center gap-2 bg-lime px-6 text-sm font-bold text-ink transition-colors hover:bg-lime-deep disabled:opacity-50"
        >
          {busy ? <Spinner className="h-4 w-4" /> : lab.t.send}
        </button>
      </div>
      <p className="text-xs text-paper-faint">{lab.t.chatNote}</p>
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
  const tr = lab.t;
  const storeKey = "mv_compare_image";

  const stop = useCallback(() => {
    Object.values(timers.current).forEach((t) => clearInterval(t));
    timers.current = {};
  }, []);

  const clearStore = useCallback(() => {
    try {
      localStorage.removeItem(storeKey);
    } catch {
      /* noop */
    }
  }, []);

  const pollJobs = useCallback(
    (jobs: { job_id: string; model?: string }[]) => {
      stop();
      setItems(jobs.map((j) => ({ jobId: j.job_id, model: j.model ?? "", phase: "polling" as const })));
      setPhase("running");
      let done = 0;
      const finishOne = () => {
        if (++done >= jobs.length) {
          clearStore();
          notify("success", tr.compareDone);
        }
      };
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
              finishOne();
            } else if (job.status === "failed") {
              clearInterval(timers.current[id]);
              delete timers.current[id];
              setItems((prev) => prev?.map((it) => (it.jobId === id ? { ...it, phase: "error" } : it)) ?? prev);
              finishOne();
            }
          } catch {
            /* 일시 오류는 다음 폴링에서 재시도 */
          }
        }, 4000);
      });
    },
    [stop, clearStore, notify, tr]
  );

  useEffect(() => stop, [stop]);

  // 마운트 시 진행 중이던 4장 생성 재개
  useEffect(() => {
    let saved: { job_id: string; model?: string }[] | null = null;
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) saved = JSON.parse(raw);
    } catch {
      /* noop */
    }
    if (!saved || !saved.length) return;
    const arr = saved;
    const t = setTimeout(() => pollJobs(arr), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          setErrMsg(tr.insufficient);
          notify("error", tr.insufficientToast);
          return;
        }
        const json = await res.json();
        const jobs: { job_id: string; model?: string }[] = Array.isArray(json.jobs)
          ? json.jobs.filter((j: { job_id?: string }) => j?.job_id)
          : [];
        if (!res.ok || jobs.length === 0) {
          const m = json.detail ?? tr.requestFailed;
          setPhase("error");
          setErrMsg(m);
          notify("error", m);
          return;
        }
        const charged = res.headers.get("X-MV-Charged");
        notify(
          "info",
          charged
            ? tr.compareStartCharged.replace("{n}", String(jobs.length)).replace("{c}", charged)
            : tr.compareStart.replace("{n}", String(jobs.length))
        );
        try {
          localStorage.setItem(storeKey, JSON.stringify(jobs.map((j) => ({ job_id: j.job_id, model: j.model }))));
        } catch {
          /* noop */
        }
        pollJobs(jobs);
      } catch {
        setPhase("error");
        setErrMsg(tr.requestError);
        notify("error", tr.requestError);
      }
    },
    [stop, lab, notify, tr, pollJobs]
  );

  return { items, phase, errMsg, run };
}

function CompareGrid({ items, onZoom, t }: { items: CompareItem[]; onZoom: (url: string) => void; t: LabT }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it, i) => (
        <div key={it.jobId} className="animate-pop border border-ink-line bg-ink-soft">
          <div className="flex aspect-square items-center justify-center overflow-hidden bg-ink">
            {it.phase === "done" && it.url ? (
              <button onClick={() => onZoom(it.url!)} className="h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt={t.imageN.replace("{n}", String(i + 1))} className="h-full w-full cursor-zoom-in object-cover" />
              </button>
            ) : it.phase === "error" ? (
              <span className="px-2 text-center text-xs text-red-600">{t.genFailed}</span>
            ) : (
              <span className="text-lime">
                <Spinner />
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 px-2.5 py-2">
            <p className="font-mono text-[10px] text-paper-dim">{t.imageN.replace("{n}", String(i + 1))}</p>
            {it.phase === "done" && it.url && (
              <a
                href={it.url}
                download={`mindvr-${it.jobId.slice(0, 8)}.png`}
                className="shrink-0 text-[10px] font-semibold text-paper-faint hover:text-lime"
              >
                {t.save}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// 국적·국가·해외 지명이 명시되지 않은 프롬프트는 자동으로 한국인·한국 배경으로 보정한다.(언어 무관 제품 동작)
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
  const [prompt, setPrompt] = useState(lab.t.imgDefault);
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
          {busy ? lab.t.generating : lab.t.gen4}
          {!busy && <span className="font-mono text-xs opacity-70">· {cost} CR</span>}
        </button>
      </div>
      <p className="text-xs text-paper-faint">
        {lab.t.imgNoteA}
        <span className="text-paper-dim">{lab.t.imgNoteEm1}</span>
        {lab.t.imgNoteB}
        <span className="text-paper-dim">{lab.t.imgNoteEm2}</span>
        {lab.t.imgNoteC}
      </p>

      {/* 4장 동시 생성 진행/결과 */}
      {compare.phase === "submitting" && (
        <div className="mt-5 flex animate-fade items-center gap-3 border border-ink-line bg-ink-soft p-5">
          <span className="text-lime">
            <Spinner />
          </span>
          <p className="text-sm font-semibold">{lab.t.comparing}</p>
        </div>
      )}
      {compare.items && <CompareGrid items={compare.items} onZoom={setZoom} t={lab.t} />}
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
          <img src={zoom} alt={lab.t.resultZoomAlt} className="max-h-[92vh] max-w-[92vw] object-contain" />
        </div>
      )}
    </div>
  );
}

function VideoPanel({ lab }: { lab: Lab }) {
  const { state, run, cancel } = useJobRunner(lab, "video");
  const [prompt, setPrompt] = useState(lab.t.videoDefault);
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
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className={inputCls} placeholder={lab.t.videoPlaceholder} />

      <div>
        <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-paper-faint">{lab.t.videoStartImage}</p>
        <ImageDrop file={file} fileUrl={fileUrl} onFile={setFile} t={lab.t} />
      </div>

      <CostButton service="video" lab={lab} onClick={submit} busy={busy}>
        {file ? lab.t.videoGenImage : lab.t.videoGen}
      </CostButton>
      <GenerationProgress state={state} service="video" t={lab.t} onCancel={cancel} />
      <ResultCard key={state.phase === "done" ? state.jobId : "idle"} state={state} t={lab.t} />
      <ErrorLine state={state} t={lab.t} />
    </div>
  );
}

const AVATAR_SRCS = [
  "/images/hero.jpg",
  "/images/persona-counselor.jpg",
  "/images/persona-interviewer.jpg",
  "/images/persona-influencer.jpg",
  "/images/persona-twin.jpg",
];

function AvatarPanel({ lab }: { lab: Lab }) {
  const { state, run, cancel } = useJobRunner(lab, "avatar");
  const [text, setText] = useState(lab.t.avatarDefault);
  const [sample, setSample] = useState(AVATAR_SRCS[0]);
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
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={inputCls} placeholder={lab.t.avatarPlaceholder} />
      <div>
        <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-paper-faint">{lab.t.personSelect}</p>
        <div className="flex flex-wrap gap-2">
          {AVATAR_SRCS.map((src, i) => (
            <button
              key={src}
              onClick={() => {
                setSample(src);
                setFile(null);
              }}
              className={`overflow-hidden border-2 transition-colors ${!file && sample === src ? "border-lime" : "border-ink-line"}`}
              title={lab.t.avatarSamples[i]}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={lab.t.avatarSamples[i]} className="h-16 w-14 object-cover" />
            </button>
          ))}
        </div>
        <p className="mb-2 mt-4 font-mono text-[10px] tracking-[0.2em] text-paper-faint">{lab.t.avatarUpload}</p>
        <ImageDrop file={file} fileUrl={fileUrl} onFile={setFile} t={lab.t} />
      </div>
      <CostButton service="avatar" lab={lab} onClick={submit} busy={busy}>
        {lab.t.avatarGen}
      </CostButton>
      <GenerationProgress state={state} service="avatar" t={lab.t} onCancel={cancel} />
      <ResultCard key={state.phase === "done" ? state.jobId : "idle"} state={state} t={lab.t} />
      <ErrorLine state={state} t={lab.t} />
    </div>
  );
}

// 마브 API에 보낼 정규화된(영문) 장르·무드 값. 인덱스 0 = 자동(미전송).
const GENRE_VALUES = ["", "Acoustic", "Pop", "Ballad", "Jazz", "Lo-Fi", "Electronic", "Cinematic", "Classical", "Hip-hop", "R&B", "Rock", "Trot"];
const MOOD_VALUES = ["", "Bright", "Calm", "Emotional", "Upbeat", "Epic", "Sad", "Dreamy"];

function MusicPanel({ lab }: { lab: Lab }) {
  const { state, run, cancel } = useJobRunner(lab, "music");
  const [prompt, setPrompt] = useState(lab.t.musicDefault);
  const [genre, setGenre] = useState(0);
  const [mood, setMood] = useState(0);
  const [instrumental, setInstrumental] = useState(true);
  const [lyrics, setLyrics] = useState("");
  const [duration, setDuration] = useState(30);

  const submit = () => {
    const f = new FormData();
    f.set("model", "ACE-Step v1.5 XL");
    f.set("prompt_ko", prompt);
    if (genre > 0) f.set("genre", GENRE_VALUES[genre]);
    if (mood > 0) f.set("mood", MOOD_VALUES[mood]);
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
        placeholder={lab.t.musicPlaceholder}
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs text-paper-faint">
          {lab.t.genreLabel}
          <select value={genre} onChange={(e) => setGenre(Number(e.target.value))} className={`${inputCls} mt-1 max-w-[150px]`}>
            {lab.t.genres.map((g, i) => (
              <option key={g} value={i}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-paper-faint">
          {lab.t.moodLabel}
          <select value={mood} onChange={(e) => setMood(Number(e.target.value))} className={`${inputCls} mt-1 max-w-[150px]`}>
            {lab.t.moods.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-paper-faint">
          {lab.t.lengthLabel}
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className={`${inputCls} mt-1 max-w-[110px]`}
          >
            {[15, 30, 60].map((d) => (
              <option key={d} value={d}>
                {lab.t.secondsUnit.replace("{d}", String(d))}
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
        {lab.t.instrumental}
      </label>
      {!instrumental && (
        <textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          rows={3}
          className={inputCls}
          placeholder={lab.t.lyricsPlaceholder}
        />
      )}

      <CostButton service="music" lab={lab} onClick={submit} busy={busy}>
        {lab.t.musicGen}
      </CostButton>
      <GenerationProgress state={state} service="music" t={lab.t} onCancel={cancel} />
      <ResultCard key={state.phase === "done" ? state.jobId : "idle"} state={state} t={lab.t} />
      <ErrorLine state={state} t={lab.t} />
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
            t.type === "success" ? "border-lime/50" : t.type === "error" ? "border-red-500/50" : "border-ink-line"
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

export default function TestLab({ t, serviceLabels }: { t: LabT; serviceLabels: ServiceLabels }) {
  const [tab, setTab] = useState<TabId>("tts");
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [balance, setBalance] = useState(0);
  const [queueDepth, setQueueDepth] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((type: ToastType, msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, type, msg }]);
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 4200);
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
        <Spinner className="h-4 w-4" /> {t.loading}
      </p>
    );

  if (!me) {
    return (
      <div className="border border-ink-line bg-ink-soft p-10 text-center">
        <p className="text-lg font-bold">{t.loginRequired}</p>
        <p className="mt-2 text-sm text-paper-dim">{t.gateLede.replace("{bonus}", "300")}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/signup" className="bg-lime px-6 py-3 text-sm font-bold text-ink hover:bg-lime-deep">
            {t.gateSignup.replace("{bonus}", "300")}
          </Link>
          <Link href="/login" className="border border-ink-line px-6 py-3 text-sm font-semibold text-paper-dim hover:border-lime">
            {t.gateLogin}
          </Link>
        </div>
      </div>
    );
  }

  const unlimited = me.unlimited === 1;
  const lab: Lab = { unlimited, balance, setBalance, notify, t, serviceLabels };

  return (
    <div>
      {/* 잔액 바 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-ink-line bg-ink-soft px-5 py-3">
        <p className="text-sm">
          <span className="text-paper-faint">{me.name}{t.userSuffix}</span>
          {unlimited ? (
            <span className="font-bold text-lime">{t.unlimitedUse}</span>
          ) : (
            <>
              {t.balanceLead}
              <span className="font-bold text-lime">{balance.toLocaleString()}</span> {t.creditsUnit}
            </>
          )}
        </p>
        <Link href="/account" className="font-mono text-[11px] tracking-[0.15em] text-paper-faint hover:text-lime">
          {t.usageLink}
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-line">
        <div className="flex flex-wrap">
          {TAB_IDS.map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                tab === id ? "border-lime text-paper" : "border-transparent text-paper-faint hover:text-paper-dim"
              }`}
            >
              {serviceLabels[id]}
              <span className="ml-1.5 font-mono text-[10px] text-paper-faint">{CREDIT_COSTS[id]}CR</span>
            </button>
          ))}
        </div>
        <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-paper-faint">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-lime" />
          {t.queueLabel.replace("{n}", String(queueDepth ?? "–"))}
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
