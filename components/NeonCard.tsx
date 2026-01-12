import { ReactNode } from "react";

export function NeonCard({
  title,
  subtitle,
  right,
  children
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-xl">
      {/* border glow */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 via-fuchsia-400/20 to-emerald-400/20 blur-2xl" />
      </div>

      {(title || subtitle || right) && (
        <div className="relative flex items-start gap-3 border-b border-white/10 px-5 py-4">
          <div className="min-w-0 flex-1">
            {title && <div className="text-lg font-semibold tracking-tight">{title}</div>}
            {subtitle && <div className="mt-1 text-sm text-slate-300">{subtitle}</div>}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      )}

      <div className="relative p-5">{children}</div>
    </div>
  );
}
