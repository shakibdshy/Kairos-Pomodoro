import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTimerStore } from "@/features/timer/use-timer-store";
import {
  DEFAULT_WORK_SEC,
  DEFAULT_SHORT_BREAK_SEC,
  DEFAULT_LONG_BREAK_SEC,
} from "@/lib/constants";

vi.mock("@/features/timer/use-timer-worker", () => ({
  createTimerWorker: vi.fn(() => ({
    postMessage: vi.fn(),
    terminate: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onmessage: null,
  })),
}));

vi.mock("@/lib/db", () => ({
  getSetting: vi.fn().mockResolvedValue("true"),
  setSetting: vi.fn().mockResolvedValue(undefined),
  getSettings: vi.fn().mockResolvedValue({}),
  getTasks: vi.fn().mockResolvedValue([]),
  getCategory: vi.fn().mockResolvedValue(null),
  addSession: vi.fn().mockResolvedValue(1),
  startSession: vi.fn().mockResolvedValue(1),
  finishSession: vi.fn().mockResolvedValue(undefined),
  abandonSession: vi.fn().mockResolvedValue(undefined),
  incrementTaskPomos: vi.fn().mockResolvedValue(undefined),
  getSessionsByDateRange: vi.fn().mockResolvedValue([]),
  getSessions: vi.fn().mockResolvedValue([]),
  getDailySummary: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/notifications", () => ({
  sendNotification: vi.fn(),
  canSendNotification: vi.fn().mockResolvedValue(true),
  playChime: vi.fn(),
}));

beforeEach(async () => {
  vi.clearAllMocks();
  useTimerStore.setState({
    phase: "work",
    status: "idle",
    secondsRemaining: DEFAULT_WORK_SEC,
    totalSeconds: DEFAULT_WORK_SEC,
    completedPomos: 0,
    activeTaskId: null,
    currentSessionId: null,
    selectedCategory: null,
    worker: null,
    overtimeSeconds: 0,
    overtimeNotifInterval: null,
    durations: {
      work: DEFAULT_WORK_SEC,
      short: DEFAULT_SHORT_BREAK_SEC,
      long: DEFAULT_LONG_BREAK_SEC,
    },
  });
});

