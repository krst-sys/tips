"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function LanguageSwitcher({ className = "", light = false }) {
  const { language, languages, locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buttonClass = light
    ? open
      ? "border-[#087f32]/35 bg-[#087f32]/10 text-[#171a17]"
      : "border-[#d8d5cb] bg-white/80 text-[#293129] hover:bg-white"
    : open
      ? "border-emerald-500/35 bg-emerald-500/10 text-[var(--gp-text)]"
      : "border-[var(--gp-border)] bg-[var(--gp-surface)] text-[var(--gp-text-secondary)] hover:bg-[var(--gp-hover)] hover:text-[var(--gp-text)]";

  const menuClass = light
    ? "border-[#d8d5cb] bg-white text-[#171a17] shadow-[0_18px_40px_rgba(31,32,28,0.12)]"
    : "gp-elevated border";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        title={t("language.selectorLabel")}
        aria-label={t("language.selectorLabel")}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex h-10 items-center gap-2 rounded-[9px] border px-2.5 text-[13px] font-semibold transition ${buttonClass}`}
      >
        <span className="text-[15px] leading-none">{language.flag}</span>
        <span>{language.shortLabel}</span>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className={`absolute right-0 top-[calc(100%+10px)] z-50 w-[210px] overflow-hidden rounded-[12px] p-2 ${menuClass}`}>
          {languages.map((item) => {
            const active = item.code === locale;

            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLocale(item.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-[9px] px-3 py-2.5 text-left transition ${
                  active
                    ? "bg-emerald-500/10 text-current"
                    : light
                      ? "text-[#596159] hover:bg-[#f2f5ef] hover:text-[#171a17]"
                      : "text-[var(--gp-text-secondary)] hover:bg-[var(--gp-hover)] hover:text-[var(--gp-text)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-[16px]">{item.flag}</span>
                  <span className="text-[13px] font-semibold">{t(item.labelKey)}</span>
                </span>
                {active ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
