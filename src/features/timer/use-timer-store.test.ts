import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTimerStore } from "./use-timer-store";
import {
  DEFAULT_WORK_SEC,
  DEFAULT_SHORT_BREAK_SEC,
  DEFAULT_LONG_BREAK_SEC,
  POMOS_BEFORE_LONG_BREAK,
} from "@/lib/constants";

vi.mock("@/features/timer/use-timer-worker", () => ({
  createTimerWorker: vi.fn(() => ({
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null,
  })),
}));

vi.mock("@/lib/db", () => ({
  startSession: vi.fn().mockResolvedValue(1),
  finishSession: vi.fn().mockResolvedValue(undefined),
  abandonSession: vi.fn().mockResolvedValue(undefined),
  addSession: vi.fn().mockResolvedValue(undefined),
  incrementTaskPomos: vi.fn().mockResolvedValue(undefined),
  getTasks: vi.fn().mockResolvedValue([]),
  getCategory: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/notifications", () => ({
  sendNotification: vi.fn(),
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
    it("has correct default values", () => {
      const state = useTimerStore.getState();
      expect(state.phase).toBe("work");
      expect(state.status).toBe("idle");
      expect(state.secondsRemaining).toBe(DEFAULT_WORK_SEC);
      expect(state.totalSeconds).toBe(DEFAULT_WORK_SEC);
      expect(state.completedPomos).toBe(0);
      expect(state.activeTaskId).toBeNull();
      expect(state.currentSessionId).toBeNull();
      expect(state.selectedCategory).toBeNull();
      expect(state.worker).toBeNull();
      expect(state.overtimeSeconds).toBe(0);
      expect(state.durations).toEqual({
        work: DEFAULT_WORK_SEC,
        short: DEFAULT_SHORT_BREAK_SEC,
        long: DEFAULT_LONG_BREAK_SEC,
      });
    });
  });

  describe("setSelectedCategory", () => {
    it("sets the selected category", () => {
      const category = {
        id: 1,
        name: "Work",
        color: "#FF0000",
        created_at: "2026-01-01",
      };
      useTimerStore.getState().setSelectedCategory(category);
      expect(useTimerStore.getState().selectedCategory).toEqual(category);
    });

    it("clears the selected category with null", () => {
      const category = {
        id: 1,
        name: "Work",
        color: "#FF0000",
        created_at: "2026-01-01",
      };
      useTimerStore.getState().setSelectedCategory(category);
      useTimerStore.getState().setSelectedCategory(null);
      expect(useTimerStore.getState().selectedCategory).toBeNull();
    });
  });

  describe("setPhase", () => {
    it("switches to short_break phase with correct duration", () => {
      useTimerStore.getState().setPhase("short_break");
      const state = useTimerStore.getState();
      expect(state.phase).toBe("short_break");
      expect(state.status).toBe("idle");
      expect(state.secondsRemaining).toBe(DEFAULT_SHORT_BREAK_SEC);
      expect(state.totalSeconds).toBe(DEFAULT_SHORT_BREAK_SEC);
    });

    it("switches to long_break phase with correct duration", () => {
      useTimerStore.getState().setPhase("long_break");
      const state = useTimerStore.getState();
      expect(state.phase).toBe("long_break");
      expect(state.status).toBe("idle");
      expect(state.secondsRemaining).toBe(DEFAULT_LONG_BREAK_SEC);
      expect(state.totalSeconds).toBe(DEFAULT_LONG_BREAK_SEC);
    });

    it("terminates existing worker when switching phase", async () => {
      await useTimerStore.getState().start();
      const worker = useTimerStore.getState().worker;
      expect(worker).not.toBeNull();

      useTimerStore.getState().setPhase("short_break");
      expect(worker!.terminate).toHaveBeenCalled();
      expect(useTimerStore.getState().worker).toBeNull();
    });
  });

  describe("setDurations", () => {
    it("updates durations and resets timer when idle", () => {
      const newWork = 30 * 60;
      useTimerStore.getState().setDurations(newWork, 600, 1200);
      const state = useTimerStore.getState();
      expect(state.durations.work).toBe(newWork);
      expect(state.durations.short).toBe(600);
      expect(state.durations.long).toBe(1200);
      expect(state.secondsRemaining).toBe(newWork);
      expect(state.totalSeconds).toBe(newWork);
    });

    it("updates durations without resetting timer when running", async () => {
      await useTimerStore.getState().start();
      const originalRemaining = useTimerStore.getState().secondsRemaining;

      useTimerStore.getState().setDurations(30 * 60, 600, 1200);
      const state = useTimerStore.getState();
      expect(state.durations.work).toBe(30 * 60);
      expect(state.secondsRemaining).toBe(originalRemaining);
    });
  });

  describe("setDurationForCurrentPhase", () => {
    it("updates only the active phase duration when idle", () => {
      useTimerStore.getState().setPhase("short_break");
      useTimerStore.getState().setDurationForCurrentPhase(95);

      const state = useTimerStore.getState();
      expect(state.durations.work).toBe(DEFAULT_WORK_SEC);
      expect(state.durations.short).toBe(95);
      expect(state.durations.long).toBe(DEFAULT_LONG_BREAK_SEC);
      expect(state.secondsRemaining).toBe(95);
      expect(state.totalSeconds).toBe(95);
    });

    it("does not change duration during an active session", async () => {
      await useTimerStore.getState().start();

      useTimerStore.getState().setDurationForCurrentPhase(95);

      const state = useTimerStore.getState();
      expect(state.durations.work).toBe(DEFAULT_WORK_SEC);
      expect(state.secondsRemaining).toBe(DEFAULT_WORK_SEC);
      expect(state.totalSeconds).toBe(DEFAULT_WORK_SEC);
    });
  });

  describe("reset", () => {
    it("resets to idle with correct phase duration", async () => {
      useTimerStore.getState().setPhase("short_break");
      await useTimerStore.getState().start();

      useTimerStore.getState().reset();
      const state = useTimerStore.getState();
      expect(state.status).toBe("idle");
      expect(state.phase).toBe("short_break");
      expect(state.secondsRemaining).toBe(DEFAULT_SHORT_BREAK_SEC);
      expect(state.totalSeconds).toBe(DEFAULT_SHORT_BREAK_SEC);
      expect(state.worker).toBeNull();
      expect(state.overtimeSeconds).toBe(0);
    });
  });

  describe("start", () => {
    it("creates a DB session, worker, and sets running status", async () => {
      const { start } = useTimerStore.getState();
      await start();

      const { startSession } = await import("@/lib/db");
      expect(startSession).toHaveBeenCalledWith(null, "work", undefined, undefined);

      const { createTimerWorker } = await import("@/features/timer/use-timer-worker");
      expect(createTimerWorker).toHaveBeenCalledOnce();

      const state = useTimerStore.getState();
      expect(state.status).toBe("running");
      expect(state.secondsRemaining).toBe(DEFAULT_WORK_SEC);
      expect(state.totalSeconds).toBe(DEFAULT_WORK_SEC);
      expect(state.currentSessionId).toBe(1);
      expect(state.worker).not.toBeNull();
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
      const firstWorker = useTimerStore.getState().worker;

      await useTimerStore.getState().start();
      expect(firstWorker!.terminate).toHaveBeenCalled();
    });
  });

  describe("pause", () => {
    it("pauses the worker and sets status to paused", async () => {
      await useTimerStore.getState().start();
      const worker = useTimerStore.getState().worker;

      useTimerStore.getState().pause();

      expect(worker!.postMessage).toHaveBeenCalledWith({ command: "pause" });
      expect(useTimerStore.getState().status).toBe("paused");
    });
  });

  describe("resume", () => {
    it("resumes the worker and sets status to running", async () => {
      await useTimerStore.getState().start();
      const worker = useTimerStore.getState().worker;

      useTimerStore.getState().pause();
      useTimerStore.getState().resume();

      expect(worker!.postMessage).toHaveBeenCalledWith({ command: "resume" });
      expect(useTimerStore.getState().status).toBe("running");
    });

    it("keeps focus_complete status when resuming from that state", async () => {
      await useTimerStore.getState().start();
      useTimerStore.setState({ status: "focus_complete" });

      useTimerStore.getState().resume();

      expect(useTimerStore.getState().status).toBe("focus_complete");
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

    it("records incomplete session and stays idle when skipping mid-session", async () => {
      await useTimerStore.getState().start();
      // secondsRemaining > 0 means incomplete
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

      // completedPomos is incremented before getNextPhase, so it becomes POMOS_BEFORE_LONG_BREAK
      expect(useTimerStore.getState().phase).toBe("long_break");
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
      expect(state.worker).toBeNull();
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
      expect(state.worker).toBeNull();
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
      expect(dbFinish).toHaveBeenCalledWith(1, DEFAULT_WORK_SEC);
      expect(incrementTaskPomos).toHaveBeenCalledWith(3);

      const state = useTimerStore.getState();
      expect(state.phase).toBe("work");
      expect(state.status).toBe("idle");
      expect(state.completedPomos).toBe(1);
      expect(state.worker).toBeNull();
    });

    it("does not increment pomos for break phase", async () => {
      useTimerStore.setState({ phase: "short_break" });
      await useTimerStore.getState().start();

      await useTimerStore.getState().endWithoutBreak();

      expect(useTimerStore.getState().completedPomos).toBe(0);
    });
  });

  describe("adjustDuration", () => {
    it("adjusts duration when idle", () => {
      useTimerStore.getState().adjustDuration(5);
      const state = useTimerStore.getState();
      expect(state.durations.work).toBe(DEFAULT_WORK_SEC + 300);
      expect(state.secondsRemaining).toBe(DEFAULT_WORK_SEC + 300);
      expect(state.totalSeconds).toBe(DEFAULT_WORK_SEC + 300);
    });

    it("clamps minimum duration to 60 seconds when idle", () => {
      useTimerStore.getState().adjustDuration(-100);
      const state = useTimerStore.getState();
      expect(state.durations.work).toBe(60);
      expect(state.secondsRemaining).toBe(60);
    });

    it("adjusts remaining time and posts to worker when running", async () => {
      await useTimerStore.getState().start();
      const worker = useTimerStore.getState().worker;

      useTimerStore.getState().adjustDuration(5);

      expect(worker!.postMessage).toHaveBeenCalledWith({
        command: "add_time",
        seconds: 300,
      });
      const state = useTimerStore.getState();
      expect(state.totalSeconds).toBe(DEFAULT_WORK_SEC + 300);
      expect(state.secondsRemaining).toBe(DEFAULT_WORK_SEC + 300);
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

      // addFiveMinutes calls start(300) internally which is async
      await useTimerStore.getState().addFiveMinutes();
      // Need to wait for the async start to complete
      await vi.waitFor(() => {
        expect(useTimerStore.getState().secondsRemaining).toBe(300);
      });
      expect(useTimerStore.getState().totalSeconds).toBe(300);
    });
  });
});
