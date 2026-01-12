"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { NeonButton } from "@/components/NeonButton";
import { ShieldAlert } from "lucide-react";

type Me = {
  user: { email: string };
  profile: { username: string | null; totalScore: number; gamesPlayed: number; questionsAnswered: number };
};

export function TopNav() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    api<Me>("/api/profile/me")
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/home" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
            <ShieldAlert className="h-5 w-5 text-cyan-200" />
          </span>
          <span className="tracking-tight">
            Phish<span className="text-cyan-300">Quest</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/scoreboard">
            <NeonButton variant="ghost">Scoreboard</NeonButton>
          </Link>
          <Link href="/home">
            <NeonButton variant="ghost">Home</NeonButton>
          </Link>
          <form
            action="/api/auth/logout"
            method="post"
            className="hidden sm:block"
            onSubmit={(e) => {
              e.preventDefault();
              fetch("/api/auth/logout", { method: "POST" }).then(() => (window.location.href = "/login"));
            }}
          >
            <NeonButton variant="danger" type="submit">
              Logout
            </NeonButton>
          </form>
          <div className="hidden sm:block text-right text-xs text-slate-300">
            <div className="max-w-[220px] truncate">{me?.profile?.username || "?"}</div>
            <div className="text-[11px] text-slate-400">Total: {me?.profile?.totalScore ?? "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
