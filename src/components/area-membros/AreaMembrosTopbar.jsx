"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  CreditCard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  UserRound,
  Wallet,
} from "lucide-react";
import {
  getCurrentNavigationItem,
  isPathActive,
} from "@/components/area-membros/areaNavigation";
import { useLanguage } from "@/i18n/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { applyTheme, getStoredTheme } from "@/components/theme-utils";

const ACCOUNT_ICONS = {
  CircleHelp,
  CreditCard,
  UserRound,
};

const ACCOUNT_MENU = [
  {
    labelKey: "topbar.accountProfile",
    descriptionKey: "topbar.accountProfileDescription",
    icon: "UserRound",
  },
  {
    labelKey: "sidebar.proPlan",
    descriptionKey: "topbar.proPlanDescription",
    icon: "CreditCard",
  },
  {
    labelKey: "topbar.support",
    descriptionKey: "topbar.supportDescription",
    icon: "CircleHelp",
  },
];

const CONTEXT_ACTIONS = {
  "/area-membros": {
    labelKey: "topbar.recordBet",
    href: "/area-membros/banca",
    icon: Plus,
  },
  "/area-membros/estatisticas": {
    labelKey: "topbar.manageBankroll",
    href: "/area-membros/banca",
    icon: Wallet,
  },
};

