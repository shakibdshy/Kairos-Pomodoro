import type { TimerPhase } from "@/features/timer/timer-types";

export function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

const PHASE_CONFIG = {
  work:        { color: "text-sahara-primary",       bg: "bg-sahara-primary", label: "Focus" },
  short_break: { color: "text-sahara-text-secondary", bg: "bg-sahara-card",   label: "Short Break" },
  long_break:  { color: "text-sahara-text-muted",     bg: "bg-sahara-card",   label: "Long Break" },
} as const;

export function getPhaseColor(phase: TimerPhase): string {
  return PHASE_CONFIG[phase].color;
}

export function getPhaseBg(phase: TimerPhase): string {
  return PHASE_CONFIG[phase].bg;
}

export function getPhaseLabel(phase: TimerPhase): string {
  return PHASE_CONFIG[phase].label;
}

export function formatTimeAmPm(date: Date): string {
  let h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")}${ampm}`;
}
