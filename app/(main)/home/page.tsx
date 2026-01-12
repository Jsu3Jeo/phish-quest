"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NeonCard } from "@/components/NeonCard";
import { NeonButton } from "@/components/NeonButton";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { api } from "@/lib/api";
import { Trophy, Play, Sparkles } from "lucide-react";

type Me = {
  user: { email: string };
  profile: { username: string | null; totalScore: number; gamesPlayed: number; questionsAnswered: number };
};

export default function HomePage() {
  const r = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Me>("/api/profile/me")
      .then((x) => {
        setMe(x);
        if (!x.profile.username) r.replace("/set-name");
      })
      .catch(() => r.replace("/login"))
      .finally(() => setLoading(false));
  }, [r]);

  return (
    <>
      <LoadingOverlay show={loading} label="กำลังโหลดโปรไฟล์..." />
      <div className="grid gap-6 md:grid-cols-2">
        <NeonCard
          title={`สวัสดี ${me?.profile.username || ""}`}
          subtitle="พร้อมลุยจับ phishing แบบมือโปรไหม?"
          right={<Sparkles className="h-5 w-5 text-cyan-300" />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xs text-slate-400">Total score</div>
                <div className="mt-1 text-xl font-semibold">{me?.profile.totalScore ?? "-"}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xs text-slate-400">Games</div>
                <div className="mt-1 text-xl font-semibold">{me?.profile.gamesPlayed ?? "-"}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xs text-slate-400">Questions</div>
                <div className="mt-1 text-xl font-semibold">{me?.profile.questionsAnswered ?? "-"}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/game">
                <NeonButton>
                  <Play className="mr-2 h-4 w-4" />
                  เริ่มเกม
                </NeonButton>
              </Link>
              <Link href="/scoreboard">
                <NeonButton variant="ghost">
                  <Trophy className="mr-2 h-4 w-4" />
                  ไป Scoreboard
                </NeonButton>
              </Link>
            </div>

            <div className="text-sm text-slate-300">
              เล่นได้เรื่อยๆ AI จะสุ่มสร้างโจทย์ใหม่ไม่ซ้ำ และหลังตอบจะอธิบายทุกตัวเลือกว่าทำไมถูก/ผิด
            </div>
          </div>
        </NeonCard>

        <NeonCard title="วิธีการเล่น" subtitle="เล่นง่าย แต่ได้สกิลจริง" right={<span className="text-xs text-slate-400">MVP</span>}>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
            <li>กด “เริ่มเกม” → AI สร้างโจทย์</li>
            <li>เลือกคำตอบ A/B/C/D</li>
            <li>ดูคำอธิบายทีละข้อ แล้วกด “ข้อต่อไป”</li>
            <li>กด “จบเกม” เมื่อพอใจคะแนน</li>
          </ol>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[12px] text-slate-400">
            Tip: ถ้าเจอคำว่า “ด่วน”, “ล็อกบัญชี”, ขอ OTP/รหัสผ่าน, โดเมนแปลกๆ → ระวังหนักๆ
          </div>
        </NeonCard>
      </div>
    </>
  );
}
