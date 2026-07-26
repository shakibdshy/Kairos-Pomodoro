import { describe, expect, it } from "vitest";
import {
  getAchievementDefinitions,
  getStreakThresholds,
} from "@/features/achievements/achievement-catalog";

describe("achievement catalog", () => {
  it("generates requested streak milestones and round-century milestones", () => {
    expect(getStreakThresholds(120)).toEqual([
      1, 7, 15, 30, 45, 60, 75, 90, 100, 105, 120,
    ]);
  });

  it("does not duplicate a milestone when a rule overlaps", () => {
    const thresholds = getStreakThresholds(300);
    expect(new Set(thresholds).size).toBe(thresholds.length);
    expect(thresholds.filter((threshold) => threshold === 300)).toHaveLength(1);
  });

  it("keeps the next streak and all twelve monthly badges discoverable", () => {
    const definitions = getAchievementDefinitions(100);
    const streakIds = definitions
      .filter((definition) => definition.category === "streak")
      .map((definition) => definition.id);
    const monthlyIds = definitions
      .filter((definition) => definition.category === "monthly")
      .map((definition) => definition.id);

    expect(streakIds).toContain("streak_100");
    expect(streakIds).toContain("streak_105");
    expect(monthlyIds).toHaveLength(12);
  });
});
