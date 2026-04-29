// Mock database that replaces @tauri-apps/plugin-sql for browser E2E tests.
// Stores everything in memory using plain Maps.

interface Row {
  id: number;
  [col: string]: unknown;
}

const tables = new Map<string, Map<number, Row>>();
const autoInc = new Map<string, number>();

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

export class Database {
  static async load(_name: string): Promise<Database> {
    return new Database();
  }

  async execute(sql: string, params: unknown[] = []) {
    const up = sql.trim().toUpperCase();
    const name = parseTable(sql);

    if (up.startsWith("CREATE TABLE")) {
      getTable(name);
      return { lastInsertId: 0, rowsAffected: 0 };
    }

    if (up.startsWith("INSERT")) {
      const tbl = getTable(name);
      const id = (autoInc.get(name) || 0) + 1;
      autoInc.set(name, id);
      const row: Row = { id };
      const colsM = sql.match(/\(([^)]+)\)\s*VALUES/i);
      if (colsM) {
        colsM[1]
          .split(",")
          .map((c) => c.trim())
          .forEach((col, i) => {
            if (col.toLowerCase() !== "id") {
              row[col] = i < params.length ? params[i] : null;
            }
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

    // Aggregation queries — return empty for simplicity
    if (
      up.includes("SUM(") ||
      up.includes("COUNT(") ||
      up.includes("AVG(") ||
      up.includes("COALESCE")
    ) {
      if (name === "_schema_meta") {
        const tbl = getTable(name);
        const vrow = Array.from(tbl.values()).find((r) => r.key === "version");
        return (vrow ? [{ value: vrow.value }] : []) as T[];
      }
      return [] as T[];
    }

    let rows = allRows(name);

    if (up.includes("WHERE")) {
      if (up.includes("archived = 0")) rows = rows.filter((r) => r.archived === 0);
      if (up.includes("completed = 1")) rows = rows.filter((r) => r.completed === 1);
      if (up.includes("completed = 0")) rows = rows.filter((r) => r.completed === 0);
      if (up.includes("date(started_at)")) rows = []; // today queries
      const id = parseWhereId(sql, params);
      if (id) rows = rows.filter((r) => r.id === id);
    }

    return rows as T[];
  }
}

export default Database;
