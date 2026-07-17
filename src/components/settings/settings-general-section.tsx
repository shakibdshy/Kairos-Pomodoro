import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/cn";
import { Moon, Sun, Monitor, Circle, Activity, RefreshCw, CheckCircle2, AlertCircle, Download } from "lucide-react";
import type { ThemeMode, ThemePreset } from "@/features/settings/settings-types";
import { useUpdate } from "@/components/providers/update-provider";

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

const TIMER_STYLES: { id: "solid" | "zigzag"; label: string; icon: typeof Activity }[] = [
  { id: "solid", label: "Solid", icon: Circle },
  { id: "zigzag", label: "Zigzag", icon: Activity },
];

interface PresetPreviewTone {
  primary: string;
  bg: string;
  text: string;
}

const PRESET_OPTIONS: {
  id: ThemePreset;
  label: string;
  preview: {
    light: PresetPreviewTone;
    dark: PresetPreviewTone;
  };
}[] = [
  {
    id: "sahara",
    label: "Sahara",
    preview: {
      light: { primary: "#c2652a", bg: "#faf5ee", text: "#3a302a" },
      dark: { primary: "#d97a3a", bg: "#1a1714", text: "#e8e0d8" },
    },
  },
  {
    id: "forest",
    label: "Forest",
    preview: {
      light: { primary: "#2f7d5b", bg: "#f3f7f4", text: "#243029" },
      dark: { primary: "#4a9c75", bg: "#151b18", text: "#dde6e0" },
    },
  },
  {
    id: "ocean",
    label: "Ocean",
    preview: {
      light: { primary: "#2566a8", bg: "#f1f6fb", text: "#1f2c38" },
      dark: { primary: "#4787c9", bg: "#131a22", text: "#d8e0e8" },
    },
  },
  {
    id: "mono",
    label: "Mono",
    preview: {
      light: { primary: "#2f2f2f", bg: "#f6f6f6", text: "#1a1a1a" },
      dark: { primary: "#e8e8e8", bg: "#161616", text: "#e8e8e8" },
    },
  },
];

interface ToggleItem {
  label: string;
  desc: string;
  key: "autoStartBreaks";
}

const TOGGLE_ITEMS: ToggleItem[] = [
  {
    label: "Auto-start breaks",
    desc: "Automatically start break timer after focus",
    key: "autoStartBreaks",
  },
];

interface SettingsGeneralProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  themePreset: ThemePreset;
  onThemePresetChange: (preset: ThemePreset) => void;
  timerStyle: "solid" | "zigzag";
  onTimerStyleChange: (style: "solid" | "zigzag") => void;
  settings: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
}

