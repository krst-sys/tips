"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  Download,
  History,
  Lock,
  Plus,
  Share2,
  Target,
  TrendingUp,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

const STORAGE_KEY = "progressao-execucao-v2";

function round(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function formatMoney(value) {
  const moneyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return moneyFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatDate(value, locale = "pt-BR") {
  if (!value) return "-";
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  });

  return dateFormatter.format(new Date(value));
}

function toNumber(value, fallback = 0) {
  const normalized = String(value).replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatOdd(value) {
  return Number(value).toFixed(2).replace(".", ",");
}

function formatSignedMoney(value) {
  return `${value > 0 ? "+" : ""}${formatMoney(value)}`;
}

function getToneClass(tone) {
  if (tone === "positive") {
    return {
      text: "text-emerald-700 dark:text-emerald-300",
      icon: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
      badge:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",
      row: "bg-emerald-50/70 dark:bg-emerald-400/[0.055]",
    };
  }

  if (tone === "negative") {
    return {
      text: "text-rose-700 dark:text-rose-300",
      icon: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20",
      badge:
        "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300",
      row: "bg-rose-50/70 dark:bg-rose-400/[0.055]",
    };
  }

  if (tone === "warning") {
    return {
      text: "text-amber-800 dark:text-amber-300",
      icon: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
      badge:
        "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300",
      row: "bg-amber-50/70 dark:bg-amber-400/[0.055]",
    };
  }

  return {
    text: "text-slate-700 dark:text-slate-300",
    icon: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/[0.08]",
    badge:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-slate-300",
    row: "bg-slate-50/70 dark:bg-white/[0.025]",
  };
}

function getEntryTone(status) {
  if (status === "green") return "positive";
  if (status === "red") return "negative";
  if (status === "pending") return "warning";
  return "neutral";
}

function getEntryLabel(status, t) {
  return t(`progression.entryStatus.${status}`);
}

function getFinalLabel(status, t) {
  return t(`progression.finalLabel.${status}`);
}

function getShareStatusLabel(status, t) {
  if (status === "completed") return t("progression.shareStatusCompleted");
  if (status === "red") return t("progression.shareStatusRed");
  return t("progression.shareStatusManual");
}

function getProjectionShareStats(projection) {
  const greens = projection.entries.filter((entry) => entry.status === "green").length;
  const reds = projection.entries.filter((entry) => entry.status === "red").length;
  const completedEntries = projection.entries.filter((entry) => entry.status !== "locked").length;
  const evolution =
    projection.initialBankroll > 0
      ? ((projection.currentBankroll - projection.initialBankroll) / projection.initialBankroll) * 100
      : 0;

  return {
    greens,
    reds,
    completedEntries,
    evolution: round(evolution),
    result: round(projection.currentBankroll - projection.initialBankroll),
  };
}

function getShareEntries(projection) {
  return projection.entries.filter((entry) => entry.status !== "locked");
}

function sanitizeFileName(value) {
  return String(value || "progressao")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function createProjectionFromForm(form, t) {
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
    name: form.name?.trim() || t("progression.newProgression"),
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

function validateForm(form, t) {
  if (!form.name.trim()) return t("progression.missingName");
  if (toNumber(form.initialBankroll) <= 0) return t("progression.missingInitialBankroll");
  if (toNumber(form.averageOdd) <= 1) return t("progression.missingAverageOdd");
  if (Math.round(toNumber(form.totalDays)) < 1) return t("progression.missingEntries");
  if (Math.round(toNumber(form.totalDays)) > 60) return t("progression.maxEntries");
  return "";
}

function Panel({ children, className = "", id }) {
  return (
    <section
      id={id}
      className={`rounded-[20px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-[13px] leading-5 text-slate-600 dark:text-slate-300">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function Input({ label, hint, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300">
          {label}
        </span>
        {hint ? <span className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</span> : null}
      </span>
      <input
        {...props}
        className={`h-11 w-full rounded-[14px] border border-slate-200 bg-white px-3.5 text-[14px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/10 ${className}`}
      />
    </label>
  );
}

function Textarea({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>
      <textarea
        {...props}
        className="min-h-[92px] w-full resize-y rounded-[14px] border border-slate-200 bg-white px-3.5 py-3 text-[14px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/10"
      />
    </label>
  );
}

function Badge({ status, children }) {
  const toneClass = getToneClass(status);

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold ${toneClass.badge}`}>
      {children}
    </span>
  );
}

function MetricCard({ label, value, detail, tone = "neutral", icon: Icon }) {
  const toneClass = getToneClass(tone);

  return (
    <article className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_8px_18px_rgba(15,23,42,0.035)] dark:border-white/[0.08] dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 truncate text-[24px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
            {value}
          </p>
          <p className={`mt-2 truncate text-[12px] font-medium ${toneClass.text}`}>
            {detail}
          </p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ring-1 ${toneClass.icon}`}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
    </article>
  );
}

function StatusBadge({ entryStatus }) {
  const { t } = useLanguage();

  return (
    <Badge status={getEntryTone(entryStatus)}>
      {getEntryLabel(entryStatus, t)}
    </Badge>
  );
}

export default function ProgressaoPage() {
  const { locale, t } = useLanguage();
  const [hydrated, setHydrated] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    name: t("progression.progression") + " 1",
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
  const [shareProjection, setShareProjection] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.form) setForm((current) => ({ ...current, ...parsed.form }));
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
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(""), 3600);
    return () => window.clearTimeout(timer);
  }, [feedback]);

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

    return {
      completedDays,
      progressPercent: (completedDays / activeProjection.totalDays) * 100,
      greens,
      reds,
    };
  }, [activeProjection]);

  const summaryCards = useMemo(() => {
    const statusText = activeProjection ? t("progression.summaryStatusInProgress") : t("progression.noActive");
    return [
      {
        label: t("progression.currentBankroll"),
        value: activeProjection ? formatMoney(activeProjection.currentBankroll) : "--",
        detail: activeProjection ? formatSignedMoney(activeProjection.profit) : t("progression.noActiveProgression"),
        tone: activeProjection?.profit < 0 ? "negative" : "positive",
        icon: Wallet,
      },
      {
        label: t("progression.currentDay"),
        value: activeProjection ? `${activeProjection.currentDay} / ${activeProjection.totalDays}` : "--",
        detail: activeProjection ? t("progression.completedCount", { count: progressInfo.completedDays }) : t("progression.awaitingCreation"),
        tone: "neutral",
        icon: Clock3,
      },
      {
        label: t("progression.nextEntry"),
        value: currentEntry ? formatMoney(currentEntry.stake) : "--",
        detail: currentEntry ? t("progression.returnValue", { value: formatMoney(currentEntry.projectedReturn) }) : t("progression.noPendingEntry"),
        tone: "warning",
        icon: TrendingUp,
      },
      {
        label: "Greens / Reds",
        value: activeProjection ? `${progressInfo.greens} / ${progressInfo.reds}` : "--",
        detail: activeProjection ? t("progression.averageOddValue", { value: formatOdd(activeProjection.averageOdd) }) : t("progression.noData"),
        tone: "positive",
        icon: Target,
      },
      {
        label: t("common.status"),
        value: statusText,
        detail: activeProjection ? activeProjection.name : t("progression.createAProgression"),
        tone: activeProjection ? "positive" : "neutral",
        icon: ClipboardList,
      },
    ];
  }, [activeProjection, currentEntry, progressInfo, t]);

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setFormError("");
  }

  function handleCreateProjection(event) {
    event.preventDefault();

    if (activeProjection) {
      setFeedback(t("progression.youMustFinishActive"));
      return;
    }

    const error = validateForm(form, t);
    if (error) {
      setFormError(error);
      return;
    }

    const projection = createProjectionFromForm(form, t);
    setActiveProjection(projection);
    setFeedback(t("progression.progressionCreated"));
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

      setFinalizedProjections((current) => [finalized, ...current]);
      setActiveProjection(null);
      setFeedback(t("progression.progressionFinishedHistory"));
      return;
    }

    setActiveProjection((current) => ({
      ...current,
      entries: updatedEntries,
      currentBankroll: nextBankroll,
      currentDay: currentEntry.day + 1,
      profit: round(nextBankroll - current.initialBankroll),
    }));
    setFeedback(t("progression.greenRegistered"));
  }

  function handleMarkRed() {
    if (!activeProjection || !currentEntry) return;
    if (!window.confirm(t("progression.redConfirm"))) {
      return;
    }

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

    setFinalizedProjections((current) => [finalized, ...current]);
    setActiveProjection(null);
    setFeedback(t("progression.redFinished"));
  }

  function handleManualFinish() {
    if (!activeProjection) return;

    const finalized = finalizeProjection(activeProjection, "manual", activeProjection.currentBankroll);
    setFinalizedProjections((current) => [finalized, ...current]);
    setActiveProjection(null);
    setFeedback(t("progression.manualFinished"));
  }

  function handleClearHistory() {
    setFinalizedProjections([]);
    setOpenFinalizedId(null);
    setShareProjection(null);
    setFeedback(t("progression.historyCleaned"));
  }

  function handleDownloadShareImage(projection) {
    const dataUrl = renderProgressionShareImage(projection, t, locale);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${sanitizeFileName(projection.name)}-filtto.png`;
    link.click();
    setFeedback(t("progression.imageGenerated"));
  }

  return (
    <main className="min-h-full bg-[#f5f7f9] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-6 px-5 py-6 md:px-8">
        <header className="flex flex-col gap-4 rounded-[20px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                {t("progression.title")}
              </h1>
              <Badge status={activeProjection ? "positive" : "neutral"}>
                {activeProjection ? t("progression.progressionInProgress") : t("progression.noActiveProgression")}
              </Badge>
            </div>
            <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-slate-600 dark:text-slate-300">
              {t("progression.progressionDescription")}
            </p>
          </div>

          <a
            href="#historico-progressao"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-white px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07] sm:w-auto"
          >
            <History className="h-4 w-4" />
            {t("progression.history")}
          </a>
        </header>

        {feedback ? (
          <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] font-medium text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
            {feedback}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </section>

        <section
          className={`grid items-start gap-6 ${
            activeProjection ? "" : "xl:grid-cols-[380px_minmax(0,1fr)]"
          }`}
        >
          {!activeProjection ? (
            <Panel className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <SectionTitle
                    eyebrow={t("progression.configuration")}
                    title={t("progression.newProgression")}
                    description={t("progression.oneActiveAtATime")}
                  />
                </div>

                <form onSubmit={handleCreateProjection} className="mt-5 grid gap-4">
                  <Input
                    label={t("progression.progressionName")}
                    type="text"
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                  />

                  <Textarea
                    label={t("progression.note")}
                    value={form.notes}
                    onChange={(event) => updateForm("notes", event.target.value)}
                    placeholder={t("common.optional")}
                  />

                  <Input
                    label={t("progression.initialBankroll")}
                    hint="R$"
                    type="number"
                    step="0.01"
                    value={form.initialBankroll}
                    onChange={(event) => updateForm("initialBankroll", event.target.value)}
                  />

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    <Input
                      label={t("progression.averageOdd")}
                      type="number"
                      step="0.01"
                      value={form.averageOdd}
                      onChange={(event) => updateForm("averageOdd", event.target.value)}
                    />
                    <Input
                      label={t("progression.numberOfEntries")}
                      type="number"
                      step="1"
                      value={form.totalDays}
                      onChange={(event) => updateForm("totalDays", event.target.value)}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-[12px] font-medium text-slate-600 dark:text-slate-300">
                      {t("progression.stakeMode")}
                    </p>
                    <div className="grid grid-cols-2 rounded-[14px] border border-slate-200 bg-slate-100 p-1 dark:border-white/[0.08] dark:bg-white/[0.04]">
                      {[
                        ["fixed", t("progression.fixed")],
                        ["percent", t("progression.variable")],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateForm("stakeMode", value)}
                          className={`h-9 rounded-[11px] text-[13px] font-semibold transition ${
                            form.stakeMode === value
                              ? "bg-white text-slate-950 shadow-sm dark:bg-white dark:text-slate-950"
                              : "text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.07] dark:hover:text-white"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.stakeMode === "fixed" ? (
                    <Input
                      label={t("progression.fixedStakeValue")}
                      hint="R$"
                      type="number"
                      step="0.01"
                      value={form.fixedStake}
                      onChange={(event) => updateForm("fixedStake", event.target.value)}
                    />
                  ) : (
                    <Input
                      label={t("progression.percentStakeValue")}
                      hint="%"
                      type="number"
                      step="0.01"
                      value={form.percentStake}
                      onChange={(event) => updateForm("percentStake", event.target.value)}
                    />
                  )}

                  {formError ? (
                    <div className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
                      {formError}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-emerald-600 px-4 text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(5,150,105,0.18)] transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                  >
                    <Plus className="h-4 w-4" />
                    {t("progression.createProgression")}
                  </button>
                </form>
            </Panel>
          ) : null}

          <div className="grid min-w-0 gap-6">
            <Panel className="overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-white/[0.06] lg:flex-row lg:items-start lg:justify-between">
                <SectionTitle
                  eyebrow={t("progression.execution")}
                  title={t("progression.progressionInProgress")}
                  description={t("progression.markCurrent")}
                />

                {activeProjection ? (
                  <button
                    type="button"
                    onClick={handleManualFinish}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-white px-3.5 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07]"
                  >
                    <Archive className="h-4 w-4" />
                    {t("progression.manualFinish")}
                  </button>
                ) : null}
              </div>

              {!activeProjection ? (
                <div className="p-6">
                  <div className="rounded-[16px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center dark:border-white/[0.12] dark:bg-white/[0.035]">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[14px] bg-white text-slate-500 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-white/[0.08]">
                      <Lock className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-[14px] font-semibold text-slate-950 dark:text-white">
                      {t("progression.noneActive")}
                    </p>
                    <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                      {t("progression.createActiveFirst")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.035]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-[15px] font-semibold text-slate-950 dark:text-white">
                            {activeProjection.name}
                          </h3>
                          <Badge status="positive">{t("progression.active")}</Badge>
                        </div>
                        <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                          {t("progression.createdAt", { date: formatDate(activeProjection.createdAt, locale) })}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge status="neutral">
                          {activeProjection.stakeMode === "fixed"
                            ? t("progression.activeStakeFixed", { value: formatMoney(activeProjection.fixedStake) })
                            : t("progression.activeStakeVariable", { value: formatOdd(activeProjection.percentStake) })}
                        </Badge>
                        <Badge status="neutral">
                          {t("progression.initialBankrollWithValue", { value: formatMoney(activeProjection.initialBankroll) })}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-[12px] font-medium text-slate-500 dark:text-slate-400">
                        <span>{t("progression.progress")}</span>
                        <span>{round(progressInfo.progressPercent)}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all dark:bg-emerald-400"
                          style={{ width: `${progressInfo.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {currentEntry ? (
                    <div className="mt-4 rounded-[18px] border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-400/20 dark:bg-emerald-400/10">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                            {t("progression.currentEntry")}
                          </p>
                          <h3 className="mt-1 text-[24px] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                            {t("progression.entryOfTotal", { day: currentEntry.day, total: activeProjection.totalDays })}
                          </h3>
                          <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-300">
                            {t("progression.betInstruction", { stake: formatMoney(currentEntry.stake), odd: formatOdd(currentEntry.odd) })}
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[520px] xl:grid-cols-4">
                          <SmallValue label={t("progression.bankrollBefore")} value={formatMoney(currentEntry.bankrollBefore)} />
                          <SmallValue label={t("progression.entry")} value={formatMoney(currentEntry.stake)} />
                          <SmallValue label={t("progression.return")} value={formatMoney(currentEntry.projectedReturn)} tone="positive" />
                          <SmallValue label={t("progression.afterGreen")} value={formatMoney(currentEntry.bankrollIfGreen)} tone="positive" />
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:max-w-[440px] sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={handleMarkGreen}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-emerald-600 px-4 text-[13px] font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {t("progression.markGreen")}
                        </button>
                        <button
                          type="button"
                          onClick={handleMarkRed}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-rose-600 px-4 text-[13px] font-semibold text-white transition hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400"
                        >
                          <XCircle className="h-4 w-4" />
                          {t("progression.markRed")}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <ProgressionTable
                    entries={activeProjection.entries}
                    onGreen={handleMarkGreen}
                    onRed={handleMarkRed}
                  />

                  {activeProjection.notes ? (
                    <div className="mt-4 rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">{t("progression.note")}:</span>{" "}
                      {activeProjection.notes}
                    </div>
                  ) : null}
                </div>
              )}
            </Panel>

            <HistorySection
              projections={finalizedProjections}
              openFinalizedId={openFinalizedId}
              onToggle={(id) => setOpenFinalizedId((current) => (current === id ? null : id))}
              onClear={handleClearHistory}
              onShare={setShareProjection}
            />
          </div>
        </section>
      </div>

      {shareProjection ? (
        <ShareProgressionModal
          projection={shareProjection}
          onClose={() => setShareProjection(null)}
          onDownload={() => handleDownloadShareImage(shareProjection)}
        />
      ) : null}
    </main>
  );
}

function SmallValue({ label, value, tone = "neutral" }) {
  const toneClass = getToneClass(tone);

  return (
    <div className="min-w-0 rounded-[14px] border border-slate-200 bg-white px-3.5 py-3 dark:border-white/[0.08] dark:bg-slate-950/40">
      <p className="text-[12px] text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 truncate text-[14px] font-semibold text-slate-950 dark:text-white ${toneClass.text}`}>
        {value}
      </p>
    </div>
  );
}

function ProgressionTable({ entries, onGreen, onRed }) {
  const { locale, t } = useLanguage();

  return (
    <>
      <div className="mt-5 grid gap-3 lg:hidden">
        {entries.map((entry) => {
          const isCurrent = entry.status === "pending";
          const isLocked = entry.status === "locked";
          const rowTone = getToneClass(getEntryTone(entry.status));

          return (
            <article
              key={entry.id}
              className={`rounded-[16px] border p-4 ${
                isCurrent
                  ? "border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10"
                  : isLocked
                  ? "border-slate-200 bg-slate-50/70 opacity-75 dark:border-white/[0.08] dark:bg-white/[0.025]"
                  : "border-slate-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.035]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400">
                    {t("progression.dayEntry", { day: entry.day })}
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-slate-950 dark:text-white">
                    {formatMoney(entry.stake)}
                  </p>
                </div>
                <StatusBadge entryStatus={entry.status} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-[12px]">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">{t("progression.odd")}</p>
                  <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                    {formatOdd(entry.odd)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">{t("progression.return")}</p>
                  <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                    {formatMoney(entry.projectedReturn)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">{t("progression.after")}</p>
                  <p className={`mt-1 font-semibold ${isLocked ? "text-slate-400 dark:text-slate-500" : rowTone.text}`}>
                    {entry.actualBankrollAfter !== null
                      ? formatMoney(entry.actualBankrollAfter)
                      : isLocked
                      ? "--"
                      : formatMoney(entry.bankrollIfGreen)}
                  </p>
                </div>
              </div>

              {isCurrent ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onGreen}
                    className="inline-flex h-9 items-center gap-1.5 rounded-[11px] bg-emerald-50 px-3 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20 dark:hover:bg-emerald-400/15"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("progression.entryStatus.green")}
                  </button>
                  <button
                    type="button"
                    onClick={onRed}
                    className="inline-flex h-9 items-center gap-1.5 rounded-[11px] bg-rose-50 px-3 text-[12px] font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20 dark:hover:bg-rose-400/15"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {t("progression.entryStatus.red")}
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="mt-5 hidden overflow-hidden rounded-[16px] border border-slate-200 dark:border-white/[0.08] lg:block">
        <table className="w-full min-w-[1080px] text-sm">
          <thead className="bg-slate-50 dark:bg-white/[0.035]">
            <tr className="text-left">
              {[
                t("progression.entry"),
                t("common.status"),
                t("progression.bankrollBefore"),
                t("progression.entry"),
                t("progression.odd"),
                t("progression.projectedReturn"),
                t("progression.bankrollAfter"),
                t("progression.tableAction"),
              ].map(
                (heading, index) => (
                  <th
                    key={`${heading}-${index}`}
                    className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 ${
                      index >= 2 && index <= 6 ? "text-right" : ""
                    }`}
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {entries.map((entry) => {
            const isCurrent = entry.status === "pending";
            const isLocked = entry.status === "locked";
            const rowTone = getToneClass(getEntryTone(entry.status));

            return (
              <tr
                key={entry.id}
                className={`transition-colors ${
                  isCurrent
                    ? rowTone.row
                    : isLocked
                    ? "bg-slate-50/60 text-slate-400 dark:bg-transparent dark:text-slate-500"
                    : "bg-white text-slate-700 hover:bg-slate-50/80 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/[0.025]"
                }`}
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium">{t("progression.dayEntry", { day: entry.day })}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge entryStatus={entry.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                  {formatMoney(entry.bankrollBefore)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-slate-950 dark:text-white">
                  {formatMoney(entry.stake)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                  {formatOdd(entry.odd)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                  {formatMoney(entry.projectedReturn)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-slate-950 dark:text-white">
                  {entry.actualBankrollAfter !== null
                    ? formatMoney(entry.actualBankrollAfter)
                    : entry.status === "locked"
                    ? "--"
                    : formatMoney(entry.bankrollIfGreen)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {entry.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={onGreen}
                        className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-emerald-50 px-2.5 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20 dark:hover:bg-emerald-400/15"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t("progression.entryStatus.green")}
                      </button>
                      <button
                        type="button"
                        onClick={onRed}
                        className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-rose-50 px-2.5 text-[12px] font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20 dark:hover:bg-rose-400/15"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {t("progression.entryStatus.red")}
                      </button>
                    </div>
                  ) : entry.status === "green" || entry.status === "red" ? (
                    <span className="text-[12px] text-slate-500 dark:text-slate-400">
                      {formatDate(entry.checkedAt, locale)}
                    </span>
                  ) : (
                    <span className="text-[12px] text-slate-400 dark:text-slate-500">
                      {t("progression.awaitingPrevious")}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function HistorySection({ projections, openFinalizedId, onToggle, onClear, onShare }) {
  const { locale, t } = useLanguage();

  return (
    <Panel id="historico-progressao" className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-white/[0.06] lg:flex-row lg:items-center lg:justify-between">
        <SectionTitle
          eyebrow={t("progression.history")}
          title={t("progression.finalizedRecent")}
          description={t("progression.progressionsEndedDescription")}
        />

        {projections.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-10 items-center justify-center rounded-[12px] bg-white px-3.5 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07]"
          >
            {t("progression.clearHistory")}
          </button>
        ) : null}
      </div>

      {projections.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-[14px] font-semibold text-slate-950 dark:text-white">
            {t("progression.noFinalized")}
          </p>
          <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
            {t("progression.whenSequenceEnds")}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {projections.map((projection) => {
            const greens = projection.entries.filter((entry) => entry.status === "green").length;
            const reds = projection.entries.filter((entry) => entry.status === "red").length;
            const stoppedDay = projection.entries.find((entry) => entry.status === "red")?.day || greens || 0;
            const isOpen = openFinalizedId === projection.id;
            const finalTone =
              projection.finalStatus === "red"
                ? "negative"
                : projection.finalStatus === "completed"
                ? "positive"
                : "neutral";
            const resultTone = getToneClass(projection.profit >= 0 ? "positive" : "negative");

            return (
              <article key={projection.id} className="p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-[15px] font-semibold text-slate-950 dark:text-white">
                        {projection.name}
                      </h3>
                      <Badge status={finalTone}>{getFinalLabel(projection.finalStatus, t)}</Badge>
                    </div>
                    <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                      {t("progression.createdFinishedAt", {
                        created: formatDate(projection.createdAt, locale),
                        finished: formatDate(projection.finishedAt, locale),
                      })}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onShare(projection)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-[12px] bg-emerald-600 px-3.5 text-[13px] font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                    >
                      <Share2 className="h-4 w-4" />
                      {t("progression.share")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggle(projection.id)}
                      className="inline-flex h-9 items-center justify-center rounded-[12px] bg-white px-3.5 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07]"
                    >
                      {isOpen ? t("progression.hideDetails") : t("progression.viewDetails")}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                  {[
                    [t("progression.initialBankroll"), formatMoney(projection.initialBankroll), ""],
                    [t("progression.finalBankroll"), formatMoney(projection.currentBankroll), ""],
                    [t("progression.result"), formatSignedMoney(projection.profit), resultTone.text],
                    ["Greens / Reds", `${greens} / ${reds}`, ""],
                    [t("progression.stoppedAtEntry"), stoppedDay || "-", ""],
                    [t("progression.finalStatus"), getFinalLabel(projection.finalStatus, t), ""],
                  ].map(([label, value, className]) => (
                    <div
                      key={label}
                      className="rounded-[14px] border border-slate-200 bg-slate-50 px-3.5 py-3 dark:border-white/[0.08] dark:bg-white/[0.035]"
                    >
                      <p className="text-[12px] text-slate-500 dark:text-slate-400">{label}</p>
                      <p className={`mt-1 truncate text-[14px] font-semibold text-slate-950 dark:text-white ${className}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {projection.notes ? (
                  <div className="mt-4 rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">{t("progression.note")}:</span>{" "}
                    {projection.notes}
                  </div>
                ) : null}

                {isOpen ? (
                  <div className="mt-4 overflow-x-auto rounded-[16px] border border-slate-200 dark:border-white/[0.08]">
                    <table className="w-full min-w-[900px] text-sm">
                      <thead className="bg-slate-50 text-left dark:bg-white/[0.035]">
                        <tr>
                          {[
                            t("progression.entry"),
                            t("common.status"),
                            t("progression.bankrollBefore"),
                            t("progression.entry"),
                            t("progression.odd"),
                            t("progression.projectedReturn"),
                            t("progression.bankrollAfter"),
                          ].map(
                            (heading, index) => (
                              <th
                                key={`${heading}-${index}`}
                                className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 ${
                                  index >= 2 ? "text-right" : ""
                                }`}
                              >
                                {heading}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                        {projection.entries.map((entry) => (
                          <tr key={entry.id} className="text-slate-700 dark:text-slate-200">
                            <td className="whitespace-nowrap px-4 py-3 font-medium">
                              {t("progression.dayEntry", { day: entry.day })}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <StatusBadge entryStatus={entry.status} />
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                              {formatMoney(entry.bankrollBefore)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-slate-950 dark:text-white">
                              {formatMoney(entry.stake)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                              {formatOdd(entry.odd)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                              {formatMoney(entry.projectedReturn)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-slate-950 dark:text-white">
                              {entry.actualBankrollAfter !== null
                                ? formatMoney(entry.actualBankrollAfter)
                                : "--"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

function ShareProgressionModal({ projection, onClose, onDownload }) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label={t("common.close")}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm dark:bg-black/65"
      />

      <section className="relative z-10 max-h-[92vh] w-full max-w-[760px] overflow-y-auto rounded-[22px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)] dark:border-white/[0.1] dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 dark:border-white/[0.06] sm:flex-row sm:items-start sm:justify-between">
          <SectionTitle
            eyebrow={t("progression.share")}
            title={t("progression.shareImage")}
            description={t("progression.shareDescription")}
          />

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:ring-white/[0.08] dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_190px] lg:items-start">
          <div className="overflow-hidden rounded-[20px] bg-slate-100 p-3 dark:bg-slate-950">
            <ShareProgressionCard projection={projection} />
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-emerald-600 px-4 text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(5,150,105,0.18)] transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
            >
              <Download className="h-4 w-4" />
              {t("common.downloadPng")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-[14px] bg-white px-4 text-[13px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-white/[0.04] dark:text-slate-300 dark:ring-white/[0.08] dark:hover:bg-white/[0.07]"
            >
              {t("common.close")}
            </button>
            <p className="text-[12px] leading-5 text-slate-500 dark:text-slate-400">
              {t("progression.shareExportHint")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ShareProgressionCard({ projection }) {
  const { locale, t } = useLanguage();
  const stats = getProjectionShareStats(projection);
  const resultTone = stats.result >= 0 ? "text-[#a3ff12]" : "text-rose-300";
  const shareEntries = getShareEntries(projection);
  const rowClass =
    shareEntries.length > 20
      ? "px-3 py-2 text-[10px]"
      : shareEntries.length > 10
        ? "px-3 py-2.5 text-[10.5px]"
        : "px-3 py-3 text-[11px]";

  return (
    <article className="relative mx-auto w-full max-w-[620px] overflow-hidden rounded-[24px] border border-white/10 bg-[#050d17] p-6 text-white shadow-[0_28px_70px_rgba(0,0,0,0.28)] sm:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(163,255,18,0.08),transparent_28%),radial-gradient(circle_at_16%_92%,rgba(14,165,233,0.10),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-x-8 top-72 text-center text-[74px] font-black tracking-[-0.08em] text-white/[0.022]">FILTTO</div>

      <div className="relative z-[1] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative h-8 w-7 shrink-0 text-[#a3ff12]">
            <span className="absolute left-0 top-0 h-2.5 w-7 skew-x-[-24deg] rounded-[2px] bg-current" />
            <span className="absolute left-0 top-3 h-2.5 w-5 skew-x-[-24deg] rounded-[2px] bg-current" />
            <span className="absolute left-0 top-6 h-2.5 w-3 skew-x-[-24deg] rounded-[2px] bg-current" />
          </span>
          <p className="text-[28px] font-black leading-none tracking-[-0.05em]">Filtto</p>
        </div>
        <span className="rounded-[14px] border border-[#a3ff12]/25 bg-[#a3ff12]/8 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-slate-100">
          {getShareStatusLabel(projection.finalStatus, t)}
        </span>
      </div>

      <div className="relative z-[1] mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4 text-[12px] text-slate-400">
        <span className="font-medium text-slate-300">{projection.name}</span>
        <span>•</span>
        <span>{formatDate(projection.createdAt, locale)} {t("progression.until")} {formatDate(projection.finishedAt, locale)}</span>
      </div>

      <div className="relative z-[1] mt-5 overflow-hidden rounded-[22px] border border-[#a3ff12]/35 bg-[#071727] p-6">
        <div className="absolute bottom-7 right-6 h-28 w-44 opacity-70">
          <div className="absolute bottom-0 left-0 h-[1px] w-full bg-[#a3ff12]/10" />
          <div className="absolute bottom-0 left-4 h-6 w-7 rounded-t bg-[#a3ff12]/10" />
          <div className="absolute bottom-0 left-12 h-10 w-7 rounded-t bg-[#a3ff12]/16" />
          <div className="absolute bottom-0 left-20 h-14 w-7 rounded-t bg-[#a3ff12]/22" />
          <div className="absolute bottom-0 left-28 h-24 w-7 rounded-t bg-[#a3ff12]/34" />
          <div className="absolute right-0 top-1 h-4 w-4 rounded-full bg-[#a3ff12] shadow-[0_0_28px_rgba(163,255,18,0.85)]" />
        </div>
        <p className="text-[14px] font-black uppercase tracking-[0.08em] text-white">{t("progression.finalResult")}</p>
        <p className={"mt-4 text-[52px] font-black leading-none tracking-[-0.07em] " + resultTone}>{formatSignedMoney(stats.result)}</p>
        <p className="mt-4 text-[16px] font-medium text-slate-400">
          {t("progression.progress")} <span className="text-slate-200">{stats.evolution > 0 ? "+" : ""}{stats.evolution.toFixed(1).replace(".", ",")}%</span>
        </p>
      </div>

      <div className="relative z-[1] mt-5 grid grid-cols-5 overflow-hidden rounded-[20px] border border-white/12 bg-[#071727]/88">
        <ShareMetric label={t("progression.initialBankroll")} value={formatMoney(projection.initialBankroll)} />
        <ShareMetric label={t("progression.finalBankroll")} value={formatMoney(projection.currentBankroll)} strong />
        <ShareMetric label={t("progression.averageOdd")} value={formatOdd(projection.averageOdd)} />
        <ShareMetric label={t("progression.entries")} value={String(stats.completedEntries)} />
        <ShareMetric label="Greens" value={String(stats.greens)} />
      </div>

      <div className="relative z-[1] mt-7 flex items-center gap-3 text-[#a3ff12]">
        <span className="text-[18px] font-black">≡</span>
        <p className="text-[15px] font-black uppercase tracking-[0.05em]">{t("progression.entries")}</p>
      </div>

      <div className="relative z-[1] mt-4 overflow-hidden rounded-[18px] border border-white/10 bg-[#071727]/82">
        <div className="grid grid-cols-[0.48fr_0.86fr_1.1fr_1fr_0.6fr_1.05fr_1.1fr] gap-2 border-b border-white/10 px-3 py-3 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
          <span>#</span><span>{t("common.status")}</span><span className="text-right">{t("progression.bankrollBefore")}</span><span className="text-right">{t("progression.entry")}</span><span className="text-right">{t("progression.odd")}</span><span className="text-right">{t("progression.return")}</span><span className="text-right">{t("progression.bankrollAfter")}</span>
        </div>
        <div className="divide-y divide-white/[0.08]">
          {shareEntries.map((entry, index) => {
            const isLast = index === shareEntries.length - 1;
            const afterValue = entry.actualBankrollAfter !== null ? entry.actualBankrollAfter : entry.bankrollIfGreen;
            const statusClass =
              entry.status === "green"
                ? "inline-flex items-center rounded-full bg-[#a3ff12]/12 px-2.5 py-1 font-bold text-[#a3ff12]"
                : entry.status === "red"
                  ? "inline-flex items-center rounded-full bg-rose-400/12 px-2.5 py-1 font-bold text-rose-300"
                  : "inline-flex items-center rounded-full bg-amber-400/12 px-2.5 py-1 font-bold text-amber-200";

            return (
              <div key={entry.id} className={"grid grid-cols-[0.48fr_0.86fr_1.1fr_1fr_0.6fr_1.05fr_1.1fr] items-center gap-2 " + rowClass}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] font-bold text-slate-100">{entry.day}</span>
                <span><span className={statusClass}>{getEntryLabel(entry.status, t)}</span></span>
                <span className="text-right text-slate-100">{formatMoney(entry.bankrollBefore)}</span>
                <span className="text-right text-slate-100">{formatMoney(entry.stake)}</span>
                <span className="text-right text-slate-100">{formatOdd(entry.odd)}</span>
                <span className="text-right text-slate-100">{formatMoney(entry.projectedReturn)}</span>
                <span className={"text-right font-bold " + (isLast ? "text-[#a3ff12]" : "text-slate-100")}>{formatMoney(afterValue)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-[1] mt-7 flex items-center justify-center gap-4 border-t border-[#a3ff12]/20 pt-5">
        <span className="relative h-6 w-5 shrink-0 text-[#a3ff12]">
          <span className="absolute left-0 top-0 h-2 w-5 skew-x-[-24deg] rounded-[2px] bg-current" />
          <span className="absolute left-0 top-2.5 h-2 w-4 skew-x-[-24deg] rounded-[2px] bg-current" />
          <span className="absolute left-0 top-5 h-2 w-2.5 skew-x-[-24deg] rounded-[2px] bg-current" />
        </span>
        <p className="text-[20px] font-black leading-none tracking-[-0.04em]">Filtto</p>
      </div>
    </article>
  );
}

function ShareMetric({ label, value, strong = false }) {
  return (
    <div className="min-w-0 border-r border-white/10 px-3 py-4 text-center last:border-r-0">
      <p className="text-[10px] uppercase tracking-[0.04em] text-slate-400">{label}</p>
      <p className={`mt-2 truncate text-[14px] font-black ${strong ? "text-[#a3ff12]" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function renderProgressionShareImage(projection, t, locale) {
  const stats = getProjectionShareStats(projection);
  const shareEntries = getShareEntries(projection);
  const scale = 2;
  const width = 1080;
  const rowH = getShareRowHeight(shareEntries.length);
  const height = getShareImageHeight(shareEntries.length, rowH);
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");

  ctx.scale(scale, scale);
  drawShareImage(ctx, projection, stats, shareEntries, width, height, rowH, t, locale);

  return canvas.toDataURL("image/png", 1);
}

function getShareRowHeight(count) {
  if (count > 20) return 54;
  if (count > 10) return 62;
  return 72;
}

function getShareImageHeight(count, rowH) {
  return 1040 + 58 + count * rowH + 170;
}

function drawShareImage(ctx, projection, stats, shareEntries, width, height, rowH, t, locale) {
  const cardX = 34;
  const cardY = 34;
  const cardW = width - 68;
  const cardH = height - 68;
  const lime = "#a3ff12";

  ctx.fillStyle = "#040b13";
  ctx.fillRect(0, 0, width, height);
  drawCircleBlur(ctx, 840, 210, 320, "rgba(163,255,18,0.10)");
  drawCircleBlur(ctx, 180, height - 220, 280, "rgba(14,165,233,0.10)");

  roundRect(ctx, cardX, cardY, cardW, cardH, 30);
  ctx.fillStyle = "#07111d";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 2;
  ctx.stroke();

  drawShareLogo(ctx, 78, 72, 64);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 39px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Filtto", 162, 118);

  drawCompletedBadge(ctx, width - 362, 78, 292, 64, getShareStatusLabel(projection.finalStatus, t));

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.moveTo(70, 164);
  ctx.lineTo(width - 70, 164);
  ctx.stroke();

  ctx.fillStyle = "#a6adba";
  ctx.font = "400 24px Arial";
  ctx.fillText(projection.name, 106, 218);
  ctx.fillText("•", 276, 218);
  ctx.fillText(formatDate(projection.createdAt, locale) + " " + t("progression.until") + " " + formatDate(projection.finishedAt, locale), 326, 218);

  const resultX = 70;
  const resultY = 262;
  const resultW = width - 140;
  const resultH = 330;
  roundRect(ctx, resultX, resultY, resultW, resultH, 26);
  ctx.fillStyle = "#071928";
  ctx.fill();
  ctx.strokeStyle = "rgba(163,255,18,0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 28px Arial";
  ctx.fillText(t("progression.finalResult").toUpperCase(), resultX + 48, resultY + 74);
  ctx.fillStyle = stats.result >= 0 ? lime : "#fda4af";
  ctx.font = "900 86px Arial";
  ctx.fillText(formatSignedMoney(stats.result), resultX + 48, resultY + 194);

  ctx.fillStyle = "#a6adba";
  ctx.font = "400 28px Arial";
  ctx.fillText(t("progression.progress").toUpperCase() + " " + (stats.evolution > 0 ? "+" : "") + stats.evolution.toFixed(1).replace(".", ",") + "%", resultX + 48, resultY + 270);
  drawGrowthChart(ctx, resultX + 600, resultY + 72, 270, 194, lime);

  const metricY = 632;
  const metricH = 156;
  roundRect(ctx, 70, metricY, width - 140, metricH, 24);
  ctx.fillStyle = "rgba(7,25,40,0.92)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const metrics = [
    [t("progression.initialBankroll").toUpperCase(), formatMoney(projection.initialBankroll), false],
    [t("progression.finalBankroll").toUpperCase(), formatMoney(projection.currentBankroll), true],
    [t("progression.averageOdd").toUpperCase(), formatOdd(projection.averageOdd), false],
    [t("progression.entries").toUpperCase(), String(stats.completedEntries), false],
    ["GREENS", String(stats.greens), false],
  ];
  const metricW = (width - 140) / metrics.length;
  metrics.forEach(([label, value, highlight], index) => {
    const x = 70 + metricW * index;
    if (index > 0) {
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath();
      ctx.moveTo(x, metricY + 32);
      ctx.lineTo(x, metricY + metricH - 32);
      ctx.stroke();
    }
    drawShareMetricCanvas(ctx, x, metricY + 28, metricW, 100, label, value, highlight);
  });

  ctx.fillStyle = lime;
  ctx.font = "900 26px Arial";
  ctx.fillText(t("progression.entries").toUpperCase(), 104, 870);

  const tableX = 70;
  const tableY = 902;
  const tableW = width - 140;
  const headerH = 58;
  const tableH = headerH + shareEntries.length * rowH;
  roundRect(ctx, tableX, tableY, tableW, tableH, 22);
  ctx.fillStyle = "rgba(7,25,40,0.84)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.beginPath();
  ctx.moveTo(tableX + 16, tableY + headerH);
  ctx.lineTo(tableX + tableW - 16, tableY + headerH);
  ctx.stroke();

  const col = {
    n: tableX + 46,
    status: tableX + 116,
    before: tableX + 360,
    stake: tableX + 520,
    odd: tableX + 610,
    returns: tableX + 770,
    after: tableX + 918,
  };
  ctx.fillStyle = "#d7dde8";
  ctx.font = "900 17px Arial";
  ctx.textAlign = "left";
  ctx.fillText("#", col.n - 8, tableY + 38);
  ctx.fillText(t("common.status").toUpperCase(), col.status, tableY + 38);
  ctx.textAlign = "right";
  ctx.fillText(t("progression.bankrollBefore").toUpperCase(), col.before, tableY + 38);
  ctx.fillText(t("progression.entry").toUpperCase(), col.stake, tableY + 38);
  ctx.fillText(t("progression.odd").toUpperCase(), col.odd, tableY + 38);
  ctx.fillText(t("progression.return").toUpperCase(), col.returns, tableY + 38);
  ctx.fillText(t("progression.bankrollAfter").toUpperCase(), col.after, tableY + 38);
  ctx.textAlign = "left";

  const rowFont = rowH <= 54 ? 19 : rowH <= 62 ? 21 : 23;
  const pillScale = rowH <= 54 ? 0.86 : rowH <= 62 ? 0.94 : 1;
  shareEntries.forEach((entry, index) => {
    const y = tableY + headerH + index * rowH;
    const centerY = y + rowH / 2;
    const afterValue = entry.actualBankrollAfter !== null ? entry.actualBankrollAfter : entry.bankrollIfGreen;
    const isLast = index === shareEntries.length - 1;

    if (index > 0) {
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.beginPath();
      ctx.moveTo(tableX + 16, y);
      ctx.lineTo(tableX + tableW - 16, y);
      ctx.stroke();
    }

    drawNumberBadge(ctx, col.n, centerY, entry.day, rowH <= 54 ? 22 : 25);
    drawCanvasStatusPill(ctx, entry.status, col.status, centerY - 17 * pillScale, pillScale, t);

    ctx.textAlign = "right";
    ctx.fillStyle = "#f8fafc";
    ctx.font = "400 " + rowFont + "px Arial";
    ctx.fillText(formatMoney(entry.bankrollBefore), col.before, centerY + rowFont / 3);
    ctx.fillText(formatMoney(entry.stake), col.stake, centerY + rowFont / 3);
    ctx.fillText(formatOdd(entry.odd), col.odd, centerY + rowFont / 3);
    ctx.fillText(formatMoney(entry.projectedReturn), col.returns, centerY + rowFont / 3);
    ctx.font = "900 " + rowFont + "px Arial";
    ctx.fillStyle = isLast ? lime : "#f8fafc";
    ctx.fillText(formatMoney(afterValue), col.after, centerY + rowFont / 3);
    ctx.textAlign = "left";
  });

  const footerY = height - 92;
  ctx.strokeStyle = "rgba(163,255,18,0.32)";
  ctx.beginPath();
  ctx.moveTo(84, footerY - 8);
  ctx.lineTo(390, footerY - 8);
  ctx.moveTo(690, footerY - 8);
  ctx.lineTo(width - 84, footerY - 8);
  ctx.stroke();
  drawShareLogo(ctx, 434, footerY - 38, 56);
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 28px Arial";
  ctx.fillText("Filtto", 506, footerY);
}

function drawShareMetricCanvas(ctx, x, y, w, h, label, value, highlight = false) {
  ctx.textAlign = "center";
  ctx.fillStyle = "#94a3b8";
  ctx.font = "400 20px Arial";
  ctx.fillText(label, x + w / 2, y + 48);
  ctx.fillStyle = highlight ? "#a3ff12" : "#ffffff";
  ctx.font = "900 28px Arial";
  ctx.fillText(value, x + w / 2, y + 92);
  ctx.textAlign = "left";
}

function drawCanvasStatusPill(ctx, status, x, y, scale = 1, t) {
  const styles = {
    green: { label: t("progression.entryStatus.green"), bg: "rgba(163,255,18,0.14)", stroke: "rgba(163,255,18,0.24)", fg: "#a3ff12" },
    red: { label: t("progression.entryStatus.red"), bg: "rgba(244,63,94,0.14)", stroke: "rgba(253,164,175,0.28)", fg: "#fda4af" },
    pending: { label: t("progression.entryStatus.pending"), bg: "rgba(245,158,11,0.14)", stroke: "rgba(252,211,77,0.28)", fg: "#fde68a" },
  };
  const style = styles[status] || styles.pending;
  const w = 112 * scale;
  const h = 34 * scale;

  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = style.bg;
  ctx.fill();
  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = style.fg;
  ctx.font = "800 " + 17 * scale + "px Arial";
  ctx.textAlign = "center";
  ctx.fillText(style.label, x + w / 2, y + 23 * scale);
  ctx.textAlign = "left";
}

function drawShareLogo(ctx, x, y, size) {
  const barH = size * 0.18;
  const gap = size * 0.13;
  const slant = size * 0.13;
  const widths = [size * 0.82, size * 0.58, size * 0.36];

  ctx.fillStyle = "#a3ff12";
  widths.forEach((barW, index) => {
    const top = y + index * (barH + gap);
    ctx.beginPath();
    ctx.moveTo(x + slant, top);
    ctx.lineTo(x + slant + barW, top);
    ctx.lineTo(x + barW, top + barH);
    ctx.lineTo(x, top + barH);
    ctx.closePath();
    ctx.fill();
  });
  ctx.textAlign = "left";
}

function drawCompletedBadge(ctx, x, y, w, h, label) {
  roundRect(ctx, x, y, w, h, 16);
  ctx.fillStyle = "rgba(163,255,18,0.06)";
  ctx.fill();
  ctx.strokeStyle = "rgba(163,255,18,0.36)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x + 34, y + h / 2, 15, 0, Math.PI * 2);
  ctx.fillStyle = "#a3ff12";
  ctx.fill();
  ctx.fillStyle = "#07111d";
  ctx.font = "900 20px Arial";
  ctx.textAlign = "center";
  ctx.fillText("✓", x + 34, y + h / 2 + 7);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 21px Arial";
  ctx.fillText(label.toUpperCase(), x + 168, y + h / 2 + 8);
  ctx.textAlign = "left";
}

function drawGrowthChart(ctx, x, y, w, h, color) {
  const points = [
    [0.02, 0.95],
    [0.16, 0.9],
    [0.28, 0.8],
    [0.42, 0.8],
    [0.52, 0.62],
    [0.62, 0.62],
    [0.72, 0.42],
    [0.82, 0.14],
    [0.92, 0.11],
    [0.99, 0.02],
  ];

  const gradient = ctx.createLinearGradient(0, y, 0, y + h);
  gradient.addColorStop(0, "rgba(163,255,18,0.40)");
  gradient.addColorStop(1, "rgba(163,255,18,0.00)");

  ctx.beginPath();
  points.forEach(([px, py], index) => {
    const cx = x + px * w;
    const cy = y + py * h;
    if (index === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  });
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  points.forEach(([px, py], index) => {
    const cx = x + px * w;
    const cy = y + py * h;
    if (index === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();

  const [lastX, lastY] = points[points.length - 1];
  ctx.beginPath();
  ctx.arc(x + lastX * w, y + lastY * h, 9, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.shadowColor = "rgba(163,255,18,0.75)";
  ctx.shadowBlur = 22;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawNumberBadge(ctx, x, y, value, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.055)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 " + radius * 0.95 + "px Arial";
  ctx.textAlign = "center";
  ctx.fillText(String(value), x, y + radius * 0.35);
  ctx.textAlign = "left";
}

function drawLogo(ctx, x, y) {
  const barH = 10;
  const gap = 6;
  const slant = 7;
  const widths = [42, 30, 18];

  ctx.fillStyle = "#8df126";
  widths.forEach((barW, index) => {
    const top = y + index * (barH + gap);
    ctx.beginPath();
    ctx.moveTo(x + slant, top);
    ctx.lineTo(x + slant + barW, top);
    ctx.lineTo(x + barW, top + barH);
    ctx.lineTo(x, top + barH);
    ctx.closePath();
    ctx.fill();
  });
  ctx.textAlign = "left";
}

function drawPill(ctx, text, x, y, w, h, bg, fg) {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = "rgba(141,241,38,0.28)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = fg;
  ctx.font = "800 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, x + w / 2, y + 29);
  ctx.textAlign = "left";
}

function drawCircleBlur(ctx, x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text || "").split(" ");
  let line = "";
  let currentY = y;
  let lines = 0;

  words.forEach((word, index) => {
    const testLine = line ? `${line} ${word}` : word;
    const width = ctx.measureText(testLine).width;
    if (width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
      lines += 1;
    } else {
      line = testLine;
    }

    if (index === words.length - 1 && lines < maxLines) {
      ctx.fillText(line, x, currentY);
    }
  });
}
