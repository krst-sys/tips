"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "progressao-execucao-v2";

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

function round(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function formatMoney(value) {
  return moneyFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatDate(value) {
  if (!value) return "-";
  return dateFormatter.format(new Date(value));
}

function toNumber(value, fallback = 0) {
  const normalized = String(value).replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatOdd(value) {
  return Number(value).toFixed(2);
}

function getStatusBadgeClasses(status) {
  switch (status) {
    case "pending":
      return "border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/15 dark:text-amber-300";
    case "green":
      return "border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/15 dark:text-emerald-300";
    case "red":
      return "border border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/15 dark:text-rose-300";
    case "locked":
    default:
      return "border border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-300";
  }
}

function getFinalStatusClasses(status) {
  switch (status) {
    case "completed":
      return "border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/15 dark:text-emerald-300";
    case "red":
      return "border border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/15 dark:text-rose-300";
    case "manual":
    default:
      return "border border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/15 dark:text-sky-300";
  }
}

function getEntryLabel(status) {
  switch (status) {
    case "pending":
      return "Pendente";
    case "green":
      return "Green";
    case "red":
      return "Red";
    case "locked":
    default:
      return "Bloqueado";
  }
}

function getFinalLabel(status) {
  switch (status) {
    case "completed":
      return "Concluída";
    case "red":
      return "Encerrada no red";
    case "manual":
    default:
      return "Encerrada manualmente";
  }
}

function createProjectionFromForm(form) {
  const initialBankroll = Math.max(1, toNumber(form.initialBankroll, 100));
  const averageOdd = Math.max(1.01, toNumber(form.averageOdd, 1.5));
  const totalDays = Math.max(1, Math.min(60, Math.round(toNumber(form.totalDays, 7))));
  const fixedStake = Math.max(0.01, toNumber(form.fixedStake, 10));
  const percentStake = Math.max(1, Math.min(100, toNumber(form.percentStake, 100)));
  const stakeMode = form.stakeMode === "fixed" ? "fixed" : "percent";

  let bankrollCursor = initialBankroll;

  const entries = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    const stake =
      stakeMode === "fixed"
        ? fixedStake
        : round(bankrollCursor * (percentStake / 100));

    const projectedReturn = round(stake * averageOdd);
    const projectedProfit = round(projectedReturn - stake);
    const bankrollIfGreen = round(bankrollCursor + projectedProfit);

    const entry = {
      id: `${Date.now()}-${day}-${Math.random().toString(36).slice(2, 8)}`,
      day,
      stake: round(stake),
      odd: round(averageOdd),
      projectedReturn,
      projectedProfit,
      bankrollBefore: round(bankrollCursor),
      bankrollIfGreen,
      actualBankrollAfter: null,
      status: day === 1 ? "pending" : "locked",
      checkedAt: null,
    };

    bankrollCursor = bankrollIfGreen;
    return entry;
  });

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: form.name?.trim() || "Nova progressão",
    notes: form.notes?.trim() || "",
    createdAt: new Date().toISOString(),
    finishedAt: null,
    finalStatus: "active",
    stakeMode,
    fixedStake,
    percentStake,
    initialBankroll,
    currentBankroll: initialBankroll,
    averageOdd,
    totalDays,
    currentDay: 1,
    profit: 0,
    entries,
  };
}

function finalizeProjection(projection, finalStatus, finalBankroll) {
  return {
    ...projection,
    currentBankroll: round(finalBankroll),
    profit: round(finalBankroll - projection.initialBankroll),
    finishedAt: new Date().toISOString(),
    finalStatus,
  };
}

