import { getDb } from "./schema";

export interface BadgeAwardRow {
  badge_id: string;
  earned_at: string;
  trigger_session_id: number | null;
  announced_at: string | null;
}

export async function getBadgeAwards(): Promise<BadgeAwardRow[]> {
  const database = await getDb();
  return database.select<BadgeAwardRow[]>(
    "SELECT badge_id, earned_at, trigger_session_id, announced_at FROM badge_awards ORDER BY earned_at ASC",
  );
}

export async function getUnannouncedBadgeAwards(): Promise<BadgeAwardRow[]> {
  const database = await getDb();
  return database.select<BadgeAwardRow[]>(
    "SELECT badge_id, earned_at, trigger_session_id, announced_at FROM badge_awards WHERE announced_at IS NULL ORDER BY earned_at ASC",
  );
}

export async function recordBadgeAward(
  badgeId: string,
  triggerSessionId: number | null,
  announce: boolean,
): Promise<void> {
  const database = await getDb();
  await database.execute(
    `INSERT OR IGNORE INTO badge_awards
       (badge_id, earned_at, trigger_session_id, announced_at)
     VALUES ($1, datetime('now', 'localtime'), $2, ${announce ? "NULL" : "datetime('now', 'localtime')"})`,
    [badgeId, triggerSessionId],
  );
}

export async function markBadgeAnnounced(badgeId: string): Promise<void> {
  const database = await getDb();
  await database.execute(
    "UPDATE badge_awards SET announced_at = datetime('now', 'localtime') WHERE badge_id = $1",
    [badgeId],
  );
}
