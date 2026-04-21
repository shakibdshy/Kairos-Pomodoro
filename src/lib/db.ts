import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:Kairos.db");
  }
  return db;
}

export async function initDb(): Promise<void> {
  const database = await getDb();

  await database.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      project TEXT,
      priority TEXT,
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

  // Simple migrations for new columns
  try {
    await database.execute("ALTER TABLE tasks ADD COLUMN project TEXT");
  } catch (e) { /* ignore if column exists */ }
  try {
    await database.execute("ALTER TABLE tasks ADD COLUMN priority TEXT");
  } catch (e) { /* ignore if column exists */ }
  try {
    await database.execute("ALTER TABLE sessions ADD COLUMN category_id INTEGER");
  } catch (e) { /* ignore if column exists */ }
  try {
    await database.execute("ALTER TABLE sessions ADD COLUMN intention TEXT");
  } catch (e) { /* ignore if column exists */ }
}

export async function getTasks() {
  const database = await getDb();
  return database.select<{
    id: number;
    name: string;
    project?: string;
    priority?: "low" | "medium" | "high";
    estimated_pomos: number;
    completed_pomos: number;
    created_at: string;
    archived: number;
  }[]>("SELECT * FROM tasks WHERE archived = 0 ORDER BY created_at DESC");
}

export async function addTask(
  name: string,
  estimatedPomos: number,
  project?: string,
  priority?: string
) {
  const database = await getDb();
  await database.execute(
    "INSERT INTO tasks (name, estimated_pomos, project, priority) VALUES ($1, $2, $3, $4)",
    [name, estimatedPomos, project || null, priority || null]
  );
}

export async function toggleTaskArchived(id: number, archived: boolean) {
  const database = await getDb();
  await database.execute(
    "UPDATE tasks SET archived = $1 WHERE id = $2",
    [archived ? 1 : 0, id]
  );
}

export async function incrementTaskPomos(id: number) {
  const database = await getDb();
  await database.execute(
    "UPDATE tasks SET completed_pomos = completed_pomos + 1 WHERE id = $1",
    [id]
  );
}

export async function addSession(
  taskId: number | null,
  phase: string,
  durationSec: number,
  completed: boolean
) {
  const database = await getDb();
  await database.execute(
    "INSERT INTO sessions (task_id, phase, duration_sec, completed, ended_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)",
    [taskId, phase, durationSec, completed ? 1 : 0]
  );
}

export async function startSession(
  taskId: number | null,
  phase: string,
  categoryId?: number | null,
  intention?: string | null
): Promise<number> {
  const database = await getDb();
  const result = await database.execute(
    "INSERT INTO sessions (task_id, phase, started_at, duration_sec, completed, category_id, intention) VALUES ($1, $2, CURRENT_TIMESTAMP, 0, 0, $3, $4) RETURNING id",
    [taskId, phase, categoryId || null, intention || null]
  );
  return result.lastInsertId as number;
}

export async function finishSession(sessionId: number): Promise<void> {
  const database = await getDb();
  await database.execute(`
    UPDATE sessions 
    SET ended_at = CURRENT_TIMESTAMP, 
        duration_sec = CAST((julianday(CURRENT_TIMESTAMP) - julianday(started_at)) * 86400 AS INTEGER),
        completed = 1
    WHERE id = $1
  `, [sessionId]);
}

export async function abandonSession(sessionId: number): Promise<void> {
  const database = await getDb();
  await database.execute("DELETE FROM sessions WHERE id = $1 AND completed = 0", [sessionId]);
}

export async function getSessions(): Promise<{
  id: number;
  task_id: number | null;
  phase: string;
  started_at: string;
  ended_at: string | null;
  duration_sec: number;
  completed: number;
  category_id: number | null;
  intention: string | null;
}[]> {
  const database = await getDb();
  return database.select(
    "SELECT * FROM sessions ORDER BY started_at DESC"
  );
}

export async function getTodaySessions(): Promise<{
  id: number;
  task_id: number | null;
  phase: string;
  started_at: string;
  ended_at: string | null;
  duration_sec: number;
  completed: number;
  category_id: number | null;
  intention: string | null;
}[]> {
  const database = await getDb();
  return database.select(
    "SELECT * FROM sessions WHERE date(started_at) = date('now') AND completed = 1 ORDER BY started_at DESC"
  );
}

export async function getSetting(key: string): Promise<string | null> {
  const database = await getDb();
  const rows = await database.select<{ value: string }[]>(
    "SELECT value FROM settings WHERE key = $1",
    [key]
  );
  return rows.length > 0 ? rows[0].value : null;
}

