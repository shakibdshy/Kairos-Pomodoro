/**
 * Lightweight daily productivity score (0–100).
 *
 * Pure function, no DB access — keeps it trivially unit-testable and lets the
 * caller (analytics layer) supply the inputs from existing queries.
 *
 * Weights (sum = 100):
 *   - Focus time    50 pts  (caps at DAILY_FOCUS_CAP seconds; 2h = full marks)
 *   - Completion    20 pts  (share of started sessions that got completed)
 *   - Consistency   20 pts  (streak bonus, full at 7+ days)
 *   - Mood          10 pts  (focused=1, neutral=0.5, distracted=0)
 *
 * Intentionally simple — "lightweight insights", per the v1.3 brief. Tunable.
 */
export interface ScoreInput {
  /** Total focus seconds for the day (work phases only). */
  focusSeconds: number;
  /** Sessions started today. */
  sessionsStarted: number;
  /** Sessions completed today. */
  sessionsCompleted: number;
  /** Current streak in days. */
  streakDays: number;
  /** Mood entries for the day: counts per mood. */
  moodCounts?: { focused?: number; neutral?: number; distracted?: number };
}

export const DAILY_FOCUS_CAP_SECONDS = 2 * 60 * 60; // 2 hours
export const STREAK_FULL_DAYS = 7;

export function computeDailyScore(input: ScoreInput): number {
  const {
    focusSeconds,
    sessionsStarted,
    sessionsCompleted,
    streakDays,
    moodCounts,
  } = input;

  // Focus time: linear up to the cap.
  const focusPts =
    50 * Math.min(1, Math.max(0, focusSeconds) / DAILY_FOCUS_CAP_SECONDS);

  // Completion rate: of started sessions, how many completed.
  const completionRate =
    sessionsStarted > 0
      ? Math.min(1, Math.max(0, sessionsCompleted) / sessionsStarted)
      : 0;
  const completionPts = 20 * completionRate;

  // Streak: full marks at STREAK_FULL_DAYS, scaled before that.
  const streakPts =
    20 * Math.min(1, Math.max(0, streakDays) / STREAK_FULL_DAYS);

  // Mood: weighted average of today's mood entries.
  const m = moodCounts ?? {};
  const totalMood = (m.focused ?? 0) + (m.neutral ?? 0) + (m.distracted ?? 0);
  let moodPts = 0;
  if (totalMood > 0) {
    const moodScore =
      (m.focused ?? 0) * 1 + (m.neutral ?? 0) * 0.5 + (m.distracted ?? 0) * 0;
    moodPts = 10 * (moodScore / totalMood);
  }

  const total = focusPts + completionPts + streakPts + moodPts;
  // Clamp and round to integer.
  return Math.max(0, Math.min(100, Math.round(total)));
}
