"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  Lightbulb,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Trophy,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { NAV_SECTIONS, isPathActive } from "@/components/area-membros/areaNavigation";
import { useLanguage } from "@/i18n/LanguageProvider";

const ICONS = {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Lightbulb,
  ReceiptText,
  Sparkles,
  Trophy,
  TrendingUp,
  Wallet,
};

function Brand() {
  return (
    <Link href="/area-membros" className="flex items-center gap-3" aria-label="Filtto">
      <span className="relative h-7 w-6 shrink-0 text-emerald-500">
        <span className="absolute left-0 top-0 h-2 w-6 skew-x-[-24deg] rounded-[2px] bg-current" />
        <span className="absolute left-0 top-2.5 h-2 w-[18px] skew-x-[-24deg] rounded-[2px] bg-current" />
        <span className="absolute left-0 top-5 h-2 w-[11px] skew-x-[-24deg] rounded-[2px] bg-current" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[24px] font-black leading-none tracking-[-0.04em] text-[var(--gp-text)]">
          Filtto
        </span>
      </span>
    </Link>
  );
}

function NavItem({ item, onNavigate }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const Icon = ICONS[item.icon] || LayoutDashboard;
  const active = isPathActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`group relative grid min-h-10 grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 rounded-[10px] px-3 py-2 text-[13px] transition ${
        active
          ? "bg-[var(--gp-primary-soft)] font-semibold text-[var(--gp-text)]"
          : "font-medium text-[var(--gp-text-secondary)] hover:text-[var(--gp-text)]"
      }`}
    >
      <span
        className={`absolute left-[-4px] top-2 bottom-2 w-[2px] rounded-full transition ${
          active ? "bg-emerald-500" : "bg-transparent"
        }`}
      />
      <Icon
        className={`h-[15px] w-[15px] transition ${
          active ? "text-emerald-500" : "text-[var(--gp-text-muted)] group-hover:text-[var(--gp-text-secondary)]"
        }`}
        strokeWidth={1.85}
      />
      <span className="truncate">{t(item.labelKey)}</span>
    </Link>
  );
}

function SidebarContent({ onNavigate, mobile = false }) {
  const { t } = useLanguage();

  return (
    <div className="gp-sidebar flex h-full min-h-0 flex-col">
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[var(--gp-border)] px-6">
        <Brand />
        {mobile ? (
          <button
            type="button"
            onClick={onNavigate}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--gp-text-secondary)] transition hover:bg-[var(--gp-hover)] hover:text-[var(--gp-text)]"
            aria-label={t("sidebar.closeMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
        <nav className="space-y-7" aria-label={t("sidebar.ariaMain")}>
          {NAV_SECTIONS.map((section) => (
            <section key={section.labelKey}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--gp-text-muted)]">
                {t(section.labelKey)}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem key={item.href} item={item} onNavigate={onNavigate} />
                ))}
              </div>
            </section>
          ))}
        </nav>
      </div>

      <div className="shrink-0 px-4 pb-5 pt-3">
        <div className="filtto-plan-card rounded-[12px] border border-[var(--gp-border)] bg-[var(--gp-surface)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <span className="truncate text-[14px] font-semibold text-[var(--gp-text)]">
                {t("sidebar.proPlan")}
              </span>
            </div>
            <span className="text-[12px] font-semibold text-emerald-500">{t("common.active")}</span>
          </div>
          <p className="mt-4 text-[12.5px] leading-5 text-[var(--gp-text-secondary)]">
            Aproveite todos os recursos para lucrar mais.
          </p>
          <button
            type="button"
            className="mt-4 flex h-10 w-full items-center justify-between rounded-[9px] border border-[var(--gp-border)] bg-[var(--gp-bg-secondary)] px-3 text-[13px] font-medium text-[var(--gp-text)] transition hover:border-emerald-500/30 hover:bg-[var(--gp-hover)]"
          >
            Gerenciar plano
            <ChevronRight className="h-4 w-4 text-[var(--gp-text-secondary)]" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AreaMembrosSidebar({ mobileOpen = false, onCloseMobile }) {
  const { t } = useLanguage();

  return (
    <>
      <aside className="gp-sidebar hidden w-[286px] shrink-0 border-r lg:block">
        <SidebarContent />
      </aside>

      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label={t("sidebar.closeMenu")}
          onClick={onCloseMobile}
          className={`absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`gp-sidebar absolute inset-y-0 left-0 w-[min(88vw,300px)] border-r shadow-2xl transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent mobile onNavigate={onCloseMobile} />
        </aside>
      </div>
    </>
  );
}
