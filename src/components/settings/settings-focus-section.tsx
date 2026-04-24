import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

const DURATION_CONFIGS = [
  {
    key: "workMin" as const,
    label: "Focus Duration",
    desc: "Recommended length for deep work sessions.",
    max: 120,
  },
  {
    key: "shortBreakMin" as const,
    label: "Short Break",
    desc: "Quick pause to refresh your mind.",
    max: 30,
  },
  {
    key: "longBreakMin" as const,
    label: "Long Break",
    desc: "Extended rest after 4 focus sessions.",
    max: 60,
  },
];

interface DurationValues {
  workMin: number;
  shortBreakMin: number;
  longBreakMin: number;
}

interface Setters {
  workMin: (v: number) => void;
  shortBreakMin: (v: number) => void;
  longBreakMin: (v: number) => void;
}

interface SettingsFocusSectionProps {
  durationValues: DurationValues;
  setters: Setters;
  onSave: () => void;
}

export function SettingsFocusSection({
  durationValues,
  setters,
  onSave,
}: SettingsFocusSectionProps) {
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
          onClick={onSave}
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
                value={durationValues[key]}
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
