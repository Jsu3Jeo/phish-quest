"use client";

import { motion } from "framer-motion";

export function LoadingOverlay({ show, label }: { show: boolean; label?: string }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm">
      <div className="w-[min(520px,92vw)] rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <motion.div
            className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-wide text-slate-100">
              {label || "AI กำลังสร้างโจทย์..."}
            </div>
            <div className="mt-1 text-xs text-slate-300">
              อย่าปิดหน้านี้ กำลังสร้างโจทย์ phishing แบบไม่ซ้ำ 🔥
            </div>
          </div>
        </div>

        <motion.div
          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="h-full w-1/3 bg-gradient-to-r from-cyan-400/70 via-fuchsia-400/70 to-emerald-400/70"
            animate={{ x: ["-40%", "140%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <div className="mt-4 text-[11px] text-slate-400">
          เคล็ดลับ: สังเกตโดเมน, ความเร่งด่วน, การขอรหัสผ่าน/OTP, ลิงก์แปลก, ไฟล์แนบ
        </div>
      </div>
    </div>
  );
}
