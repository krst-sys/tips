"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";

function Icon({ type, className = "h-5 w-5" }) {
  if (type === "home") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M4 10.5L12 4L20 10.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 9.5V19H17.5V9.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === "bank") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M4 10L12 5L20 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 10V18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M10 10V18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M14 10V18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M18 10V18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4 19H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "ranking") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M8 18V11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12 18V7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M16 18V13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M5 19H19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "progress") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M5 18L9.5 13.5L12.5 16.5L19 10"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.5 10H19V13.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "method") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="4" y="5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 9H16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M8 12H13.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M8 15H11.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "palpites") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M7 16.5H6A2.5 2.5 0 0 1 3.5 14V8A2.5 2.5 0 0 1 6 5.5H12A2.5 2.5 0 0 1 14.5 8V9"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.5 18.5H18A2.5 2.5 0 0 0 20.5 16V12A2.5 2.5 0 0 0 18 9.5H12A2.5 2.5 0 0 0 9.5 12V16C9.5 17.38 10.62 18.5 12 18.5H12.8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.5 18.5V20.5L14.5 18.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "profile") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M5.5 18.5C6.8 15.9 9.1 14.5 12 14.5C14.9 14.5 17.2 15.9 18.5 18.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "subscription") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="4" y="6" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4 10H20" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 14H11.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "spark") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M12 3L13.9 8.1L19 10L13.9 11.9L12 17L10.1 11.9L5 10L10.1 8.1L12 3Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "menu-open") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M4 7H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4 12H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4 17H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "menu-close") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M4 7H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M10 12H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4 17H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "sun") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 2.5V5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12 19V21.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M21.5 12H19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M5 12H2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M18.7 5.3L17 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M7 17L5.3 18.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M18.7 18.7L17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M7 7L5.3 5.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "moon") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M19 14.5A7.5 7.5 0 0 1 9.5 5a8.5 8.5 0 1 0 9.5 9.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return null;
}

