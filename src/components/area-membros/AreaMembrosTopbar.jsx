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
  Sun,
  UserRound,
  Wallet,
} from "lucide-react";
import {
  getCurrentNavigationItem,
  isPathActive,
} from "@/components/area-membros/areaNavigation";

const ACCOUNT_ICONS = {
  CircleHelp,
  CreditCard,
  UserRound,
};

const ACCOUNT_MENU = [
  {
    label: "Perfil da conta",
    description: "Preferencias locais",
    icon: "UserRound",
  },
  {
    label: "Plano Pro",
    description: "Premium ativo",
    icon: "CreditCard",
  },
  {
    label: "Suporte",
    description: "Atendimento pelo canal contratado",
    icon: "CircleHelp",
  },
];

const CONTEXT_ACTIONS = {
  "/area-membros": {
    label: "Registrar aposta",
    href: "/area-membros/banca",
    icon: Plus,
  },
  "/area-membros/estatisticas": {
    label: "Gerenciar banca",
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
      className={`inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-300 dark:hover:border-white/[0.14] dark:hover:bg-white/[0.065] dark:hover:text-white ${className}`}
    >
      {children}
    </button>
  );
}

function AccountDropdownItem({ item, onClick }) {
  const Icon = ACCOUNT_ICONS[item.icon] || UserRound;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-[12px] px-3 py-2.5 text-left transition hover:bg-slate-100 dark:hover:bg-white/[0.055]"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-slate-100 text-slate-600 dark:bg-white/[0.055] dark:text-slate-300">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-slate-950 dark:text-white">
          {item.label}
        </span>
        <span className="mt-0.5 block text-[12px] text-slate-500 dark:text-slate-400">
          {item.description}
        </span>
      </span>
    </button>
  );
}

export default function AreaMembrosTopbar({ onMenuClick }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
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

  const isDark = resolvedTheme === "dark";
  const ActionIcon = action?.icon;

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-slate-200 bg-white/88 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#0b111d]/88">
      <div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <IconButton title="Abrir navegacao" onClick={onMenuClick} className="lg:hidden">
            <Menu className="h-5 w-5" strokeWidth={1.9} />
          </IconButton>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 dark:text-slate-400">
              <span>Area de membros</span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="truncate">{currentItem.label}</span>
            </div>
            <h1 className="mt-1 truncate text-[20px] font-semibold tracking-[-0.025em] text-slate-950 dark:text-white sm:text-[22px]">
              {currentItem.label}
            </h1>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2">
          {action ? (
            <Link
              href={action.href}
              className="hidden h-10 items-center justify-center gap-2 rounded-[12px] bg-slate-950 px-3.5 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 dark:bg-white/[0.08] dark:text-white dark:ring-1 dark:ring-white/[0.1] dark:hover:bg-white/[0.12] sm:inline-flex"
            >
              <ActionIcon className="h-4 w-4" strokeWidth={2} />
              {action.label}
            </Link>
          ) : null}

          <IconButton title="Notificacoes">
            <span className="relative">
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0b111d]" />
            </span>
          </IconButton>

          {mounted ? (
            <IconButton
              title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </IconButton>
          ) : (
            <div className="h-10 w-10 rounded-[12px] border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.035]" />
          )}

          <div className="relative" ref={accountRef}>
            <button
              type="button"
              onClick={() => setAccountOpen((current) => !current)}
              className={`inline-flex h-10 items-center gap-2 rounded-[12px] border px-2 transition ${
                accountOpen
                  ? "border-slate-300 bg-slate-100 dark:border-white/[0.14] dark:bg-white/[0.07]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.035] dark:hover:border-white/[0.14] dark:hover:bg-white/[0.065]"
              }`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-slate-900 text-[11px] font-semibold text-white dark:bg-white dark:text-slate-950">
                AT
              </span>
              <span className="hidden text-left leading-none md:block">
                <span className="block text-[13px] font-semibold text-slate-950 dark:text-white">
                  Thyago
                </span>
                <span className="mt-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Plano Pro
                </span>
              </span>
              <ChevronDown
                className={`hidden h-4 w-4 text-slate-400 transition md:block ${
                  accountOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {accountOpen ? (
              <div className="absolute right-0 top-[calc(100%+10px)] w-[304px] overflow-hidden rounded-[18px] border border-slate-200 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.16)] dark:border-white/[0.09] dark:bg-[#0d1522] dark:shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
                <div className="rounded-[14px] bg-slate-50 p-3 dark:bg-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-slate-900 text-[13px] font-semibold text-white dark:bg-white dark:text-slate-950">
                      AT
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-slate-950 dark:text-white">
                        Thyago
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Premium ativo
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  {ACCOUNT_MENU.map((item) => (
                    <AccountDropdownItem
                      key={item.label}
                      item={item}
                      onClick={() => setAccountOpen(false)}
                    />
                  ))}
                </div>

                <div className="mt-2 border-t border-slate-200 pt-2 dark:border-white/[0.07]">
                  <button
                    type="button"
                    onClick={() => setAccountOpen(false)}
                    className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-400/10 dark:hover:text-rose-300"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-slate-100 dark:bg-white/[0.055]">
                      <LogOut className="h-4 w-4" strokeWidth={1.9} />
                    </span>
                    Sair
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
