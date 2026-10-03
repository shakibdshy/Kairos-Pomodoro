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

export function getPhaseDurationKey(phase: TimerPhase): keyof TimerDurations {
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

/**
 * Cadence for the long break. Guarded because the value is read from persisted
 * settings, which may be absent or corrupt — a non-positive cadence would make
 * the modulo below NaN and silently disable long breaks entirely.
 */
export function resolveLongBreakCadence(value: unknown): number {
  return typeof value === "number" && value >= 1
    ? Math.floor(value)
    : POMOS_BEFORE_LONG_BREAK;
}

export function getNextPhase(
  currentPhase: TimerPhase,
  pomosCompleted: number,
  durations: TimerDurations,
  /** Cadence for the long break; falls back to the default when unset. */
  pomosBeforeLongBreak: number = POMOS_BEFORE_LONG_BREAK,
): { phase: TimerPhase; duration: number } {
  if (currentPhase === "work") {
    const cadence = resolveLongBreakCadence(pomosBeforeLongBreak);
    if (pomosCompleted % cadence === 0) {
      return { phase: "long_break", duration: durations.long };
    }
    return { phase: "short_break", duration: durations.short };
  }
  return { phase: "work", duration: durations.work };
}

export type { TimerDurations };
