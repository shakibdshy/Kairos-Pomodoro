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
    2: [
      `CREATE TABLE IF NOT EXISTS presets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        work_duration INTEGER NOT NULL,
        short_break_duration INTEGER NOT NULL,
        long_break_duration INTEGER NOT NULL,
        pomos_before_long_break INTEGER NOT NULL DEFAULT 4,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
    ],
  };

  const targetVersion = 2;

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

  // Seed default presets if none exist
  const presetCount = await database.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM presets",
  );
  if (presetCount[0].count === 0) {
    await database.execute(`
      INSERT INTO presets (name, work_duration, short_break_duration, long_break_duration, pomos_before_long_break)
      VALUES 
        ('Classic Pomodoro', 1500, 300, 900, 4),
        ('Deep Work', 3600, 600, 1800, 3),
        ('Flow State', 5400, 900, 3600, 2),
        ('Quick Sprints', 900, 180, 600, 4)
    `);
  }
}
