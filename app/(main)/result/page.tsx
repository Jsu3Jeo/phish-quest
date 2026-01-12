"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NeonCard } from "@/components/NeonCard";
import { NeonButton } from "@/components/NeonButton";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { api } from "@/lib/api";
import { Lightbulb, Home, Trophy } from "lucide-react";

type Q = {
  order: number;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanations: string[];
  indicators: string[];
  selectedIndex: number | null;
  isCorrect: boolean | null;
};

type Res = {
  session: { id: string; score: number; questionCount: number; endedAt: string | null };
  profile: { username: string | null; totalScore: number; gamesPlayed: number; questionsAnswered: number };
  questions: Q[];
};

export default function ResultPage() {
  const sp = useSearchParams();
  const sessionId = sp.get("sessionId");
  const [data, setData] = useState<Res | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    api<Res>(`/api/game/session?sessionId=${sessionId}&full=1`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [sessionId]);

  const tips = useMemo(() => {
    if (!data) return [];
    const wrong = data.questions.filter((q) => q.isCorrect === false);
    const counts = new Map<string, number>();
    for (const q of wrong) {
      for (const tag of q.indicators || []) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map((x) => x[0]);

    const dict: Record<string, string> = {
      "lookalike-domain": "เช็คโดเมนให้ตรงกับของจริง (ตัวสะกดคล้ายๆ, มีขีด, subdomain หลอก)",
      "domain-mismatch": "อย่าดูแค่ชื่อที่โชว์ ดู URL เต็มก่อนกดเสมอ",
      urgency: "ข้อความเร่งด่วน/ขู่ล็อกบัญชี มักเป็นตัวหลอก → หยุดก่อน 10 วิ",
      "credential-harvest": "ไม่มีบริการจริงไหนขอรหัสผ่าน/OTP ทางอีเมลหรือแชท",
      attachment: "ไฟล์แนบไม่รู้ที่มา = อันตราย เปิดผ่านระบบสแกน/ถาม IT ก่อน",
      misspelling: "สะกดแปลกๆ ภาษาแปลกๆ เป็นสัญญาณแดง"
    };

    if (top.length === 0) {
      return [
        "ทำได้ดีมาก! รักษานิสัย: หยุด-อ่าน-เช็คโดเมน-อย่าให้ความเร่งด่วนบังคับ",
        "ถ้าไม่มั่นใจ: ไปที่เว็บไซต์ด้วยการพิมพ์เอง ไม่กดลิงก์จากข้อความ"
      ];
    }
    return top.map((t) => dict[t] || `ระวังเรื่อง: ${t}`);
  }, [data]);

  return (
    <>
      <LoadingOverlay show={loading} label="กำลังสรุปผล..." />
      {data && (
        <div className="grid gap-6 md:grid-cols-2">
          <NeonCard title="สรุปคะแนน" subtitle="จบเกมแล้ว! (คะแนนถูกบวกเข้า Scoreboard แล้ว)">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xs text-slate-400">คะแนนรอบนี้</div>
                <div className="mt-1 text-2xl font-semibold">{data.session.score}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xs text-slate-400">จำนวนข้อ</div>
                <div className="mt-1 text-2xl font-semibold">{data.session.questionCount}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xs text-slate-400">คะแนนรวม</div>
                <div className="mt-1 text-2xl font-semibold">{data.profile.totalScore}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xs text-slate-400">เล่นทั้งหมด</div>
                <div className="mt-1 text-2xl font-semibold">{data.profile.gamesPlayed}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/home">
                <NeonButton variant="ghost">
                  <Home className="mr-2 h-4 w-4" />
                  กลับ Home
                </NeonButton>
              </Link>
              <Link href="/scoreboard">
                <NeonButton>
                  <Trophy className="mr-2 h-4 w-4" />
                  ดู Scoreboard
                </NeonButton>
              </Link>
              <Link href="/game">
                <NeonButton variant="ghost">เล่นอีกรอบ</NeonButton>
              </Link>
            </div>
          </NeonCard>

          <NeonCard title="คำแนะนำส่วนตัว" subtitle="ดูจากข้อที่คุณพลาดบ่อย" right={<Lightbulb className="h-5 w-5 text-cyan-300" />}>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-200">
              {tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[12px] text-slate-400">
              สูตรกันโดน: “หยุด 10 วิ → เช็คโดเมน → อย่ากดลิงก์จากข้อความ → ไปเว็บด้วยการพิมพ์เอง”
            </div>
          </NeonCard>

          <div className="md:col-span-2">
            <NeonCard title="รีวิวข้อที่ทำ" subtitle="ดูว่าพลาดตรงไหนได้ทันที">
              <div className="grid gap-3">
                {data.questions.map((q) => (
                  <details key={q.order} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <summary className="cursor-pointer text-sm font-semibold">
                      ข้อ {q.order} — {q.isCorrect ? "✅ ถูก" : "❌ ผิด"}
                    </summary>
                    <div className="mt-3 space-y-2 text-sm text-slate-200">
                      <div className="rounded-xl border border-white/10 bg-black/20 p-3">{q.questionText}</div>
                      <div className="grid gap-2">
                        {q.options.map((o, i) => (
                          <div
                            key={i}
                            className={[
                              "rounded-xl border border-white/10 bg-white/[0.02] p-3",
                              i === q.correctIndex ? "border-emerald-300/30" : "",
                              q.selectedIndex === i && q.selectedIndex !== q.correctIndex ? "border-rose-300/30" : ""
                            ].join(" ")}
                          >
                            <div className="text-xs text-slate-400">ตัวเลือก {String.fromCharCode(65 + i)}</div>
                            <div className="mt-1">{o}</div>
                            <div className="mt-2 text-[12px] text-slate-300">{q.explanations[i]}</div>
                          </div>
                        ))}
                      </div>
                      <div className="text-[12px] text-slate-400">
                        สัญญาณ: <span className="text-cyan-200">{q.indicators.join(", ")}</span>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </NeonCard>
          </div>
        </div>
      )}
    </>
  );
}
