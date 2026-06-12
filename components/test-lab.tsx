"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TabId = "tts" | "llm" | "image" | "video" | "avatar";

const TABS: { id: TabId; label: string; en: string }[] = [
  { id: "tts", label: "음성 (TTS)", en: "TTS" },
  { id: "llm", label: "대화 (LLM)", en: "LLM" },
  { id: "image", label: "이미지 생성", en: "IMAGE" },
  { id: "video", label: "영상 생성", en: "VIDEO" },
  { id: "avatar", label: "아바타", en: "AVATAR" },
];

type JobState =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "polling"; jobId: string; status: string; seconds: number }
  | { phase: "done"; jobId: string; kind: "audio" | "image" | "video" | "file"; url: string }
  | { phase: "error"; message: string };

function kindFromContentType(ct: string): "audio" | "image" | "video" | "file" {
  if (ct.startsWith("audio/")) return "audio";
  if (ct.startsWith("image/")) return "image";
  if (ct.startsWith("video/")) return "video";
  return "file";
}

/** 잡 제출 → 폴링 → 결과 URL 확정까지의 공용 러너 */
function useJobRunner() {
  const [state, setState] = useState<JobState>({ phase: "idle" });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

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
        const json = await res.json();
        if (!res.ok || !json.job_id) {
          setState({ phase: "error", message: json.detail ?? "잡 생성에 실패했습니다." });
          return;
        }
        const jobId: string = json.job_id;
        let seconds = 0;
        setState({ phase: "polling", jobId, status: "queued", seconds });

        timer.current = setInterval(async () => {
          seconds += 4;
          try {
            const jr = await fetch(`/api/marv/jobs/${jobId}`, { cache: "no-store" });
            const job = await jr.json();
            if (job.status === "finished") {
              stop();
              const head = await fetch(`/api/marv/jobs/${jobId}/result`, { method: "GET" });
              const ct = head.headers.get("content-type") ?? "";
              const blob = await head.blob();
              setState({
                phase: "done",
                jobId,
                kind: kindFromContentType(ct),
                url: URL.createObjectURL(blob),
              });
            } else if (job.status === "failed") {
              stop();
              setState({ phase: "error", message: job.error ?? "생성에 실패했습니다." });
            } else {
              setState({ phase: "polling", jobId, status: job.status, seconds });
            }
          } catch {
            /* 일시 네트워크 오류는 다음 폴링에서 재시도 */
          }
        }, 4000);
      } catch {
        setState({ phase: "error", message: "요청 중 오류가 발생했습니다." });
      }
    },
    [stop]
  );

  return { state, run };
}

const inputCls =
  "w-full border border-ink-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-faint focus:border-lime focus:outline-none";
const btnCls =
  "bg-lime px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-lime-deep disabled:opacity-50";

function StatusLine({ state }: { state: JobState }) {
  if (state.phase === "idle") return null;
  if (state.phase === "submitting")
    return <p className="font-mono text-xs text-paper-faint">SUBMITTING…</p>;
  if (state.phase === "polling")
    return (
      <p className="flex items-center gap-2 font-mono text-xs text-paper-faint">
        <span className="live-dot h-2 w-2 rounded-full bg-lime" />
        {state.status.toUpperCase()} · {state.seconds}s · JOB {state.jobId.slice(0, 8)} — GPU
        대기열에서 순차 처리됩니다
      </p>
    );
  if (state.phase === "error")
    return <p className="text-sm font-semibold text-red-600">오류: {state.message}</p>;
  return null;
}

function ResultView({ state }: { state: JobState }) {
  if (state.phase !== "done") return null;
  return (
    <div className="mt-5 border border-ink-line bg-ink-soft p-4">
      <p className="mb-3 font-mono text-[10px] tracking-[0.2em] text-paper-faint">
        RESULT · JOB {state.jobId.slice(0, 8)}
      </p>
      {state.kind === "audio" && <audio controls src={state.url} className="w-full" />}
      {state.kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={state.url} alt="생성 결과" className="max-h-[480px] w-auto" />
      )}
      {state.kind === "video" && (
        <video controls src={state.url} className="max-h-[480px] w-auto" />
      )}
      {state.kind === "file" && (
        <a href={state.url} download className="font-semibold text-lime underline">
          결과 파일 다운로드
        </a>
      )}
    </div>
  );
}

/* ── 탭별 패널 ─────────────────────────────────────────── */

function TtsPanel() {
  const { state, run } = useJobRunner();
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

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className={inputCls}
        placeholder="읽을 한국어 문장"
      />
      <div className="flex flex-wrap items-center gap-3">
        <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)} className={`${inputCls} max-w-xs`}>
          <option value="">기본 음성</option>
          {voices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <button onClick={submit} disabled={state.phase === "submitting" || state.phase === "polling"} className={btnCls}>
          음성 생성
        </button>
      </div>
      <StatusLine state={state} />
      <ResultView state={state} />
    </div>
  );
}

