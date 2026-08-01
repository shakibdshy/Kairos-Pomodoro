import { beforeEach, describe, expect, it, vi } from "vitest";

const { execute, load, database } = vi.hoisted(() => {
  const execute = vi.fn().mockResolvedValue({ lastInsertId: 1 });
  const database = { execute, select: vi.fn() };
  const load = vi.fn().mockResolvedValue(database);
  return { execute, load, database };
});

vi.mock("@tauri-apps/plugin-sql", () => ({
  default: { load },
}));

import { getDb, withSerializedWrite } from "@/lib/db/schema";

beforeEach(() => {
  execute.mockReset();
  execute.mockResolvedValue({ lastInsertId: 1 });
});

describe("database transactions", () => {
  it("shares one in-flight database connection across concurrent callers", async () => {
    const connections = await Promise.all([getDb(), getDb(), getDb()]);

    expect(connections[0]).toBe(database);
    expect(connections[1]).toBe(database);
    expect(connections[2]).toBe(database);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("uses autocommit writes without explicit transaction commands", async () => {
    await withSerializedWrite(async (db) => {
      await db.execute("UPDATE time_blocks SET title = $1", ["Focus"]);
    });

    // Assert the UPDATE ran without BEGIN/COMMIT, independently of setup-call
    // ordering: getDb emits a one-time PRAGMA busy_timeout on first load, so
    // the executed-SQL array may or may not include it depending on whether
    // the connection was previously cached by another test in the suite.
    const executedSql = execute.mock.calls.map(([sql]) => sql);
    expect(executedSql).toContain("UPDATE time_blocks SET title = $1");
    expect(executedSql.some((sql) => /^\s*BEGIN\b/i.test(String(sql)))).toBe(false);
    expect(executedSql.some((sql) => /^\s*COMMIT\b/i.test(String(sql)))).toBe(false);
  });

  it("serializes overlapping multi-statement writes", async () => {
    let releaseFirst!: () => void;
    const firstFinished = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    let secondStarted = false;

    const first = withSerializedWrite(async () => {
      await firstFinished;
    });
    const second = withSerializedWrite(async () => {
      secondStarted = true;
    });

    await Promise.resolve();
    expect(secondStarted).toBe(false);
    releaseFirst();
    await Promise.all([first, second]);
    expect(secondStarted).toBe(true);
  });
});
