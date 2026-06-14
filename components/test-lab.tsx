"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CREDIT_COSTS, type Service } from "@/lib/credits";

type TabId = Service;

const TABS: { id: TabId; label: string }[] = [
  { id: "tts", label: "음성 (TTS)" },
  { id: "llm", label: "대화 (LLM)" },
  { id: "image", label: "이미지 생성" },
  { id: "video", label: "영상 생성" },
  { id: "avatar", label: "아바타" },
];

type Me = { name: string; credits: number; unlimited: number };

type Lab = {
  unlimited: boolean;
  balance: number;
  setBalance: (n: number) => void;
};

type JobState =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "polling"; jobId: string; status: string; seconds: number }
  | { phase: "done"; jobId: string; kind: "audio" | "image" | "video" | "file"; url: string }
  | { phase: "error"; message: string; insufficient?: boolean };

function kindFromContentType(ct: string): "audio" | "image" | "video" | "file" {
  if (ct.startsWith("audio/")) return "audio";
  if (ct.startsWith("image/")) return "image";
  if (ct.startsWith("video/")) return "video";
  return "file";
}

/** 잡 제출 → 폴링 → 결과 URL 확정까지의 공용 러너. 잔액 헤더를 읽어 갱신한다. */
function useJobRunner(lab: Lab) {
  const [state, setState] = useState<JobState>({ phase: "idle" });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);
  useEffect(() => stop, [stop]);

  const applyBalanceHeader = useCallback(
    (res: Response) => {
      const b = res.headers.get("X-MV-Balance");
      if (b !== null) lab.setBalance(Number(b));
    },
    [lab]
  );

  const run = useCallback(
    async (path: string, form: FormData) => {
      stop();
      setState({ phase: "submitting" });
      try {
        const res = await fetch(`/api/marv/submit?path=${encodeURIComponent(path)}`, {
          method: "POST",
          body: form,
        });
        applyBalanceHeader(res);
        if (res.status === 402) {
          setState({ phase: "error", message: "크레딧이 부족합니다.", insufficient: true });
          return;
        }
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
            applyBalanceHeader(jr);
            const job = await jr.json();
            if (job.status === "finished") {
              stop();
              const r = await fetch(`/api/marv/jobs/${jobId}/result`);
              const ct = r.headers.get("content-type") ?? "";
              const blob = await r.blob();
              setState({
                phase: "done",
                jobId,
                kind: kindFromContentType(ct),
                url: URL.createObjectURL(blob),
              });
            } else if (job.status === "failed") {
              stop();
              setState({ phase: "error", message: job.error ?? "생성에 실패했습니다 (크레딧 환불됨)." });
            } else {
              setState({ phase: "polling", jobId, status: job.status, seconds });
            }
          } catch {
            /* 일시 오류는 다음 폴링에서 재시도 */
          }
        }, 4000);
      } catch {
        setState({ phase: "error", message: "요청 중 오류가 발생했습니다." });
      }
    },
    [stop, applyBalanceHeader]
  );

  return { state, run };
}

const inputCls =
  "w-full border border-ink-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper-faint focus:border-lime focus:outline-none";

function CostButton({
  service,
  lab,
  onClick,
  disabled,
  children,
}: {
  service: Service;
  lab: Lab;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const cost = CREDIT_COSTS[service];
  const broke = !lab.unlimited && lab.balance < cost;
  return (
    <button
      onClick={onClick}
      disabled={disabled || broke}
      className="bg-lime px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-lime-deep disabled:opacity-50"
    >
      {children}
      <span className="ml-2 font-mono text-xs opacity-70">· {cost} CR</span>
    </button>
  );
}

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
    return (
      <p className="text-sm font-semibold text-red-600">
        {state.message}{" "}
        {state.insufficient && (
          <Link href="/account" className="ml-1 text-lime underline">
            충전 안내
          </Link>
        )}
      </p>
    );
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
      {state.kind === "video" && <video controls src={state.url} className="max-h-[480px] w-auto" />}
      {state.kind === "file" && (
        <a href={state.url} download className="font-semibold text-lime underline">
          결과 파일 다운로드
        </a>
      )}
    </div>
  );
}

/* ── 탭별 패널 ─────────────────────────────────────────── */