export function SettingsGeneralSection({
  currentTheme,
  onThemeChange,
  themePreset,
  onThemePresetChange,
  timerStyle,
  onTimerStyleChange,
  settings,
  onToggle,
}: SettingsGeneralProps) {
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (currentTheme !== "system") {
      setResolvedTheme(currentTheme);
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncResolvedTheme = () =>
      setResolvedTheme(mediaQuery.matches ? "dark" : "light");

    syncResolvedTheme();
    mediaQuery.addEventListener("change", syncResolvedTheme);
    return () =>
      mediaQuery.removeEventListener("change", syncResolvedTheme);
  }, [currentTheme]);

  return (
    <section>
      <h3 className="font-serif text-xl md:text-2xl text-sahara-text mb-6 md:mb-8">
        Appearance
      </h3>
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {THEME_OPTIONS.map((theme) => (
          <Button
            key={theme.id}
            variant="outline"
            intent="sahara"
            size="md"
            shape="rounded-2xl"
            active={currentTheme === theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={cn(
              "flex-col gap-2 md:gap-3 p-4 md:p-6",
              currentTheme === theme.id
                ? ""
                : "bg-sahara-surface border-sahara-border/20 text-sahara-text-muted hover:border-sahara-primary/30",
            )}
          >
            <theme.icon className="size-5 md:w-6 md:h-6" />
            <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase">
              {theme.label}
            </span>
          </Button>
        ))}
      </div>

      <div className="mt-12">
        <h3 className="font-serif text-xl md:text-2xl text-sahara-text mb-2 md:mb-3">
          Color Theme
        </h3>
        <p className="text-xs text-sahara-text-muted mb-6 md:mb-8">
          Choose the accent palette for the app.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {PRESET_OPTIONS.map((preset) => {
            const preview = preset.preview[resolvedTheme];

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onThemePresetChange(preset.id)}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 md:p-5 rounded-2xl border-2 transition-all",
                  themePreset === preset.id
                    ? "border-sahara-primary shadow-sm shadow-sahara-primary/10"
                    : "border-sahara-border/20 hover:border-sahara-primary/30",
                )}
                style={{ backgroundColor: preview.bg }}
              >
                <span
                  className="size-8 md:size-10 rounded-full shrink-0 shadow-inner"
                  style={{ backgroundColor: preview.primary }}
                />
                <span
                  className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: preview.text }}
                >
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-12">
        <h3 className="font-serif text-xl md:text-2xl text-sahara-text mb-6 md:mb-8">
          Timer Animation Style
        </h3>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {TIMER_STYLES.map((style) => (
            <Button
              key={style.id}
              variant="outline"
              intent="sahara"
              size="md"
              shape="rounded-2xl"
              active={timerStyle === style.id}
              onClick={() => onTimerStyleChange(style.id)}
              className={cn(
                "flex-col gap-2 md:gap-3 p-4 md:p-6",
                timerStyle === style.id
                  ? ""
                  : "bg-sahara-surface border-sahara-border/20 text-sahara-text-muted hover:border-sahara-primary/30",
              )}
            >
              <style.icon className="size-5 md:w-6 md:h-6" />
              <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase">
                {style.label}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {TOGGLE_ITEMS.map(({ label, desc, key }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <div className="flex-1">
              <span className="font-bold text-sahara-text-secondary text-sm block">
                {label}
              </span>
              <span className="text-[11px] text-sahara-text-muted mt-0.5 block">
                {desc}
              </span>
            </div>
            <Switch
              checked={settings[key]}
              onCheckedChange={(v) => onToggle(key, v)}
              className="ml-4"
            />
          </div>
        ))}
      </div>

      <UpdatesSection />
    </section>
  );
}

/** Manual update-check trigger + status. No-op outside the UpdateProvider (tests/dev). */
function UpdatesSection() {
  const update = useUpdate();
  if (!update) return null;
  return <UpdatesSectionInner update={update} />;
}

function UpdatesSectionInner({
  update,
}: {
  update: NonNullable<ReturnType<typeof useUpdate>>;
}) {
  const { status, checkForUpdate } = update;
  const checking = status.kind === "checking";

  const statusText =
    status.kind === "checking"
      ? "Checking…"
      : status.kind === "up-to-date"
        ? "You're on the latest version."
        : status.kind === "available"
          ? `v${status.update.version} is available.`
          : status.kind === "error"
            ? "Check failed — see console for details."
            : "";

  const StatusIcon =
    status.kind === "up-to-date"
      ? CheckCircle2
      : status.kind === "available"
        ? Download
        : status.kind === "error"
          ? AlertCircle
          : RefreshCw;

  const statusTone =
    status.kind === "up-to-date"
      ? "text-emerald-400"
      : status.kind === "available"
        ? "text-sahara-primary"
        : status.kind === "error"
          ? "text-red-400"
          : "text-sahara-text-muted";

  return (
    <div className="mt-12">
      <h3 className="font-serif text-xl md:text-2xl text-sahara-text mb-2 md:mb-3">
        Updates
      </h3>
      <p className="text-xs text-sahara-text-muted mb-4">
        Kairos checks for updates automatically on launch and every 24 hours. You can also check manually.
      </p>
      <div className="flex items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <StatusIcon
            className={cn("size-4 shrink-0", statusTone, checking && "animate-spin")}
          />
          <span className="text-xs text-sahara-text-secondary truncate">
            {statusText}
          </span>
        </div>
        <Button
          variant="outline"
          intent="default"
          size="sm"
          shape="rounded-xl"
          onClick={() => void checkForUpdate()}
          disabled={checking}
          className="text-[10px] gap-1.5 shrink-0"
        >
          <RefreshCw className={cn("size-3", checking && "animate-spin")} />
          {checking ? "Checking…" : "Check for Updates"}
        </Button>
      </div>
    </div>
  );
}
