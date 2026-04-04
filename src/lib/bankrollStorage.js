export const BETS_STORAGE_KEY = "alpha_tips_bankroll_entries_v1";
export const SETTINGS_STORAGE_KEY = "alpha_tips_bankroll_settings_v1";

export function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value === null || value === undefined || value === "") return 0;

  const raw = String(value).trim();
  if (!raw) return 0;

  let normalized = raw.replace(/\s+/g, "");

  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = normalized.replace(",", ".");
  }

  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function roundToTwo(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

export function getTodayInputValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function formatDate(dateString) {
  if (!dateString) return "--/--/----";
  const [year, month, day] = String(dateString).split("-");
  if (!year || !month || !day) return String(dateString);
  return `${day}/${month}/${year}`;
}

export function loadBankrollEntries() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(BETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBankrollEntries(entries) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BETS_STORAGE_KEY, JSON.stringify(entries));
}

export function loadBankrollSettings() {
  if (typeof window === "undefined") {
    return { initialBankroll: "" };
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { initialBankroll: "" };

    const parsed = JSON.parse(raw);

    return {
      initialBankroll:
        parsed?.initialBankroll === "" ||
        parsed?.initialBankroll === null ||
        parsed?.initialBankroll === undefined
          ? ""
          : toNumber(parsed.initialBankroll),
    };
  } catch {
    return { initialBankroll: "" };
  }
}

export function saveBankrollSettings(settings) {
  if (typeof window === "undefined") return;

  const rawValue = settings?.initialBankroll;

  const safeSettings = {
    initialBankroll:
      rawValue === "" || rawValue === null || rawValue === undefined
        ? ""
        : toNumber(rawValue),
  };

  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(safeSettings));
}

export function calculateEntryResult(entry) {
  const stake = toNumber(entry?.stake);
  const odd = toNumber(entry?.odd);
  const cashoutAmount = toNumber(entry?.cashoutAmount);
  const status = entry?.status || "pending";

  let retorno = 0;
  let lucro = 0;

  if (status === "green") {
    retorno = roundToTwo(stake * odd);
    lucro = roundToTwo(retorno - stake);
  } else if (status === "red") {
    retorno = 0;
    lucro = roundToTwo(-stake);
  } else if (status === "cashout") {
    retorno = roundToTwo(cashoutAmount);
    lucro = roundToTwo(retorno - stake);
  }

  return {
    stake: roundToTwo(stake),
    odd: roundToTwo(odd),
    cashoutAmount: roundToTwo(cashoutAmount),
    retorno: roundToTwo(retorno),
    lucro: roundToTwo(lucro),
  };
}

export function calculateStats(entries, initialBankroll = 0) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const safeInitialBankroll = toNumber(initialBankroll);

  const settledEntries = safeEntries.filter((entry) => entry.status !== "pending");

  const totalEntries = safeEntries.length;
  const pendingEntries = safeEntries.filter((entry) => entry.status === "pending").length;
  const greenEntries = safeEntries.filter((entry) => entry.status === "green").length;
  const redEntries = safeEntries.filter((entry) => entry.status === "red").length;
  const cashoutEntries = safeEntries.filter((entry) => entry.status === "cashout").length;

  const totalStaked = safeEntries.reduce((sum, entry) => {
    return sum + calculateEntryResult(entry).stake;
  }, 0);

  const settledStake = settledEntries.reduce((sum, entry) => {
    return sum + calculateEntryResult(entry).stake;
  }, 0);

  const totalReturn = settledEntries.reduce((sum, entry) => {
    return sum + calculateEntryResult(entry).retorno;
  }, 0);

  const netProfit = settledEntries.reduce((sum, entry) => {
    return sum + calculateEntryResult(entry).lucro;
  }, 0);

  const currentBankroll = roundToTwo(safeInitialBankroll + netProfit);
  const roi = settledStake > 0 ? (netProfit / settledStake) * 100 : 0;
  const hitRate =
    settledEntries.length > 0 ? (greenEntries / settledEntries.length) * 100 : 0;

  const averageOdd =
    safeEntries.length > 0
      ? safeEntries.reduce((sum, entry) => sum + toNumber(entry.odd), 0) / safeEntries.length
      : 0;

  const averageStake =
    safeEntries.length > 0 ? totalStaked / safeEntries.length : 0;

  return {
    initialBankroll:
      initialBankroll === "" || initialBankroll === null || initialBankroll === undefined
        ? ""
        : roundToTwo(safeInitialBankroll),
    currentBankroll,
    totalEntries,
    pendingEntries,
    greenEntries,
    redEntries,
    cashoutEntries,
    totalStaked: roundToTwo(totalStaked),
    settledStake: roundToTwo(settledStake),
    totalReturn: roundToTwo(totalReturn),
    netProfit: roundToTwo(netProfit),
    roi: roundToTwo(roi),
    hitRate: roundToTwo(hitRate),
    averageOdd: roundToTwo(averageOdd),
    averageStake: roundToTwo(averageStake),
  };
}

export function getStatusMeta(status) {
  if (status === "green") {
    return {
      label: "Green",
      className: "border-[#2c4720] bg-[rgba(141,241,38,0.08)] text-[#8df126]",
    };
  }

  if (status === "red") {
    return {
      label: "Red",
      className: "border-[#4a2729] bg-[rgba(219,143,143,0.08)] text-[#db8f8f]",
    };
  }

  if (status === "cashout") {
    return {
      label: "Cashout",
      className: "border-[#3b3a20] bg-[rgba(234,214,99,0.08)] text-[#ead663]",
    };
  }

  return {
    label: "Pendente",
    className: "border-white/[0.08] bg-white/[0.04] text-white/70",
  };
}