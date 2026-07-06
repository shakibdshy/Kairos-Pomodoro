import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the DB singleton before importing the repo.
const { execute, select } = vi.hoisted(() => ({
  execute: vi.fn().mockResolvedValue({ lastInsertId: 1 }),
  select: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/db/schema", () => ({
  getDb: vi.fn().mockResolvedValue({ execute, select }),
}));

import {
  addTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
  getTimeBlock,
  getWeekTimeBlocks,
  markTimeBlockCompleted,
} from "@/lib/db/time-blocks";
import type { TimeBlock, TimeBlockWithMeta } from "@/lib/db";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("time-blocks repository", () => {
  it("addTimeBlock inserts all fields and returns the new id", async () => {
    execute.mockResolvedValueOnce({ lastInsertId: 42 });
    const id = await addTimeBlock({
      title: "Deep work",
      start_time: "2026-07-03 09:00:00",
      end_time: "2026-07-03 09:25:00",
      task_id: 3,
      category_id: 1,
      color: "#c2652a",
      session_id: 7,
    });
    expect(id).toBe(42);
    expect(execute).toHaveBeenCalledTimes(1);
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO time_blocks/);
    expect(params).toEqual([
      "Deep work",
      "2026-07-03 09:00:00",
      "2026-07-03 09:25:00",
      3,
      1,
      "#c2652a",
      7,
    ]);
  });

  it("addTimeBlock nullifies optional fields when omitted", async () => {
    await addTimeBlock({
      title: null,
      start_time: "2026-07-03 09:00:00",
      end_time: "2026-07-03 10:00:00",
    });
    const [, params] = execute.mock.calls[0];
    expect(params).toEqual([
      null,
      "2026-07-03 09:00:00",
      "2026-07-03 10:00:00",
      null,
      null,
      null,
      null,
    ]);
  });

  it("updateTimeBlock builds a dynamic SET clause", async () => {
    await updateTimeBlock(7, { title: "Renamed", color: "#ff0000" });
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toMatch(/UPDATE time_blocks SET title = \$1, color = \$2 WHERE id = \$3/);
    expect(params).toEqual(["Renamed", "#ff0000", 7]);
  });

  it("updateTimeBlock sets session_id to link a logged session", async () => {
    await updateTimeBlock(3, { session_id: 9 });
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toMatch(/UPDATE time_blocks SET session_id = \$1 WHERE id = \$2/);
    expect(params).toEqual([9, 3]);
  });

  it("updateTimeBlock is a no-op when given nothing to update", async () => {
    await updateTimeBlock(7, {});
    expect(execute).not.toHaveBeenCalled();
  });

  it("deleteTimeBlock deletes by id", async () => {
    await deleteTimeBlock(9);
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toMatch(/DELETE FROM time_blocks WHERE id = \$1/);
    expect(params).toEqual([9]);
  });

  it("getTimeBlock returns the matching row or null", async () => {
    const sample: TimeBlock = {
      id: 7,
      title: "Found",
      start_time: "2026-07-03 09:00:00",
      end_time: "2026-07-03 09:25:00",
      task_id: null,
      category_id: null,
      color: null,
      completed: 0,
      created_at: "2026-07-03",
      session_id: null,
    };
    select.mockResolvedValueOnce([sample]);
    const result = await getTimeBlock(7);
    expect(result).toEqual(sample);
    const [sql, params] = select.mock.calls[0];
    expect(sql).toMatch(/SELECT \* FROM time_blocks WHERE id = \$1/);
    expect(params).toEqual([7]);

    select.mockResolvedValueOnce([]);
    const missing = await getTimeBlock(99);
    expect(missing).toBeNull();
  });

  it("addTimeBlock rejects invalid time ranges", async () => {
    await expect(
      addTimeBlock({
        title: null,
        start_time: "2026-07-03 10:00:00",
        end_time: "2026-07-03 09:00:00",
      }),
    ).rejects.toThrow("end_time must be after start_time");
    expect(execute).not.toHaveBeenCalled();
  });

  it("getWeekTimeBlocks joins tasks + categories and filters by date range", async () => {
    const sample: TimeBlockWithMeta[] = [
      {
        id: 1,
        title: "Block",
        start_time: "2026-07-03 09:00:00",
        end_time: "2026-07-03 09:25:00",
        task_id: 2,
        category_id: 1,
        color: null,
        completed: 0,
        created_at: "2026-07-03",
        session_id: 5,
        task_name: "Report",
        category_name: "Writing",
        category_color: "#abc",
      },
    ];
    select.mockResolvedValueOnce(sample);
    const result = await getWeekTimeBlocks("2026-07-01", "2026-07-07");
    expect(result).toEqual(sample);
    const [sql, params] = select.mock.calls[0];
    expect(sql).toMatch(/LEFT JOIN tasks t/);
    expect(sql).toMatch(/LEFT JOIN categories c/);
    expect(sql).toMatch(/date\(tb\.start_time\) >= \$1/);
    expect(params).toEqual(["2026-07-01", "2026-07-07"]);
  });

  it("markTimeBlockCompleted sets the completed flag", async () => {
    await markTimeBlockCompleted(5, true);
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toMatch(/UPDATE time_blocks SET completed = \$1 WHERE id = \$2/);
    expect(params).toEqual([1, 5]);
  });
});