function isPathActive(pathname, href) {
  if (href === "/area-membros") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function useSidebarDensity() {
  const [height, setHeight] = useState(900);

  useEffect(() => {
    function updateHeight() {
      setHeight(window.innerHeight);
    }

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return useMemo(() => {
    if (height <= 770) {
      return {
        width: "w-[280px]",
        headerHeight: "h-[74px]",
        headerPadding: "px-4",
        brandBox: "h-10 w-10 rounded-[14px] text-[24px]",
        brandTitle: "text-[18px]",
        brandEyebrow: "text-[9px]",
        collapseBtn: "h-8 w-8 rounded-[12px]",
        contentPadding: "px-3 py-3",
        sectionGap: "space-y-1",
        sectionTitle: "text-[9px]",
        sectionMargin: "mt-3",
        itemPadding: "gap-3 px-3 py-2",
        itemRadius: "rounded-[14px]",
        itemIcon: "h-7 w-7 rounded-[10px]",
        itemIconSize: "h-[14px] w-[14px]",
        itemText: "text-[13px]",
        featuredPadding: "gap-3 px-3 py-3",
        featuredRadius: "rounded-[16px]",
        featuredIcon: "h-8 w-8 rounded-[11px]",
        featuredIconSize: "h-4 w-4",
        featuredTitle: "text-[13px]",
        featuredSub: "text-[10px]",
        featuredBadge: "text-[9px] px-2 py-0.5",
        themePadding: "px-3 py-2",
        themeHeight: "h-9",
        themeIcon: "h-7 w-7 rounded-[10px]",
        themeIconSize: "h-3.5 w-3.5",
        themeText: "text-[12px]",
      };
    }

    if (height <= 860) {
      return {
        width: "w-[292px]",
        headerHeight: "h-[78px]",
        headerPadding: "px-5",
        brandBox: "h-10 w-10 rounded-[14px] text-[25px]",
        brandTitle: "text-[19px]",
        brandEyebrow: "text-[10px]",
        collapseBtn: "h-9 w-9 rounded-[12px]",
        contentPadding: "px-3 py-3",
        sectionGap: "space-y-1.5",
        sectionTitle: "text-[10px]",
        sectionMargin: "mt-4",
        itemPadding: "gap-3 px-3.5 py-2.5",
        itemRadius: "rounded-[15px]",
        itemIcon: "h-8 w-8 rounded-[11px]",
        itemIconSize: "h-[15px] w-[15px]",
        itemText: "text-[14px]",
        featuredPadding: "gap-3 px-3.5 py-3",
        featuredRadius: "rounded-[17px]",
        featuredIcon: "h-9 w-9 rounded-[12px]",
        featuredIconSize: "h-4 w-4",
        featuredTitle: "text-[14px]",
        featuredSub: "text-[11px]",
        featuredBadge: "text-[9px] px-2 py-0.5",
        themePadding: "px-3 py-2.5",
        themeHeight: "h-10",
        themeIcon: "h-8 w-8 rounded-[11px]",
        themeIconSize: "h-4 w-4",
        themeText: "text-[13px]",
      };
    }

    return {
      width: "w-[304px]",
      headerHeight: "h-[86px]",
      headerPadding: "px-6",
      brandBox: "h-11 w-11 rounded-[15px] text-[28px]",
      brandTitle: "text-[21px]",
      brandEyebrow: "text-[10px]",
      collapseBtn: "h-10 w-10 rounded-[13px]",
      contentPadding: "px-4 py-4",
      sectionGap: "space-y-2",
      sectionTitle: "text-[10px]",
      sectionMargin: "mt-4",
      itemPadding: "gap-3 px-4 py-3",
      itemRadius: "rounded-[16px]",
      itemIcon: "h-9 w-9 rounded-[12px]",
      itemIconSize: "h-4 w-4",
      itemText: "text-[15px]",
      featuredPadding: "gap-3 px-4 py-4",
      featuredRadius: "rounded-[18px]",
      featuredIcon: "h-10 w-10 rounded-[13px]",
      featuredIconSize: "h-4.5 w-4.5",
      featuredTitle: "text-[15px]",
      featuredSub: "text-[12px]",
      featuredBadge: "text-[10px] px-2 py-0.5",
      themePadding: "px-3 py-3",
      themeHeight: "h-11",
      themeIcon: "h-9 w-9 rounded-[12px]",
      themeIconSize: "h-4 w-4",
      themeText: "text-[14px]",
    };
  }, [height]);
}

function ThemeToggleButton({ collapsed, density }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`rounded-[16px] border border-slate-200 bg-white/80 dark:border-white/[0.08] dark:bg-white/[0.03] ${
          collapsed ? `${density.themeHeight} w-full` : density.themePadding
        }`}
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className={`inline-flex items-center rounded-[16px] border transition ${
        collapsed
          ? `${density.themeHeight} w-full justify-center`
          : `w-full justify-between ${density.themePadding}`
      } border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/75 dark:hover:bg-white/[0.06] dark:hover:text-white`}
    >
      <span
        className={`flex shrink-0 items-center justify-center ${density.themeIcon} ${
          isDark
            ? "bg-[#182434] text-[#8df126]"
            : "bg-slate-100 text-slate-700"
        }`}
      >
        <Icon type={isDark ? "sun" : "moon"} className={density.themeIconSize} />
      </span>

      {!collapsed && (
        <>
          <span className={`ml-3 flex-1 text-left font-medium ${density.themeText}`}>
            {isDark ? "Modo claro" : "Modo escuro"}
          </span>
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isDark ? "bg-[#8df126]" : "bg-slate-300"
            }`}
          />
        </>
      )}
    </button>
  );
}

function SidebarSectionTitle({ children, collapsed, first = false, density }) {
  if (collapsed) return null;

  return (
    <div className={`${first ? "mb-1" : `mb-1 ${density.sectionMargin}`} px-1`}>
      <span className={`font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-white/28 ${density.sectionTitle}`}>
        {children}
      </span>
    </div>
  );
}

function SidebarItem({
  href,
  label,
  icon,
  collapsed,
  badge,
  featured = false,
  density,
}) {
  const pathname = usePathname();
  const active = isPathActive(pathname, href);

  if (featured) {
    return (
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`group relative flex overflow-hidden border transition-all duration-300 ${
          collapsed
            ? "justify-center px-2 py-3"
            : `items-center ${density.featuredPadding}`
        } ${density.featuredRadius} ${
          active
            ? "border-[#b8ff6a]/45 bg-[linear-gradient(135deg,rgba(141,241,38,0.18)_0%,rgba(141,241,38,0.08)_100%)] text-slate-950 shadow-[0_18px_40px_rgba(141,241,38,0.16)] dark:text-white"
            : "border-slate-200 bg-[linear-gradient(135deg,#f8ffef_0%,#ffffff_100%)] text-slate-900 hover:border-[#d9f7b7] hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] dark:border-[#b8ff6a]/15 dark:bg-[linear-gradient(135deg,rgba(141,241,38,0.14)_0%,rgba(16,24,38,0.92)_100%)] dark:text-white"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 opacity-100">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#8df126]/12 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#8df126]/40 to-transparent" />
        </div>

        <span
          className={`relative z-[1] flex shrink-0 items-center justify-center ${density.featuredIcon} ${
            active
              ? "bg-slate-100 text-[#6a9d1f] dark:bg-white/[0.035] dark:text-[#8df126]"
              : "bg-slate-100 text-slate-500 dark:bg-white/[0.035] dark:text-white/42"
          }`}
        >
          <Icon type={icon} className={density.featuredIconSize} />
        </span>

        {!collapsed && (
          <div className="relative z-[1] min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`truncate font-semibold ${density.featuredTitle}`}>{label}</span>
              {badge && (
                <span className={`rounded-full border border-[#8df126]/30 bg-[#8df126]/12 font-bold uppercase tracking-[0.16em] text-[#4d7f11] dark:text-[#cfff9b] ${density.featuredBadge}`}>
                  {badge}
                </span>
              )}
            </div>
            <p className={`mt-0.5 leading-[1.2] text-slate-600 dark:text-white/58 ${density.featuredSub}`}>
              Conteúdo premium e estratégias
            </p>
          </div>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`group flex items-center border transition-all duration-200 ${
        collapsed ? "justify-center px-2 py-2" : density.itemPadding
      } ${density.itemRadius} ${
        active
          ? "border-slate-200 bg-slate-100 text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[linear-gradient(180deg,#121d2b_0%,#101826_100%)] dark:text-white dark:shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
          : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:text-white/50 dark:hover:border-white/[0.05] dark:hover:bg-white/[0.03] dark:hover:text-white/82"
      }`}
    >
      <span
        className={`flex shrink-0 items-center justify-center ${density.itemIcon} ${
          active
            ? "bg-slate-200 text-slate-800 dark:bg-[#182434] dark:text-[#8df126]"
            : "bg-slate-100 text-slate-500 dark:bg-white/[0.035] dark:text-white/42"
        }`}
      >
        <Icon type={icon} className={density.itemIconSize} />
      </span>

      {!collapsed && <span className={`flex-1 font-medium ${density.itemText}`}>{label}</span>}

      {!collapsed && (
        <span
          className={`h-2 w-2 rounded-full transition ${
            active ? "bg-[#8df126]" : "bg-transparent"
          }`}
        />
      )}
    </Link>
  );
}

export default function AreaMembrosSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const density = useSidebarDensity();

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem("alpha_tips_sidebar_collapsed")
        : null;

    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;

      if (typeof window !== "undefined") {
        window.localStorage.setItem("alpha_tips_sidebar_collapsed", String(next));
      }

      return next;
    });
  }

  return (
    <aside
      className={`relative z-30 hidden h-screen shrink-0 border-r backdrop-blur-xl transition-all duration-300 xl:sticky xl:top-0 xl:flex xl:flex-col ${
        collapsed ? "w-[92px]" : density.width
      } border-slate-200 bg-[rgba(255,255,255,0.88)] dark:border-white/[0.06] dark:bg-[rgba(7,12,20,0.88)]`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-32 w-full bg-gradient-to-b from-[#8df126]/8 to-transparent dark:from-[#8df126]/6" />
      </div>

      <div
        className={`relative flex items-center border-b ${density.headerHeight} ${
          collapsed ? "justify-center px-3" : `justify-between ${density.headerPadding}`
        } border-slate-200 dark:border-white/[0.06]`}
      >
        {collapsed ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-[#8df126]/12 text-[22px] font-black leading-none text-[#8df126]">
            α
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className={`flex items-center justify-center bg-[#8df126]/12 font-black leading-none text-[#8df126] shadow-[inset_0_0_0_1px_rgba(141,241,38,0.18)] ${density.brandBox}`}>
              α
            </div>

            <div>
              <div className={`font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-white/34 ${density.brandEyebrow}`}>
                Painel de Membros
              </div>
              <div className={`font-extrabold tracking-[-0.03em] text-slate-900 dark:text-white ${density.brandTitle}`}>
                ALPHA <span className="text-[#8df126]">TIPS</span>
              </div>
            </div>
          </div>
        )}

        {!collapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className={`inline-flex items-center justify-center border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/68 dark:hover:bg-white/[0.06] dark:hover:text-white ${density.collapseBtn}`}
            title="Recolher sidebar"
          >
            <Icon type="menu-close" className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className={`relative flex flex-1 flex-col ${density.contentPadding}`}>
        {collapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="mb-2 inline-flex h-9 w-full items-center justify-center rounded-[14px] border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/68 dark:hover:bg-white/[0.06] dark:hover:text-white"
            title="Expandir sidebar"
          >
            <Icon type="menu-open" className="h-4 w-4" />
          </button>
        )}

        <nav className={density.sectionGap}>
          <SidebarSectionTitle collapsed={collapsed} first density={density}>
            Destaque
          </SidebarSectionTitle>

          <SidebarItem
            href="/area-membros/metodos"
            label="Métodos"
            icon="method"
            collapsed={collapsed}
            featured
            badge="Destaque"
            density={density}
          />

          <SidebarSectionTitle collapsed={collapsed} density={density}>
            Área
          </SidebarSectionTitle>

          <SidebarItem
            href="/area-membros"
            label="Resumo"
            icon="home"
            collapsed={collapsed}
            density={density}
          />
          <SidebarItem
            href="/area-membros/banca"
            label="Banca"
            icon="bank"
            collapsed={collapsed}
            density={density}
          />
          <SidebarItem
            href="/area-membros/simulador-progressao"
            label="Progressão"
            icon="progress"
            collapsed={collapsed}
            density={density}
          />

          <SidebarSectionTitle collapsed={collapsed} density={density}>
            Comunidade
          </SidebarSectionTitle>

          <SidebarItem
            href="/area-membros/palpites"
            label="Palpites"
            icon="palpites"
            collapsed={collapsed}
            density={density}
          />
          <SidebarItem
            href="/area-membros/ranking"
            label="Ranking"
            icon="ranking"
            collapsed={collapsed}
            density={density}
          />

          <SidebarSectionTitle collapsed={collapsed} density={density}>
            Conta
          </SidebarSectionTitle>

          <SidebarItem
            href="/area-membros/perfil"
            label="Perfil"
            icon="profile"
            collapsed={collapsed}
            density={density}
          />
          <SidebarItem
            href="/area-membros/assinatura"
            label="Assinatura"
            icon="subscription"
            collapsed={collapsed}
            density={density}
          />
        </nav>

        <div className="mt-auto pt-2">
          <ThemeToggleButton collapsed={collapsed} density={density} />
        </div>
      </div>
    </aside>
  );
}