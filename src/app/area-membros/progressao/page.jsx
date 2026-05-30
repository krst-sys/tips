"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Edit3,
  FileImage,
  Info,
  Layers3,
  ListChecks,
  Lock,
  Plus,
  Target,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";

const STORAGE_KEY = "progressao-execucao-v2";

function round(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatMoney(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatOdd(value) {
  return Number(value || 0).toFixed(2);
}

function formatSignedMoney(value) {
  return `${value > 0 ? "+" : ""}${formatMoney(value)}`;
}

function ordinal(value) {
  return `${value}ª`;
}

function getShareEntries(progression) {
  return progression.entries.filter((entry) => entry.status !== "locked");
}

function getProgressStats(progression) {
  if (!progression) {
    return { greens: 0, reds: 0, completed: 0, percent: 0 };
  }

  const greens = progression.entries.filter((entry) => entry.status === "green").length;
  const reds = progression.entries.filter((entry) => entry.status === "red").length;
  const completed = greens + reds;

  return {
    greens,
    reds,
    completed,
    percent: progression.totalDays ? round((completed / progression.totalDays) * 100) : 0,
  };
}

function validateForm(form) {
  if (!form.name.trim()) return "Informe um nome para a progressão.";
  if (toNumber(form.initialBankroll) <= 0) return "A banca inicial precisa ser maior que 0.";
  if (toNumber(form.averageOdd) <= 1) return "A odd média precisa ser maior que 1.";
  if (Math.round(toNumber(form.totalDays)) <= 0) return "Informe pelo menos 1 entrada.";
  if (Math.round(toNumber(form.totalDays)) > 30) return "Use no máximo 30 entradas.";
  if (form.stakeMode === "fixed" && toNumber(form.fixedStake) <= 0) return "Informe uma stake fixa maior que 0.";
  if (form.stakeMode === "percent" && toNumber(form.percentStake) <= 0) return "Informe um percentual maior que 0.";
  return "";
}

function createProgression(form) {
  const initialBankroll = round(toNumber(form.initialBankroll, 50));
  const averageOdd = round(toNumber(form.averageOdd, 5));
  const totalDays = Math.max(1, Math.min(30, Math.round(toNumber(form.totalDays, 30))));
  const stakeMode = form.stakeMode === "fixed" ? "fixed" : "percent";
  const fixedStake = round(toNumber(form.fixedStake, 10));
  const percentStake = round(toNumber(form.percentStake, 100));
  let bankrollCursor = initialBankroll;

  const entries = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    const stake =
      stakeMode === "fixed"
        ? fixedStake
        : round(bankrollCursor * (percentStake / 100));
    const projectedReturn = round(stake * averageOdd);
    const bankrollIfGreen = round(bankrollCursor - stake + projectedReturn);

    const entry = {
      id: `${Date.now()}-${day}-${Math.random().toString(36).slice(2, 8)}`,
      day,
      status: day === 1 ? "pending" : "locked",
      bankrollBefore: round(bankrollCursor),
      stake,
      odd: averageOdd,
      projectedReturn,
      bankrollIfGreen,
      actualBankrollAfter: null,
      checkedAt: null,
    };

    bankrollCursor = bankrollIfGreen;
    return entry;
  });

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: form.name.trim(),
    notes: form.notes.trim(),
    createdAt: new Date().toISOString(),
    finishedAt: null,
    finalStatus: "active",
    initialBankroll,
    currentBankroll: initialBankroll,
    averageOdd,
    totalDays,
    currentDay: 1,
    stakeMode,
    fixedStake,
    percentStake,
    profit: 0,
    entries,
  };
}

function finalizeProgression(progression, finalStatus, finalBankroll, entries = progression.entries) {
  return {
    ...progression,
    entries,
    finalStatus,
    currentBankroll: round(finalBankroll),
    profit: round(finalBankroll - progression.initialBankroll),
    finishedAt: new Date().toISOString(),
  };
}

function getFinalLabel(status) {
  if (status === "completed") return "Concluída";
  if (status === "red") return "Encerrada (Red)";
  return "Encerrada manualmente";
}

function statusTone(status) {
  if (status === "green" || status === "completed") return "positive";
  if (status === "red") return "negative";
  if (status === "pending") return "warning";
  return "neutral";
}

