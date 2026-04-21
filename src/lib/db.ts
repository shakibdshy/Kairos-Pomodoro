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
