"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function Icon({ type, className = "h-5 w-5" }) {
  if (type === "home") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M4 10.5L12 4L20 10.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 9.5V19H17.5V9.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "bank") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M4 10L12 5L20 10"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M6 10V18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M10 10V18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M14 10V18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M18 10V18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4 19H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "chart") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M5 18V11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M10 18V7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M15 18V13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M20 18V9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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

  return null;
}

function SidebarItem({ href, label, icon, collapsed }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`group flex items-center rounded-[15px] border transition ${
        collapsed
          ? "justify-center px-2 py-3"
          : "gap-3 px-4 py-3"
      } ${
        active
          ? "border-white/[0.08] bg-[linear-gradient(180deg,#121d2b_0%,#101826_100%)] text-white shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
          : "border-transparent text-white/50 hover:border-white/[0.05] hover:bg-white/[0.025] hover:text-white/82"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] ${
          active
            ? "bg-[#182434] text-[#8df126]"
            : "bg-white/[0.035] text-white/42"
        }`}
      >
        <Icon type={icon} className="h-4 w-4" />
      </span>

      {!collapsed && <span className="flex-1">{label}</span>}

      {!collapsed && active && <span className="h-2 w-2 rounded-full bg-[#8df126]" />}
    </Link>
  );
}

export default function AreaMembrosSidebar() {
  const [collapsed, setCollapsed] = useState(false);

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
      className={`relative z-30 hidden h-full shrink-0 border-r border-white/[0.06] bg-[rgba(9,15,24,0.84)] backdrop-blur-xl transition-all duration-300 xl:flex xl:flex-col ${
        collapsed ? "w-[92px]" : "w-[290px]"
      }`}
    >
      <div
        className={`flex h-[84px] items-center border-b border-white/[0.06] ${
          collapsed ? "justify-center px-3" : "justify-between px-6"
        }`}
      >
        {collapsed ? (
          <div className="text-[42px] font-black leading-none text-[#8df126]">α</div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-[42px] font-black leading-none text-[#8df126]">
              α
            </div>
            <div className="text-[23px] font-extrabold tracking-[-0.03em] text-white">
              ALPHA <span className="text-[#8df126]">TIPS</span>
            </div>
          </div>
        )}

        {!collapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/[0.06] bg-white/[0.03] text-white/68 transition hover:bg-white/[0.06] hover:text-white"
            title="Recolher sidebar"
          >
            <Icon type="menu-close" className="h-4 w-4" />
          </button>
        )}
      </div>

      <div
        className={`flex flex-1 flex-col ${
          collapsed ? "px-2 py-5" : "px-4 py-5"
        }`}
      >
        {collapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="mb-3 inline-flex h-11 w-full items-center justify-center rounded-[14px] border border-white/[0.06] bg-white/[0.03] text-white/68 transition hover:bg-white/[0.06] hover:text-white"
            title="Expandir sidebar"
          >
            <Icon type="menu-open" className="h-4 w-4" />
          </button>
        )}

        <nav className="space-y-2">
          <SidebarItem
            href="/area-membros"
            label="Resumo"
            icon="home"
            collapsed={collapsed}
          />
          <SidebarItem
            href="/area-membros/banca"
            label="Banca"
            icon="bank"
            collapsed={collapsed}
          />
          <SidebarItem
            href="/area-membros/resultados"
            label="Resultados"
            icon="chart"
            collapsed={collapsed}
          />
        </nav>

        <div
          className={`mt-auto rounded-[18px] border border-white/[0.06] bg-[linear-gradient(180deg,#101925_0%,#0d151f_100%)] ${
            collapsed ? "p-3" : "p-4"
          }`}
        >
          {collapsed ? (
            <div className="flex items-center justify-center">
              <div className="text-[18px] font-black text-[#8df126]">α</div>
            </div>
          ) : (
            <>
              <p className="text-[12px] font-semibold text-white">Alpha Tips</p>
              <p className="mt-1 text-[12px] text-white/42">
                Área interna premium
              </p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}