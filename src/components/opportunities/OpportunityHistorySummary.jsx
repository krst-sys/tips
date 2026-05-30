"use client";

function formatPercent(value) {
  if (value === null || value === undefined) return "--";
  return `${Math.round(value * 100)}%`;
}

function SummaryCard({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "green"
      ? "text-emerald-700 dark:text-emerald-300"
      : tone === "red"
        ? "text-rose-700 dark:text-rose-300"
        : "text-[var(--gp-text)]";

  return (
    <div className="rounded-[10px] border border-[var(--gp-border-soft)] bg-[var(--gp-surface)] px-3 py-2">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--gp-text-secondary)]">{label}</p>
      <p className={`mt-0.5 truncate text-[17px] font-semibold tracking-[-0.02em] ${toneClass}`}>{value}</p>
    </div>
  );
}

export default function OpportunityHistorySummary({ metrics }) {
  if (!metrics?.registered) return null;

  return (
    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
      <SummaryCard label="Registradas" value={metrics.registered} />
      <SummaryCard label="Finalizadas" value={metrics.finalized} />
      <SummaryCard label="Green" value={metrics.green} tone="green" />
      <SummaryCard label="Red" value={metrics.red} tone="red" />
      <SummaryCard label="Pendentes" value={metrics.pending} />
      <SummaryCard label="Taxa de acerto" value={formatPercent(metrics.hitRate)} />
    </div>
  );
}
