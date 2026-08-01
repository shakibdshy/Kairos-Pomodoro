import {
  getAchievementProgress,
  getBadgeAwards,
  getUnannouncedBadgeAwards,
  markBadgeAnnounced,
  recordBadgeAward,
  type BadgeAwardRow,
} from "@/lib/db";
import {
  getAchievementDefinitions,
  type AchievementDisplay,
} from "./achievement-catalog";
import { CONSISTENCY_STREAK_THRESHOLD } from "@/lib/constants";

function buildDisplay(
  definitions: ReturnType<typeof getAchievementDefinitions>,
  awards: BadgeAwardRow[],
  progress: Awaited<ReturnType<typeof getAchievementProgress>>,
): AchievementDisplay[] {
  const awardMap = new Map(awards.map((award) => [award.badge_id, award]));
  return definitions.map((definition) => {
    const award = awardMap.get(definition.id);
    const earnedByRule =
      (definition.id === "early_bird" && progress.earlyBird) ||
      (definition.id === "marathon" && progress.marathon) ||
      (definition.id === "consistency" &&
        Math.max(progress.currentStreak, progress.bestStreak) >= CONSISTENCY_STREAK_THRESHOLD) ||
      (definition.category === "streak" &&
        (progress.currentStreak >= (definition.threshold ?? Infinity) ||
          progress.bestStreak >= (definition.threshold ?? Infinity))) ||
      (definition.category === "monthly" &&
        progress.qualifyingMonths >= (definition.threshold ?? Infinity));

    return {
      ...definition,
      earned: Boolean(award) || earnedByRule,
      earnedAt: award?.earned_at,
    };
  });
}

export async function reconcileAchievements(
  triggerSessionId: number | null = null,
  announce = true,
): Promise<AchievementDisplay[]> {
  const progress = await getAchievementProgress();
  const existingAwards = await getBadgeAwards();
  const existingIds = new Set(existingAwards.map((award) => award.badge_id));
  const definitions = getAchievementDefinitions(progress.bestStreak);
  const earned = buildDisplay(definitions, existingAwards, progress).filter(
    (achievement) => achievement.earned,
  );

  // Record only achievements not already awarded, and note whether anything was
  // actually written so the follow-up read/build can be skipped otherwise.
  let recordedNew = false;
  for (const achievement of earned) {
    if (!existingIds.has(achievement.id)) {
      await recordBadgeAward(achievement.id, triggerSessionId, announce);
      recordedNew = true;
    }
  }

  // No earned achievements, or all earned were already recorded — nothing new
  // to announce, so skip the second getBadgeAwards/buildDisplay.
  if (!recordedNew) return [];

  const updatedAwards = await getBadgeAwards();
  const updated = buildDisplay(definitions, updatedAwards, progress);
  const newlyAwardedIds = new Set(
    earned
      .filter((achievement) => !existingIds.has(achievement.id))
      .map((achievement) => achievement.id),
  );
  return updated.filter((achievement) => newlyAwardedIds.has(achievement.id));
}

export async function getAchievementSnapshot(): Promise<AchievementDisplay[]> {
  const progress = await getAchievementProgress();
  const awards = await getBadgeAwards();
  return buildDisplay(getAchievementDefinitions(progress.bestStreak), awards, progress);
}

export async function getPendingAchievementAnnouncements(): Promise<AchievementDisplay[]> {
  const [progress, pending] = await Promise.all([
    getAchievementProgress(),
    getUnannouncedBadgeAwards(),
  ]);
  return buildDisplay(getAchievementDefinitions(progress.bestStreak), pending, progress).filter(
    (achievement) => pending.some((award) => award.badge_id === achievement.id),
  );
}

export { markBadgeAnnounced };
