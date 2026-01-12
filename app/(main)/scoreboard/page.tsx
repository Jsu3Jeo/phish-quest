"use client";

import { useEffect, useState } from "react";
import { NeonCard } from "@/components/NeonCard";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { api } from "@/lib/api";

type Row = {
  username: string;
  totalScore: number;
  gamesPlayed: number;
  questionsAnswered: number;
};

export default function ScoreboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ rows: Row[] }>("/api/scoreboard")
      .then((d) => setRows(d.rows))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <LoadingOverlay show={loading} label="กำลังโหลด Scoreboard..." />
      <NeonCard title="Scoreboard" subtitle="คะแนนรวม (เล่นใหม่ = เพิ่มคะแนน ไม่เพิ่มชื่อซ้ำ)">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-400">
              <tr>
                <th className="py-2">#</th>
                <th className="py-2">Name</th>
                <th className="py-2">Total</th>
                <th className="py-2">Games</th>
                <th className="py-2">Questions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.username} className="border-t border-white/10">
                  <td className="py-2 pr-2 text-slate-400">{i + 1}</td>
                  <td className="py-2 font-semibold">{r.username}</td>
                  <td className="py-2">{r.totalScore}</td>
                  <td className="py-2">{r.gamesPlayed}</td>
                  <td className="py-2">{r.questionsAnswered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="mt-4 text-sm text-slate-300">ยังไม่มีใครเล่นเลย ลองเป็นคนแรกดู 👀</div>
        )}
      </NeonCard>
    </>
  );
}
