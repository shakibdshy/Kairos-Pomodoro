import type { TimerPhase } from "@/features/timer/timer-types";

export function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function getPhaseColor(phase: TimerPhase): string {
  switch (phase) {
    case "work":
      return "text-sahara-primary";
    case "short_break":
      return "text-sahara-text-secondary";
    case "long_break":
      return "text-sahara-text-muted";
  }
}

export function getPhaseBg(phase: TimerPhase): string {
  switch (phase) {
    case "work":
      return "bg-sahara-primary";
    case "short_break":
      return "bg-sahara-card";
    case "long_break":
      return "bg-sahara-card";
  }
}

export function getPhaseLabel(phase: TimerPhase): string {
  switch (phase) {
    case "work":
      return "Focus";
    case "short_break":
      return "Short Break";
    case "long_break":
      return "Long Break";
  }
}