export default function ProgressaoPage() {
  const [hydrated, setHydrated] = useState(false);
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(true);

  const [form, setForm] = useState({
    name: "Progressão 1",
    notes: "",
    initialBankroll: "10",
    averageOdd: "1.50",
    totalDays: "24",
    stakeMode: "percent",
    fixedStake: "10",
    percentStake: "100",
  });

  const [activeProjection, setActiveProjection] = useState(null);
  const [finalizedProjections, setFinalizedProjections] = useState([]);
  const [openFinalizedId, setOpenFinalizedId] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);

        if (parsed.form) setForm(parsed.form);
        if (parsed.activeProjection) setActiveProjection(parsed.activeProjection);
        if (Array.isArray(parsed.finalizedProjections)) {
          setFinalizedProjections(parsed.finalizedProjections);
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

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          form,
          activeProjection,
          finalizedProjections,
        })
      );
    } catch (error) {
      console.error("Erro ao salvar progressões:", error);
    }
  }, [hydrated, form, activeProjection, finalizedProjections]);

  useEffect(() => {
    if (!hydrated) return;
    setIsCreatePanelOpen(!activeProjection);
  }, [hydrated, activeProjection]);

  const currentEntry = useMemo(() => {
    if (!activeProjection) return null;
    return activeProjection.entries.find((entry) => entry.status === "pending") || null;
  }, [activeProjection]);

  const progressInfo = useMemo(() => {
    if (!activeProjection) {
      return {
        completedDays: 0,
        progressPercent: 0,
        greens: 0,
        reds: 0,
      };
    }

    const greens = activeProjection.entries.filter((entry) => entry.status === "green").length;
    const reds = activeProjection.entries.filter((entry) => entry.status === "red").length;
    const completedDays = greens + reds;
    const progressPercent = (completedDays / activeProjection.totalDays) * 100;

    return {
      completedDays,
      progressPercent,
      greens,
      reds,
    };
  }, [activeProjection]);

  function updateForm(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleCreateProjection() {
    if (activeProjection) return;

    const projection = createProjectionFromForm(form);
    setActiveProjection(projection);
    setIsCreatePanelOpen(false);
  }

  function handleMarkGreen() {
    if (!activeProjection || !currentEntry) return;

    const currentIndex = activeProjection.entries.findIndex((entry) => entry.id === currentEntry.id);
    if (currentIndex === -1) return;

    const nextBankroll = round(currentEntry.bankrollIfGreen);

    const updatedEntries = activeProjection.entries.map((entry, index) => {
      if (index === currentIndex) {
        return {
          ...entry,
          status: "green",
          checkedAt: new Date().toISOString(),
          actualBankrollAfter: nextBankroll,
        };
      }

      if (index === currentIndex + 1) {
        return {
          ...entry,
          status: "pending",
        };
      }

      return entry;
    });

    const isLastDay = currentIndex === activeProjection.entries.length - 1;

    if (isLastDay) {
      const finalized = finalizeProjection(
        {
          ...activeProjection,
          entries: updatedEntries,
          currentDay: activeProjection.totalDays,
        },
        "completed",
        nextBankroll
      );

      setFinalizedProjections((prev) => [finalized, ...prev]);
      setActiveProjection(null);
      setIsCreatePanelOpen(true);
      return;
    }

    setActiveProjection((prev) => ({
      ...prev,
      entries: updatedEntries,
      currentBankroll: nextBankroll,
      currentDay: currentEntry.day + 1,
      profit: round(nextBankroll - prev.initialBankroll),
    }));
  }

  function handleMarkRed() {
    if (!activeProjection || !currentEntry) return;

    const currentIndex = activeProjection.entries.findIndex((entry) => entry.id === currentEntry.id);
    if (currentIndex === -1) return;

    const nextBankroll = round(currentEntry.bankrollBefore - currentEntry.stake);

    const updatedEntries = activeProjection.entries.map((entry, index) => {
      if (index === currentIndex) {
        return {
          ...entry,
          status: "red",
          checkedAt: new Date().toISOString(),
          actualBankrollAfter: nextBankroll,
        };
      }

      return entry;
    });

    const finalized = finalizeProjection(
      {
        ...activeProjection,
        entries: updatedEntries,
        currentDay: currentEntry.day,
      },
      "red",
      nextBankroll
    );

    setFinalizedProjections((prev) => [finalized, ...prev]);
    setActiveProjection(null);
    setIsCreatePanelOpen(true);
  }

  function handleManualFinish() {
    if (!activeProjection) return;

    const finalized = finalizeProjection(
      {
        ...activeProjection,
      },
      "manual",
      activeProjection.currentBankroll
    );

    setFinalizedProjections((prev) => [finalized, ...prev]);
    setActiveProjection(null);
    setIsCreatePanelOpen(true);
  }

  function handleClearHistory() {
    setFinalizedProjections([]);
    setOpenFinalizedId(null);
  }

  const showExpandedCreatePanel = !activeProjection && isCreatePanelOpen;

  return (
    <div className="relative min-h-screen bg-transparent text-slate-900 dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(59,130,246,0.10),transparent_24%),radial-gradient(circle_at_92%_10%,rgba(141,241,38,0.08),transparent_20%),linear-gradient(180deg,#f8fafc_0%,#eef3f8_100%)] dark:bg-[radial-gradient(circle_at_12%_8%,rgba(92,126,176,0.16),transparent_22%),radial-gradient(circle_at_92%_10%,rgba(141,241,38,0.06),transparent_18%),linear-gradient(180deg,#08111b_0%,#0a1320_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1550px] px-5 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
              Progressão em andamento
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Execute sua sequência e marque cada resultado
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
              Crie uma projeção, acompanhe o dia atual e vá marcando green ou red.
              Se bater red, a sequência vai para finalizadas e você pode abrir outra.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:shadow-none">
            {activeProjection ? (
              <>
                Projeção ativa:{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeProjection.name}
                </span>
              </>
            ) : (
              <>Nenhuma projeção ativa no momento</>
            )}
          </div>
        </div>

        <div
          className={`grid gap-6 transition-all duration-300 ${
            activeProjection
              ? "xl:grid-cols-[130px_minmax(0,1fr)]"
              : "xl:grid-cols-[390px_minmax(0,1fr)]"
          }`}
        >
          <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl transition-all duration-300 dark:border-white/[0.08] dark:bg-[linear-gradient(180deg,rgba(16,25,37,0.94)_0%,rgba(13,21,32,0.94)_100%)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            {showExpandedCreatePanel ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Nova projeção
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Você só pode ter 1 projeção ativa por vez.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Nome da projeção
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400/50 dark:border-white/[0.08] dark:bg-[#0d1624] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Observação
                    </label>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) => updateForm("notes", e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400/50 dark:border-white/[0.08] dark:bg-[#0d1624] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Banca inicial
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.initialBankroll}
                      onChange={(e) => updateForm("initialBankroll", e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400/50 dark:border-white/[0.08] dark:bg-[#0d1624] dark:text-white"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Odd média
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.averageOdd}
                        onChange={(e) => updateForm("averageOdd", e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400/50 dark:border-white/[0.08] dark:bg-[#0d1624] dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Número de dias
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={form.totalDays}
                        onChange={(e) => updateForm("totalDays", e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400/50 dark:border-white/[0.08] dark:bg-[#0d1624] dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Tipo de stake
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => updateForm("stakeMode", "fixed")}
                        className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                          form.stakeMode === "fixed"
                            ? "bg-slate-900 text-white dark:bg-white dark:text-[#08111b]"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-[#0d1624] dark:text-slate-300 dark:hover:bg-white/[0.08]"
                        }`}
                      >
                        Fixa
                      </button>

                      <button
                        type="button"
                        onClick={() => updateForm("stakeMode", "percent")}
                        className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                          form.stakeMode === "percent"
                            ? "bg-emerald-400 text-[#08111b]"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-[#0d1624] dark:text-slate-300 dark:hover:bg-white/[0.08]"
                        }`}
                      >
                        Variável
                      </button>
                    </div>
                  </div>

                  {form.stakeMode === "fixed" ? (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Valor fixo por entrada
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.fixedStake}
                        onChange={(e) => updateForm("fixedStake", e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400/50 dark:border-white/[0.08] dark:bg-[#0d1624] dark:text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Percentual da banca por entrada
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.percentStake}
                        onChange={(e) => updateForm("percentStake", e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400/50 dark:border-white/[0.08] dark:bg-[#0d1624] dark:text-white"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleCreateProjection}
                    className="mt-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-[#08111b] transition hover:brightness-105"
                  >
                    Criar projeção
                  </button>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300 bg-amber-50 text-xl dark:border-amber-400/20 dark:bg-amber-400/10">
                  📌
                </div>

                <h2 className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-slate-900 dark:text-white">
                  Em andamento
                </h2>

                <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  O painel de criação volta quando a projeção ativa for encerrada.
                </p>
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              <div className="rounded-3xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-5 dark:border-emerald-400/15 dark:from-emerald-400/10 dark:to-emerald-400/5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                  Banca atual
                </p>
                <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                  {activeProjection ? formatMoney(activeProjection.currentBankroll) : "--"}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {activeProjection
                    ? `Lucro acumulado: ${formatMoney(activeProjection.profit)}`
                    : "Sem projeção ativa"}
                </p>
              </div>

              <div className="rounded-3xl border border-sky-300 bg-gradient-to-br from-sky-50 to-white p-5 dark:border-sky-400/15 dark:from-sky-400/10 dark:to-sky-400/5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
                  Dia atual
                </p>
                <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                  {activeProjection ? `${activeProjection.currentDay} / ${activeProjection.totalDays}` : "--"}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {activeProjection
                    ? `${progressInfo.completedDays} finalizado(s)`
                    : "Aguardando nova projeção"}
                </p>
              </div>

              <div className="rounded-3xl border border-amber-300 bg-gradient-to-br from-amber-50 to-white p-5 dark:border-amber-400/15 dark:from-amber-400/10 dark:to-amber-400/5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
                  Próxima entrada
                </p>
                <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                  {currentEntry ? formatMoney(currentEntry.stake) : "--"}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {currentEntry ? `Retorno previsto: ${formatMoney(currentEntry.projectedReturn)}` : "Sem entrada pendente"}
                </p>
              </div>

              <div className="rounded-3xl border border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 to-white p-5 dark:border-fuchsia-400/15 dark:from-fuchsia-400/10 dark:to-fuchsia-400/5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-700 dark:text-fuchsia-300">
                  Greens / Reds
                </p>
                <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                  {activeProjection ? `${progressInfo.greens} / ${progressInfo.reds}` : "--"}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {activeProjection
                    ? `Odd alvo ${formatOdd(activeProjection.averageOdd)}`
                    : "Abra uma nova projeção"}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[linear-gradient(180deg,rgba(16,25,37,0.94)_0%,rgba(13,21,32,0.94)_100%)] dark:shadow-none">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Projeção em andamento
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Marque o dia atual como green ou red para seguir a sequência.
                  </p>
                </div>

                {activeProjection && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleManualFinish}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.08] dark:bg-[#0d1624] dark:text-slate-200 dark:hover:bg-white/[0.08]"
                    >
                      Encerrar manualmente
                    </button>
                  </div>
                )}
              </div>

              {!activeProjection ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center dark:border-white/[0.1] dark:bg-[#0d1624]">
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    Nenhuma projeção ativa
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Crie uma nova projeção no painel ao lado para começar.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-[#0d1624]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {activeProjection.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Criada em {formatDate(activeProjection.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                          {activeProjection.stakeMode === "fixed"
                            ? `Stake fixa ${formatMoney(activeProjection.fixedStake)}`
                            : `Stake variável ${formatOdd(activeProjection.percentStake)}%`}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                          Banca inicial {formatMoney(activeProjection.initialBankroll)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                        <span>Progresso</span>
                        <span>{round(progressInfo.progressPercent)}%</span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all"
                          style={{ width: `${progressInfo.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/[0.08]">
                    <table className="min-w-[1080px] w-full text-sm">
                      <thead className="bg-slate-50 text-left dark:bg-white/[0.06]">
                        <tr className="text-slate-700 dark:text-slate-200">
                          <th className="px-4 py-3 font-bold">DIA</th>
                          <th className="px-4 py-3 font-bold">STATUS</th>
                          <th className="px-4 py-3 font-bold">BANCA ANTES</th>
                          <th className="px-4 py-3 font-bold">ENTRADA</th>
                          <th className="px-4 py-3 font-bold">ODD</th>
                          <th className="px-4 py-3 font-bold">RETORNO PREVISTO</th>
                          <th className="px-4 py-3 font-bold">BANCA APÓS</th>
                          <th className="px-4 py-3 font-bold">AÇÃO</th>
                        </tr>
                      </thead>

                      <tbody>
                        {activeProjection.entries.map((entry) => {
                          const isCurrent = entry.status === "pending";

                          return (
                            <tr
                              key={entry.id}
                              className={`border-t border-slate-200 text-slate-700 dark:border-white/[0.06] dark:text-slate-200 ${
                                isCurrent ? "bg-emerald-50 dark:bg-emerald-400/[0.05]" : ""
                              }`}
                            >
                              <td className="px-4 py-3 font-semibold">{entry.day}º DIA</td>

                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClasses(
                                    entry.status
                                  )}`}
                                >
                                  {getEntryLabel(entry.status)}
                                </span>
                              </td>

                              <td className="px-4 py-3">{formatMoney(entry.bankrollBefore)}</td>
                              <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                                {formatMoney(entry.stake)}
                              </td>
                              <td className="px-4 py-3">{formatOdd(entry.odd)}</td>
                              <td className="px-4 py-3">{formatMoney(entry.projectedReturn)}</td>
                              <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                                {entry.actualBankrollAfter !== null
                                  ? formatMoney(entry.actualBankrollAfter)
                                  : entry.status === "locked"
                                  ? "--"
                                  : formatMoney(entry.bankrollIfGreen)}
                              </td>

                              <td className="px-4 py-3">
                                {entry.status === "pending" ? (
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={handleMarkGreen}
                                      className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-black text-[#08111b] transition hover:brightness-105"
                                    >
                                      ✓ Marcar green
                                    </button>

                                    <button
                                      type="button"
                                      onClick={handleMarkRed}
                                      className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-black text-white transition hover:brightness-105"
                                    >
                                      ✕ Marcar red
                                    </button>
                                  </div>
                                ) : entry.status === "green" ? (
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Confirmado em {formatDate(entry.checkedAt)}
                                  </span>
                                ) : entry.status === "red" ? (
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Encerrado em {formatDate(entry.checkedAt)}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-500 dark:text-slate-500">
                                    Aguardando dia anterior
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {activeProjection.notes && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/[0.08] dark:bg-[#0d1624] dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">Observação:</span>{" "}
                      {activeProjection.notes}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[linear-gradient(180deg,rgba(16,25,37,0.94)_0%,rgba(13,21,32,0.94)_100%)] dark:shadow-none">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Finalizadas recentes
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Projeções encerradas por red, concluídas ou fechadas manualmente.
                  </p>
                </div>

                {finalizedProjections.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.08] dark:bg-[#0d1624] dark:text-slate-200 dark:hover:bg-white/[0.08]"
                  >
                    Limpar histórico
                  </button>
                )}
              </div>

              {finalizedProjections.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center dark:border-white/[0.1] dark:bg-[#0d1624]">
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    Ainda não há projeções finalizadas
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Quando uma sequência terminar, ela aparecerá aqui.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {finalizedProjections.map((projection) => {
                    const greens = projection.entries.filter((entry) => entry.status === "green").length;
                    const reds = projection.entries.filter((entry) => entry.status === "red").length;
                    const stoppedDay =
                      projection.entries.find((entry) => entry.status === "red")?.day ||
                      greens ||
                      0;

                    const isOpen = openFinalizedId === projection.id;

                    return (
                      <div
                        key={projection.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-[#0d1624]"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-black text-slate-900 dark:text-white">
                                {projection.name}
                              </h3>
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${getFinalStatusClasses(
                                  projection.finalStatus
                                )}`}
                              >
                                {getFinalLabel(projection.finalStatus)}
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                              Criada em {formatDate(projection.createdAt)} • Finalizada em{" "}
                              {formatDate(projection.finishedAt)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setOpenFinalizedId((prev) => (prev === projection.id ? null : projection.id))
                            }
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
                          >
                            {isOpen ? "Ocultar detalhes" : "Ver detalhes"}
                          </button>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                              Banca inicial
                            </p>
                            <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                              {formatMoney(projection.initialBankroll)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                              Banca final
                            </p>
                            <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                              {formatMoney(projection.currentBankroll)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                              Greens / Reds
                            </p>
                            <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                              {greens} / {reds}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                              Parou no dia
                            </p>
                            <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                              {stoppedDay || "-"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                              Lucro líquido
                            </p>
                            <p
                              className={`mt-2 text-lg font-black ${
                                projection.profit >= 0
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-rose-700 dark:text-rose-300"
                              }`}
                            >
                              {formatMoney(projection.profit)}
                            </p>
                          </div>
                        </div>

                        {projection.notes && (
                          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-300">
                            <span className="font-bold text-slate-900 dark:text-white">Observação:</span>{" "}
                            {projection.notes}
                          </div>
                        )}

                        {isOpen && (
                          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/[0.08]">
                            <table className="min-w-[950px] w-full text-sm">
                              <thead className="bg-slate-50 text-left dark:bg-white/[0.06]">
                                <tr className="text-slate-700 dark:text-slate-200">
                                  <th className="px-4 py-3 font-bold">DIA</th>
                                  <th className="px-4 py-3 font-bold">STATUS</th>
                                  <th className="px-4 py-3 font-bold">BANCA ANTES</th>
                                  <th className="px-4 py-3 font-bold">ENTRADA</th>
                                  <th className="px-4 py-3 font-bold">ODD</th>
                                  <th className="px-4 py-3 font-bold">RETORNO PREVISTO</th>
                                  <th className="px-4 py-3 font-bold">BANCA APÓS</th>
                                </tr>
                              </thead>

                              <tbody>
                                {projection.entries.map((entry) => (
                                  <tr
                                    key={entry.id}
                                    className="border-t border-slate-200 text-slate-700 dark:border-white/[0.06] dark:text-slate-200"
                                  >
                                    <td className="px-4 py-3 font-semibold">{entry.day}º DIA</td>
                                    <td className="px-4 py-3">
                                      <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClasses(
                                          entry.status
                                        )}`}
                                      >
                                        {getEntryLabel(entry.status)}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">{formatMoney(entry.bankrollBefore)}</td>
                                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                                      {formatMoney(entry.stake)}
                                    </td>
                                    <td className="px-4 py-3">{formatOdd(entry.odd)}</td>
                                    <td className="px-4 py-3">{formatMoney(entry.projectedReturn)}</td>
                                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                                      {entry.actualBankrollAfter !== null
                                        ? formatMoney(entry.actualBankrollAfter)
                                        : "--"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}