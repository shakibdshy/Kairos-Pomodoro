// In-memory database mock injected into the browser before the app loads.
// This replaces @tauri-apps/plugin-sql so the app boots in Playwright without Tauri.

function createMockDatabase() {
  const tables = {};
  const autoInc = {};

  function getTable(name) {
    if (!tables[name]) { tables[name] = {}; autoInc[name] = 0; }
    return tables[name];
  }

  function parseTable(sql) {
    const m = sql.match(/(?:FROM|INTO|UPDATE|TABLE(?:\s+IF\s+NOT\s+EXISTS)?)\s+["']?(\w+)/i);
    return m ? m[1].toLowerCase() : "";
  }

  function parseWhereId(sql, params) {
    const m = sql.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
    return m ? Number(params[parseInt(m[1]) - 1]) : null;
  }

  function allRows(name) {
    return Object.values(getTable(name));
  }

  return {
    async execute(sql, params) {
      params = params || [];
      const up = sql.trim().toUpperCase();
      const name = parseTable(sql);

      if (up.startsWith("CREATE TABLE")) {
        getTable(name);
        return { lastInsertId: 0, rowsAffected: 0 };
      }

      if (up.startsWith("INSERT")) {
        const tbl = getTable(name);
        autoInc[name] = (autoInc[name] || 0) + 1;
        const id = autoInc[name];
        const row = { id };

        const colsM = sql.match(/\(([^)]+)\)\s*VALUES/i);
        if (colsM) {
          colsM[1].split(",").map(c => c.trim()).forEach((col, i) => {
            if (col.toLowerCase() !== "id") row[col] = i < params.length ? params[i] : null;
          });
        }
        tbl[id] = row;
        return { lastInsertId: id, rowsAffected: 1 };
      }

      if (up.startsWith("UPDATE")) {
        const tbl = getTable(name);
        const id = parseWhereId(sql, params);

        // Handle ON CONFLICT (upsert for settings)
        if (up.includes("ON CONFLICT")) {
          let found = false;
          for (const rid in tbl) {
            if (tbl[rid].key === params[0]) {
              tbl[rid].value = params[params.length - 1];
              found = true;
              break;
            }
          }
          if (!found) {
            autoInc[name] = (autoInc[name] || 0) + 1;
            tbl[autoInc[name]] = { id: autoInc[name], key: params[0], value: params[1] };
          }
          return { lastInsertId: 0, rowsAffected: 1 };
        }

        // Handle increment: col = col + 1
        const incM = sql.match(/(\w+)\s*=\s*\1\s*\+\s*1/i);
        if (incM && id && tbl[id]) {
          const col = incM[1];
          tbl[id][col] = (tbl[id][col] || 0) + 1;
          return { lastInsertId: 0, rowsAffected: 1 };
        }

        // General SET assignments
        if (id && tbl[id]) {
          const setM = sql.match(/SET\s+(.+?)(?:\s+WHERE|$)/is);
          if (setM) {
            const parts = setM[1].split(",").map(s => s.trim());
            for (const part of parts) {
              const [col] = part.split("=").map(s => s.trim());
              const idxM = part.match(/\$(\d+)/);
              if (idxM) {
                tbl[id][col] = params[parseInt(idxM[1]) - 1];
              }
            }
          }
          return { lastInsertId: 0, rowsAffected: 1 };
        }
        return { lastInsertId: 0, rowsAffected: 0 };
      }

      if (up.startsWith("DELETE")) {
        const tbl = getTable(name);
        const id = parseWhereId(sql, params);
        if (id && tbl[id]) { delete tbl[id]; return { lastInsertId: 0, rowsAffected: 1 }; }
        // Delete by task_id
        const tm = sql.match(/task_id\s*=\s*\$(\d+)/i);
        if (tm) {
          const tid = Number(params[parseInt(tm[1]) - 1]);
          for (const rid in tbl) { if (tbl[rid].task_id === tid) delete tbl[rid]; }
        }
        return { lastInsertId: 0, rowsAffected: 0 };
      }

      if (up.startsWith("ALTER TABLE")) {
        const tbl = getTable(name);
        const cm = sql.match(/ADD\s+COLUMN\s+(\w+)/i);
        if (cm) {
          for (const rid in tbl) {
            if (!(cm[1] in tbl[rid])) tbl[rid][cm[1]] = null;
          }
        }
        return { lastInsertId: 0, rowsAffected: 0 };
      }

      return { lastInsertId: 0, rowsAffected: 0 };
    },

    async select(sql, params) {
      params = params || [];
      const up = sql.trim().toUpperCase();
      const name = parseTable(sql);

      // Aggregation queries
      if (up.includes("SUM(") || up.includes("COUNT(") || up.includes("AVG(") || up.includes("COALESCE")) {
        if (name === "_schema_meta") {
          const tbl = getTable(name);
          const vrow = Object.values(tbl).find(r => r.key === "version");
          return vrow ? [{ value: vrow.value }] : [];
        }
        return [];
      }

      let rows = allRows(name);

      if (up.includes("WHERE")) {
        if (up.includes("archived = 0")) rows = rows.filter(r => r.archived === 0);
        if (up.includes("completed = 1")) rows = rows.filter(r => r.completed === 1);
        if (up.includes("completed = 0")) rows = rows.filter(r => r.completed === 0);
        if (up.includes("date(started_at)")) rows = []; // today queries return empty
        const id = parseWhereId(sql, params);
        if (id) rows = rows.filter(r => r.id === id);
      }

      return rows;
    },
  };
}

// Set up the mock
window.__TAURI_INTERNALS__ = {};
window.__mockDb = createMockDatabase();

// Override the plugin-sql Database class via import map
const db = window.__mockDb;

const mockSqlSrc = `
const db = window.__mockDb;
class Database {
  static async load(name) { return new Database(); }
  async execute(sql, params) { return db.execute(sql, params || []); }
  async select(sql, params) { return db.select(sql, params || []); }
}
export default Database;
export { Database };
`;

const blob = new Blob([mockSqlSrc], { type: "text/javascript" });
const url = URL.createObjectURL(blob);

const importMap = { imports: { "@tauri-apps/plugin-sql": url } };
const s = document.createElement("script");
s.type = "importmap";
s.textContent = JSON.stringify(importMap);
document.currentScript.before(s);
