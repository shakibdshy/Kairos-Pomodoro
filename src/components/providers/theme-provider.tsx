import { useEffect, type ReactNode } from "react";
import { useSettingsStore } from "@/features/settings/use-settings-store";
import type { ThemeMode } from "@/features/settings/settings-types";

interface ThemeProviderProps {
  children: ReactNode;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement;
  const resolved = mode === "system" ? getSystemTheme() : mode;

  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const settings = useSettingsStore((s) => s.settings);
  const loaded = useSettingsStore((s) => s.loaded);

  useEffect(() => {
    if (!loaded) return;

    applyTheme(settings.theme);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (settings.theme === "system") {
        applyTheme("system");
      }
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [loaded, settings.theme]);

  return <>{children}</>;
}
