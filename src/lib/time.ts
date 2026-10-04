import type { TimerPhase } from "@/features/timer/timer-types";

export function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

const PHASE_LABELS = {
  work: "Focus",
  short_break: "Short Break",
  long_break: "Long Break",
} as const;

export function getPhaseLabel(phase: TimerPhase): string {
  return PHASE_LABELS[phase];
}

export function formatTimeAmPm(date: Date): string {
  let h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")}${ampm}`;
}
