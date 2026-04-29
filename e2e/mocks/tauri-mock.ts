// In-memory SQLite-like database mock for Playwright browser tests.
// This is injected before the app loads so Tauri plugin-sql calls work in the browser.

interface MockRow {
  [col: string]: string | number | null;
}

function createMockDatabase() {
  const tables: Map<string, Map<number, MockRow>> = new Map();
  const autoIncrement: Map<string, number> = new Map();
  let nextId = 1;

  function getTable(name: string): Map<number, MockRow> {
    if (!tables.has(name)) tables.set(name, new Map());
    return tables.get(name)!;
  }

  function parseTableName(sql: string): string {
    const m = sql.match(/(?:FROM|INTO|UPDATE|TABLE(?:\s+IF\s+NOT\s+EXISTS)?)\s+["']?(\w+)/i);
    return m ? m[1].toLowerCase() : "";
  }

  function parseWhereId(sql: string, params: unknown[]): { id: number } | null {
    const m = sql.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
    if (m) return { id: Number(params[parseInt(m[1]) - 1]) };
    return null;
  }

  function selectAll(tableName: string): MockRow[] {
    const table = getTable(tableName);
    return Array.from(table.values());
  }

  function filterRows(tableName: string, predicate: (row: MockRow) => boolean): MockRow[] {
    return selectAll(tableName).filter(predicate);
  }

  function execute(sql: string, params: unknown[] = []): { lastInsertId: number; rowsAffected: number } {
    const upper = sql.trim().toUpperCase();

    if (upper.startsWith("CREATE TABLE")) {
      const name = parseTableName(sql);
      getTable(name);
      return { lastInsertId: 0, rowsAffected: 0 };
    }

    if (upper.startsWith("INSERT")) {
      const name = parseTableName(sql);
      const table = getTable(name);
      const id = (autoIncrement.get(name) ?? 0) + 1;
      autoIncrement.set(name, id);

      const row: MockRow = { id };
      // Extract column placeholders
      const colsMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
      if (colsMatch) {
        const cols = colsMatch[1].split(",").map((c) => c.trim());
        cols.forEach((col, i) => {
          if (col.toLowerCase() !== "id") {
            row[col] = params[i] ?? null;
          }
        });
      }
      table.set(id, row);
      return { lastInsertId: id, rowsAffected: 1 };
    }

    if (upper.startsWith("UPDATE")) {
      const name = parseTableName(sql);
      const table = getTable(name);
      let rowsAffected = 0;

      if (upper.includes("ON CONFLICT")) {
        // INSERT OR REPLACE / ON CONFLICT DO UPDATE
        const keyMatch = sql.match(/key\s*=\s*\$(\d+)/i);
        if (keyMatch) {
          const keyIdx = parseInt(keyMatch[1]) - 1;
          // Find existing row by value
          const keyVal = params[keyIdx];
          const valIdx = sql.indexOf("value =") !== -1 || sql.indexOf("value=") !== -1;
          for (const [id, row] of table) {
            const entries = Object.values(row);
            if (entries.some((v) => v === keyVal) || row.key === keyVal) {
              if (sql.includes("DO UPDATE SET value")) {
                row.value = params[params.length - 1] as string;
                rowsAffected++;
              }
            }
          }
          if (rowsAffected === 0) {
            // Insert new
            const id = (autoIncrement.get(name) ?? 0) + 1;
            autoIncrement.set(name, id);
            const row: MockRow = { id, key: params[0], value: params[1] };
            table.set(id, row);
            rowsAffected = 1;
          }
        }
        return { lastInsertId: 0, rowsAffected };
      }

      // Regular UPDATE
      const setMatch = sql.match(/SET\s+(.+?)(?:\s+WHERE|$)/i);
      const where = parseWhereId(sql, params);
      if (setMatch && where) {
        const row = table.get(where.id);
        if (row) {
          const assignments = setMatch[1].split(",").map((s) => s.trim());
          let paramIdx = 0;
          for (const assignment of assignments) {
            const [col, _val] = assignment.split("=").map((s) => s.trim());
            if (col) {
              // Skip the WHERE param
              const idx = (assignment.match(/\$(\d+)/g) || []).map(
                (m) => parseInt(m.slice(1)) - 1,
              );
              row[col] = params[idx[0]] ?? null;
            }
          }
          rowsAffected = 1;
        }
      }
      // Handle increment style: completed_pomos = completed_pomos + 1
      const incMatch = sql.match(/(\w+)\s*=\s*\1\s*\+\s*1/i);
      if (incMatch && where) {
        const row = table.get(where.id);
        if (row) {
          const col = incMatch[1];
          row[col] = ((row[col] as number) || 0) + 1;
          rowsAffected = 1;
        }
      }
      return { lastInsertId: 0, rowsAffected };
    }

    if (upper.startsWith("DELETE")) {
      const name = parseTableName(sql);
      const table = getTable(name);
      const where = parseWhereId(sql, params);
      if (where && table.has(where.id)) {
        table.delete(where.id);
        return { lastInsertId: 0, rowsAffected: 1 };
      }
      // Check for task_id based delete
      const taskMatch = sql.match(/task_id\s*=\s*\$(\d+)/i);
      if (taskMatch) {
        const taskId = Number(params[parseInt(taskMatch[1]) - 1]);
        for (const [id, row] of table) {
          if (row.task_id === taskId) table.delete(id);
        }
      }
      return { lastInsertId: 0, rowsAffected: 0 };
    }

    if (upper.startsWith("ALTER TABLE")) {
      const name = parseTableName(sql);
      const table = getTable(name);
      const colMatch = sql.match(/ADD\s+COLUMN\s+(\w+)/i);
      if (colMatch) {
        for (const row of table.values()) {
          if (!(colMatch[1] in row)) row[colMatch[1]] = null;
        }
      }
      return { lastInsertId: 0, rowsAffected: 0 };
    }

    return { lastInsertId: 0, rowsAffected: 0 };
  }

  function select<T>(sql: string, params: unknown[] = []): T[] {
    const upper = sql.trim().toUpperCase();
    const name = parseTableName(sql);

    if (upper.includes("COUNT") || upper.includes("SUM") || upper.includes("AVG") || upper.includes("COALESCE")) {
      // Aggregation queries — return minimal mock data
      if (upper.includes("_schema_meta")) {
        const table = getTable("_schema_meta");
        const versionRow = Array.from(table.values()).find((r) => r.key === "version");
        if (sql.includes("version")) {
          return (versionRow ? [{ value: versionRow.value }] : []) as T[];
        }
        return [] as T[];
      }
      if (upper.includes("GROUP BY")) {
        return [] as T[];
      }
      return [{ total: 0, total_focus_seconds: 0, total_sessions: 0, avg_session_seconds: 0, longest_session_seconds: 0, total_break_seconds: 0, avg_break_seconds: 0, total_seconds: 0, session_count: 0, cnt: 0 }] as T[];
    }

    let rows = selectAll(name);

    // Filter by WHERE conditions
    if (upper.includes("WHERE")) {
      if (upper.includes("archived = 0")) {
        rows = rows.filter((r) => r.archived === 0 || r.archived === null);
      }
      if (upper.includes("completed = 1") || upper.includes("completed = 0")) {
        const val = upper.includes("completed = 1") ? 1 : 0;
        rows = rows.filter((r) => r.completed === val);
      }
      if (upper.includes("date(started_at)") && upper.includes("date('now'")) {
        // Today sessions — return empty for simplicity
        rows = [];
      }
      const whereId = parseWhereId(sql, params);
      if (whereId) {
        rows = rows.filter((r) => r.id === whereId.id);
      }
    }

    return rows as T[];
  }

  return { execute, select };
}

const mockDb = createMockDatabase();

// Mock window.__TAURI_INTERNALS__ so isTauri() returns true
(window as any).__TAURI_INTERNALS__ = {};

// Intercept dynamic imports of @tauri-apps/plugin-sql
const origFetch = window.fetch;
const moduleCache = new Map<string, string>();

// Provide a mock module via import map or script injection
const mockSqlModule = `
const db = window.__mockDb;

class Database {
  static async load(name) {
    return new Database();
  }
  async execute(sql, params) {
    return db.execute(sql, params || []);
  }
  async select(sql, params) {
    return db.select(sql, params || []);
  }
}

export default Database;
export { Database };
`;

// Store on window for access
(window as any).__mockDb = mockDb;

// Intercept module resolution by patching the dynamic import system
const blob = new Blob([mockSqlModule], { type: "text/javascript" });
const moduleUrl = URL.createObjectURL(blob);
(window as any).__mockSqlUrl = moduleUrl;

// Also provide a mock for the notifications module
const mockNotifications = `
export async function sendNotification(type, message) {
  console.log('[Mock] Notification:', type, message);
}
export async function playChime() {
  console.log('[Mock] Chime played');
}
`;

const notifBlob = new Blob([mockNotifications], { type: "text/javascript" });
(window as any).__mockNotifUrl = URL.createObjectURL(notifBlob);

// Mock invoke for @tauri-apps/api/core
const mockCore = `
export async function invoke(cmd, args) {
  console.log('[Mock] Invoke:', cmd, args);
  return null;
}
`;

const coreBlob = new Blob([mockCore], { type: "text/javascript" });
(window as any).__mockCoreUrl = URL.createObjectURL(coreBlob);

// Set up import map to redirect Tauri modules to our mocks
const importMap = {
  imports: {
    "@tauri-apps/plugin-sql": (window as any).__mockSqlUrl,
    "@tauri-apps/plugin-sql/dist-js/index.js": (window as any).__mockSqlUrl,
  },
};

const script = document.createElement("script");
script.type = "importmap";
script.textContent = JSON.stringify(importMap);
document.head.prepend(script);

console.log("[TauriMock] Browser mocks initialized");