export default function ProgressaoPage() {
  const [hydrated, setHydrated] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [formError, setFormError] = useState("");
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [form, setForm] = useState({
    name: "Progressão 1",
    notes: "",
    initialBankroll: "50,00",
    averageOdd: "5,00",
    totalDays: "30",
    stakeMode: "percent",
    fixedStake: "10,00",
    percentStake: "100",
  });
  const [activeProgression, setActiveProgression] = useState(null);
  const [finalizedProgressions, setFinalizedProgressions] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.form) setForm((current) => ({ ...current, ...parsed.form }));
        if (parsed.activeProjection) setActiveProgression(parsed.activeProjection);
        if (Array.isArray(parsed.finalizedProjections)) {
          setFinalizedProgressions(parsed.finalizedProjections);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar progressões:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        form,
        activeProjection: activeProgression,
        finalizedProjections: finalizedProgressions,
      })
    );
  }, [activeProgression, finalizedProgressions, form, hydrated]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(""), 3500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const currentEntry = useMemo(
    () => activeProgression?.entries.find((entry) => entry.status === "pending") || null,
    [activeProgression]
  );

  function updateForm(field, value) {
    if (field === "notes" && value.length > 120) return;
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
  }

  function handleCreate(event) {
    event.preventDefault();
    const error = validateForm(form);
    if (error) {
      setFormError(error);
      return;
    }

    setActiveProgression(createProgression(form));
    setShowAllEntries(false);
    setFeedback("Progressão criada. A primeira entrada está disponível.");
  }

  function handleMarkGreen() {
    if (!activeProgression || !currentEntry) return;
    const currentIndex = activeProgression.entries.findIndex((entry) => entry.id === currentEntry.id);
    const nextBankroll = currentEntry.bankrollIfGreen;

    const entries = activeProgression.entries.map((entry, index) => {
      if (index === currentIndex) {
        return {
          ...entry,
          status: "green",
          actualBankrollAfter: nextBankroll,
          checkedAt: new Date().toISOString(),
        };
      }
      if (index === currentIndex + 1) {
        return { ...entry, status: "pending" };
      }
      return entry;
    });

    if (currentIndex === activeProgression.entries.length - 1) {
      setFinalizedProgressions((current) => [
        finalizeProgression(
          { ...activeProgression, currentDay: activeProgression.totalDays },
          "completed",
          nextBankroll,
          entries
        ),
        ...current,
      ]);
      setActiveProgression(null);
      setFeedback("Progressão concluída e arquivada no histórico.");
      return;
    }

    setActiveProgression((current) => ({
      ...current,
      entries,
      currentBankroll: nextBankroll,
      currentDay: currentEntry.day + 1,
      profit: round(nextBankroll - current.initialBankroll),
    }));
    setFeedback("Green registrado. Próxima entrada liberada.");
  }

  function handleMarkRed() {
    if (!activeProgression || !currentEntry) return;
    const currentIndex = activeProgression.entries.findIndex((entry) => entry.id === currentEntry.id);
    const nextBankroll = round(currentEntry.bankrollBefore - currentEntry.stake);
    const entries = activeProgression.entries.map((entry, index) =>
      index === currentIndex
        ? {
            ...entry,
            status: "red",
            actualBankrollAfter: nextBankroll,
            checkedAt: new Date().toISOString(),
          }
        : entry
    );

    setFinalizedProgressions((current) => [
      finalizeProgression({ ...activeProgression, currentDay: currentEntry.day }, "red", nextBankroll, entries),
      ...current,
    ]);
    setActiveProgression(null);
    setFeedback("Progressão encerrada e arquivada após Red.");
  }

  function downloadShareImage(progression) {
    const dataUrl = renderShareImage(progression);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${progression.name.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}-filtto.png`;
    link.click();
  }

  if (!hydrated) {
    return <main className="bankroll-page" />;
  }

  return (
    <main className="bankroll-page">
      <style jsx global>{`
        @keyframes progress-shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 180% 50%;
          }
        }

        .progress-shimmer {
          animation: progress-shimmer 2.4s ease-in-out infinite;
        }

        @keyframes active-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.45);
            opacity: 0.78;
          }
          50% {
            box-shadow: 0 0 0 7px rgba(34, 197, 94, 0);
            opacity: 1;
          }
        }

        .active-pulse {
          animation: active-pulse 1.7s ease-in-out infinite;
        }
      `}</style>
      <div className="mx-auto max-w-[1488px] px-4 pb-14 pt-3 md:px-8">
        {activeProgression ? (
          <ProgressionActiveView
            progression={activeProgression}
            currentEntry={currentEntry}
            finalized={finalizedProgressions}
            showAllEntries={showAllEntries}
            onToggleEntries={() => setShowAllEntries((current) => !current)}
            onGreen={handleMarkGreen}
            onRed={handleMarkRed}
            onDownload={downloadShareImage}
          />
        ) : (
          <ProgressionCreateView
            form={form}
            formError={formError}
            finalized={finalizedProgressions}
            onChange={updateForm}
            onCreate={handleCreate}
            onDownload={downloadShareImage}
          />
        )}

        {feedback ? (
          <div className="fixed bottom-5 right-5 z-40 max-w-[360px] rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] font-medium text-emerald-800 shadow-[0_18px_45px_rgba(15,23,42,0.16)] dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
            {feedback}
          </div>
        ) : null}
      </div>
    </main>
  );
}

function ProgressionCreateView({ form, formError, finalized, onChange, onCreate, onDownload }) {
  return (
    <div className="grid gap-3 pb-8">
      <IntroCard active={false} />

      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]">
        <Panel className="p-4">
          <SectionHeading title="Nova progressão" description="Configure os parâmetros da sua sequência." />
          <form onSubmit={onCreate} className="mt-3 grid gap-3.5">
            <FormBlock title="Dados da progressão">
              <div className="grid gap-3.5 lg:grid-cols-2">
                <Field label="Nome da progressão">
                  <input
                    value={form.name}
                    onChange={(event) => onChange("name", event.target.value)}
                    placeholder="Ex.: Progressão 1"
                    className={inputClass}
                  />
                </Field>
                <Field label="Observação (opcional)" suffix={String(form.notes.length) + "/120"}>
                  <textarea
                    value={form.notes}
                    onChange={(event) => onChange("notes", event.target.value)}
                    placeholder="Alguma observação sobre esta progressão..."
                    className={[inputClass, "min-h-[50px] resize-none py-2"].join(" ")}
                  />
                </Field>
              </div>
            </FormBlock>

            <FormBlock title="Configuração da sequência">
              <div className="grid gap-3.5 md:grid-cols-3">
                <Field label="Banca inicial">
                  <div className="relative">
                    <input
                      value={form.initialBankroll}
                      onChange={(event) => onChange("initialBankroll", event.target.value)}
                      className={[inputClass, "pr-12"].join(" ")}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">R$</span>
                  </div>
                </Field>
                <Field label="Odd média">
                  <input value={form.averageOdd} onChange={(event) => onChange("averageOdd", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Número de entradas">
                  <input value={form.totalDays} onChange={(event) => onChange("totalDays", event.target.value)} className={inputClass} />
                </Field>
              </div>
            </FormBlock>

            <FormBlock title="Tipo de stake">
              <div className="grid gap-3.5 lg:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-[12px] font-medium text-slate-600 dark:text-slate-300">Modo da stake</p>
                  <div className="grid h-10 grid-cols-2 rounded-[12px] border border-slate-200 bg-white p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                    {[["fixed", "Fixa"], ["percent", "Variável"]].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => onChange("stakeMode", value)}
                        className={[
                          "rounded-[8px] text-[13px] font-semibold transition",
                          form.stakeMode === value
                            ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white",
                        ].join(" ")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {form.stakeMode === "fixed" ? (
                  <Field label="Valor da stake">
                    <div className="relative">
                      <input value={form.fixedStake} onChange={(event) => onChange("fixedStake", event.target.value)} className={[inputClass, "pr-12"].join(" ")} />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">R$</span>
                    </div>
                  </Field>
                ) : (
                  <Field label="Percentual da banca por entrada">
                    <div className="relative">
                      <input value={form.percentStake} onChange={(event) => onChange("percentStake", event.target.value)} className={[inputClass, "pr-12"].join(" ")} />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">%</span>
                    </div>
                  </Field>
                )}
              </div>
            </FormBlock>

            <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
              <Info className="h-3.5 w-3.5 text-slate-400" />
              Você poderá ajustar e revisar tudo antes de iniciar a progressão.
            </div>

            {formError ? (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-300">
                {formError}
              </div>
            ) : null}

            <button className="mt-0.5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-emerald-400/40 bg-[linear-gradient(180deg,#2fed76,#17c85a)] text-sm font-bold text-[#041108] shadow-[0_14px_34px_rgba(34,197,94,0.20)] transition hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,#4cf18a,#20d967)]">
              <Plus className="h-4 w-4" />
              Criar progressão
            </button>
          </form>
        </Panel>

        <div className="grid gap-4">
          <HowItWorksCard />
          <RulesCard compact />
        </div>
      </section>

      <FinalizedTable finalized={finalized} onDownload={onDownload} />
    </div>
  );
}

function FormBlock({ title, children }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
        {title}
      </p>
      {children}
    </div>
  );
}

function ProgressionActiveHeader() {
  return (
    <header className="flex flex-col gap-3 border-b border-slate-200/80 pb-4 dark:border-white/[0.08] lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-[13px] text-slate-500 dark:text-slate-400">
          Área de membros <span className="mx-2 text-slate-400/70">›</span> Progressão
        </p>
        <h1 className="mt-2 text-[28px] font-black leading-none tracking-[-0.045em] text-slate-950 dark:text-white">
          Progressão
        </h1>
        <p className="mt-3 max-w-[820px] text-[14px] leading-5 text-slate-600 dark:text-slate-300">
          Crie uma sequência de entradas, avance uma por vez e arquive automaticamente ao concluir ou bater Red.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <span className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.10)]" />
          1 progressão ativa
        </span>
        <a
          href="#finalizadas"
          className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-800 transition hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]"
        >
          <CalendarDays className="h-4 w-4" />
          Histórico
        </a>
      </div>
    </header>
  );
}

function ProgressionActiveView({
  progression,
  currentEntry,
  finalized,
  showAllEntries,
  onToggleEntries,
  onGreen,
  onRed,
  onDownload,
}) {
  const visibleEntries = showAllEntries ? progression.entries : progression.entries.slice(0, 5);
  const stats = getProgressStats(progression);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap justify-end gap-3">
        <span className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300">
          <span className="active-pulse h-2.5 w-2.5 rounded-full bg-emerald-400" />
          1 progressão ativa
        </span>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1.18fr]">
        <KpiCard icon={Wallet} label="Banca inicial" value={formatMoney(progression.initialBankroll)} detail="Valor definido como base" tone="green" />
        <KpiCard icon={TrendingUp} label="Odd média" value={formatOdd(progression.averageOdd)} detail="Odd usada na sequência" tone="sky" />
        <KpiCard icon={Layers3} label="Entradas totais" value={String(progression.totalDays)} detail="Total planejado" tone="violet" />
        <KpiCard icon={ListChecks} label="Entrada atual" value={`${progression.currentDay}ª de ${progression.totalDays}`} detail="Próxima ação disponível" tone="amber" />
        <KpiCard icon={Target} label="Status" value="Em andamento" detail="1 progressão ativa" tone="green" />
      </section>

      <section className="grid items-start gap-4">
        <div className="grid gap-3">
          <Panel className="border-emerald-400/24 bg-[radial-gradient(circle_at_6%_0%,rgba(34,197,94,0.20),transparent_20rem),linear-gradient(135deg,rgba(16,52,39,0.76),rgba(15,23,32,0.94)_58%,rgba(13,19,27,0.96))] dark:border-emerald-400/24">
            <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[250px_1fr]">
              <div className="border-slate-200 lg:border-r lg:pr-7 dark:border-white/[0.09]">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-[24px] font-black tracking-[-0.04em] text-slate-950 dark:text-white">{progression.name}</h2>
                  <Badge tone="positive">Ativa</Badge>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <CalendarDays className="h-4 w-4" />
                  Criada em {formatDate(progression.createdAt)}
                </p>
                <p className="mt-7 text-sm text-slate-500 dark:text-slate-400">Observação</p>
                <p className="mt-3 text-[15px] text-slate-700 dark:text-slate-200">
                  {progression.notes || "Foco e disciplina."}
                </p>
                <button className="mt-16 inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.07]">
                  <Edit3 className="h-4 w-4" />
                  Editar progressão
                </button>
              </div>

              {currentEntry ? (
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[12px] font-black uppercase tracking-[0.24em] text-emerald-500">Entrada atual</p>
                      <h3 className="mt-3 text-[30px] font-black leading-tight tracking-[-0.055em] text-slate-950 dark:text-white">
                        {ordinal(currentEntry.day)} entrada de {progression.totalDays}
                      </h3>
                      <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
                        Apostar {formatMoney(currentEntry.stake)} na odd {formatOdd(currentEntry.odd)}.
                      </p>
                    </div>
                    <div className="min-w-[126px] rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] dark:border-white/[0.08] dark:bg-[#161d2a]">
                      <p className="text-slate-500 dark:text-slate-400">
                        {progression.stakeMode === "fixed" ? "Stake fixa" : "Stake variável"}
                      </p>
                      <p className="mt-1 font-semibold">
                        {progression.stakeMode === "fixed"
                          ? formatMoney(progression.fixedStake)
                          : `${formatOdd(progression.percentStake)}%`}
                      </p>
                    </div>
                  </div>

                  <ProgressionProgressBar stats={stats} total={progression.totalDays} />

                  <div className="mt-5 grid overflow-hidden rounded-[10px] border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#111827]/70 sm:grid-cols-2 lg:grid-cols-4">
                    <MiniMetric label="Banca antes" value={formatMoney(currentEntry.bankrollBefore)} />
                    <MiniMetric label="Entrada" value={formatMoney(currentEntry.stake)} />
                    <MiniMetric label="Retorno previsto" value={formatMoney(currentEntry.projectedReturn)} positive />
                    <MiniMetric label="Banca após Green" value={formatMoney(currentEntry.bankrollIfGreen)} positive />
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <button onClick={onGreen} className="inline-flex h-14 items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,#25db68,#16bf56)] text-base font-black text-[#041108] shadow-[0_15px_32px_rgba(34,197,94,0.18)] transition hover:-translate-y-0.5">
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Marcar Green
                      </span>
                    </button>
                    <button onClick={onRed} className="inline-flex h-14 items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,#ff335d,#e91f49)] text-base font-black text-white shadow-[0_15px_32px_rgba(244,63,94,0.16)] transition hover:-translate-y-0.5">
                      <span className="inline-flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Marcar Red
                      </span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-white/[0.08]">
              <h2 className="text-[18px] font-black text-slate-950 dark:text-white">Sequência de entradas</h2>
            </div>
            <ProgressionSequence entries={visibleEntries} total={progression.totalDays} onGreen={onGreen} onRed={onRed} />
            {progression.entries.length > 5 ? (
              <button
                onClick={onToggleEntries}
                className="mx-4 mb-4 flex h-12 w-[calc(100%-2rem)] min-w-0 items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/[0.08] dark:bg-[#101720]/70 dark:text-white dark:hover:bg-white/[0.05]"
              >
                {showAllEntries ? "Ver menos" : `Ver todas as ${progression.totalDays} entradas`}
                <ChevronDown className={`h-4 w-4 transition ${showAllEntries ? "rotate-180" : ""}`} />
              </button>
            ) : null}
          </Panel>

          <FinalizedCompact finalized={finalized} onDownload={onDownload} />
        </div>
      </section>
    </div>
  );
}

function IntroCard({ active }) {
  return (
    <Panel className="relative bg-[radial-gradient(circle_at_92%_42%,rgba(34,197,94,0.10),transparent_18%),linear-gradient(120deg,rgba(21,29,39,0.92),rgba(13,19,27,0.9))] px-6 py-4">
      <div className="pointer-events-none absolute right-6 top-1/2 hidden h-[78px] w-[96px] -translate-y-1/2 items-center justify-center text-emerald-500/15 dark:text-emerald-400/14 md:flex">
        <BarChart3 className="h-[76px] w-[76px]" strokeWidth={1.7} />
      </div>
      <div className="relative z-[1] grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_112px] md:items-center">
        <div>
          <h2 className="text-[20px] font-black tracking-[-0.04em]">Progressão</h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Crie uma sequência de entradas e acompanhe a execução uma por vez.
          </p>
        </div>
        <div className="shrink-0 md:justify-self-end">
          <Badge tone={active ? "positive" : "neutral"}>{active ? "Progressão ativa" : "Sem progressão ativa"}</Badge>
        </div>
        <div className="hidden md:block" />
      </div>
    </Panel>
  );
}

function Panel({ children, className = "" }) {
  return (
    <section className={`bankroll-panel ${className}`}>
      {children}
    </section>
  );
}

function SectionHeading({ title, description }) {
  return (
    <div>
      <h2 className="text-[20px] font-black tracking-[-0.04em]">{title}</h2>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

function Field({ label, suffix, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-slate-600 dark:text-slate-300">
        {label}
        {suffix ? <span className="text-xs text-slate-400">{suffix}</span> : null}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-10 w-full rounded-[12px] border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/10";

function Badge({ children, tone = "neutral" }) {
  const styles = {
    positive: "bankroll-green",
    negative: "bankroll-red",
    warning: "bankroll-cashout",
    neutral: "border border-slate-200 bg-slate-100 text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-300",
  };
  return (
    <span className={`inline-flex h-7 min-w-[72px] items-center justify-center gap-1.5 rounded-[8px] px-2.5 text-[12px] font-bold ${styles[tone]}`}>
      {tone === "neutral" ? <span className="h-2 w-2 rounded-full bg-slate-400/80" /> : null}
      {children}
    </span>
  );
}

function HowItWorksCard() {
  const steps = [
    ["Crie a progressão", "Defina banca inicial, odd média, número de entradas e tipo de stake."],
    ["Faça a entrada atual", "Acompanhe a sequência e registre cada entrada."],
    ["Marque Green ou Red", "Informe o resultado da entrada para avançar ou encerrar."],
    ["Arquivamento automático", "Red encerra a sequência. Todas Green concluem a progressão."],
  ];
  return (
    <Panel className="p-4 md:p-5">
      <h2 className="text-[18px] font-black">Como funciona</h2>
      <div className="mt-3.5 grid gap-3.5">
        {steps.map(([title, text], index) => (
          <div key={title} className="flex gap-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/10">
              <ListChecks className="h-3.5 w-3.5" />
            </span>
            <div>
              <h3 className="text-[13px] font-black leading-4">{index + 1}. {title}</h3>
              <p className="mt-1 text-[12px] leading-4 text-slate-500 dark:text-slate-400">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function RulesCard({ compact = false }) {
  const rules = compact
    ? [
        <>Apenas 1 progressão ativa por vez.</>,
        <><span className="text-emerald-500">Green</span> libera a próxima entrada.</>,
        <><span className="text-rose-500">Red</span> encerra e a progressão é arquivada.</>,
        <>Todas as entradas <span className="text-emerald-500">Green</span> concluem a sequência.</>,
      ]
    : [
        <>Apenas uma progressão pode estar ativa.</>,
        <>A entrada atual é a única liberada para marcar resultado.</>,
        <>Ao marcar <span className="text-emerald-500">Green</span>, você avança para a próxima entrada.</>,
        <>As próximas entradas ficam bloqueadas até o resultado anterior.</>,
        <>Ao marcar <span className="text-rose-500">Red</span>, a progressão é arquivada.</>,
        <>Ao completar todas as entradas com Green, a progressão é concluída com sucesso.</>,
        <>Progressões finalizadas aparecem no histórico abaixo da sequência.</>,
      ];

  return (
    <Panel className="p-5">
      <div className="flex items-center gap-3">
        {!compact ? <Target className="h-5 w-5 text-emerald-500" /> : null}
        <h2 className="text-[18px] font-black text-slate-950 dark:text-white">{compact ? "Regras" : "Regras da progressão"}</h2>
      </div>
      <div className="mt-4 grid gap-3">
        {rules.map((rule, index) => (
          <div key={index} className="flex gap-3 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <p>{rule}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function KpiCard({ icon: Icon, label, value, detail, tone }) {
  const toneClasses = {
    green: {
      card: "border-emerald-500/25 bg-[radial-gradient(circle_at_15%_18%,rgba(34,197,94,0.18),transparent_46%),linear-gradient(135deg,rgba(11,83,55,0.18),#ffffff)] dark:border-emerald-400/28 dark:bg-[radial-gradient(circle_at_15%_18%,rgba(34,197,94,0.22),transparent_46%),linear-gradient(135deg,rgba(18,73,49,0.86),rgba(14,24,31,0.96))]",
      icon: "bg-emerald-500/14 text-emerald-500 dark:bg-emerald-400/14 dark:text-emerald-300",
      value: label === "Status" ? "text-emerald-600 dark:text-emerald-300" : "text-slate-950 dark:text-white",
    },
    sky: {
      card: "border-sky-500/24 bg-[radial-gradient(circle_at_15%_18%,rgba(56,189,248,0.16),transparent_46%),linear-gradient(135deg,rgba(14,116,144,0.14),#ffffff)] dark:border-sky-400/28 dark:bg-[radial-gradient(circle_at_15%_18%,rgba(56,189,248,0.22),transparent_46%),linear-gradient(135deg,rgba(15,63,91,0.88),rgba(14,24,31,0.96))]",
      icon: "bg-sky-500/14 text-sky-500 dark:bg-sky-400/14 dark:text-sky-300",
      value: "text-slate-950 dark:text-white",
    },
    violet: {
      card: "border-violet-500/24 bg-[radial-gradient(circle_at_15%_18%,rgba(139,92,246,0.15),transparent_46%),linear-gradient(135deg,rgba(109,40,217,0.12),#ffffff)] dark:border-violet-400/28 dark:bg-[radial-gradient(circle_at_15%_18%,rgba(139,92,246,0.22),transparent_46%),linear-gradient(135deg,rgba(49,37,88,0.9),rgba(14,24,31,0.96))]",
      icon: "bg-violet-500/14 text-violet-500 dark:bg-violet-400/14 dark:text-violet-300",
      value: "text-slate-950 dark:text-white",
    },
    amber: {
      card: "border-amber-500/25 bg-[radial-gradient(circle_at_15%_18%,rgba(245,158,11,0.16),transparent_46%),linear-gradient(135deg,rgba(180,83,9,0.12),#ffffff)] dark:border-amber-400/30 dark:bg-[radial-gradient(circle_at_15%_18%,rgba(245,158,11,0.23),transparent_46%),linear-gradient(135deg,rgba(74,50,17,0.94),rgba(14,24,31,0.96))]",
      icon: "bg-amber-500/14 text-amber-600 dark:bg-amber-400/14 dark:text-amber-300",
      value: "text-slate-950 dark:text-white",
    },
  };
  const styles = toneClasses[tone] || toneClasses.green;

  return (
    <article className={`rounded-[8px] border p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] ${styles.card}`}>
      <div className="flex min-h-[78px] items-center gap-4">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] ${styles.icon}`}>
          <Icon className="h-6 w-6" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-slate-200">{label}</p>
          <p className={`mt-1.5 text-[23px] font-black leading-none tracking-[-0.035em] drop-shadow-[0_1px_0_rgba(0,0,0,0.35)] ${styles.value}`}>{value}</p>
          {detail ? <p className="mt-2 truncate text-[11.5px] font-semibold text-slate-600 dark:text-slate-300">{detail}</p> : null}
        </div>
      </div>
    </article>
  );
}

