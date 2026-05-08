"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { applyTheme, getStoredTheme } from "@/components/theme-utils";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [activeTheme, setActiveTheme] = useState("dark");
  const { setTheme } = useTheme();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const currentTheme = getStoredTheme();
      applyTheme(currentTheme);
      setActiveTheme(currentTheme);
      setMounted(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!mounted) return null;

  const isDark = activeTheme === "dark";
  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    setActiveTheme(nextTheme);
    applyTheme(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:opacity-90 dark:border-white/10 dark:bg-white/10 dark:text-white"
    >
      {isDark ? "Modo claro" : "Modo escuro"}
    </button>
  );
}
