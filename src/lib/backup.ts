import { save, open } from "@tauri-apps/plugin-dialog";
import { writeFile, readTextFile } from "@tauri-apps/plugin-fs";
import { getDb } from "@/lib/db/schema";
import { isTauri } from "@/lib/tauri";

/** Schema version this build writes/accepts. Must stay in sync with schema.ts targetVersion. */
export const BACKUP_FORMAT_VERSION = 1;
export const BACKUP_SCHEMA_VERSION = 3;
export const BACKUP_APP_ID = "kairos";

/** Tables that get dumped on export and re-inserted on restore, in dependency order. */
const TABLES = [
  "categories",
  "tasks",
  "sessions",
  "presets",
  "settings",
  "time_blocks",
  "journal_entries",
] as const;

const TABLE_COLUMNS: Record<string, string[]> = {
  categories: ["id", "name", "color", "created_at"],
  tasks: [
    "id",
    "name",
    "estimated_pomos",
    "completed_pomos",
    "created_at",
    "archived",
    "project",
    "priority",
    "category_id",
  ],
  sessions: [
    "id",
    "task_id",
    "phase",
    "started_at",
    "ended_at",
    "duration_sec",
    "completed",
    "category_id",
    "intention",
    "mood",
    "notes",
  ],
  presets: [
    "id",
    "name",
    "work_duration",
    "short_break_duration",
    "long_break_duration",
    "pomos_before_long_break",
    "created_at",
  ],
  settings: ["key", "value"],
  time_blocks: [
    "id",
    "title",
    "start_time",
    "end_time",
    "task_id",
    "category_id",
    "color",
    "completed",
    "created_at",
  ],
  journal_entries: ["id", "date", "content", "created_at", "updated_at"],
};

export interface BackupFile {
  app: string;
  formatVersion: number;
  exportedAt: string;
  schemaVersion: number;
  data: Record<string, Record<string, unknown>[]>;
}

export interface BackupResult {
  ok: boolean;
  /** Path written (export) or read (import), when applicable. */
  path?: string;
  error?: string;
  /** Counts restored per table (import only). */
  counts?: Record<string, number>;
}

async function dumpTable(db: Awaited<ReturnType<typeof getDb>>, table: string) {
  try {
    return await db.select<Record<string, unknown>[]>(`SELECT * FROM ${table}`);
  } catch {
    // Table may not exist on an older DB that hasn't migrated yet.
    return [];
  }
}

/**
 * Export the entire local database to a versioned JSON file.
 * Returns BACKUP_RESULT with the written path, or an error.
 */
export async function exportBackup(): Promise<BackupResult> {
  if (!isTauri()) return { ok: false, error: "Not running in desktop mode." };

  try {
    const db = await getDb();

    const data: BackupFile["data"] = {};
    for (const table of TABLES) {
      data[table] = await dumpTable(db, table);
    }

    let schemaVersion = 0;
    try {
      const rows = await db.select<{ value: string }[]>(
        "SELECT value FROM _schema_meta WHERE key = 'version'",
      );
      if (rows.length > 0) schemaVersion = Number(rows[0].value);
    } catch {
      // ignore
    }

    const payload: BackupFile = {
      app: BACKUP_APP_ID,
      formatVersion: BACKUP_FORMAT_VERSION,
      exportedAt: new Date().toISOString(),
      schemaVersion,
      data,
    };

    const defaultFilename = `kairos-backup-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.json`;

    const filePath = await save({
      defaultPath: defaultFilename,
      filters: [{ name: "Kairos Backup", extensions: ["json"] }],
      title: "Save Kairos Backup",
    });

    if (!filePath) return { ok: false, error: "Cancelled" };

    await writeFile(filePath, new TextEncoder().encode(JSON.stringify(payload, null, 2)));
    return { ok: true, path: filePath };
  } catch (e) {
    return { ok: false, error: (e as Error)?.message ?? "Unknown error" };
  }
}

function validateBackup(payload: unknown): asserts payload is BackupFile {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Invalid backup file: not a JSON object.");
  }
  const p = payload as Partial<BackupFile>;
  if (p.app !== BACKUP_APP_ID) {
    throw new Error("Invalid backup file: not a Kairos backup.");
  }
  // Accept any formatVersion <= BACKUP_FORMAT_VERSION (backward compatible), default to 0
  const formatVersion = typeof p.formatVersion === "number" ? p.formatVersion : 0;
  if (formatVersion > BACKUP_FORMAT_VERSION) {
    throw new Error(
      `Backup was created by a newer version of Kairos (format v${formatVersion}). This build only supports up to v${BACKUP_FORMAT_VERSION}.`,
    );
  }
  // Default schemaVersion to 0 if not present (for old backups)
  const schemaVersion = typeof p.schemaVersion === "number" ? p.schemaVersion : 0;
  if (schemaVersion > BACKUP_SCHEMA_VERSION) {
    throw new Error(
      `Backup schema version ${schemaVersion} is newer than supported ${BACKUP_SCHEMA_VERSION}. Update the app to restore this backup.`,
    );
  }
  if (typeof p.data !== "object" || p.data === null) {
    throw new Error("Invalid backup file: missing data.");
  }
}

/**
 * Restore a database from a JSON backup file. DESTRUCTIVE: clears all existing
 * rows in the affected tables before re-inserting. Not reversible — callers
 * should confirm with the user (and ideally auto-backup first).
 */
