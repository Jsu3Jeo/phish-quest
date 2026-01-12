"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NeonCard } from "@/components/NeonCard";
import { NeonButton } from "@/components/NeonButton";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { api } from "@/lib/api";
import { CheckCircle2, XCircle, CornerDownRight, Flag } from "lucide-react";

type Question = {
  id: string;
  order: number;
  questionText: string;
  options: string[];
  correctIndex?: number;
  explanations?: string[];
  indicators?: string[];
};

type StartRes = {
  sessionId: string;
  question: Question;
  score: number;
};

type AnswerRes = {
  sessionId: string;
  score: number;
  questionNumber: number;
  correct: boolean;
  correctIndex: number;
  explanations: string[];
  indicators: string[];
  nextQuestion: Question;
};

export default function GamePage() {
  const r = useRouter();
  const sp = useSearchParams();
  const existingSession = sp.get("sessionId");

  const [sessionId, setSessionId] = useState<string | null>(existingSession);
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState<Question | null>(null);

  const [pendingNext, setPendingNext] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    correctIndex: number;
    explanations: string[];
    indicators: string[];
    selectedIndex: number;
  } | null>(null);

  const [busy, setBusy] = useState(true);

  const [selected, setSelected] = useState<number | null>(null);

  const questionNumber = current?.order ?? 1;

  useEffect(() => {
    async function boot() {
      setBusy(true);
      try {
        if (!existingSession) {
          const res = await api<StartRes>("/api/game/start", { method: "POST", body: JSON.stringify({}) });
          setSessionId(res.sessionId);
          setScore(res.score);
          setCurrent(res.question);
          r.replace(`/game?sessionId=${res.sessionId}`);
        } else {
          // load current session state (in case refresh)
          const res = await api<{ sessionId: string; score: number; currentQuestion: Question }>(
            `/api/game/session?sessionId=${existingSession}`
          );
          setSessionId(res.sessionId);
          setScore(res.score);
          setCurrent(res.currentQuestion);
        }
      } catch {
        r.replace("/home");
      } finally {
        setBusy(false);
      }
    }
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canAnswer = useMemo(() => current && feedback === null && selected !== null, [current, feedback, selected]);

  async function submitAnswer() {
    if (!sessionId || !current || selected === null) return;
    setBusy(true);
    try {
      const res = await api<AnswerRes>("/api/game/answer", {
        method: "POST",
        body: JSON.stringify({ sessionId, selectedIndex: selected })
      });

      setScore(res.score);
      setFeedback({
        correct: res.correct,
        correctIndex: res.correctIndex,
        explanations: res.explanations,
        indicators: res.indicators,
        selectedIndex: selected
      });
      setPendingNext(res.nextQuestion);
    } catch (e: any) {
      alert(e?.message || "ส่งคำตอบไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function nextQuestion() {
    if (!pendingNext) return;
    setCurrent(pendingNext);
    setPendingNext(null);
    setFeedback(null);
    setSelected(null);
  }

  async function endGame() {
    if (!sessionId) return;
    setBusy(true);
    try {
      await api<{ ok: true }>("/api/game/end", { method: "POST", body: JSON.stringify({ sessionId }) });
      r.push(`/result?sessionId=${sessionId}`);
    } catch (e: any) {
      alert(e?.message || "จบเกมไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <LoadingOverlay show={busy} />
      <div className="grid gap-6">
        <NeonCard
          title={`เล่นเกม — ข้อที่ ${questionNumber}`}
          subtitle={`คะแนนตอนนี้: ${score}`}
          right={
            <NeonButton variant="danger" onClick={endGame}>
              <Flag className="mr-2 h-4 w-4" />
              จบเกม
            </NeonButton>
          }
        >
          {current ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-slate-100">
                {current.questionText}
              </div>

              <div className="grid gap-2">
                {current.options.map((opt, i) => {
                  const isSel = selected === i;
                  const isCorrect = feedback && feedback.correctIndex === i;
                  const isWrong = feedback && feedback.selectedIndex === i && feedback.correctIndex !== i;

                  return (
                    <button
                      key={i}
                      disabled={!!feedback}
                      onClick={() => setSelected(i)}
                      className={[
                        "group relative rounded-xl border px-4 py-3 text-left transition",
                        "border-white/10 bg-black/20 hover:border-white/20",
                        isSel ? "border-cyan-300/40 bg-cyan-400/10" : "",
                        isCorrect ? "border-emerald-300/40 bg-emerald-400/10" : "",
                        isWrong ? "border-rose-300/40 bg-rose-500/10" : "",
                        feedback ? "cursor-default" : ""
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-slate-200">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <div className="min-w-0 flex-1 text-sm">{opt}</div>
                        {feedback && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-300" />}
                        {feedback && isWrong && <XCircle className="h-5 w-5 text-rose-300" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {!feedback ? (
                <div className="flex gap-2">
                  <NeonButton disabled={!canAnswer} onClick={submitAnswer}>
                    ส่งคำตอบ
                  </NeonButton>
                  <div className="text-xs text-slate-400 self-center">
                    เลือกคำตอบก่อน แล้วค่อยกดส่ง
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className={[
                        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                        feedback.correct
                          ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                          : "border-rose-300/30 bg-rose-500/10 text-rose-100"
                      ].join(" ")}
                    >
                      {feedback.correct ? (
                        <>
                          <CheckCircle2 className="h-5 w-5" /> ถูกต้อง!
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5" /> ยังไม่ใช่
                        </>
                      )}
                    </div>

                    <div className="text-xs text-slate-300">
                      สัญญาณที่เกี่ยวข้อง:{" "}
                      <span className="text-cyan-200">{feedback.indicators.join(", ")}</span>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {feedback.explanations.map((ex, i) => (
                      <div
                        key={i}
                        className={[
                          "rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-200",
                          i === feedback.correctIndex ? "border-emerald-300/20" : ""
                        ].join(" ")}
                      >
                        <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
                          <CornerDownRight className="h-4 w-4" />
                          ตัวเลือก {String.fromCharCode(65 + i)}
                        </div>
                        {ex}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <NeonButton onClick={nextQuestion}>
                      ข้อต่อไป
                    </NeonButton>
                    <div className="text-xs text-slate-400">AI จะสร้างข้อใหม่ต่อเนื่องแบบไม่ซ้ำ</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-300">กำลังเริ่มเกม...</div>
          )}
        </NeonCard>
      </div>
    </>
  );
}