function MiniMetric({ label, value, positive = false }) {
  return (
    <div className="border-b border-slate-200 px-5 py-4 last:border-b-0 dark:border-white/[0.08] sm:border-r sm:last:border-r-0">
      <p className="text-[12px] text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-[16px] font-black ${positive ? "text-emerald-500" : "text-slate-950 dark:text-white"}`}>{value}</p>
    </div>
  );
}

function ProgressionProgressBar({ stats, total }) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between text-[12px] text-slate-500 dark:text-slate-400">
        <span>Progresso da sequência</span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {stats.completed} de {total}
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#16c85a,#4ade80,#16c85a)] bg-[length:180%_100%] shadow-[0_0_18px_rgba(34,197,94,0.35)] transition-[width] duration-700 ease-out progress-shimmer"
          style={{ width: `${stats.percent}%` }}
        />
      </div>
      <div className="mt-2 flex justify-end text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
        {stats.percent}% concluído
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const labels = { pending: "Pendente", green: "Green", red: "Red", locked: "Bloqueado" };
  const tone = statusTone(status);
  return <Badge tone={tone}>{status === "locked" ? <Lock className="h-3.5 w-3.5" /> : null}{labels[status]}</Badge>;
}

function ProgressionSequence({ entries, total, onGreen, onRed }) {
  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] table-fixed border-collapse text-[13px]">
          <thead>
            <tr className="bg-slate-100/80 text-left text-[11px] uppercase tracking-[0.04em] text-slate-500 dark:bg-[#18212c] dark:text-slate-400">
              {["Entrada", "Status", "Banca antes", "Entrada", "Odd", "Retorno previsto", "Banca após", "Ação"].map((head, index) => (
                <th
                  key={head}
                  className={[
                    "px-4 py-3 font-semibold",
                    index >= 2 && index <= 6 ? "text-right" : "",
                    index === 0 ? "w-[120px]" : "",
                    index === 1 ? "w-[130px]" : "",
                    index === 4 ? "w-[80px]" : "",
                    index === 7 ? "w-[150px] text-right" : "",
                  ].join(" ")}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/[0.07]">
            {entries.map((entry) => (
              <tr key={entry.id} className={entry.status === "pending" ? "bg-amber-400/12" : entry.status === "locked" ? "text-slate-400 dark:text-slate-500" : ""}>
                <td className="px-4 py-3.5 font-black">{ordinal(entry.day)} de {total}</td>
                <td className="px-4 py-3.5"><StatusBadge status={entry.status} /></td>
                <td className="px-4 py-3.5 text-right tabular-nums">{formatMoney(entry.bankrollBefore)}</td>
                <td className="px-4 py-3.5 text-right font-bold tabular-nums">{formatMoney(entry.stake)}</td>
                <td className="px-4 py-3.5 text-right tabular-nums">{formatOdd(entry.odd)}</td>
                <td className="px-4 py-3.5 text-right tabular-nums">{formatMoney(entry.projectedReturn)}</td>
                <td className="px-4 py-3.5 text-right font-bold tabular-nums">
                  {entry.actualBankrollAfter !== null ? formatMoney(entry.actualBankrollAfter) : formatMoney(entry.bankrollIfGreen)}
                </td>
                <td className="px-4 py-3.5">
                  {entry.status === "pending" ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={onGreen} className="inline-flex h-8 min-w-[66px] items-center justify-center gap-1.5 rounded-[8px] border border-emerald-400/25 bg-emerald-400/10 px-2.5 text-[12px] font-bold text-emerald-500">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Green
                      </button>
                      <button onClick={onRed} className="inline-flex h-8 min-w-[58px] items-center justify-center gap-1.5 rounded-[8px] border border-rose-400/25 bg-rose-400/10 px-2.5 text-[12px] font-bold text-rose-500">
                        <XCircle className="h-3.5 w-3.5" />
                        Red
                      </button>
                    </div>
                  ) : entry.status === "locked" ? (
                    <div className="flex justify-end"><Lock className="h-4 w-4 text-slate-500" /></div>
                  ) : (
                    <span className="text-xs text-slate-500">{formatDate(entry.checkedAt)}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {entries.map((entry) => (
          <article key={entry.id} className={`rounded-[18px] border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:border-white/[0.08] ${entry.status === "pending" ? "border-amber-400/30 bg-amber-400/10" : "border-slate-200 bg-white dark:bg-slate-900/92"}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-black">{ordinal(entry.day)} de {total}</p>
                <p className="mt-1 text-sm text-slate-500">{formatMoney(entry.stake)} na odd {formatOdd(entry.odd)}</p>
              </div>
              <StatusBadge status={entry.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <MiniText label="Banca antes" value={formatMoney(entry.bankrollBefore)} />
              <MiniText label="Retorno" value={formatMoney(entry.projectedReturn)} />
              <MiniText label="Banca após" value={formatMoney(entry.bankrollIfGreen)} />
            </div>
            {entry.status === "pending" ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={onGreen} className="h-10 rounded-[12px] bg-emerald-600 font-bold text-white dark:bg-emerald-500 dark:text-slate-950">Green</button>
                <button onClick={onRed} className="h-10 rounded-[12px] bg-rose-600 font-bold text-white dark:bg-rose-500">Red</button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </>
  );
}

function MiniText({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function FinalizedTable({ finalized, onDownload }) {
  const rows = finalized.slice(0, 4);

  return (
    <Panel id="finalizadas" className="overflow-hidden">
      <div className="bankroll-panel-head border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <h2 className="bankroll-section-title text-[20px]">Finalizadas recentes</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Veja suas progressões arquivadas mais recentemente.</p>
        </div>
        <button className="bankroll-mini-button hidden md:inline-flex">Ver todas</button>
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[12px] border border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-white/[0.04]">
            <Download className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-black text-slate-950 dark:text-white">Nenhuma progressão finalizada ainda.</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quando uma sequência terminar, ela aparecerá aqui.</p>
        </div>
      ) : (
        <>
          <div className="bankroll-table-wrap hidden lg:block">
            <table className="bankroll-table">
              <thead>
                <tr>
                  {["Nome", "Período", "Banca inicial", "Banca final", "Resultado", "Status", "Ações"].map((head, index) => (
                    <th key={head} className={index >= 2 && index <= 4 ? "numeric" : ""}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <FinalizedRow key={item.id} item={item} onDownload={onDownload} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 lg:hidden">
            {rows.map((item) => (
              <FinalizedCard key={item.id} item={item} onDownload={onDownload} />
            ))}
          </div>

          <div className="border-t border-slate-200/80 px-5 py-4 text-center text-sm text-slate-500 dark:border-white/[0.08]">
            <span className="mr-2 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Mostrando {rows.length} de {finalized.length} progressões
          </div>
        </>
      )}
    </Panel>
  );
}

function FinalizedRow({ item, onDownload }) {
  const resultPositive = item.profit >= 0;
  const period = item.createdAtLabel || `${formatDate(item.createdAt)} - ${formatDate(item.finishedAt)}`;

  return (
    <tr>
      <td className="font-semibold">{item.name}</td>
      <td className="text-slate-500">{period}</td>
      <td className="numeric">{formatMoney(item.initialBankroll)}</td>
      <td className="numeric">{formatMoney(item.currentBankroll)}</td>
      <td className={`numeric font-black ${resultPositive ? "text-emerald-500" : "text-rose-500"}`}>{formatSignedMoney(item.profit)}</td>
      <td><Badge tone={item.finalStatus === "red" ? "negative" : "positive"}>{getFinalLabel(item.finalStatus)}</Badge></td>
      <td>
        <button
          onClick={() => !item.isSample && onDownload(item)}
          className="bankroll-more"
          aria-label="Baixar imagem"
        >
          <Download className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function FinalizedCard({ item, onDownload }) {
  const period = item.createdAtLabel || `${formatDate(item.createdAt)} - ${formatDate(item.finishedAt)}`;

  return (
    <article className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)] dark:border-white/[0.08] dark:bg-slate-900/92">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-black">{item.name}</p>
          <p className="mt-1 text-sm text-slate-500">{period}</p>
        </div>
        <button onClick={() => !item.isSample && onDownload(item)} className="bankroll-more">
          <Download className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <MiniText label="Banca inicial" value={formatMoney(item.initialBankroll)} />
        <MiniText label="Banca final" value={formatMoney(item.currentBankroll)} />
        <MiniText label="Resultado" value={formatSignedMoney(item.profit)} />
      </div>
    </article>
  );
}

function FinalizedCompact({ finalized, onDownload }) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-[18px] font-black text-slate-950 dark:text-white">Últimas finalizadas</h3>
        <a href="#finalizadas" className="inline-flex h-8 items-center rounded-[9px] border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-300">Ver todas</a>
      </div>
      {finalized.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-slate-500">Nenhuma finalizada ainda.</p>
      ) : (
        <div className="px-5 pb-5">
          <div className="overflow-hidden rounded-[10px] border border-slate-200 dark:border-white/[0.08]">
            <div className="hidden bg-slate-100/80 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500 dark:bg-[#18212c] dark:text-slate-400 md:grid md:grid-cols-[1.2fr_0.9fr_0.9fr_0.7fr_132px] md:gap-4">
              <span>Nome</span>
              <span className="text-right">Banca inicial</span>
              <span className="text-right">Banca final</span>
              <span className="text-center">Resultado</span>
              <span className="text-right">Exportar</span>
            </div>
            {finalized.slice(0, 2).map((item) => (
              <div key={item.id} className="grid gap-3 border-b border-slate-200 bg-white p-4 text-[13px] last:border-b-0 dark:border-white/[0.07] dark:bg-[#111820] md:grid-cols-[1.2fr_0.9fr_0.9fr_0.7fr_132px] md:items-center md:gap-4 md:px-4 md:py-3.5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500 md:hidden">Nome</p>
                  <p className="mt-1 truncate font-semibold text-slate-950 dark:text-white md:mt-0">{item.name}</p>
                </div>
                <div className="md:text-right">
                  <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500 md:hidden">Banca inicial</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300 md:mt-0">{formatMoney(item.initialBankroll)}</p>
                </div>
                <div className="md:text-right">
                  <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500 md:hidden">Banca final</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300 md:mt-0">{formatMoney(item.currentBankroll)}</p>
                </div>
                <div className="md:flex md:justify-center">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500 md:hidden">Resultado</p>
                  <Badge tone={item.finalStatus === "red" ? "negative" : "positive"}>{item.finalStatus === "red" ? "Red" : "Green"}</Badge>
                </div>
                <div className="md:flex md:justify-end">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500 md:hidden">Exportar</p>
              <button
                onClick={() => onDownload(item)}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[8px] border border-emerald-400/25 bg-emerald-400/10 px-2.5 text-[11px] font-bold text-emerald-600 transition hover:bg-emerald-400/15 dark:text-emerald-300"
                aria-label="Baixar extrato da progressão em imagem"
                title="Baixar extrato da progressão em imagem"
              >
                <FileImage className="h-4 w-4" />
                Extrato PNG
              </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}

function renderShareImage(progression) {
  const entries = getShareEntries(progression);
  const stats = getProgressStats(progression);
  const scale = 2;
  const width = 1080;
  const rowHeight = entries.length > 20 ? 54 : entries.length > 10 ? 62 : 72;
  const height = 1220 + entries.length * rowHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  ctx.fillStyle = "#050d17";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(163,255,18,0.32)";
  ctx.lineWidth = 2;
  rounded(ctx, 34, 34, width - 68, height - 68, 30);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 42px Arial";
  ctx.fillText("ALPHA", 90, 110);
  ctx.fillStyle = "#a3ff12";
  ctx.fillText("TIPS", 242, 110);
  pill(ctx, progression.finalStatus === "red" ? "ENCERRADA (RED)" : "PROGRESSÃO CONCLUÍDA", 690, 68, 300, 58, progression.finalStatus === "red" ? "#fb7185" : "#a3ff12");

  ctx.fillStyle = "#9aa4b2";
  ctx.font = "400 24px Arial";
  ctx.fillText(`${progression.name}   •   ${formatDate(progression.createdAt)} até ${formatDate(progression.finishedAt)}`, 76, 180);

  rounded(ctx, 76, 230, 928, 300, 26);
  ctx.fillStyle = "#071928";
  ctx.fill();
  ctx.strokeStyle = "rgba(163,255,18,0.5)";
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 28px Arial";
  ctx.fillText("RESULTADO FINAL", 122, 305);
  ctx.fillStyle = progression.profit >= 0 ? "#a3ff12" : "#fb7185";
  ctx.font = "900 86px Arial";
  ctx.fillText(formatSignedMoney(progression.profit), 122, 420);
  ctx.fillStyle = "#a7b0bd";
  ctx.font = "400 26px Arial";
  const evolution = progression.initialBankroll ? (progression.profit / progression.initialBankroll) * 100 : 0;
  ctx.fillText(`EVOLUÇÃO ${evolution > 0 ? "+" : ""}${round(evolution).toFixed(1).replace(".", ",")}%`, 122, 478);

  const metrics = [
    ["BANCA INICIAL", formatMoney(progression.initialBankroll)],
    ["BANCA FINAL", formatMoney(progression.currentBankroll)],
    ["ODD MÉDIA", formatOdd(progression.averageOdd)],
    ["ENTRADAS", String(entries.length)],
    ["GREENS", String(stats.greens)],
  ];
  rounded(ctx, 76, 570, 928, 138, 22);
  ctx.fillStyle = "#071928";
  ctx.fill();
  metrics.forEach(([label, value], index) => {
    const x = 76 + (928 / 5) * index;
    ctx.textAlign = "center";
    ctx.fillStyle = "#a7b0bd";
    ctx.font = "400 20px Arial";
    ctx.fillText(label, x + 92, 630);
    ctx.fillStyle = index === 1 ? "#a3ff12" : "#ffffff";
    ctx.font = "900 27px Arial";
    ctx.fillText(value, x + 92, 675);
  });
  ctx.textAlign = "left";

  ctx.fillStyle = "#a3ff12";
  ctx.font = "900 27px Arial";
  ctx.fillText("ENTRADAS DA PROGRESSÃO", 94, 775);

  const tableY = 808;
  rounded(ctx, 76, tableY, 928, 58 + entries.length * rowHeight, 22);
  ctx.fillStyle = "rgba(7,25,40,0.88)";
  ctx.fill();
  const columns = [116, 220, 410, 555, 640, 800, 960];
  ctx.fillStyle = "#d8dee9";
  ctx.font = "900 17px Arial";
  ["#", "STATUS", "BANCA ANTES", "ENTRADA", "ODD", "RETORNO", "BANCA APÓS"].forEach((label, index) => {
    ctx.textAlign = index < 2 ? "left" : "right";
    ctx.fillText(label, columns[index], tableY + 38);
  });

  entries.forEach((entry, index) => {
    const y = tableY + 58 + index * rowHeight;
    const center = y + rowHeight / 2;
    const after = entry.actualBankrollAfter ?? entry.bankrollIfGreen;
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.moveTo(92, y);
    ctx.lineTo(988, y);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 22px Arial";
    ctx.textAlign = "left";
    ctx.fillText(String(entry.day), columns[0], center + 8);
    pill(ctx, entry.status === "red" ? "Red" : "Green", columns[1], center - 18, 100, 34, entry.status === "red" ? "#fb7185" : "#a3ff12");
    ctx.textAlign = "right";
    ctx.font = "400 22px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(formatMoney(entry.bankrollBefore), columns[2], center + 8);
    ctx.fillText(formatMoney(entry.stake), columns[3], center + 8);
    ctx.fillText(formatOdd(entry.odd), columns[4], center + 8);
    ctx.fillText(formatMoney(entry.projectedReturn), columns[5], center + 8);
    ctx.fillStyle = index === entries.length - 1 ? "#a3ff12" : "#ffffff";
    ctx.font = "900 22px Arial";
    ctx.fillText(formatMoney(after), columns[6], center + 8);
  });

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 30px Arial";
  ctx.fillText("ALPHA", 500, height - 82);
  ctx.fillStyle = "#a3ff12";
  ctx.fillText("TIPS", 610, height - 82);

  return canvas.toDataURL("image/png", 1);
}

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function pill(ctx, text, x, y, w, h, color) {
  rounded(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = `${color}22`;
  ctx.fill();
  ctx.strokeStyle = `${color}55`;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = "900 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, x + w / 2, y + h / 2 + 7);
  ctx.textAlign = "left";
}