function TtsPanel({ lab }: { lab: Lab }) {
  const { state, run } = useJobRunner(lab);
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
        <CostButton service="tts" lab={lab} onClick={submit} disabled={busy}>
          음성 생성
        </CostButton>
      </div>
      <StatusLine state={state} />
      <ResultView state={state} />
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
        return;
      }
      const json = await res.json();
      if (!res.ok) setError({ message: json.detail ?? "요청 실패" });
      else
        setReply(
          json.message_to_user ??
            (json.job_id ? `생성 잡이 시작되었습니다 (JOB ${json.job_id.slice(0, 8)} · ${json.tab ?? ""})` : JSON.stringify(json))
        );
    } catch {
      setError({ message: "요청 중 오류가 발생했습니다." });
    } finally {
      setBusy(false);
    }
  };

  const cost = CREDIT_COSTS.llm;
  const broke = !lab.unlimited && lab.balance < cost;
  return (
    <div className="space-y-4">
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className={inputCls} />
      <button
        onClick={submit}
        disabled={busy || broke}
        className="bg-lime px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-lime-deep disabled:opacity-50"
      >
        {busy ? "응답 생성 중…" : "보내기"}
        <span className="ml-2 font-mono text-xs opacity-70">· {cost} CR</span>
      </button>
      {error && (
        <p className="text-sm font-semibold text-red-600">
          {error.message}{" "}
          {error.insufficient && (
            <Link href="/account" className="ml-1 text-lime underline">
              충전 안내
            </Link>
          )}
        </p>
      )}
      {reply && (
        <div className="border border-ink-line bg-ink-soft p-5 text-sm leading-relaxed text-paper-dim">{reply}</div>
      )}
      <p className="text-xs text-paper-faint">
        * 마브 오케스트레이터에 직접 연결됩니다. &ldquo;~만들어줘&rdquo;라고 하면 실제 생성 잡이 시작될 수 있습니다.
      </p>
    </div>
  );
}

function ImagePanel({ lab }: { lab: Lab }) {
  const { state, run } = useJobRunner(lab);
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

  const busy = state.phase === "submitting" || state.phase === "polling";
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
        <CostButton service="image" lab={lab} onClick={submit} disabled={busy}>
          이미지 생성
        </CostButton>
      </div>
      <StatusLine state={state} />
      <ResultView state={state} />
    </div>
  );
}

function VideoPanel({ lab }: { lab: Lab }) {
  const { state, run } = useJobRunner(lab);
  const [prompt, setPrompt] = useState("햇살 좋은 한강공원에서 강아지와 산책하는 사람, 시네마틱");

  const submit = () => {
    const f = new FormData();
    f.set("model", "Wan 2.2 T2V");
    f.set("prompt_ko", prompt);
    f.set("params_json", JSON.stringify({ duration_s: 5 }));
    run("/v1/video", f);
  };

  const busy = state.phase === "submitting" || state.phase === "polling";
  return (
    <div className="space-y-4">
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className={inputCls} />
      <CostButton service="video" lab={lab} onClick={submit} disabled={busy}>
        영상 생성 (5초)
      </CostButton>
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

function AvatarPanel({ lab }: { lab: Lab }) {
  const { state, run } = useJobRunner(lab);
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
              className={`overflow-hidden border-2 ${!file && sample === s.src ? "border-lime" : "border-ink-line"}`}
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
      <CostButton service="avatar" lab={lab} onClick={submit} disabled={busy}>
        말하는 아바타 생성 (6초)
      </CostButton>
      <p className="text-xs text-paper-faint">* 아바타 영상은 수 분이 걸릴 수 있습니다. 페이지를 열어 두세요.</p>
      <StatusLine state={state} />
      <ResultView state={state} />
    </div>
  );
}

/* ── 메인 ─────────────────────────────────────────────── */

export default function TestLab() {
  const [tab, setTab] = useState<TabId>("tts");
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [balance, setBalance] = useState(0);
  const [queueDepth, setQueueDepth] = useState<number | null>(null);

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

  if (me === undefined) return <p className="font-mono text-sm text-paper-faint">로딩 중…</p>;

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
  const lab: Lab = { unlimited, balance, setBalance };

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
        <p className="font-mono text-[10px] tracking-[0.2em] text-paper-faint">
          QUEUE {queueDepth ?? "–"} · SERIAL GPU
        </p>
      </div>

      <div className="pt-8">
        {tab === "tts" && <TtsPanel lab={lab} />}
        {tab === "llm" && <LlmPanel lab={lab} />}
        {tab === "image" && <ImagePanel lab={lab} />}
        {tab === "video" && <VideoPanel lab={lab} />}
        {tab === "avatar" && <AvatarPanel lab={lab} />}
      </div>
    </div>
  );
}
