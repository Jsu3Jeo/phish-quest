"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NeonCard } from "@/components/NeonCard";
import { NeonButton } from "@/components/NeonButton";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { api } from "@/lib/api";

export default function SignupPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (pw.length < 8) return setErr("รหัสผ่านต้องยาวอย่างน้อย 8 ตัว");
    if (pw !== pw2) return setErr("รหัสผ่านไม่ตรงกัน");
    setLoading(true);
    try {
      const res = await api<{ ok: true } | { ok: false; error: string }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password: pw })
      });
      if ("error" in res) throw new Error(res.error);
      r.push("/set-name");
    } catch (e: any) {
      setErr(e?.message || "สมัครไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <LoadingOverlay show={loading} label="กำลังสมัครสมาชิก..." />
      <div className="w-full max-w-md animate-floaty">
        <NeonCard
          title="Signup"
          subtitle="สร้างบัญชีเพื่อเก็บคะแนน + ดู Scoreboard"
          right={<span className="text-xs text-slate-400">v1</span>}
        >
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-slate-300">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-cyan-300/40"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300">Password</label>
              <input
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                type="password"
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-cyan-300/40"
                placeholder="อย่างน้อย 8 ตัว"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300">Confirm password</label>
              <input
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                type="password"
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-cyan-300/40"
              />
            </div>

            {err && <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">{err}</div>}

            <NeonButton className="w-full" type="submit">
              Create account
            </NeonButton>

            <div className="text-center text-sm text-slate-300">
              มีบัญชีแล้ว?{" "}
              <Link href="/login" className="text-cyan-300 hover:underline">
                Login
              </Link>
            </div>
          </form>
        </NeonCard>
      </div>
    </>
  );
}
