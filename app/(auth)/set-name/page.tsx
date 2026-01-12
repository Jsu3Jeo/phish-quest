"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NeonCard } from "@/components/NeonCard";
import { NeonButton } from "@/components/NeonButton";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { api } from "@/lib/api";

export default function SetNamePage() {
  const r = useRouter();
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ profile: { username: string | null } }>("/api/profile/me")
      .then((me) => {
        if (me.profile.username) r.replace("/home");
        setLoading(false);
      })
      .catch(() => {
        r.replace("/login");
      });
  }, [r]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const cleaned = name.trim();
    if (cleaned.length < 3) return setErr("ชื่ออย่างน้อย 3 ตัวอักษร");
    if (cleaned.length > 20) return setErr("ชื่อยาวไป (<= 20)");
    setSaving(true);
    try {
      const res = await api<{ ok: true } | { ok: false; error: string }>("/api/profile/set-name", {
        method: "POST",
        body: JSON.stringify({ username: cleaned })
      });
      if ("error" in res) throw new Error(res.error);
      r.push("/home");
    } catch (e: any) {
      setErr(e?.message || "ตั้งชื่อไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <LoadingOverlay show={loading || saving} label={saving ? "กำลังตั้งชื่อ..." : "กำลังโหลด..."} />
      <div className="w-full max-w-md">
        <NeonCard title="ตั้งชื่อใน Scoreboard" subtitle="ชื่อห้ามซ้ำ และจะแสดงให้คนอื่นเห็น">
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-slate-300">Username</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-cyan-300/40"
                placeholder="เช่น CyberNinja"
              />
              <div className="mt-1 text-[11px] text-slate-400">
                แนะนำ: ใช้อังกฤษ/ตัวเลขได้ แต่หลีกเลี่ยงข้อมูลส่วนตัวจริง
              </div>
            </div>

            {err && <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{err}</div>}

            <NeonButton className="w-full" type="submit">
              Save & Go Home
            </NeonButton>
          </form>
        </NeonCard>
      </div>
    </>
  );
}
