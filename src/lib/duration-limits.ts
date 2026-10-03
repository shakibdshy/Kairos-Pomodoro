/**
 * Session-duration policy — the single source of truth for how long a session
 * may be.
 *
 * Every surface that accepts a duration reads its ceiling from here: the
 * Focus Rhythm settings inputs, the settings sliders, the preset editor
 * steppers, and the timer duration field. These used to disagree (60m in the
 * settings panel, 99m59s in the timer display, 120m in the Focus Rhythm
 * inputs), so a value one screen accepted was silently truncated by another.
 *
 * Reasoning for the numbers: a focus session longer than three hours stops
 * being a focus session, so work caps at 180m. Breaks stay short enough that
 * the work-to-rest ratio keeps working — even a 180m focus is followed by a
 * 30m short break — so short caps at 30m and long at 60m.
 */
export const MAX_DURATION_MINUTES = {
  work: 180,
  shortBreak: 30,
  longBreak: 60,
} as const;

export type DurationKind = keyof typeof MAX_DURATION_MINUTES;

export const MAX_DURATION_SECONDS = {
  work: MAX_DURATION_MINUTES.work * 60,
  shortBreak: MAX_DURATION_MINUTES.shortBreak * 60,
  longBreak: MAX_DURATION_MINUTES.longBreak * 60,
} as const;

export const MIN_DURATION_MINUTES = 1;
export const MIN_DURATION_SECONDS = MIN_DURATION_MINUTES * 60;

/** Clamps a duration in seconds to the floor and ceiling for its kind. */
export function clampDurationSeconds(
  kind: DurationKind,
  seconds: number,
): number {
  return Math.min(
    MAX_DURATION_SECONDS[kind],
    Math.max(MIN_DURATION_SECONDS, Math.floor(seconds)),
  );
}

/** Clamps a duration in minutes to the ceiling for its kind. */
export function clampDurationMinutes(
  kind: DurationKind,
  minutes: number,
): number {
  return Math.min(
    MAX_DURATION_MINUTES[kind],
    Math.max(MIN_DURATION_MINUTES, Math.floor(minutes)),
  );
}

/** True when a stored preset duration exceeds the policy for its kind. */
export function exceedsMaxDuration(
  kind: DurationKind,
  seconds: number,
): boolean {
  return seconds > MAX_DURATION_SECONDS[kind];
}

/**
 * The longest duration any single phase may hold. The timer duration field
 * edits whichever phase is current, so it must be able to represent the
 * largest ceiling rather than picking one.
 */
export const MAX_ANY_DURATION_SECONDS = Math.max(
  ...Object.values(MAX_DURATION_SECONDS),
);
