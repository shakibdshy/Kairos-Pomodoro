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
  // Bound announced_at as a parameter: NULL when announce is true (pending
  // announcement), otherwise the current local-naive timestamp in the same
  // yyyy-MM-dd HH:mm:ss format that datetime('now', 'localtime') yields.
  const announcedAt = announce ? null : localNowTimestamp();
  await database.execute(
    `INSERT OR IGNORE INTO badge_awards
       (badge_id, earned_at, trigger_session_id, announced_at)
     VALUES ($1, datetime('now', 'localtime'), $2, $3)`,
    [badgeId, triggerSessionId, announcedAt],
  );
}

/** Local-naive `yyyy-MM-dd HH:mm:ss`, matching datetime('now', 'localtime'). */
function localNowTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export async function markBadgeAnnounced(badgeId: string): Promise<void> {
  const database = await getDb();
  await database.execute(
    "UPDATE badge_awards SET announced_at = datetime('now', 'localtime') WHERE badge_id = $1",
    [badgeId],
  );
}
