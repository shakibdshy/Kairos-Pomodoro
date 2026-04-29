import Database from "@tauri-apps/plugin-sql";
import { DEFAULT_CATEGORY_COLOR } from "@/lib/constants";

let db: Database | null = null;

async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:Kairos-Pomodoro.db");
  }
  return db;
}

export interface Session {
  id: number;
  task_id: number | null;
  phase: string;
  started_at: string;
  ended_at: string | null;
  duration_sec: number;
  completed: number;
  category_id: number | null;
  intention: string | null;
}

export async function initDb(): Promise<void> {
  const database = await getDb();

  await database.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      estimated_pomos INTEGER NOT NULL DEFAULT 1,
      completed_pomos INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      archived BOOLEAN DEFAULT 0
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      phase TEXT NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      duration_sec INTEGER NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#C17767',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS _schema_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Versioned migrations
  let currentVersion = 0;
  try {
    const rows = await database.select<{ value: string }[]>(
      "SELECT value FROM _schema_meta WHERE key = 'version'",
    );
    if (rows.length > 0) currentVersion = Number(rows[0].value);
  } catch {
    // Fresh database
  }

  const migrations: Record<number, string[]> = {
    1: [
      "ALTER TABLE tasks ADD COLUMN project TEXT",
      "ALTER TABLE tasks ADD COLUMN priority TEXT",
      "ALTER TABLE tasks ADD COLUMN category_id INTEGER",
      "ALTER TABLE sessions ADD COLUMN category_id INTEGER",
      "ALTER TABLE sessions ADD COLUMN intention TEXT",
      "ALTER TABLE sessions ADD COLUMN mood TEXT",
      "ALTER TABLE sessions ADD COLUMN notes TEXT",
    ],
  };

  const targetVersion = 1;

  for (let v = currentVersion + 1; v <= targetVersion; v++) {
    const statements = migrations[v];
    if (!statements) continue;
    for (const sql of statements) {
      try {
        await database.execute(sql);
      } catch (e) {
        const msg = (e as Error)?.message ?? "";
        if (!msg.includes("duplicate column")) {
          console.warn(`[DB] Migration v${v} warning:`, msg);
        }
      }
    }
    await database.execute(
      "INSERT OR REPLACE INTO _schema_meta (key, value) VALUES ('version', $1)",
      [String(v)],
    );
  }
}

export async function getTasks(): Promise<
  {
    id: number;
    name: string;
    project?: string;
    priority?: "low" | "medium" | "high";
    estimated_pomos: number;
    completed_pomos: number;
    category_id: number | null;
    created_at: string;
    archived: number;
  }[]
> {
  const database = await getDb();
  return database.select<
    {
      id: number;
      name: string;
      project?: string;
      priority?: "low" | "medium" | "high";
      estimated_pomos: number;
      completed_pomos: number;
      category_id: number | null;
      created_at: string;
      archived: number;
    }[]
  >("SELECT * FROM tasks WHERE archived = 0 ORDER BY created_at DESC");
}

export async function addTask(
  name: string,
  estimatedPomos: number,
  project?: string,
  priority?: string,
  categoryId?: number | null,
): Promise<number> {
  const database = await getDb();
  const result = await database.execute(
    "INSERT INTO tasks (name, estimated_pomos, project, priority, category_id) VALUES ($1, $2, $3, $4, $5)",
    [
      name,
      estimatedPomos,
      project ?? null,
      priority ?? null,
      categoryId ?? null,
    ],
  );
  return result.lastInsertId as number;
}

export async function toggleTaskArchived(
  id: number,
  archived: boolean,
): Promise<void> {
  const database = await getDb();
  await database.execute("UPDATE tasks SET archived = $1 WHERE id = $2", [
    archived ? 1 : 0,
    id,
  ]);
}

