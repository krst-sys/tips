"use client";

import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import { getScoreMeta } from "@/lib/filttoScore";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function toneClasses(tone) {
  if (tone === "strong") {
    return {
      ring: "ring-emerald-500/24",
      text: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-500/12",
      icon: CheckCircle2,
    };
  }
  if (tone === "good") {
    return {
      ring: "ring-emerald-500/18",
      text: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-500/10",
      icon: Sparkles,
    };
  }
  if (tone === "attention") {
    return {
      ring: "ring-amber-500/22",
      text: "text-amber-700 dark:text-amber-300",
      bg: "bg-amber-500/12",
      icon: AlertTriangle,
    };
  }
  if (tone === "risk") {
    return {
      ring: "ring-rose-500/22",
      text: "text-rose-700 dark:text-rose-300",
      bg: "bg-rose-500/10",
      icon: ShieldAlert,
    };
  }
  return {
    ring: "ring-[var(--gp-border)]",
    text: "text-[var(--gp-text-secondary)]",
    bg: "bg-[var(--gp-surface-elevated)]",
    icon: ShieldAlert,
  };
}

export default function FilttoScoreCard({
  score,
  status,
  summary,
  compact = false,
  className = "",
}) {
  const meta = getScoreMeta(score);
  const tone = toneClasses(meta.tone);
  const Icon = tone.icon;
  const progress = meta.score ?? 0;

  return (
    <section
      className={cn(
        "min-w-0 rounded-[18px] border border-[var(--gp-border)] bg-[var(--gp-surface)] shadow-[var(--gp-shadow-soft)]",
        compact ? "p-4" : "p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--gp-text-muted)]">
            Filtto Score
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <p className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-[var(--gp-text)]">
              {meta.score === null ? "--" : meta.score}
              <span className="text-[15px] font-semibold text-[var(--gp-text-muted)]">/100</span>
            </p>
            <span className={cn("mb-0.5 rounded-full px-2.5 py-1 text-[12px] font-semibold", tone.bg, tone.text)}>
              {status || meta.label}
            </span>
          </div>
        </div>

        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ring-1", tone.bg, tone.text, tone.ring)}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--gp-bg-secondary)]">
        <span
          className={cn(
            "block h-full rounded-full",
            meta.tone === "attention" ? "bg-amber-500" : meta.tone === "risk" ? "bg-rose-500" : "bg-[var(--gp-primary)]"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-3 text-[13px] leading-5 text-[var(--gp-text-secondary)]">
        {summary || "Score estimado com os dados disponiveis. Nao representa garantia de acerto."}
      </p>
    </section>
  );
}
