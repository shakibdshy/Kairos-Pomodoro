import { describe, it, expect } from "vitest";
import { computeDayLayout } from "@/components/base/calendar-grid";
import type { WeekSession, TimeBlockWithMeta } from "@/lib/db";

/**
 * Regression tests for the calendar positioning bug where a logged time block
 * (e.g. 12:30–13:30) rendered at the wrong axis row (~09:00).
 *
 * Root cause: session cards used to *expand* their containing hour row, and the
 * shared time axis took the per-column max — so a block's pixel position in its
 * own column no longer lined up with the axis labels. These tests pin the
 * invariant that fixes it: every hour row is exactly BASE_HOUR_HEIGHT tall
 * regardless of content, and a card's topPx is derived purely from its time.
 */

const START_HOUR = 6;
const END_HOUR = 22;
const BASE_HOUR_HEIGHT = 64;

function makeSession(over: Partial<WeekSession>): WeekSession {
  return {
    id: 1,
    task_id: null,
    task_name: null,
    phase: "work",
    started_at: "2026-07-05 09:00:00",
    duration_sec: 1500,
    completed: 1,
    category_id: null,
    category_name: null,
    category_color: null,
    intention: null,
    mood: null,
    notes: null,
    ...over,
  };
}

function makeBlock(over: Partial<TimeBlockWithMeta>): TimeBlockWithMeta {
  return {
    id: 1,
    title: null,
    start_time: "2026-07-05 12:30:00",
    end_time: "2026-07-05 13:30:00",
    task_id: null,
    category_id: null,
    color: null,
    completed: 0,
    created_at: "",
    session_id: null,
    task_name: null,
    category_name: null,
    category_color: null,
    ...over,
  };
}

describe("computeDayLayout — uniform hour grid", () => {
  it("every hour row is exactly BASE_HOUR_HEIGHT, even when sessions are present", () => {
    // A session that previously inflated its hour row (old min-height was 100px).
    const sessions = [
      makeSession({ id: 1, started_at: "2026-07-05 09:00:00", duration_sec: 1500 }),
    ];
    const layout = computeDayLayout(sessions, [], START_HOUR, END_HOUR);

    for (let h = 0; h < layout.hourTopPx.length - 1; h++) {
      expect(layout.hourTopPx[h + 1] - layout.hourTopPx[h]).toBe(BASE_HOUR_HEIGHT);
    }
  });

  it("a block at 12:30 sits on the 12:00 axis row (the reported bug)", () => {
    const block = makeBlock({ start_time: "2026-07-05 12:30:00", end_time: "2026-07-05 13:30:00" });
    const layout = computeDayLayout([], [block], START_HOUR, END_HOUR);

    const positioned = layout.positionedBlocks[0];
    // hours[0] === START_HOUR (6), so the 12:00 row is index 6.
    const row12Start = layout.hourTopPx[12 - START_HOUR];
    const row12End = layout.hourTopPx[12 - START_HOUR + 1];
    expect(positioned.topPx).toBeGreaterThanOrEqual(row12Start);
    expect(positioned.topPx).toBeLessThan(row12End);

    // And its topPx is the pure time-derived value (6.5h * 64 = 416),
    // computed from the same Date parse the production code uses so the
    // assertion holds in any runtime timezone.
    const d = new Date(block.start_time);
    const startMin = (d.getHours() - START_HOUR) * 60 + d.getMinutes();
    expect(positioned.topPx).toBe((startMin / 60) * BASE_HOUR_HEIGHT);
  });

  it("a block's position is not affected by sessions on the same day", () => {
    // Morning sessions on the same column must not shift an afternoon block.
    const sessions = [
      makeSession({ id: 1, started_at: "2026-07-05 08:00:00", duration_sec: 3600 }),
      makeSession({ id: 2, started_at: "2026-07-05 10:00:00", duration_sec: 3600 }),
    ];
    const block = makeBlock({ start_time: "2026-07-05 12:30:00", end_time: "2026-07-05 13:30:00" });

    const withSessions = computeDayLayout(sessions, [block], START_HOUR, END_HOUR);
    const withoutSessions = computeDayLayout([], [block], START_HOUR, END_HOUR);

    expect(withSessions.positionedBlocks[0].topPx).toBe(
      withoutSessions.positionedBlocks[0].topPx,
    );
  });

  it("back-to-back sessions keep their true time positions (no overlap-shift)", () => {
    // Two adjacent 25-min sessions at 09:00 and 09:25. Previously the second
    // was nudged to existingEnd + 4, detaching it from its labeled time.
    const sessions = [
      makeSession({ id: 1, started_at: "2026-07-05 09:00:00", duration_sec: 1500 }),
      makeSession({ id: 2, started_at: "2026-07-05 09:25:00", duration_sec: 1500 }),
    ];
    const layout = computeDayLayout(sessions, [], START_HOUR, END_HOUR);

    const d2 = new Date(sessions[1].started_at);
    const startMin = (d2.getHours() - START_HOUR) * 60 + d2.getMinutes();
    expect(layout.positioned[1].topPx).toBe((startMin / 60) * BASE_HOUR_HEIGHT);
  });
});
