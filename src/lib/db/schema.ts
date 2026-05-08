import Database from "@tauri-apps/plugin-sql";
import { DEFAULT_CATEGORY_COLOR } from "@/lib/constants";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:Kairos-Pomodoro.db");
  }
  return db;
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
      color TEXT NOT NULL DEFAULT '${DEFAULT_CATEGORY_COLOR}',
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
