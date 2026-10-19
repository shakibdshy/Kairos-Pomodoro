import { describe, it, expect, vi } from "vitest";
import { timerWorkerCode } from "@/features/timer/use-timer-worker";

/**
 * The countdown runs inside a Web Worker built from timerWorkerCode, which is
 * invisible to the store-level tests (they mock the worker away). These tests
 * evaluate the actual script against a sandboxed `self` so the pause/adjust
 * behavior is pinned directly.
 */
function createWorkerSandbox() {
  const posted: Array<Record<string, unknown>> = [];
  let tick: (() => void) | null = null;
  let nowMs = 1_000_000;

  const setIntervalMock = vi.fn((cb: () => void) => {
    tick = cb;
    return 1;
  });
  const clearIntervalMock = vi.fn(() => {
    tick = null;
  });

  const self: {
    onmessage: ((e: { data: Record<string, unknown> }) => void) | null;
    postMessage: (m: Record<string, unknown>) => void;
  } = { onmessage: null, postMessage: (m) => posted.push(m) };

  new Function(
    "self",
    "setInterval",
    "clearInterval",
    "Date",
    timerWorkerCode,
  )(self, setIntervalMock, clearIntervalMock, { now: () => nowMs });

  return {
    posted,
    setIntervalMock,
    clearIntervalMock,
    get tick() {
      return tick;
    },
    advanceSeconds(s: number) {
      nowMs += s * 1000;
      if (tick) tick();
    },
    send(data: Record<string, unknown>) {
      self.onmessage!({ data });
    },
  };
}

describe("timer worker script", () => {
  it("carries an adjustment while paused without restarting the countdown", () => {
    const worker = createWorkerSandbox();
    worker.send({ command: "start", seconds: 10 });
    worker.advanceSeconds(2);
    worker.send({ command: "pause" });

    worker.send({ command: "add_time", seconds: 300 });

    // Paused stays paused: no new interval, and no further ticks advance time.
    expect(worker.setIntervalMock).toHaveBeenCalledTimes(1);
    const ticksBefore = worker.posted.filter((m) => m.type === "tick").length;
    worker.advanceSeconds(5);
    const ticksAfter = worker.posted.filter((m) => m.type === "tick").length;
    expect(ticksAfter).toBe(ticksBefore);
  });

  it("resumes from the adjusted remaining instead of the stale value", () => {
    const worker = createWorkerSandbox();
    worker.send({ command: "start", seconds: 10 });
    worker.advanceSeconds(2); // remaining 8
    worker.send({ command: "pause" });

    worker.send({ command: "add_time", seconds: 300 }); // remaining 308
    worker.send({ command: "resume" });
    expect(worker.setIntervalMock).toHaveBeenCalledTimes(2);

    worker.advanceSeconds(2); // 308 - 2
    const lastTick = worker.posted.filter((m) => m.type === "tick").at(-1);
    expect(lastTick).toEqual({ type: "tick", remaining: 306 });
  });

  it("does not consult the wall-clock deadline while paused", () => {
    // Regression: add_time while paused used to recompute remaining from the
    // stale deadline, which sat in the past during a long pause and zeroed it.
    const worker = createWorkerSandbox();
    worker.send({ command: "start", seconds: 10 });
    worker.advanceSeconds(2);
    worker.send({ command: "pause" });

    worker.advanceSeconds(7200); // 2 hours paused
    worker.send({ command: "add_time", seconds: 300 });
    worker.send({ command: "resume" });
    worker.advanceSeconds(1);

    const lastTick = worker.posted.filter((m) => m.type === "tick").at(-1);
    expect(lastTick).toEqual({ type: "tick", remaining: 307 });
  });
});