export async function updateTask(
  id: number,
  name?: string,
  estimatedPomos?: number,
  project?: string | null,
  priority?: string | null,
  categoryId?: number | null,
): Promise<void> {
  const database = await getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (estimatedPomos !== undefined) {
    fields.push(`estimated_pomos = $${paramIndex++}`);
    values.push(estimatedPomos);
  }
  if (project !== undefined) {
    fields.push(`project = $${paramIndex++}`);
    values.push(project ?? null);
  }
  if (priority !== undefined) {
    fields.push(`priority = $${paramIndex++}`);
    values.push(priority ?? null);
  }
  if (categoryId !== undefined) {
    fields.push(`category_id = $${paramIndex++}`);
    values.push(categoryId ?? null);
  }

  if (fields.length === 0) return;
  values.push(id);
  await database.execute(
    `UPDATE tasks SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values,
  );
}

export async function deleteTask(id: number): Promise<void> {
  const database = await getDb();
  await database.execute("DELETE FROM sessions WHERE task_id = $1", [id]);
  await database.execute("DELETE FROM tasks WHERE id = $1", [id]);
}

export async function incrementTaskPomos(id: number): Promise<void> {
  const database = await getDb();
  await database.execute(
    "UPDATE tasks SET completed_pomos = completed_pomos + 1 WHERE id = $1",
    [id],
  );
}

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

export async function getSetting(key: string): Promise<string | null> {
  const database = await getDb();
  const rows = await database.select<{ value: string }[]>(
    "SELECT value FROM settings WHERE key = $1",
    [key],
  );
  return rows.length > 0 ? rows[0].value : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const database = await getDb();
  await database.execute(
    "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = $2",
    [key, value],
  );
}

export interface Category {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export async function getCategories(): Promise<Category[]> {
  const database = await getDb();
  return database.select("SELECT * FROM categories ORDER BY name ASC");
}

export async function getCategory(id: number): Promise<Category | null> {
  const database = await getDb();
  const rows = await database.select<Category[]>(
    "SELECT * FROM categories WHERE id = $1",
    [id],
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function addCategory(
  name: string,
  color?: string,
): Promise<number> {
  const database = await getDb();
  const result = await database.execute(
    "INSERT INTO categories (name, color) VALUES ($1, $2)",
    [name, color ?? DEFAULT_CATEGORY_COLOR],
  );
  return result.lastInsertId as number;
}

export async function updateCategory(
  id: number,
  name: string,
  color: string,
): Promise<void> {
  const database = await getDb();
  await database.execute(
    "UPDATE categories SET name = $1, color = $2 WHERE id = $3",
    [name, color, id],
  );
}

export async function deleteCategory(id: number): Promise<void> {
  const database = await getDb();
  await database.execute(
    "UPDATE sessions SET category_id = NULL WHERE category_id = $1",
    [id],
  );
  await database.execute("DELETE FROM categories WHERE id = $1", [id]);
}

export interface CategoryBreakdown {
  category_id: number | null;
  intention: string | null;
  category_name: string | null;
  category_color: string | null;
  total_seconds: number;
  session_count: number;
}

export async function getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
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
    WHERE date(s.started_at) = date('now', 'localtime') AND s.completed = 1
    GROUP BY s.category_id, s.intention, c.name, c.color
    ORDER BY total_seconds DESC
  `);
}

export async function getTaskTimeToday(taskId: number): Promise<number> {
  const database = await getDb();
  const rows = await database.select<{ total: number }[]>(
    "SELECT COALESCE(SUM(duration_sec), 0) AS total FROM sessions WHERE task_id = $1 AND date(started_at) = date('now', 'localtime') AND completed = 1",
    [taskId],
  );
  return rows[0]?.total ?? 0;
}

export interface DayData {
  date: string;
  day_name: string;
  total_seconds: number;
  session_count: number;
}

export async function getWeeklyData(): Promise<DayData[]> {
  const database = await getDb();
  return database.select<DayData[]>(`
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
    WHERE date(started_at) >= date('now', 'localtime', '-6 days') AND completed = 1
    GROUP BY date(started_at)
    ORDER BY date(started_at) ASC
  `);
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

export interface WeekSession {
  id: number;
  task_id: number | null;
  task_name: string | null;
  phase: string;
  started_at: string;
  duration_sec: number;
  completed: number;
  category_id: number | null;
  category_name: string | null;
  category_color: string | null;
  intention: string | null;
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

export interface WeekSummary {
  total_seconds: number;
  total_sessions: number;
  work_sessions: number;
  break_sessions: number;
  avg_daily_seconds: number;
  peak_day: string | null;
  peak_day_seconds: number;
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
