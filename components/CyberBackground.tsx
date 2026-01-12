"use client";

import { motion } from "framer-motion";

export function CyberBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* grid */}
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.25) 1px, transparent 1px)",
          backgroundSize: "36px 36px"
        }}
      />
      {/* animated glow */}
      <motion.div
        className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, rgba(34,211,238,0.55), rgba(168,85,247,0.45), rgba(34,197,94,0.35), rgba(34,211,238,0.55))"
        }}
        animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-48 -right-48 h-[560px] w-[560px] rounded-full blur-3xl opacity-70"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(56,189,248,0.35), rgba(244,63,94,0.18), rgba(168,85,247,0.35), rgba(56,189,248,0.35))"
        }}
        animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />
    </div>
  );
}
