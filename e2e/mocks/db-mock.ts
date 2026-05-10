// Mock database that replaces @tauri-apps/plugin-sql for browser E2E tests.
// Stores everything in memory using plain Maps.

interface Row {
  id: number;
  [col: string]: unknown;
}

const tables = new Map<string, Map<number, Row>>();
const autoInc = new Map<string, number>();
const columnDefaults = new Map<string, Map<string, unknown>>();

(function seedDefaults() {
  const settings = getTable("settings");
  autoInc.set("settings", 1);
  settings.set(1, { id: 1, key: "onboarding_complete", value: "true" });
})();

function getTable(name: string): Map<number, Row> {
  if (!tables.has(name)) {
    tables.set(name, new Map());
    autoInc.set(name, 0);
  }
  return tables.get(name)!;
}

function allRows(name: string): Row[] {
  return Array.from(getTable(name).values());
}

function parseTable(sql: string): string {
  const m = sql.match(
    /(?:FROM|INTO|UPDATE|TABLE(?:\s+IF\s+NOT\s+EXISTS)?)\s+["']?(\w+)/i,
  );
  return m ? m[1].toLowerCase() : "";
}

function parseWhereId(sql: string, params: unknown[]): number | null {
  const m = sql.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
  return m ? Number(params[parseInt(m[1]) - 1]) : null;
}

function applyWhereFilters(rows: Row[], sql: string, up: string, params: unknown[]): Row[] {
  if (!up.includes("WHERE")) return rows;

  let result = rows;
  if (up.includes("ARCHIVED = 0")) result = result.filter((r) => r.archived === 0);
  if (up.includes("COMPLETED = 1")) result = result.filter((r) => r.completed === 1);
  if (up.includes("COMPLETED = 0")) result = result.filter((r) => r.completed === 0);
  if (up.includes("DATE(STARTED_AT)")) result = [];

  const id = parseWhereId(sql, params);
  if (id) result = result.filter((r) => r.id === id);

  const genericEq = sql.match(/WHERE\s+(\w+)\s*=\s*\$(\d+)/i);
  if (genericEq) {
    const col = genericEq[1];
    const pIdx = parseInt(genericEq[2]) - 1;
    if (pIdx < params.length && col !== "id") {
      result = result.filter((r) => r[col] === params[pIdx]);
    }
  }

  return result;
}

function parseCreateDefaults(sql: string): Map<string, unknown> {
  const defaults = new Map<string, unknown>();
  // Match column definitions inside the CREATE TABLE body
  const bodyMatch = sql.match(/\(([^)]+)\)/s);
  if (!bodyMatch) return defaults;

  const lines = bodyMatch[1].split(",").map((l) => l.trim());
  for (const line of lines) {
    // Skip constraints (FOREIGN KEY, PRIMARY KEY, etc.)
    if (/^(FOREIGN|PRIMARY|UNIQUE|CHECK|CONSTRAINT)/i.test(line)) continue;

    const parts = line.split(/\s+/);
    const colName = parts[0].replace(/["']/g, "");
    if (!colName) continue;

    const defaultMatch = line.match(/DEFAULT\s+(\S+)/i);
    if (defaultMatch) {
      let val = defaultMatch[1];
      // Remove trailing comma
      val = val.replace(/,$/, "");
      // Parse the default value
      if (val === "0") defaults.set(colName, 0);
      else if (val === "1") defaults.set(colName, 1);
      else if (/^\d+$/.test(val)) defaults.set(colName, Number(val));
      else if (
        val.startsWith("'") &&
        val.endsWith("'") &&
        val !== "'now'"
      ) {
        defaults.set(colName, val.slice(1, -1));
      }
    }
  }
  return defaults;
}

export class Database {
  static async load(_name: string): Promise<Database> {
    return new Database();
  }

  async execute(sql: string, params: unknown[] = []) {
    const up = sql.trim().toUpperCase();
    const name = parseTable(sql);

    if (up.startsWith("CREATE TABLE")) {
      getTable(name);
      columnDefaults.set(name, parseCreateDefaults(sql));
      return { lastInsertId: 0, rowsAffected: 0 };
    }

    if (up.startsWith("INSERT")) {
      const tbl = getTable(name);
      const id = (autoInc.get(name) || 0) + 1;
      autoInc.set(name, id);
      const row: Row = { id };

      // Apply schema defaults first
      const defaults = columnDefaults.get(name);
      if (defaults) {
        for (const [col, val] of defaults) {
          row[col] = val;
        }
      }

      // Parse the VALUES tokens to handle mixed placeholders and literals
      const colsM = sql.match(/\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      if (colsM) {
        const cols = colsM[1].split(",").map((c) => c.trim());
        const valTokens = colsM[2].split(",").map((v) => v.trim());
        cols.forEach((col, i) => {
          if (col.toLowerCase() === "id") return;
          const token = valTokens[i];
          if (!token) return;

          if (/^\$\d+$/.test(token)) {
            // Placeholder — consume from params
            const pIdx = parseInt(token.slice(1)) - 1;
            row[col] = pIdx < params.length ? params[pIdx] : null;
          }
          // Otherwise it's a literal/function — skip, default was already applied
        });
      }
      tbl.set(id, row);
      return { lastInsertId: id, rowsAffected: 1 };
    }

    if (up.startsWith("UPDATE")) {
      const tbl = getTable(name);
      const id = parseWhereId(sql, params);

      // Upsert for settings table
      if (up.includes("ON CONFLICT")) {
        for (const [, row] of tbl) {
          if (row.key === params[0]) {
            row.value = params[params.length - 1];
            return { lastInsertId: 0, rowsAffected: 1 };
          }
        }
        const newId = (autoInc.get(name) || 0) + 1;
        autoInc.set(name, newId);
        tbl.set(newId, { id: newId, key: params[0], value: params[1] });
        return { lastInsertId: 0, rowsAffected: 1 };
      }

      if (id && tbl.has(id)) {
        const row = tbl.get(id)!;
        // Handle col = col + 1
        const incM = sql.match(/(\w+)\s*=\s*\1\s*\+\s*1/i);
        if (incM) {
          row[incM[1]] = ((row[incM[1]] as number) || 0) + 1;
          return { lastInsertId: 0, rowsAffected: 1 };
        }
        // General SET
        const setM = sql.match(/SET\s+(.+?)(?:\s+WHERE|$)/is);
        if (setM) {
          setM[1]
            .split(",")
            .map((s) => s.trim())
            .forEach((part) => {
              const [col] = part.split("=").map((s) => s.trim());
              const idxM = part.match(/\$(\d+)/);
              if (idxM) row[col] = params[parseInt(idxM[1]) - 1];
            });
        }
        return { lastInsertId: 0, rowsAffected: 1 };
      }
      return { lastInsertId: 0, rowsAffected: 0 };
    }

    if (up.startsWith("DELETE")) {
      const tbl = getTable(name);
      const id = parseWhereId(sql, params);
      if (id && tbl.has(id)) {
        tbl.delete(id);
        return { lastInsertId: 0, rowsAffected: 1 };
      }
      const tm = sql.match(/task_id\s*=\s*\$(\d+)/i);
      if (tm) {
        const tid = Number(params[parseInt(tm[1]) - 1]);
        for (const [rid, row] of tbl) {
          if (row.task_id === tid) tbl.delete(rid);
        }
      }
      return { lastInsertId: 0, rowsAffected: 0 };
    }

    if (up.startsWith("ALTER TABLE")) {
      const cm = sql.match(/ADD\s+COLUMN\s+(\w+)/i);
      if (cm) {
        for (const row of getTable(name).values()) {
          if (!(cm[1] in row)) row[cm[1]] = null;
        }
      }
      return { lastInsertId: 0, rowsAffected: 0 };
    }

    return { lastInsertId: 0, rowsAffected: 0 };
  }

  async select<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const up = sql.trim().toUpperCase();
    const name = parseTable(sql);

    if (name === "_schema_meta") {
      const tbl = getTable(name);
      const vrow = Array.from(tbl.values()).find((r) => r.key === "version");
      return (vrow ? [{ value: vrow.value }] : []) as T[];
    }

    if (up.includes("COUNT(*)")) {
      const countCol = (sql.match(/COUNT\(\*\)\s+AS\s+(\w+)/i) || [])[1] ?? "count";
      let rows = allRows(name);

      rows = applyWhereFilters(rows, sql, up, params);

      return [{ [countCol]: rows.length }] as T[];
    }

    if (
      up.includes("SUM(") ||
      up.includes("COUNT(") ||
      up.includes("AVG(") ||
      up.includes("COALESCE")
    ) {
      return [] as T[];
    }

    let rows = allRows(name);

    rows = applyWhereFilters(rows, sql, up, params);

    return rows as T[];
  }
}

export default Database;
