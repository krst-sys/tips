"use client";

const RESULT_LABELS = {
  green: "Green",
  red: "Red",
  pending: "Pendente",
  void: "Anulada",
  refunded: "Reembolso",
};

function resultClasses(result) {
  if (result === "green") return "bg-emerald-500/10 text-emerald-700 ring-emerald-500/18 dark:text-emerald-300";
  if (result === "red") return "bg-rose-500/10 text-rose-700 ring-rose-500/18 dark:text-rose-300";
  if (result === "void" || result === "refunded") return "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300";
  return "bg-sky-500/10 text-sky-700 ring-sky-500/18 dark:text-sky-300";
}

function safeText(value, fallback = "Nao informado") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function formatDate(value) {
  if (!value) return "Data indefinida";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data indefinida";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

function formatOdd(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  return number.toFixed(2).replace(".", ",");
}

function formatPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  const normalized = number <= 1 ? number * 100 : number;
  return `${Math.round(normalized)}%`;
}

function formatScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  return `${Math.round(number)}/100`;
}

export default function OpportunityHistoryList({ records }) {
  if (!records?.length) return null;

  return (
    <div className="overflow-hidden rounded-[12px] border border-[var(--gp-border-soft)] bg-[var(--gp-surface)]">
      <div className="hidden grid-cols-[minmax(220px,1.3fr)_minmax(150px,0.9fr)_88px_96px_92px_96px] gap-3 border-b border-[var(--gp-border-soft)] bg-[var(--gp-surface-elevated)] px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--gp-text-secondary)] lg:grid">
        <span>Jogo</span>
        <span>Mercado</span>
        <span>Odd</span>
        <span>Prob.</span>
        <span>Score</span>
        <span>Resultado</span>
      </div>

      <div className="divide-y divide-[var(--gp-border-soft)]">
        {records.map((record) => (
          <article
            key={record.uniqueKey || record.id}
            className="grid gap-2.5 px-4 py-3 lg:grid-cols-[minmax(220px,1.3fr)_minmax(150px,0.9fr)_88px_96px_92px_96px] lg:items-center"
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-[var(--gp-text)]">
                {safeText(record.homeTeam, "Mandante")} x {safeText(record.awayTeam, "Visitante")}
              </p>
              <p className="mt-1 truncate text-[12px] text-[var(--gp-text-secondary)]">
                {formatDate(record.registeredAt)} - {safeText(record.leagueName, "Liga nao informada")}
              </p>
            </div>

            <p className="truncate text-[13px] font-semibold text-[var(--gp-text)]">{safeText(record.market, "Mercado nao informado")}</p>
            <p className="text-[13px] font-semibold text-[var(--gp-text)]">Odd {formatOdd(record.odd)}</p>
            <p className="text-[13px] text-[var(--gp-text-secondary)]">Prob. {formatPercent(record.probability)}</p>
            <p className="text-[13px] text-[var(--gp-text-secondary)]">Score {formatScore(record.filttoScore)}</p>

            <div className="flex flex-wrap items-center gap-2 lg:justify-between">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${resultClasses(record.result)}`}>
                {RESULT_LABELS[record.result] || "Pendente"}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
