import { describe, it, expect } from "vitest";
import {
  computeDailyScore,
  DAILY_FOCUS_CAP_SECONDS,
  STREAK_FULL_DAYS,
} from "@/lib/productivity-score";

describe("computeDailyScore", () => {
  it("returns 0 with no activity", () => {
    expect(
      computeDailyScore({
        focusSeconds: 0,
        sessionsStarted: 0,
        sessionsCompleted: 0,
        streakDays: 0,
      }),
    ).toBe(0);
  });

  it("caps focus contribution at DAILY_FOCUS_CAP_SECONDS", () => {
    const base = {
      sessionsStarted: 0,
      sessionsCompleted: 0,
      streakDays: 0,
    };
    const atCap = computeDailyScore({ ...base, focusSeconds: DAILY_FOCUS_CAP_SECONDS });
    const aboveCap = computeDailyScore({ ...base, focusSeconds: DAILY_FOCUS_CAP_SECONDS * 3 });
    expect(atCap).toBe(aboveCap); // no extra points past the cap
    expect(atCap).toBe(50); // full focus marks
  });

  it("scales focus linearly below the cap", () => {
    const base = {
      sessionsStarted: 0,
      sessionsCompleted: 0,
      streakDays: 0,
    };
    expect(
      computeDailyScore({ ...base, focusSeconds: DAILY_FOCUS_CAP_SECONDS / 2 }),
    ).toBe(25);
  });

  it("rewards completion rate of started sessions", () => {
    const base = {
      focusSeconds: 0,
      streakDays: 0,
    };
    expect(
      computeDailyScore({ ...base, sessionsStarted: 4, sessionsCompleted: 4 }),
    ).toBe(20); // full completion marks
    expect(
      computeDailyScore({ ...base, sessionsStarted: 4, sessionsCompleted: 2 }),
    ).toBe(10);
  });

  it("treats zero started sessions as zero completion (no free points)", () => {
    expect(
      computeDailyScore({
        focusSeconds: 0,
        sessionsStarted: 0,
        sessionsCompleted: 0,
        streakDays: 0,
      }),
    ).toBe(0);
  });

  it("awards full streak bonus at STREAK_FULL_DAYS", () => {
    const base = {
      focusSeconds: 0,
      sessionsStarted: 0,
      sessionsCompleted: 0,
    };
    expect(computeDailyScore({ ...base, streakDays: STREAK_FULL_DAYS })).toBe(20);
    expect(computeDailyScore({ ...base, streakDays: 100 })).toBe(20);
  });

  it("weights mood as focused > neutral > distracted", () => {
    const base = {
      focusSeconds: 0,
      sessionsStarted: 0,
      sessionsCompleted: 0,
      streakDays: 0,
    };
    expect(computeDailyScore({ ...base, moodCounts: { focused: 2 } })).toBe(10);
    expect(computeDailyScore({ ...base, moodCounts: { neutral: 4 } })).toBe(5);
    expect(computeDailyScore({ ...base, moodCounts: { distracted: 3 } })).toBe(0);
  });

  it("never exceeds 100 or goes below 0", () => {
    expect(
      computeDailyScore({
        focusSeconds: 99999,
        sessionsStarted: 10,
        sessionsCompleted: 10,
        streakDays: 30,
        moodCounts: { focused: 5 },
      }),
    ).toBe(100);
    expect(
      computeDailyScore({
        focusSeconds: -100,
        sessionsStarted: 0,
        sessionsCompleted: 0,
        streakDays: -5,
        moodCounts: { distracted: 99 },
      }),
    ).toBe(0);
  });

  it("sums all components correctly", () => {
    // 25 (half focus) + 20 (full completion) + 20/7 (~2.857 streak) + 7.5 (mood)
    // = 55.357 → rounds to 55 (rounding happens once, at the end).
    const score = computeDailyScore({
      focusSeconds: DAILY_FOCUS_CAP_SECONDS / 2,
      sessionsStarted: 4,
      sessionsCompleted: 4,
      streakDays: 1,
      moodCounts: { focused: 1, neutral: 1 }, // avg 0.75 → 7.5
    });
    expect(score).toBe(55);
  });
});
