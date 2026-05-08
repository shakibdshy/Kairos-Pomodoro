import { getDb } from "./schema";
import type { Session, WeekSession, WeekSummary } from "./types";

export async function addSession(
  taskId: number | null,
  phase: string,
  durationSec: number,
  completed: boolean,
): Promise<void> {
  const database = await getDb();
  await database.execute(
    "INSERT INTO sessions (task_id, phase, duration_sec, completed, ended_at) VALUES ($1, $2, $3, $4, datetime('now', 'localtime'))",
    [taskId, phase, durationSec, completed ? 1 : 0],
  );
}

export async function startSession(
  taskId: number | null,
  phase: string,
  categoryId?: number | null,
  intention?: string | null,
): Promise<number> {
  const database = await getDb();
  const result = await database.execute(
    "INSERT INTO sessions (task_id, phase, started_at, duration_sec, completed, category_id, intention) VALUES ($1, $2, datetime('now', 'localtime'), 0, 0, $3, $4) RETURNING id",
    [taskId, phase, categoryId ?? null, intention ?? null],
  );
  return result.lastInsertId as number;
}

export async function finishSession(
  sessionId: number,
  durationSec?: number,
  mood?: string,
  notes?: string,
): Promise<void> {
  const database = await getDb();

  if (durationSec !== undefined) {
    await database.execute(
      `
      UPDATE sessions
      SET ended_at = datetime('now', 'localtime'),
          duration_sec = $2,
          completed = 1,
          mood = $3,
          notes = $4
      WHERE id = $1
    `,
      [sessionId, durationSec, mood ?? null, notes ?? null],
    );
  } else {
    await database.execute(
      `
      UPDATE sessions
      SET ended_at = datetime('now', 'localtime'),
          duration_sec = CAST(strftime('%s', 'now', 'localtime') - strftime('%s', started_at) AS INTEGER),
          completed = 1,
          mood = $2,
          notes = $3
      WHERE id = $1
    `,
      [sessionId, mood ?? null, notes ?? null],
    );
  }
}

export async function abandonSession(sessionId: number): Promise<void> {
  const database = await getDb();
  await database.execute(
    "DELETE FROM sessions WHERE id = $1 AND completed = 0",
    [sessionId],
  );
}

export async function getSessions(): Promise<Session[]> {
  const database = await getDb();
  return database.select<Session[]>(
    "SELECT * FROM sessions ORDER BY started_at DESC",
  );
}

export async function getTodaySessions(): Promise<Session[]> {
  const database = await getDb();
  return database.select<Session[]>(
    "SELECT * FROM sessions WHERE date(started_at) = date('now', 'localtime') AND completed = 1 ORDER BY started_at DESC",
  );
}

export async function getWeekSessions(
  weekStart: string,
  weekEnd: string,
): Promise<WeekSession[]> {
  const database = await getDb();
  return database.select<WeekSession[]>(
    `
    SELECT
      s.id,
      s.task_id,
      t.name AS task_name,
      s.phase,
      s.started_at,
      s.duration_sec,
      s.completed,
      s.category_id,
      c.name AS category_name,
      c.color AS category_color,
      s.intention
    FROM sessions s
    LEFT JOIN tasks t ON s.task_id = t.id
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE date(s.started_at) >= $1 AND date(s.started_at) <= $2 AND s.completed = 1
    ORDER BY s.started_at ASC
  `,
    [weekStart, weekEnd],
  );
}

export async function getWeekSummary(
  weekStart: string,
  weekEnd: string,
): Promise<WeekSummary> {
  const database = await getDb();
  const rows = await database.select<
    {
      total_seconds: number;
      total_sessions: number;
      work_sessions: number;
      break_sessions: number;
    }[]
  >(
    `
    SELECT
      COALESCE(SUM(duration_sec), 0) AS total_seconds,
      COALESCE(COUNT(*), 0) AS total_sessions,
      COALESCE(SUM(CASE WHEN phase = 'work' THEN 1 ELSE 0 END), 0) AS work_sessions,
      COALESCE(SUM(CASE WHEN phase != 'work' THEN 1 ELSE 0 END), 0) AS break_sessions
    FROM sessions
    WHERE date(started_at) >= $1 AND date(started_at) <= $2 AND completed = 1
  `,
    [weekStart, weekEnd],
  );

  const raw = rows[0];
  if (!raw || raw.total_sessions === 0) {
    return {
      total_seconds: 0,
      total_sessions: 0,
      work_sessions: 0,
      break_sessions: 0,
      avg_daily_seconds: 0,
      peak_day: null,
      peak_day_seconds: 0,
    };
  }

  const dayRows = await database.select<{ d: string; total: number }[]>(
    `
    SELECT date(started_at) AS d, COALESCE(SUM(duration_sec), 0) AS total
    FROM sessions
    WHERE date(started_at) >= $1 AND date(started_at) <= $2 AND completed = 1
    GROUP BY date(started_at)
    ORDER BY total DESC
    LIMIT 1
  `,
    [weekStart, weekEnd],
  );

  const activeDaysRows = await database.select<{ cnt: number }[]>(
    `
    SELECT COUNT(DISTINCT date(started_at)) AS cnt FROM sessions
    WHERE date(started_at) >= $1 AND date(started_at) <= $2 AND completed = 1
  `,
    [weekStart, weekEnd],
  );
  const activeDays = activeDaysRows[0]?.cnt ?? 0;

  return {
    total_seconds: raw.total_seconds,
    total_sessions: raw.total_sessions,
    work_sessions: raw.work_sessions,
    break_sessions: raw.break_sessions,
    avg_daily_seconds:
      activeDays > 0 ? Math.round(raw.total_seconds / activeDays) : 0,
    peak_day: dayRows[0]?.d ?? null,
    peak_day_seconds: dayRows[0]?.total ?? 0,
  };
}
