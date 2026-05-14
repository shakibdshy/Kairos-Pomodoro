import type { TimerPhase } from "@/features/timer/timer-types";
import { POMOS_BEFORE_LONG_BREAK } from "@/lib/constants";

interface TimerDurations {
  work: number;
  short: number;
  long: number;
}

export function getPhaseDuration(
  phase: TimerPhase,
  durations: TimerDurations,
): number {
  return durations[
    phase === "work" ? "work" : phase === "short_break" ? "short" : "long"
  ];
}

export function getPhaseDurationKey(
  phase: TimerPhase,
): keyof TimerDurations {
  return phase === "work" ? "work" : phase === "short_break" ? "short" : "long";
}

export function determineBreakPhase(
  durationSec: number,
  durations: TimerDurations,
): TimerPhase {
  const longDelta = Math.abs(durationSec - durations.long);
  const shortDelta = Math.abs(durationSec - durations.short);
  return longDelta <= shortDelta ? "long_break" : "short_break";
}

export function getNextPhase(
  currentPhase: TimerPhase,
  pomosCompleted: number,
  durations: TimerDurations,
): { phase: TimerPhase; duration: number } {
  if (currentPhase === "work") {
    if (pomosCompleted % POMOS_BEFORE_LONG_BREAK === 0) {
      return { phase: "long_break", duration: durations.long };
    }
    return { phase: "short_break", duration: durations.short };
  }
  return { phase: "work", duration: durations.work };
}

export type { TimerDurations };
