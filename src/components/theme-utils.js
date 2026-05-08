export const THEME_STORAGE_KEY = "theme";

export function getStoredTheme() {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "dark";
}

export function applyTheme(theme) {
  if (typeof document === "undefined") return;

  const nextTheme = theme === "light" ? "light" : "dark";
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  document.documentElement.style.colorScheme = nextTheme;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    // Private browsing can block localStorage. The DOM class is still applied.
  }
}
