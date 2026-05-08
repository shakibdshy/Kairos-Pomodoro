import { getDb } from "./schema";
import type { CategoryBreakdown, DayData } from "./types";

export async function getCategoryBreakdown(
  startDate?: string,
  endDate?: string,
): Promise<CategoryBreakdown[]> {
  const database = await getDb();
  if (startDate && endDate) {
    return database.select<CategoryBreakdown[]>(
      `SELECT
        s.category_id,
        s.intention,
        c.name AS category_name,
        c.color AS category_color,
        COALESCE(SUM(s.duration_sec), 0) AS total_seconds,
        COUNT(*) AS session_count
      FROM sessions s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE date(s.started_at) >= $1 AND date(s.started_at) <= $2 AND s.completed = 1
      GROUP BY s.category_id, s.intention, c.name, c.color
      ORDER BY total_seconds DESC`,
      [startDate, endDate],
    );
  }
  return database.select<CategoryBreakdown[]>(`
    SELECT
      s.category_id,
      s.intention,
      c.name AS category_name,
      c.color AS category_color,
      COALESCE(SUM(s.duration_sec), 0) AS total_seconds,
      COUNT(*) AS session_count
    FROM sessions s
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE date(s.started_at) = date('now', 'localtime') AND s.completed = 1
    GROUP BY s.category_id, s.intention, c.name, c.color
    ORDER BY total_seconds DESC
  `);
}

export async function getAllCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  const database = await getDb();
  return database.select<CategoryBreakdown[]>(`
    SELECT
      s.category_id,
      s.intention,
      c.name AS category_name,
      c.color AS category_color,
      COALESCE(SUM(s.duration_sec), 0) AS total_seconds,
      COUNT(*) AS session_count
    FROM sessions s
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE s.completed = 1
    GROUP BY s.category_id, s.intention, c.name, c.color
    ORDER BY total_seconds DESC
  `);
}

export async function getWeeklyData(
  startDate?: string,
  endDate?: string,
): Promise<DayData[]> {
  const database = await getDb();
  const query = `
    SELECT
      date(started_at) AS date,
      CASE CAST(strftime('%w', started_at) AS INTEGER)
        WHEN 0 THEN 'Sun' WHEN 1 THEN 'Mon' WHEN 2 THEN 'Tue'
        WHEN 3 THEN 'Wed' WHEN 4 THEN 'Thu' WHEN 5 THEN 'Fri'
        ELSE 'Sat'
      END AS day_name,
      COALESCE(SUM(duration_sec), 0) AS total_seconds,
      COUNT(*) AS session_count
    FROM sessions
    WHERE date(started_at) >= $1 AND date(started_at) <= $2 AND completed = 1
    GROUP BY date(started_at)
    ORDER BY date(started_at) ASC`;
  return database.select<DayData[]>(query, [startDate ?? "", endDate ?? ""]);
}

export async function getAllTimeStats(): Promise<{
  total_focus_seconds: number;
  total_sessions: number;
  avg_session_seconds: number;
  longest_session_seconds: number;
  total_break_seconds: number;
  avg_break_seconds: number;
}> {
  const database = await getDb();
  const rows = await database.select<
    {
      total_focus_seconds: number;
      total_sessions: number;
      avg_session_seconds: number;
      longest_session_seconds: number;
      total_break_seconds: number;
      avg_break_seconds: number;
    }[]
  >(`
    SELECT
      COALESCE(SUM(CASE WHEN phase = 'work' THEN duration_sec ELSE 0 END), 0) AS total_focus_seconds,
      COALESCE(SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END), 0) AS total_sessions,
      COALESCE(AVG(CASE WHEN phase = 'work' AND completed = 1 THEN duration_sec END), 0) AS avg_session_seconds,
      COALESCE(MAX(CASE WHEN phase = 'work' AND completed = 1 THEN duration_sec END), 0) AS longest_session_seconds,
      COALESCE(SUM(CASE WHEN phase != 'work' AND completed = 1 THEN duration_sec ELSE 0 END), 0) AS total_break_seconds,
      COALESCE(AVG(CASE WHEN phase != 'work' AND completed = 1 THEN duration_sec END), 0) AS avg_break_seconds
    FROM sessions
  `);
  return (
    rows[0] ?? {
      total_focus_seconds: 0,
      total_sessions: 0,
      avg_session_seconds: 0,
      longest_session_seconds: 0,
      total_break_seconds: 0,
      avg_break_seconds: 0,
    }
  );
}

export async function getCurrentStreak(): Promise<number> {
  const database = await getDb();
  const rows = await database.select<{ days: string }[]>(
    "SELECT DISTINCT date(started_at) as days FROM sessions WHERE completed = 1 ORDER BY days DESC",
  );
  if (rows.length === 0) return 0;
  const today = new Date().toISOString().split("T")[0];
  let streak = 0;
  for (const row of rows) {
    const [ay, am, ad] = today.split("-").map(Number);
    const [by, bm, bd] = row.days.split("-").map(Number);
    const dateA = new Date(ay, am - 1, ad);
    const dateB = new Date(by, bm - 1, bd);
    const diffDays = Math.round(
      (dateA.getTime() - dateB.getTime()) / 86400000,
    );
    if (diffDays === streak) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export async function getBestStreak(): Promise<number> {
  const database = await getDb();
  const rows = await database.select<{ days: string }[]>(
    "SELECT DISTINCT date(started_at) as days FROM sessions WHERE completed = 1 ORDER BY days ASC",
  );
  if (rows.length === 0) return 0;
  let bestStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < rows.length; i++) {
    const [ay, am, ad] = rows[i - 1].days.split("-").map(Number);
    const [by, bm, bd] = rows[i].days.split("-").map(Number);
    const dateA = new Date(ay, am - 1, ad);
    const dateB = new Date(by, bm - 1, bd);
    const diffDays = Math.round(
      (dateB.getTime() - dateA.getTime()) / 86400000,
    );
    if (diffDays === 1) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  return bestStreak;
}
