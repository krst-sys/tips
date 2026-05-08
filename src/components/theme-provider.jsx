"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { applyTheme, getStoredTheme } from "@/components/theme-utils";

function ThemeClassSync() {
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  return null;
}

export default function SiteThemeProvider({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="theme"
      disableTransitionOnChange
    >
      <ThemeClassSync />
      {children}
    </ThemeProvider>
  );
}
