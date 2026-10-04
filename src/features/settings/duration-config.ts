import {
  MAX_DURATION_MINUTES,
  clampDurationMinutes,
  type DurationKind,
} from "@/lib/duration-limits";
import type { Settings } from "@/features/settings/settings-types";

export interface DurationConfig {
  /** Key on the section's local reducer state. */
  field: "workMin" | "shortBreakMin" | "longBreakMin";
  /** Key on the persisted settings record. */
  settingsKey: "workDuration" | "shortBreakDuration" | "longBreakDuration";
  /** Which policy ceiling applies. */
  kind: DurationKind;
  label: string;
  desc: string;
  maxMinutes: number;
}

/**
 * Single description of the Focus Rhythm inputs. Driven off the duration
 * policy so a ceiling change reaches the UI without a second edit.
 */
export const DURATION_CONFIGS: readonly DurationConfig[] = [
  {
    field: "workMin",
    settingsKey: "workDuration",
    kind: "work",
    label: "Focus Duration",
    desc: "Recommended length for deep work sessions.",
    maxMinutes: MAX_DURATION_MINUTES.work,
  },
  {
    field: "shortBreakMin",
    settingsKey: "shortBreakDuration",
    kind: "shortBreak",
    label: "Short Break",
    desc: "Quick pause to refresh your mind.",
    maxMinutes: MAX_DURATION_MINUTES.shortBreak,
  },
  {
    field: "longBreakMin",
    settingsKey: "longBreakDuration",
    kind: "longBreak",
    label: "Long Break",
    desc: "Extended rest after a full set of focus sessions.",
    maxMinutes: MAX_DURATION_MINUTES.longBreak,
  },
] as const;

export type DurationField = (typeof DURATION_CONFIGS)[number]["field"];

export interface DurationFormState {
  workMin: number;
  shortBreakMin: number;
  longBreakMin: number;
}

/** Reads the form state off persisted settings (which are in seconds). */
export function durationFormFromSettings(
  settings: Settings,
): DurationFormState {
  return {
    workMin: Math.round(settings.workDuration / 60),
    shortBreakMin: Math.round(settings.shortBreakDuration / 60),
    longBreakMin: Math.round(settings.longBreakDuration / 60),
  };
}

/** Turns form state into the seconds the settings record stores. */
export function settingsFromDurationForm(
  form: DurationFormState,
): Record<DurationConfig["settingsKey"], number> {
  const out = {} as Record<DurationConfig["settingsKey"], number>;
  for (const config of DURATION_CONFIGS) {
    out[config.settingsKey] =
      clampDurationMinutes(config.kind, form[config.field]) * 60;
  }
  return out;
}
