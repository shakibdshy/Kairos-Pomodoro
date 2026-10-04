import { beforeEach, describe, expect, it, vi } from "vitest";

const { execute, load } = vi.hoisted(() => {
  const execute = vi
    .fn()
    .mockResolvedValue({ lastInsertId: 1, rowsAffected: 0 });
  // Version 0 so initDb runs every migration, not just the base DDL: four of
  // the tables (presets, time_blocks, journal_entries, badge_awards) are only
  // created by migrations and would be invisible at the latest version.
  const select = vi.fn().mockResolvedValue([{ value: 0 }]);
  const database = { execute, select };
  const load = vi.fn().mockResolvedValue(database);
  return { execute, load };
});

vi.mock("@tauri-apps/plugin-sql", () => ({
  default: { load },
}));

import { initDb } from "@/lib/db/schema";
import { WIPED_TABLES } from "@/lib/data-wipe";

/** Tables initDb actually issues CREATE TABLE for, read from the recorded SQL. */
async function tablesCreatedBySchema(): Promise<string[]> {
  execute.mockClear();
  await initDb();
  const names = execute.mock.calls
    .map(
      ([sql]) => String(sql).match(/CREATE TABLE IF NOT EXISTS\s+(\w+)/i)?.[1],
    )
    .filter((name): name is string => Boolean(name));
  return [...new Set(names)].sort();
}

beforeEach(() => {
  execute.mockClear();
  execute.mockResolvedValue({ lastInsertId: 1, rowsAffected: 0 });
});

describe("Clear All Data", () => {
  it("wipes every table the schema creates", async () => {
    expect([...WIPED_TABLES].sort()).toEqual(await tablesCreatedBySchema());
  });

  it("has no duplicates", () => {
    expect(new Set(WIPED_TABLES).size).toBe(WIPED_TABLES.length);
  });

  it.each([
    ["time_blocks", "tasks"],
    ["time_blocks", "categories"],
    ["sessions", "tasks"],
    ["sessions", "categories"],
  ])("deletes %s before its parent %s", (child, parent) => {
    expect(WIPED_TABLES.indexOf(child as never)).toBeLessThan(
      WIPED_TABLES.indexOf(parent as never),
    );
  });
});
