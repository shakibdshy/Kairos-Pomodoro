export type AchievementIcon = "award" | "flame" | "sun" | "trophy" | "calendar";

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  category: "legacy" | "streak" | "monthly";
  threshold?: number;
}

export interface AchievementDisplay extends AchievementDefinition {
  earned: boolean;
  earnedAt?: string;
}

const LEGACY_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "early_bird",
    title: "Early Bird",
    description: "Complete a focus session before 7 AM",
    icon: "sun",
    category: "legacy",
  },
  {
    id: "marathon",
    title: "Marathon Runner",
    description: "Complete four focus sessions in one day",
    icon: "trophy",
    category: "legacy",
  },
  {
    id: "consistency",
    title: "Consistency King",
    description: "Maintain a seven-day streak",
    icon: "flame",
    category: "legacy",
  },
];

export function getStreakThresholds(limit: number): number[] {
  const thresholds = new Set([1, 7, 15, 30]);
  for (let day = 45; day <= limit; day += 15) thresholds.add(day);
  for (let day = 100; day <= limit; day += 100) thresholds.add(day);
  return [...thresholds].sort((a, b) => a - b);
}

export function getAchievementDefinitions(bestStreak: number): AchievementDefinition[] {
  const streakLimit = Math.max(30, bestStreak + 15);
  const streakAchievements = getStreakThresholds(streakLimit).map((days) => ({
    id: `streak_${days}`,
    title: `${days}-Day Flame`,
    description: `Complete focus sessions on ${days} consecutive days`,
    icon: "flame" as const,
    category: "streak" as const,
    threshold: days,
  }));

  const monthlyAchievements = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return {
      id: `monthly_${month}`,
      title: `Monthly Momentum ${toRoman(month)}`,
      description: `Complete ${month} qualifying focus month${month === 1 ? "" : "s"}`,
      icon: "calendar" as const,
      category: "monthly" as const,
      threshold: month,
    };
  });

  return [...LEGACY_ACHIEVEMENTS, ...streakAchievements, ...monthlyAchievements];
}

function toRoman(value: number): string {
  const numerals: Array<[number, string]> = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let remaining = value;
  let result = "";
  for (const [number, numeral] of numerals) {
    while (remaining >= number) {
      result += numeral;
      remaining -= number;
    }
  }
  return result;
}
