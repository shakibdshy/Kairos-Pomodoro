import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the DB singleton before importing the repo — same pattern as
// time-blocks.test.ts.
const { execute } = vi.hoisted(() => ({
  execute: vi.fn().mockResolvedValue({ lastInsertId: 1 }),
}));

vi.mock("@/lib/db/schema", () => ({
  getDb: vi.fn().mockResolvedValue({ execute }),
}));

import {
  addLoggedSession,
  updateLoggedSession,
  deleteSession,
} from "@/lib/db/sessions";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("logged-session (time-block → session) helpers", () => {
  it("addLoggedSession inserts an explicit-timestamp completed session", async () => {
    execute.mockResolvedValueOnce({ lastInsertId: 11 });
    const id = await addLoggedSession({
      taskId: 3,
      phase: "work",
      startedAt: "2026-07-05 12:30:00",
      endedAt: "2026-07-05 13:30:00",
      durationSec: 3600,
      categoryId: 2,
      intention: "Deep work",
    });
    expect(id).toBe(11);
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO sessions/);
    expect(sql).toMatch(/completed/);
    expect(params).toEqual([
      3,
      "work",
      "2026-07-05 12:30:00",
      "2026-07-05 13:30:00",
      3600,
      2,
      "Deep work",
    ]);
  });

  it("updateLoggedSession rewrites times + duration for an existing session", async () => {
    await updateLoggedSession(11, {
      taskId: 4,
      startedAt: "2026-07-05 13:00:00",
      endedAt: "2026-07-05 14:30:00",
      durationSec: 5400,
      categoryId: 1,
      intention: "Edited",
    });
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toMatch(/UPDATE sessions\s+SET/);
    expect(sql).toMatch(/started_at = \$2/);
    expect(sql).toMatch(/duration_sec = MAX\(0, \$4\)/);
    expect(sql).toMatch(/WHERE id = \$7/);
    expect(params).toEqual([
      4,
      "2026-07-05 13:00:00",
      "2026-07-05 14:30:00",
      5400,
      1,
      "Edited",
      11,
    ]);
  });

  it("deleteSession deletes by id", async () => {
    await deleteSession(11);
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toMatch(/DELETE FROM sessions WHERE id = \$1/);
    expect(params).toEqual([11]);
  });
});
