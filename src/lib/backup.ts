import { save, open } from "@tauri-apps/plugin-dialog";
import { writeFile, readTextFile } from "@tauri-apps/plugin-fs";
import { getDb } from "@/lib/db/schema";
import { isTauri } from "@/lib/tauri";

/** Schema version this build writes/accepts. Must stay in sync with schema.ts targetVersion. */
export const BACKUP_FORMAT_VERSION = 1;
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
  if (typeof p.formatVersion !== "number") {
    throw new Error("Invalid backup file: missing format version.");
  }
  if (p.formatVersion > BACKUP_FORMAT_VERSION) {
    throw new Error(
      `Backup was created by a newer version of Kairos (format v${p.formatVersion}). This build only supports up to v${BACKUP_FORMAT_VERSION}.`,
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

    // Wipe then re-insert, in dependency order. Reverse order for deletes so
    // foreign-key references (sessions→tasks, etc.) clear cleanly.
    const counts: Record<string, number> = {};
    for (const table of [...TABLES].reverse()) {
      try {
        await db.execute(`DELETE FROM ${table}`);
      } catch {
        // table may not exist pre-migration; ignore
      }
    }

    for (const table of TABLES) {
      const rows = payload.data[table] ?? [];
      counts[table] = rows.length;
      if (rows.length === 0) continue;

      for (const row of rows) {
        const cols = Object.keys(row);
        if (cols.length === 0) continue;
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
        const values = cols.map((c) => (row as Record<string, unknown>)[c]);
        try {
          await db.execute(
            `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`,
            values,
          );
        } catch (e) {
          // Skip rows that violate constraints (e.g. duplicate keys), keep going.
          console.warn(`[backup] Skipped ${table} row:`, (e as Error)?.message);
        }
      }
    }

    return { ok: true, path: filePath, counts };
  } catch (e) {
    return { ok: false, path: filePath ?? undefined, error: (e as Error)?.message ?? "Unknown error" };
  }
}