function IconButton({ title, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-[9px] border border-[var(--gp-border)] bg-[var(--gp-surface)] text-[var(--gp-text-secondary)] transition hover:bg-[var(--gp-hover)] hover:text-[var(--gp-text)] focus:ring-4 focus:ring-emerald-500/12 ${className}`}
    >
      {children}
    </button>
  );
}

function AccountDropdownItem({ item, onClick }) {
  const { t } = useLanguage();
  const Icon = ACCOUNT_ICONS[item.icon] || UserRound;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-[9px] px-3 py-2.5 text-left transition hover:bg-[var(--gp-hover)]"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--gp-surface)] text-[var(--gp-text-secondary)] ring-1 ring-[var(--gp-border)]">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-[var(--gp-text)]">
          {t(item.labelKey)}
        </span>
        <span className="mt-0.5 block text-[12px] text-[var(--gp-text-secondary)]">
          {t(item.descriptionKey)}
        </span>
      </span>
    </button>
  );
}

export default function AreaMembrosTopbar({ onMenuClick }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTheme, setActiveTheme] = useState("dark");
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const currentTheme = getStoredTheme();
      applyTheme(currentTheme);
      setActiveTheme(currentTheme);
      setMounted(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentItem = getCurrentNavigationItem(pathname);
  const action = useMemo(() => {
    return (
      CONTEXT_ACTIONS[pathname] ||
      Object.entries(CONTEXT_ACTIONS).find(([href]) => isPathActive(pathname, href))?.[1] ||
      null
    );
  }, [pathname]);

  useEffect(() => {
    if (!mounted) return;
    const nextTheme = resolvedTheme === "light" ? "light" : "dark";
    applyTheme(nextTheme);
    queueMicrotask(() => setActiveTheme(nextTheme));
  }, [mounted, resolvedTheme]);

  function handleThemeToggle() {
    const nextTheme = activeTheme === "dark" ? "light" : "dark";
    setActiveTheme(nextTheme);
    applyTheme(nextTheme);
    setTheme(nextTheme);
  }

  const isDark = activeTheme === "dark";
  const ActionIcon = action?.icon;

  return (
    <header className="gp-topbar sticky top-0 z-40 shrink-0 border-b">
      <div className="flex min-h-[76px] items-center gap-3 px-4 sm:px-5 lg:px-6">
        <IconButton title={t("topbar.openNavigation")} onClick={onMenuClick} className="lg:hidden">
          <Menu className="h-5 w-5" strokeWidth={1.9} />
        </IconButton>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--gp-text-secondary)]">
            <span>{t("topbar.memberArea")}</span>
            <span className="h-1 w-1 rounded-full bg-[var(--gp-border)]" />
            <span className="truncate">{t(currentItem.labelKey)}</span>
          </div>
          <h1 className="mt-1 truncate text-[21px] font-semibold tracking-[-0.025em] text-[var(--gp-text)]">
            {t(currentItem.labelKey)}
          </h1>
        </div>

        <label className="hidden h-10 w-full max-w-[420px] items-center gap-3 rounded-[9px] border border-[var(--gp-border)] bg-[var(--gp-surface)] px-3.5 text-[13px] text-[var(--gp-text-secondary)] transition focus-within:border-emerald-500/45 focus-within:ring-4 focus-within:ring-emerald-500/10 xl:flex">
          <Search className="h-4 w-4 shrink-0" strokeWidth={1.9} />
          <input
            type="search"
            placeholder={t("topbar.searchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-[var(--gp-text)] outline-none placeholder:text-[var(--gp-text-muted)]"
          />
        </label>

        <div className="flex shrink-0 items-center justify-end gap-2">
          {action ? (
            <Link
              href={action.href}
              className="gp-button-primary hidden h-10 items-center justify-center gap-2 rounded-[9px] px-3.5 text-[13px] font-semibold transition sm:inline-flex"
            >
              <ActionIcon className="h-4 w-4" strokeWidth={2} />
              {t(action.labelKey)}
            </Link>
          ) : null}

          <LanguageSwitcher />

          <IconButton title={t("topbar.notifications")}>
            <span className="relative">
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[var(--gp-topbar)]" />
            </span>
          </IconButton>

          {mounted ? (
            <IconButton
              title={isDark ? t("topbar.lightMode") : t("topbar.darkMode")}
              onClick={handleThemeToggle}
            >
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </IconButton>
          ) : (
            <div className="h-10 w-10 rounded-[9px] border border-[var(--gp-border)] bg-[var(--gp-surface)]" />
          )}

          <div className="relative" ref={accountRef}>
            <button
              type="button"
              onClick={() => setAccountOpen((current) => !current)}
              className={`inline-flex h-10 items-center gap-2 rounded-[9px] border px-2 transition ${
                accountOpen
                  ? "border-emerald-500/35 bg-emerald-500/10"
                  : "border-[var(--gp-border)] bg-[var(--gp-surface)] hover:bg-[var(--gp-hover)]"
              }`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-emerald-500 text-[11px] font-semibold text-[#07120b]">
                AT
              </span>
              <span className="hidden text-left leading-none md:block">
                <span className="block text-[13px] font-semibold text-[var(--gp-text)]">
                  Thyago
                </span>
                <span className="mt-1 block text-[11px] font-medium text-[var(--gp-text-secondary)]">
                  {t("sidebar.proPlan")}
                </span>
              </span>
              <ChevronDown
                className={`hidden h-4 w-4 text-[var(--gp-text-muted)] transition md:block ${
                  accountOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {accountOpen ? (
              <div className="gp-elevated absolute right-0 top-[calc(100%+10px)] w-[304px] overflow-hidden rounded-[12px] border p-2">
                <div className="rounded-[9px] bg-[var(--gp-bg-secondary)] p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-emerald-500 text-[13px] font-semibold text-[#07120b]">
                      AT
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-[var(--gp-text)]">
                        Thyago
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-emerald-500">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t("topbar.activePremium")}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  {ACCOUNT_MENU.map((item) => (
                    <AccountDropdownItem
                      key={item.labelKey}
                      item={item}
                      onClick={() => setAccountOpen(false)}
                    />
                  ))}
                </div>

                <div className="mt-2 border-t border-[var(--gp-border)] pt-2">
                  <button
                    type="button"
                    onClick={() => setAccountOpen(false)}
                    className="flex w-full items-center gap-3 rounded-[9px] px-3 py-2.5 text-left text-[13px] font-semibold text-[var(--gp-text-secondary)] transition hover:bg-rose-400/10 hover:text-rose-400"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--gp-surface)] ring-1 ring-[var(--gp-border)]">
                      <LogOut className="h-4 w-4" strokeWidth={1.9} />
                    </span>
                    {t("topbar.logout")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
