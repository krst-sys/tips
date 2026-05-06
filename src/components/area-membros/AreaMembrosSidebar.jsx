"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  ChartNoAxesCombined,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  LayoutDashboard,
  MessagesSquare,
  Trophy,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { NAV_SECTIONS, isPathActive } from "@/components/area-membros/areaNavigation";

const ICONS = {
  BookOpenCheck,
  ChartNoAxesCombined,
  CreditCard,
  LayoutDashboard,
  MessagesSquare,
  Trophy,
  TrendingUp,
  Wallet,
};

function Brand({ collapsed = false }) {
  return (
    <Link
      href="/area-membros"
      className={`flex min-h-12 items-center gap-3 rounded-[14px] px-2 transition hover:bg-slate-100 dark:hover:bg-white/[0.04] ${
        collapsed ? "justify-center" : ""
      }`}
      title={collapsed ? "Alpha Tips" : undefined}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-slate-950 text-[18px] font-black text-lime-300 ring-1 ring-slate-900/10 dark:bg-white dark:text-slate-950 dark:ring-white/10">
        A
      </span>
      {!collapsed ? (
        <span className="min-w-0">
          <span className="block text-[15px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
            Alpha Tips
          </span>
          <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Gestão profissional
          </span>
        </span>
      ) : null}
    </Link>
  );
}

function NavItem({ item, collapsed, onNavigate }) {
  const pathname = usePathname();
  const Icon = ICONS[item.icon] || LayoutDashboard;
  const active = isPathActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={`group relative flex min-h-11 items-center rounded-[12px] text-[14px] font-medium transition ${
        collapsed ? "justify-center px-2" : "gap-3 px-3"
      } ${
        active
          ? "bg-white text-slate-950 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-slate-200 dark:bg-white/[0.08] dark:text-white dark:ring-white/[0.1]"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.055] dark:hover:text-white"
      }`}
    >
      {!collapsed ? (
        <span
          className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full transition ${
            active ? "bg-lime-500 dark:bg-lime-300" : "bg-transparent"
          }`}
        />
      ) : null}

      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] ${
          active
            ? "bg-slate-50 text-slate-950 ring-1 ring-slate-200 dark:bg-lime-300/12 dark:text-lime-200 dark:ring-0"
            : "text-slate-500 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-white"
        }`}
      >
        <Icon className="h-[17px] w-[17px]" strokeWidth={1.9} />
      </span>

      {!collapsed ? (
        <>
          <span
            className={`min-w-0 flex-1 truncate ${
              active ? "text-slate-950 dark:text-white" : ""
            }`}
          >
            {item.label}
          </span>
          {item.badge ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                active
                  ? "bg-lime-300 text-slate-950"
                  : "bg-lime-100 text-lime-800 dark:bg-lime-300/10 dark:text-lime-200"
              }`}
            >
              {item.badge}
            </span>
          ) : null}
        </>
      ) : null}
    </Link>
  );
}

function SidebarContent({ collapsed = false, onNavigate, onToggleCollapsed, mobile = false }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-[#0b111d]">
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-white/[0.07]">
        <Brand collapsed={collapsed && !mobile} />
        {mobile ? (
          <button
            type="button"
            onClick={onNavigate}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-6" aria-label="Navegacao principal">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {!collapsed || mobile ? (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                  {section.label}
                </p>
              ) : null}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    collapsed={collapsed && !mobile}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

      </div>

      {!mobile ? (
        <div className="border-t border-slate-200 p-3 dark:border-white/[0.07]">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-[11px] text-[13px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.055] dark:hover:text-white"
            title={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!collapsed ? <span>Recolher</span> : null}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function AreaMembrosSidebar({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile,
  onToggleCollapsed,
}) {
  return (
    <>
      <aside
        className={`hidden shrink-0 border-r border-slate-200 transition-[width] duration-200 ease-out dark:border-white/[0.07] lg:block ${
          collapsed ? "w-[84px]" : "w-[280px]"
        }`}
      >
        <SidebarContent collapsed={collapsed} onToggleCollapsed={onToggleCollapsed} />
      </aside>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onCloseMobile}
          className={`absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-opacity dark:bg-black/60 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[min(88vw,320px)] border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 dark:border-white/[0.08] dark:bg-[#0b111d] ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent mobile onNavigate={onCloseMobile} />
        </aside>
      </div>
    </>
  );
}