function LlmPanel() {
  const [message, setMessage] = useState("마인드브이알을 한 문장으로 소개해줘.");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setReply(null);
    setError(null);
    try {
      const f = new FormData();
      f.set("message", message);
      const res = await fetch("/api/marv/submit?path=%2Fv1%2Fchat", { method: "POST", body: f });
      const json = await res.json();
      if (!res.ok) setError(json.detail ?? "요청 실패");
      else
        setReply(
          json.message_to_user ??
            (json.job_id ? `생성 잡이 시작되었습니다 (JOB ${json.job_id.slice(0, 8)} · ${json.tab ?? ""})` : JSON.stringify(json))
        );
    } catch {
      setError("요청 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className={inputCls} />
      <button onClick={submit} disabled={busy} className={btnCls}>
        {busy ? "응답 생성 중…" : "보내기"}
      </button>
      {error && <p className="text-sm font-semibold text-red-600">오류: {error}</p>}
      {reply && (
        <div className="border border-ink-line bg-ink-soft p-5 text-sm leading-relaxed text-paper-dim">{reply}</div>
      )}
      <p className="text-xs text-paper-faint">
        * 마브 오케스트레이터에 직접 연결됩니다. &ldquo;~만들어줘&rdquo;라고 하면 실제 생성 잡이 시작될 수 있습니다.
      </p>
    </div>
  );
}

function ImagePanel() {
  const { state, run } = useJobRunner();
  const [prompt, setPrompt] = useState("밝은 스튜디오에서 카메라를 보고 미소 짓는 한국인 바리스타");
  const [model, setModel] = useState("Z-Image-Turbo");
  const [aspect, setAspect] = useState("1:1");

  const submit = () => {
    const f = new FormData();
    f.set("model", model);
    f.set("prompt_ko", prompt);
    f.set("params_json", JSON.stringify({ aspect }));
    run("/v1/image", f);
  };

  return (
    <div className="space-y-4">
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className={inputCls} />
      <div className="flex flex-wrap items-center gap-3">
        <select value={model} onChange={(e) => setModel(e.target.value)} className={`${inputCls} max-w-xs`}>
          <option>Z-Image-Turbo</option>
          <option>Qwen-Image-2512-Lifestyle</option>
          <option>HiDream-O1</option>
        </select>
        <select value={aspect} onChange={(e) => setAspect(e.target.value)} className={`${inputCls} max-w-[110px]`}>
          {["1:1", "16:9", "9:16", "3:4", "4:3"].map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <button onClick={submit} disabled={state.phase === "submitting" || state.phase === "polling"} className={btnCls}>
          이미지 생성
        </button>
      </div>
      <StatusLine state={state} />
      <ResultView state={state} />
    </div>
  );
}

function VideoPanel() {
  const { state, run } = useJobRunner();
  const [prompt, setPrompt] = useState("햇살 좋은 한강공원에서 강아지와 산책하는 사람, 시네마틱");

  const submit = () => {
    const f = new FormData();
    f.set("model", "Wan 2.2 T2V");
    f.set("prompt_ko", prompt);
    f.set("params_json", JSON.stringify({ duration_s: 5 }));
    run("/v1/video", f);
  };

  return (
    <div className="space-y-4">
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className={inputCls} />
      <button onClick={submit} disabled={state.phase === "submitting" || state.phase === "polling"} className={btnCls}>
        영상 생성 (5초)
      </button>
      <p className="text-xs text-paper-faint">* 영상 생성은 수 분이 걸릴 수 있습니다. 페이지를 열어 두세요.</p>
      <StatusLine state={state} />
      <ResultView state={state} />
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

function AvatarPanel() {
  const { state, run } = useJobRunner();
  const [text, setText] = useState("안녕하세요! 이 영상은 테스트 페이지에서 방금 만들어졌습니다.");
  const [sample, setSample] = useState(AVATAR_SAMPLES[0].src);
  const [file, setFile] = useState<File | null>(null);

  const submit = async () => {
    const f = new FormData();
    f.set("model", "daVinci-MagiHuman");
    f.set("prompt_ko", text);
    f.set("duration_s", "6");
    if (file) {
      f.set("ref_image", file);
    } else {
      const blob = await fetch(sample).then((r) => r.blob());
      f.set("ref_image", new File([blob], "ref.jpg", { type: "image/jpeg" }));
    }
    run("/v1/talking_head", f);
  };

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
              className={`overflow-hidden border-2 ${
                !file && sample === s.src ? "border-lime" : "border-ink-line"
              }`}
              title={s.label}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt={s.label} className="h-16 w-14 object-cover" />
            </button>
          ))}
        </div>
        <label className="mt-3 block text-sm text-paper-dim">
          또는 사진 업로드:{" "}
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-xs" />
        </label>
      </div>

      <button onClick={submit} disabled={state.phase === "submitting" || state.phase === "polling"} className={btnCls}>
        말하는 아바타 생성 (6초)
      </button>
      <p className="text-xs text-paper-faint">* 아바타 영상은 수 분이 걸릴 수 있습니다. 페이지를 열어 두세요.</p>
      <StatusLine state={state} />
      <ResultView state={state} />
    </div>
  );
}

/* ── 메인 ─────────────────────────────────────────────── */

export default function TestLab() {
  const [tab, setTab] = useState<TabId>("tts");
  const [queueDepth, setQueueDepth] = useState<number | null>(null);

  useEffect(() => {
    const tick = () =>
      fetch("/api/marv/health")
        .then((r) => r.json())
        .then((h) => setQueueDepth(typeof h.queue_depth === "number" ? h.queue_depth : null))
        .catch(() => {});
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-line">
        <div className="flex flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? "border-lime text-paper"
                  : "border-transparent text-paper-faint hover:text-paper-dim"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[10px] tracking-[0.2em] text-paper-faint">
          QUEUE {queueDepth ?? "–"} · SERIAL GPU
        </p>
      </div>

      <div className="pt-8">
        {tab === "tts" && <TtsPanel />}
        {tab === "llm" && <LlmPanel />}
        {tab === "image" && <ImagePanel />}
        {tab === "video" && <VideoPanel />}
        {tab === "avatar" && <AvatarPanel />}
      </div>
    </div>
  );
}
