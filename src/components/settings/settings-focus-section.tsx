import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/features/settings/use-settings-store";
import { Save } from "lucide-react";

const DURATION_CONFIGS = [
  {
    key: "workMin" as const,
    label: "Focus Duration",
    desc: "Recommended length for deep work sessions.",
    max: 120,
    settingsKey: "workDuration" as const,
  },
  {
    key: "shortBreakMin" as const,
    label: "Short Break",
    desc: "Quick pause to refresh your mind.",
    max: 30,
    settingsKey: "shortBreakDuration" as const,
  },
  {
    key: "longBreakMin" as const,
    label: "Long Break",
    desc: "Extended rest after 4 focus sessions.",
    max: 60,
    settingsKey: "longBreakDuration" as const,
  },
];

export function SettingsFocusSection() {
  const settings = useSettingsStore((s) => s.settings);
  const loaded = useSettingsStore((s) => s.loaded);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const [workMin, setWorkMin] = useState(25);
  const [shortBreakMin, setShortBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);

  useEffect(() => {
    if (loaded) {
      setWorkMin(Math.round(settings.workDuration / 60));
      setShortBreakMin(Math.round(settings.shortBreakDuration / 60));
      setLongBreakMin(Math.round(settings.longBreakDuration / 60));
    }
  }, [
    loaded,
    settings.workDuration,
    settings.shortBreakDuration,
    settings.longBreakDuration,
  ]);

  const handleSave = async () => {
    if (!loaded) return;
    await Promise.all([
      updateSetting("workDuration", workMin * 60),
      updateSetting("shortBreakDuration", shortBreakMin * 60),
      updateSetting("longBreakDuration", longBreakMin * 60),
    ]);
  };

  const setters = {
    workMin: setWorkMin,
    shortBreakMin: setShortBreakMin,
    longBreakMin: setLongBreakMin,
  };

  const values = { workMin, shortBreakMin, longBreakMin };

  return (
    <section>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h3 className="font-serif text-xl md:text-2xl text-sahara-text">
          Focus Rhythm
        </h3>
        <Button
          variant="link"
          intent="sahara"
          size="xs"
          onClick={handleSave}
          className="gap-2"
        >
          <Save className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase hidden sm:inline">
            Save Changes
          </span>
        </Button>
      </div>

      <div className="space-y-6 md:space-y-8">
        {DURATION_CONFIGS.map(({ key, label, desc, max }) => (
          <div
            key={key}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 group"
          >
            <div>
              <h4 className="font-bold text-sahara-text-secondary text-sm">
                {label}
              </h4>
              <p className="text-xs text-sahara-text-muted mt-0.5">{desc}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-center">
              <input
                type="number"
                min={1}
                max={max}
                value={values[key]}
                onChange={(e) =>
                  setters[key](
                    Math.min(
                      max,
                      Math.max(1, parseInt(e.target.value, 10) || 1),
                    ),
                  )
                }
                className="w-18 bg-sahara-card border border-sahara-border/20 rounded-xl px-3 md:px-4 py-2 text-center text-sm font-bold text-sahara-primary outline-none focus:border-sahara-primary/40 transition-colors"
              />
              <span className="text-[9px] md:text-[10px] font-bold text-sahara-text-muted uppercase tracking-widest">
                Min
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
