"use client";

import { motion } from "framer-motion";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export function NeonButton({ variant = "primary", className = "", ...props }: Props) {
  const base =
    "relative inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300/40 disabled:opacity-60 disabled:cursor-not-allowed";

  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-cyan-400/20 via-fuchsia-400/20 to-emerald-400/20 text-white border border-white/10 hover:border-white/20"
      : variant === "danger"
        ? "bg-rose-500/10 text-rose-100 border border-rose-400/20 hover:border-rose-300/30"
        : "bg-white/[0.03] text-slate-100 border border-white/10 hover:border-white/20";

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${base} ${styles} ${className}`}
      {...props}
    >
      <span className="absolute inset-0 -z-10 animate-shimmer bg-[length:200%_200%] opacity-50 [background-image:linear-gradient(90deg,transparent,rgba(255,255,255,0.10),transparent)]" />
      {props.children}
    </motion.button>
  );
}
