"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import enUS from "@/i18n/locales/en-US.json";
import ptBR from "@/i18n/locales/pt-BR.json";

export const DEFAULT_LOCALE = "pt-BR";
export const LANGUAGE_COOKIE = "filtto-language";

export const LANGUAGES = [
  {
    code: "pt-BR",
    flag: "🇧🇷",
    shortLabel: "PT",
    labelKey: "language.portuguese",
  },
  {
    code: "en-US",
    flag: "🇺🇸",
    shortLabel: "EN",
    labelKey: "language.english",
  },
];

const dictionaries = {
  "pt-BR": ptBR,
  "en-US": enUS,
};

const LanguageContext = createContext(null);

function getNestedValue(source, key) {
  if (typeof key !== "string" || key.length === 0) return undefined;
  return key.split(".").reduce((current, segment) => current?.[segment], source);
}

function interpolate(value, params) {
  if (!params) return value;

  return Object.entries(params).reduce((text, [key, replacement]) => {
    return text.replaceAll(`{{${key}}}`, String(replacement));
  }, value);
}

function readCookieLocale() {
  if (typeof document === "undefined") return DEFAULT_LOCALE;

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${LANGUAGE_COOKIE}=`));
  const value = cookie ? decodeURIComponent(cookie.split("=")[1]) : "";

  return dictionaries[value] ? value : DEFAULT_LOCALE;
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = window.localStorage.getItem(LANGUAGE_COOKIE);
        setLocaleState(dictionaries[stored] ? stored : readCookieLocale());
      } catch {
        setLocaleState(readCookieLocale());
      }
    });
  }, []);

  const setLocale = (nextLocale) => {
    if (!dictionaries[nextLocale]) return;

    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale;
    document.cookie = `${LANGUAGE_COOKIE}=${encodeURIComponent(nextLocale)}; path=/; max-age=31536000; samesite=lax`;

    try {
      window.localStorage.setItem(LANGUAGE_COOKIE, nextLocale);
    } catch {
      // localStorage can be unavailable in private contexts; the cookie still keeps the preference.
    }
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => {
    const t = (key, params) => {
      const currentValue = getNestedValue(dictionaries[locale], key);
      const fallbackValue = getNestedValue(dictionaries[DEFAULT_LOCALE], key);
      const translated = typeof currentValue === "string" ? currentValue : fallbackValue;

      return interpolate(typeof translated === "string" ? translated : key, params);
    };

    return {
      language: LANGUAGES.find((item) => item.code === locale) || LANGUAGES[0],
      languages: LANGUAGES,
      locale,
      setLocale,
      t,
    };
  }, [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
