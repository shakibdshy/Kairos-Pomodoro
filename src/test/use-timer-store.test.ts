import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTimerStore } from "@/features/timer/use-timer-store";
import {
  DEFAULT_WORK_SEC,
  DEFAULT_SHORT_BREAK_SEC,
  DEFAULT_LONG_BREAK_SEC,
  POMOS_BEFORE_LONG_BREAK,
} from "@/lib/constants";

const mockWorker = {
  postMessage: vi.fn(),
  terminate: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  onmessage: null as ((e: MessageEvent) => void) | null,
};

vi.mock("@/features/timer/use-timer-worker", () => ({
  createTimerWorker: vi.fn(() => mockWorker),
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

vi.mock("@/features/settings/use-settings-store", () => ({
  useSettingsStore: {
    getState: vi.fn(() => ({
      settings: { autoStartBreaks: false },
    })),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockWorker.postMessage.mockClear();
  mockWorker.terminate.mockClear();
  mockWorker.onmessage = null;
  useTimerStore.setState({
    phase: "work",
    status: "idle",
    secondsRemaining: DEFAULT_WORK_SEC,
    totalSeconds: DEFAULT_WORK_SEC,
    completedPomos: 0,
    activeTaskId: null,
    currentSessionId: null,
    selectedCategory: null,
    overtimeSeconds: 0,
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

    it("terminates existing worker when switching phase", async () => {
      await useTimerStore.getState().start();
      const prevTerminate = mockWorker.terminate;

      useTimerStore.getState().setPhase("short_break");
      expect(prevTerminate).toHaveBeenCalled();
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

    it("adjusts remaining time and posts to worker when running", async () => {
      await useTimerStore.getState().start();

      useTimerStore.getState().adjustDuration(5);

      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        command: "add_time",
        seconds: 300,
      });
      const state = useTimerStore.getState();
      expect(state.totalSeconds).toBe(DEFAULT_WORK_SEC + 300);
      expect(state.secondsRemaining).toBe(DEFAULT_WORK_SEC + 300);
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

  describe("start", () => {
    it("creates a DB session, worker, and sets running status", async () => {
      await useTimerStore.getState().start();

      const { startSession } = await import("@/lib/db");
      expect(startSession).toHaveBeenCalledWith(null, "work", undefined, undefined);

      const { createTimerWorker } = await import("@/features/timer/use-timer-worker");
      expect(createTimerWorker).toHaveBeenCalledOnce();

      const state = useTimerStore.getState();
      expect(state.status).toBe("running");
      expect(state.secondsRemaining).toBe(DEFAULT_WORK_SEC);
      expect(state.totalSeconds).toBe(DEFAULT_WORK_SEC);
      expect(state.currentSessionId).toBe(1);
      expect(state.overtimeSeconds).toBe(0);
    });

    it("uses custom duration when provided", async () => {
      await useTimerStore.getState().start(600);
      const state = useTimerStore.getState();
      expect(state.secondsRemaining).toBe(600);
      expect(state.totalSeconds).toBe(600);
    });

    it("terminates existing worker before starting new one", async () => {
      await useTimerStore.getState().start();
      mockWorker.terminate.mockClear();

      await useTimerStore.getState().start();
      expect(mockWorker.terminate).toHaveBeenCalled();
    });
  });

  describe("pause", () => {
    it("pauses the worker and sets status to paused", async () => {
      await useTimerStore.getState().start();

      useTimerStore.getState().pause();

      expect(mockWorker.postMessage).toHaveBeenCalledWith({ command: "pause" });
      expect(useTimerStore.getState().status).toBe("paused");
    });
  });

  describe("resume", () => {
    it("resumes the worker and sets status", async () => {
      await useTimerStore.getState().start();

      useTimerStore.getState().pause();
      useTimerStore.getState().resume();

      expect(mockWorker.postMessage).toHaveBeenCalledWith({ command: "resume" });
    });
  });

  describe("skip", () => {
    it("records completed session and transitions to break when work is done", async () => {
      await useTimerStore.getState().start();
      useTimerStore.setState({ secondsRemaining: 0, overtimeSeconds: 0 });

      useTimerStore.getState().skip();

      const { addSession } = await import("@/lib/db");
      expect(addSession).toHaveBeenCalledWith(
        null,
        "work",
        DEFAULT_WORK_SEC,
        true,
      );

      const state = useTimerStore.getState();
      expect(state.completedPomos).toBe(1);
      expect(state.phase).toBe("short_break");
    });

    it("records incomplete session when skipping mid-session", async () => {
      await useTimerStore.getState().start();
      useTimerStore.setState({ secondsRemaining: 500 });

      useTimerStore.getState().skip();

      const { addSession } = await import("@/lib/db");
      expect(addSession).toHaveBeenCalledWith(
        null,
        "work",
        DEFAULT_WORK_SEC - 500,
        false,
      );

      const state = useTimerStore.getState();
      expect(state.completedPomos).toBe(0);
      expect(state.status).toBe("idle");
    });

    it("increments task pomos when work completed with active task", async () => {
      useTimerStore.setState({ activeTaskId: 42 });
      await useTimerStore.getState().start();
      useTimerStore.setState({ secondsRemaining: 0 });

      useTimerStore.getState().skip();

      const { incrementTaskPomos } = await import("@/lib/db");
      expect(incrementTaskPomos).toHaveBeenCalledWith(42);
    });

    it("sends notification when session completed", async () => {
      await useTimerStore.getState().start();
      useTimerStore.setState({ secondsRemaining: 0 });

      useTimerStore.getState().skip();

      const { sendNotification } = await import("@/lib/notifications");
      expect(sendNotification).toHaveBeenCalled();
    });

    it("transitions to long break after POMOS_BEFORE_LONG_BREAK completed pomos", async () => {
      useTimerStore.setState({ completedPomos: POMOS_BEFORE_LONG_BREAK - 1 });
      await useTimerStore.getState().start();
      useTimerStore.setState({ secondsRemaining: 0 });

      useTimerStore.getState().skip();

      expect(useTimerStore.getState().phase).toBe("long_break");
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

  describe("finishSession", () => {
    it("finishes DB session, increments pomos, and resets to work idle", async () => {
      useTimerStore.setState({ activeTaskId: 10 });
      await useTimerStore.getState().start();

      await useTimerStore.getState().finishSession("great", "Good session");

      const { finishSession: dbFinish, incrementTaskPomos } = await import("@/lib/db");
      expect(dbFinish).toHaveBeenCalledWith(1, undefined, "great", "Good session");
      expect(incrementTaskPomos).toHaveBeenCalledWith(10);

      const state = useTimerStore.getState();
      expect(state.status).toBe("idle");
      expect(state.phase).toBe("work");
      expect(state.completedPomos).toBe(1);
      expect(state.currentSessionId).toBeNull();
    });

    it("does not increment pomos for break phase", async () => {
      useTimerStore.setState({ phase: "short_break" });
      await useTimerStore.getState().start();

      await useTimerStore.getState().finishSession();

      const state = useTimerStore.getState();
      expect(state.completedPomos).toBe(0);
      expect(state.phase).toBe("work");
    });

    it("does not call DB when no currentSessionId", async () => {
      await useTimerStore.getState().finishSession();

      const { finishSession: dbFinish } = await import("@/lib/db");
      expect(dbFinish).not.toHaveBeenCalled();
    });
  });

  describe("abandonSession", () => {
    it("deletes DB session and resets without incrementing pomos", async () => {
      await useTimerStore.getState().start();

      await useTimerStore.getState().abandonSession();

      const { abandonSession: dbAbandon } = await import("@/lib/db");
      expect(dbAbandon).toHaveBeenCalledWith(1);

      const state = useTimerStore.getState();
      expect(state.status).toBe("idle");
      expect(state.completedPomos).toBe(0);
      expect(state.currentSessionId).toBeNull();
    });

    it("does not call DB when no currentSessionId", async () => {
      await useTimerStore.getState().abandonSession();

      const { abandonSession: dbAbandon } = await import("@/lib/db");
      expect(dbAbandon).not.toHaveBeenCalled();
    });
  });

  describe("confirmStartNextPhase", () => {
    it("finishes current session and auto-starts next phase", async () => {
      useTimerStore.setState({ activeTaskId: 5 });
      await useTimerStore.getState().start();

      await useTimerStore.getState().confirmStartNextPhase("good", "Nice");

      const { finishSession: dbFinish, incrementTaskPomos } = await import("@/lib/db");
      expect(dbFinish).toHaveBeenCalledWith(1, DEFAULT_WORK_SEC, "good", "Nice");
      expect(incrementTaskPomos).toHaveBeenCalledWith(5);

      const state = useTimerStore.getState();
      expect(state.completedPomos).toBe(1);
      expect(state.phase).toBe("short_break");
      expect(state.status).toBe("running");
      expect(state.currentSessionId).toBe(1);
    });

    it("transitions from break to work phase", async () => {
      useTimerStore.setState({ phase: "short_break" });
      await useTimerStore.getState().start();

      await useTimerStore.getState().confirmStartNextPhase();

      const state = useTimerStore.getState();
      expect(state.phase).toBe("work");
      expect(state.completedPomos).toBe(0);
    });
  });

  describe("endWithoutBreak", () => {
    it("finishes session and resets to work idle without auto-starting break", async () => {
      useTimerStore.setState({ activeTaskId: 3 });
      await useTimerStore.getState().start();

      await useTimerStore.getState().endWithoutBreak();

      const { finishSession: dbFinish, incrementTaskPomos } = await import("@/lib/db");
      expect(dbFinish).toHaveBeenCalledWith(1, DEFAULT_WORK_SEC, undefined, undefined);
      expect(incrementTaskPomos).toHaveBeenCalledWith(3);

      const state = useTimerStore.getState();
      expect(state.phase).toBe("work");
      expect(state.status).toBe("idle");
      expect(state.completedPomos).toBe(1);
    });

    it("does not increment pomos for break phase", async () => {
      useTimerStore.setState({ phase: "short_break" });
      await useTimerStore.getState().start();

      await useTimerStore.getState().endWithoutBreak();

      expect(useTimerStore.getState().completedPomos).toBe(0);
    });
  });

  describe("addFiveMinutes", () => {
    it("adds 300 seconds to remaining time when session is active", async () => {
      await useTimerStore.getState().start();

      useTimerStore.getState().addFiveMinutes();

      const state = useTimerStore.getState();
      expect(state.totalSeconds).toBe(DEFAULT_WORK_SEC + 300);
      expect(state.secondsRemaining).toBe(DEFAULT_WORK_SEC + 300);
    });

    it("starts a new 5-min session when in overtime", async () => {
      await useTimerStore.getState().start();
      useTimerStore.setState({ overtimeSeconds: 30, secondsRemaining: 0 });

      await useTimerStore.getState().addFiveMinutes();
      await vi.waitFor(() => {
        expect(useTimerStore.getState().secondsRemaining).toBe(300);
      });
      expect(useTimerStore.getState().totalSeconds).toBe(300);
    });
  });
});