export async function setSetting(key: string, value: string) {
  const database = await getDb();
  await database.execute(
    "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = $2",
    [key, value]
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
  const rows = await database.select<Category[]>("SELECT * FROM categories WHERE id = $1", [id]);
  return rows.length > 0 ? rows[0] : null;
}

export async function addCategory(name: string, color?: string): Promise<number> {
  const database = await getDb();
  const result = await database.execute(
    "INSERT INTO categories (name, color) VALUES ($1, $2)",
    [name, color || "#C17767"]
  );
  return result.lastInsertId as number;
}

export async function updateCategory(id: number, name: string, color: string): Promise<void> {
  const database = await getDb();
  await database.execute(
    "UPDATE categories SET name = $1, color = $2 WHERE id = $3",
    [name, color, id]
  );
}

export async function deleteCategory(id: number): Promise<void> {
  const database = await getDb();
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
    WHERE date(s.started_at) = date('now') AND s.completed = 1
    GROUP BY s.category_id, s.intention, c.name, c.color
    ORDER BY total_seconds DESC
  `);
}

export async function getTaskTimeToday(taskId: number): Promise<number> {
  const database = await getDb();
  const rows = await database.select<{ total: number }[]>(
    "SELECT COALESCE(SUM(duration_sec), 0) AS total FROM sessions WHERE task_id = $1 AND date(started_at) = date('now') AND completed = 1",
    [taskId]
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
    WHERE date(started_at) >= date('now', '-6 days') AND completed = 1
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
  const rows = await database.select<{
    total_focus_seconds: number;
    total_sessions: number;
    avg_session_seconds: number;
    longest_session_seconds: number;
    total_break_seconds: number;
    avg_break_seconds: number;
  }[]>(`
    SELECT 
      COALESCE(SUM(CASE WHEN phase = 'work' THEN duration_sec ELSE 0 END), 0) AS total_focus_seconds,
      COALESCE(SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END), 0) AS total_sessions,
      COALESCE(AVG(CASE WHEN phase = 'work' AND completed = 1 THEN duration_sec END), 0) AS avg_session_seconds,
      COALESCE(MAX(CASE WHEN phase = 'work' AND completed = 1 THEN duration_sec END), 0) AS longest_session_seconds,
      COALESCE(SUM(CASE WHEN phase != 'work' AND completed = 1 THEN duration_sec ELSE 0 END), 0) AS total_break_seconds,
      COALESCE(AVG(CASE WHEN phase != 'work' AND completed = 1 THEN duration_sec END), 0) AS avg_break_seconds
    FROM sessions
  `);
  return rows[0] ?? { total_focus_seconds: 0, total_sessions: 0, avg_session_seconds: 0, longest_session_seconds: 0, total_break_seconds: 0, avg_break_seconds: 0 };
}

export async function getCurrentStreak(): Promise<number> {
  const database = await getDb();
  try {
    const rows = await database.select<{ streak: number }[]>(`
      WITH RECURSIVE countdown(d) AS (
        SELECT date('now')
        UNION ALL
        SELECT date(d, '-1 day') FROM countdown WHERE d > date('now', '-365 days')
      )
      SELECT COUNT(*) as streak FROM countdown c
      WHERE EXISTS (
        SELECT 1 FROM sessions 
        WHERE date(started_at) = c.d AND completed = 1
      )
      AND c.d <= (
        SELECT COALESCE(MIN(date(started_at)), date('now')) 
        FROM countdown c2 
        WHERE NOT EXISTS (
          SELECT 1 FROM sessions 
          WHERE date(started_at) = c2.d AND completed = 1
        ) AND c2.d < date('now')
      )
    `);
    return rows[0]?.streak ?? 0;
  } catch {
    const rows = await database.select<{ days: string }[]>(
      "SELECT DISTINCT date(started_at) as days FROM sessions WHERE completed = 1 ORDER BY days DESC"
    );
    if (rows.length === 0) return 0;
    const today = new Date().toISOString().split("T")[0];
    let streak = 0;
    for (const row of rows) {
      const diffMs = new Date(today).getTime() - new Date(row.days).getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }
}

export async function getBestStreak(): Promise<number> {
  const database = await getDb();
  try {
    const rows = await database.select<{ best_streak: number }[]>(`
      WITH RECURSIVE dates(d) AS (
        SELECT MIN(date(started_at)) FROM sessions WHERE completed = 1
        UNION ALL
        SELECT date(d, '+1 day') FROM dates WHERE d < date('now')
      ),
      has_session(d, s) AS (
        SELECT d, CASE WHEN EXISTS (
          SELECT 1 FROM sessions WHERE date(started_at) = d AND completed = 1 LIMIT 1
        ) THEN 1 ELSE 0 END FROM dates
      ),
      groups(d, s, g) AS (
        SELECT d, s, CASE WHEN s = 1 THEN 0 ELSE 1 END FROM has_session
        UNION ALL
        SELECT hs.d, hs.s, g.g + CASE WHEN hs.s = 1 THEN 0 ELSE 1 END 
        FROM has_session hs JOIN groups g ON hs.d = date(g.d, '+1 day')
      )
      SELECT MAX(g) as best_streak FROM groups WHERE s = 1
    `);
    return rows[0]?.best_streak ?? 0;
  } catch {
    const rows = await database.select<{ days: string }[]>(
      "SELECT DISTINCT date(started_at) as days FROM sessions WHERE completed = 1 ORDER BY days ASC"
    );
    if (rows.length === 0) return 0;
    let bestStreak = 1;
    let currentStreak = 1;
    for (let i = 1; i < rows.length; i++) {
      const prev = new Date(rows[i - 1].days);
      const curr = new Date(rows[i].days);
      const diffMs = curr.getTime() - prev.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    return bestStreak;
  }
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
