"use client";

import { BarChart3 } from "lucide-react";

export default function OpportunityHistoryButton({ onClick }) {
  return (
    <button
      type="button"
      data-opportunity-history-trigger="true"
      onClick={onClick}
      onMouseDown={onClick}
      onPointerDown={onClick}
      className="gp-button-secondary inline-flex h-9 w-full items-center justify-center gap-2 rounded-[10px] border px-3.5 text-[12px] font-semibold transition focus-visible:ring-3 focus-visible:ring-[var(--gp-primary-soft)] sm:w-auto"
    >
      <BarChart3 className="h-4 w-4" />
      Historico
    </button>
  );
}
