import { describe, it, expect, vi, beforeEach } from "vitest";

const { execute, select } = vi.hoisted(() => ({
  execute: vi.fn().mockResolvedValue({ lastInsertId: 1 }),
  select: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/db/schema", () => ({
  getDb: vi.fn().mockResolvedValue({ execute, select }),
}));

import {
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalEntries,
} from "@/lib/db/journal";
import type { JournalEntry } from "@/lib/db";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("journal repository", () => {
  it("addJournalEntry inserts with today's date by default", async () => {
    execute.mockResolvedValueOnce({ lastInsertId: 42 });
    const id = await addJournalEntry("Morning reflection");
    expect(id).toBe(42);
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO journal_entries \(date, content\) VALUES \(\$1, \$2\)/);
    expect(params[1]).toBe("Morning reflection");
    expect(params[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("addJournalEntry accepts an explicit date", async () => {
    execute.mockResolvedValueOnce({ lastInsertId: 3 });
    await addJournalEntry("Backdated", "2025-01-15");
    const [, params] = execute.mock.calls[0];
    expect(params).toEqual(["2025-01-15", "Backdated"]);
  });

  it("updateJournalEntry updates content and timestamp", async () => {
    await updateJournalEntry(5, "Updated content");
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toMatch(/UPDATE journal_entries SET content = \$1, updated_at = CURRENT_TIMESTAMP WHERE id = \$2/);
    expect(params).toEqual(["Updated content", 5]);
  });

  it("deleteJournalEntry deletes by id", async () => {
    await deleteJournalEntry(9);
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toMatch(/DELETE FROM journal_entries WHERE id = \$1/);
    expect(params).toEqual([9]);
  });

  it("getJournalEntries returns all rows when no range is given", async () => {
    const sample: JournalEntry[] = [
      {
        id: 1,
        date: "2026-07-03",
        content: "Entry one",
        created_at: "2026-07-03T10:00:00Z",
        updated_at: "2026-07-03T10:00:00Z",
      },
    ];
    select.mockResolvedValueOnce(sample);
    const result = await getJournalEntries();
    expect(result).toEqual(sample);
    const [sql, params] = select.mock.calls[0];
    expect(sql).toMatch(/SELECT \* FROM journal_entries ORDER BY date DESC, created_at DESC/);
    expect(params).toBeUndefined();
  });

  it("getJournalEntries filters by date range", async () => {
    const sample: JournalEntry[] = [
      {
        id: 2,
        date: "2026-07-02",
        content: "Entry two",
        created_at: "2026-07-02T10:00:00Z",
        updated_at: "2026-07-02T10:00:00Z",
      },
    ];
    select.mockResolvedValueOnce(sample);
    const result = await getJournalEntries("2026-07-01", "2026-07-07");
    expect(result).toEqual(sample);
    const [sql, params] = select.mock.calls[0];
    expect(sql).toMatch(/WHERE date >= \$1 AND date <= \$2/);
    expect(params).toEqual(["2026-07-01", "2026-07-07"]);
  });
});
