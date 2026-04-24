import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/cn";
import { Moon, Sun, Monitor } from "lucide-react";
import type { ThemeMode } from "@/features/settings/settings-types";

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

interface ToggleItem {
  label: string;
  desc: string;
  key: "autoStartBreaks" | "respectDnd";
}

const TOGGLE_ITEMS: ToggleItem[] = [
  {
    label: "Auto-start breaks",
    desc: "Automatically start break timer after focus",
    key: "autoStartBreaks",
  },
  {
    label: "Respect Do Not Disturb",
    desc: "Mute notifications when DnD is active",
    key: "respectDnd",
  },
];

interface SettingsGeneralProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  settings: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
}

export function SettingsGeneralSection({
  currentTheme,
  onThemeChange,
  settings,
  onToggle,
}: SettingsGeneralProps) {
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
            <theme.icon className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase">
              {theme.label}
            </span>
          </Button>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        {TOGGLE_ITEMS.map(({ label, desc, key }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <div>
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
    </section>
  );
}