export async function importBackup(): Promise<BackupResult> {
  if (!isTauri()) return { ok: false, error: "Not running in desktop mode." };

  let filePath: string | null = null;
  try {
    const picked = await open({
      multiple: false,
      filters: [{ name: "Kairos Backup", extensions: ["json"] }],
      title: "Select a Kairos Backup to Restore",
    });
    filePath = typeof picked === "string" ? picked : null;
    if (!filePath) return { ok: false, error: "Cancelled" };

    const raw = await readTextFile(filePath);
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      throw new Error("Could not parse backup file: invalid JSON.");
    }
    validateBackup(payload);

    const db = await getDb();

    const counts: Record<string, number> = {};

    // NOTE: We intentionally do NOT use an explicit transaction
    // (BEGIN/COMMIT/ROLLBACK). The @tauri-apps/plugin-sql connection is a
    // shared singleton; background polling (TodayFocus 10s, analytics) issues
    // statements concurrently, and explicit transaction control through this
    // plugin is unreliable — it produces "cannot start a transaction within a
    // transaction" when a prior failed rollback left the connection in a
    // transactional state, or when an interleaved statement auto-begins one.
    //
    // Autocommit avoids that entirely: each statement commits and releases the
    // write lock immediately, so no lock is held across the multi-second
    // import. That also REDUCES contention with polling vs. a long-held
    // transaction. Per-statement retry handles momentary SQLITE_BUSY.
    await db.execute("PRAGMA busy_timeout = 15000").catch(() => {});
    await db.execute("PRAGMA foreign_keys = OFF").catch(() => {});

    const isBusyError = (e: unknown) =>
      /database is locked|SQLITE_BUSY|code: 5/i.test(String((e as Error)?.message ?? e));

    /** Run a write statement, retrying on SQLITE_BUSY with backoff. */
    const execWithRetry = async (sql: string, params: unknown[] = []) => {
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          await db.execute(sql, params);
          return;
        } catch (e) {
          if (!isBusyError(e) || attempt === 5) throw e;
          await new Promise((r) => setTimeout(r, attempt * 300));
        }
      }
    };

    try {
      // Wipe (reverse dependency order so FK refs clear cleanly).
      for (const table of [...TABLES].reverse()) {
        try {
          await execWithRetry(`DELETE FROM ${table}`);
        } catch (e) {
          const msg = (e as Error)?.message ?? "";
          if (!msg.toLowerCase().includes("no such table")) throw e;
          // table may not exist pre-migration; ignore
        }
      }

      // Re-insert (forward dependency order).
      for (const table of TABLES) {
        const rows = payload.data[table] ?? [];
        counts[table] = 0;
        if (rows.length === 0) continue;

        const allowedCols = TABLE_COLUMNS[table] ?? [];
        const validRows = rows.filter((row) => {
          const cols = Object.keys(row).filter((c) => allowedCols.includes(c));
          return cols.length > 0;
        });
        if (validRows.length === 0) continue;

        // Common columns from the first valid row.
        const cols = Object.keys(validRows[0]).filter((c) => allowedCols.includes(c));

        const BATCH_SIZE = 500;
        for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
          const batch = validRows.slice(i, i + BATCH_SIZE);
          const allValues: unknown[] = [];
          const rowPlaceholders: string[] = [];
          let paramIndex = 1;

          for (const row of batch) {
            const placeholders = cols.map(() => `$${paramIndex++}`);
            rowPlaceholders.push(`(${placeholders.join(", ")})`);
            for (const col of cols) {
              // Coerce missing properties to null — JSON may have dropped
              // null/empty values, or rows genuinely have different shapes.
              // Passing JS `undefined` to the SQL binding breaks the param
              // count, so normalize to null here.
              const val = (row as Record<string, unknown>)[col];
              allValues.push(val === undefined ? null : val);
            }
          }

          try {
            await execWithRetry(
              `INSERT INTO ${table} (${cols.join(", ")}) VALUES ${rowPlaceholders.join(", ")}`,
              allValues,
            );
            counts[table] += batch.length;
          } catch (e) {
            // Batch failed — fall back to one-by-one so a single bad row
            // doesn't abort the whole table.
            console.warn(
              `[backup] Batch insert for ${table} failed, trying one-by-one`,
              (e as Error)?.message,
            );
            for (const row of batch) {
              try {
                const singlePlaceholders = cols.map((_, idx) => `$${idx + 1}`);
                const singleValues = cols.map((col) => {
                  const v = (row as Record<string, unknown>)[col];
                  return v === undefined ? null : v;
                });
                await execWithRetry(
                  `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${singlePlaceholders.join(", ")})`,
                  singleValues,
                );
                counts[table]++;
              } catch (singleErr) {
                console.warn(`[backup] Skipped ${table} row:`, (singleErr as Error)?.message);
              }
            }
          }
        }
      }
    } finally {
      // Restore FK enforcement regardless of outcome.
      await db.execute("PRAGMA foreign_keys = ON").catch(() => {});
    }

    return { ok: true, path: filePath, counts };
  } catch (e) {
    console.error("[backup] Import failed:", e);
    const err = e as Error;
    return { 
      ok: false, 
      path: filePath ?? undefined, 
      error: err?.message 
        ? `${err.message} (see dev console for details)` 
        : "Unknown error (see dev console for details)" 
    };
  }
}