describe("useTimerStore", () => {
  describe("initial state", () => {
    it("has correct defaults", () => {
      const state = useTimerStore.getState();
      expect(state.phase).toBe("work");
      expect(state.status).toBe("idle");
      expect(state.secondsRemaining).toBe(DEFAULT_WORK_SEC);
      expect(state.totalSeconds).toBe(DEFAULT_WORK_SEC);
      expect(state.completedPomos).toBe(0);
      expect(state.activeTaskId).toBeNull();
      expect(state.currentSessionId).toBeNull();
      expect(state.overtimeSeconds).toBe(0);
    });
  });

  describe("setPhase", () => {
    it("sets phase and resets secondsRemaining for short_break", () => {
      useTimerStore.getState().setPhase("short_break");
      const state = useTimerStore.getState();
      expect(state.phase).toBe("short_break");
      expect(state.secondsRemaining).toBe(DEFAULT_SHORT_BREAK_SEC);
      expect(state.totalSeconds).toBe(DEFAULT_SHORT_BREAK_SEC);
      expect(state.status).toBe("idle");
      expect(state.overtimeSeconds).toBe(0);
    });

    it("resets secondsRemaining to correct duration for long_break", () => {
      useTimerStore.getState().setPhase("long_break");
      expect(useTimerStore.getState().secondsRemaining).toBe(DEFAULT_LONG_BREAK_SEC);
    });

    it("resets secondsRemaining for work phase", () => {
      useTimerStore.setState({ secondsRemaining: 10 });
      useTimerStore.getState().setPhase("work");
      expect(useTimerStore.getState().secondsRemaining).toBe(DEFAULT_WORK_SEC);
    });
  });

  describe("setDurations", () => {
    it("updates durations and resets secondsRemaining when idle", () => {
      useTimerStore.getState().setDurations(1800, 300, 900);
      const state = useTimerStore.getState();
      expect(state.durations).toEqual({ work: 1800, short: 300, long: 900 });
      expect(state.secondsRemaining).toBe(1800);
      expect(state.totalSeconds).toBe(1800);
    });

    it("updates durations without resetting when not idle", () => {
      useTimerStore.setState({ status: "running" as const });
      useTimerStore.getState().setDurations(1800, 300, 900);
      const state = useTimerStore.getState();
      expect(state.durations).toEqual({ work: 1800, short: 300, long: 900 });
    });
  });

  describe("setDurationForCurrentPhase", () => {
    it("sets duration for current phase when idle", () => {
      useTimerStore.getState().setDurationForCurrentPhase(1800);
      const state = useTimerStore.getState();
      expect(state.durations.work).toBe(1800);
      expect(state.secondsRemaining).toBe(1800);
    });

    it("does nothing when not idle", () => {
      useTimerStore.setState({ status: "running" as const });
      const original = useTimerStore.getState().durations.work;
      useTimerStore.getState().setDurationForCurrentPhase(1800);
      expect(useTimerStore.getState().durations.work).toBe(original);
    });

    it("clamps to minimum of 1", () => {
      useTimerStore.getState().setDurationForCurrentPhase(0);
      expect(useTimerStore.getState().secondsRemaining).toBe(1);
    });
  });

  describe("adjustDuration", () => {
    it("adds minutes when idle", () => {
      useTimerStore.getState().adjustDuration(5);
      const state = useTimerStore.getState();
      expect(state.durations.work).toBe(DEFAULT_WORK_SEC + 300);
      expect(state.secondsRemaining).toBe(DEFAULT_WORK_SEC + 300);
    });

    it("subtracts minutes when idle", () => {
      useTimerStore.getState().adjustDuration(-5);
      expect(useTimerStore.getState().durations.work).toBe(DEFAULT_WORK_SEC - 300);
    });

    it("clamps minimum to 60 seconds", () => {
      useTimerStore.getState().adjustDuration(-1000);
      expect(useTimerStore.getState().durations.work).toBe(60);
    });
  });

  describe("setActiveTask", () => {
    it("sets activeTaskId", async () => {
      await useTimerStore.getState().setActiveTask(42);
      expect(useTimerStore.getState().activeTaskId).toBe(42);
    });

    it("clears activeTaskId", async () => {
      useTimerStore.setState({ activeTaskId: 42 });
      await useTimerStore.getState().setActiveTask(null);
      expect(useTimerStore.getState().activeTaskId).toBeNull();
    });
  });

  describe("setSelectedCategory", () => {
    it("sets selected category", () => {
      const cat = { id: 1, name: "Work", color: "#FF0000", created_at: "2026-01-01" };
      useTimerStore.getState().setSelectedCategory(cat);
      expect(useTimerStore.getState().selectedCategory).toEqual(cat);
    });

    it("clears selected category", () => {
      useTimerStore.setState({
        selectedCategory: { id: 1, name: "Work", color: "#FF0000", created_at: "2026-01-01" },
      });
      useTimerStore.getState().setSelectedCategory(null);
      expect(useTimerStore.getState().selectedCategory).toBeNull();
    });
  });

  describe("reset", () => {
    it("resets to idle state with phase duration", () => {
      useTimerStore.setState({
        status: "running" as const,
        secondsRemaining: 10,
        totalSeconds: 100,
        overtimeSeconds: 30,
      });
      useTimerStore.getState().reset();
      const state = useTimerStore.getState();
      expect(state.status).toBe("idle");
      expect(state.secondsRemaining).toBe(DEFAULT_WORK_SEC);
      expect(state.totalSeconds).toBe(DEFAULT_WORK_SEC);
      expect(state.overtimeSeconds).toBe(0);
      expect(state.worker).toBeNull();
    });

    it("resets with correct duration for current phase", () => {
      useTimerStore.setState({
        phase: "short_break" as const,
        status: "running" as const,
        secondsRemaining: 5,
      });
      useTimerStore.getState().reset();
      expect(useTimerStore.getState().secondsRemaining).toBe(DEFAULT_SHORT_BREAK_SEC);
    });
  });

  describe("abandonSession", () => {
    it("resets to idle state", async () => {
      useTimerStore.setState({
        status: "running" as const,
        currentSessionId: 42,
        secondsRemaining: 10,
      });
      await useTimerStore.getState().abandonSession();
      const state = useTimerStore.getState();
      expect(state.status).toBe("idle");
      expect(state.currentSessionId).toBeNull();
      expect(state.secondsRemaining).toBe(DEFAULT_WORK_SEC);
    });

    it("calls dbAbandonSession when session exists", async () => {
      const { abandonSession } = await import("@/lib/db");
      useTimerStore.setState({ currentSessionId: 42 });
      await useTimerStore.getState().abandonSession();
      expect(abandonSession).toHaveBeenCalledWith(42);
    });
  });
});
