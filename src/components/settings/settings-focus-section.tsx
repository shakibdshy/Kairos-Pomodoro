import { useReducer } from "react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/features/settings/use-settings-store";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { Save } from "lucide-react";
import { clampDurationMinutes } from "@/lib/duration-limits";
import {
  DURATION_CONFIGS,
  durationFormFromSettings,
  settingsFromDurationForm,
  type DurationField,
  type DurationFormState,
} from "@/features/settings/duration-config";

type FocusAction =
  | { type: "SYNC"; payload: DurationFormState }
  | { type: "SET_FIELD"; field: DurationField; value: number };

function focusReducer(
  _state: DurationFormState,
  action: FocusAction,
): DurationFormState {
  switch (action.type) {
    case "SYNC":
      return action.payload;
    case "SET_FIELD":
      return { ..._state, [action.field]: action.value };
  }
}

export function SettingsFocusSection() {
  const settings = useSettingsStore((s) => s.settings);
  const loaded = useSettingsStore((s) => s.loaded);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const setDurations = useTimerStore((s) => s.setDurations);

  const [state, dispatch] = useReducer(
    focusReducer,
    durationFormFromSettings(settings),
  );

  const syncedFrom = durationFormFromSettings(settings);
  if (loaded && state.workMin !== syncedFrom.workMin) {
    dispatch({ type: "SYNC", payload: syncedFrom });
  }

  const handleSave = async () => {
    if (!loaded) return;
    const next = settingsFromDurationForm(state);
    await Promise.all(
      DURATION_CONFIGS.map((c) =>
        updateSetting(c.settingsKey, next[c.settingsKey]),
      ),
    );
    setDurations(
      next.workDuration,
      next.shortBreakDuration,
      next.longBreakDuration,
    );
  };

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
          <Save className="size-3.5 md:w-4 md:h-4" />
          <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase hidden sm:inline">
            Save Changes
          </span>
        </Button>
      </div>

      <div className="space-y-6 md:space-y-8">
        {DURATION_CONFIGS.map(({ field, label, desc, maxMinutes, kind }) => (
          <div
            key={field}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 group"
          >
            <div>
              <h4 className="font-semibold text-sahara-text-secondary text-sm">
                {label}
              </h4>
              <p className="text-xs text-sahara-text-muted mt-0.5">
                {desc} Up to {maxMinutes} min.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-center">
              <input
                type="number"
                min={1}
                max={maxMinutes}
                value={state[field]}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field,
                    value: clampDurationMinutes(
                      kind,
                      parseInt(e.target.value, 10) || 1,
                    ),
                  })
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
