import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePresetsStore } from "@/features/timer/use-presets-store";
import { useTimerStore } from "@/features/timer/use-timer-store";
import {
  DEFAULT_WORK_SEC,
  DEFAULT_SHORT_BREAK_SEC,
  DEFAULT_LONG_BREAK_SEC,
} from "@/lib/constants";
import type { TimerPreset } from "@/lib/db";
import { MAX_DURATION_SECONDS } from "@/lib/duration-limits";

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
  getPresets: vi.fn().mockResolvedValue([]),
  addPreset: vi.fn().mockResolvedValue(undefined),
  updatePreset: vi.fn().mockResolvedValue(undefined),
  deletePreset: vi.fn().mockResolvedValue(undefined),
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

function makePreset(overrides: Partial<TimerPreset> = {}): TimerPreset {
  return {
    id: 1,
    name: "DSA",
    work_duration: 7200,
    short_break_duration: 1200,
    long_break_duration: 3600,
    pomos_before_long_break: 4,
    created_at: "2026-01-01 00:00:00",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
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

describe("usePresetsStore", () => {
  describe("applyPreset", () => {
    it("applies a 120 minute preset to the idle timer without clamping", () => {
      usePresetsStore.getState().applyPreset(makePreset());

      const state = useTimerStore.getState();
      expect(state.durations.work).toBe(7200);
      expect(state.durations.short).toBe(1200);
      expect(state.durations.long).toBe(3600);
    });

    it("seeds the idle countdown with the full preset duration", () => {
      usePresetsStore.getState().applyPreset(makePreset());

      const state = useTimerStore.getState();
      expect(state.secondsRemaining).toBe(7200);
      expect(state.totalSeconds).toBe(7200);
    });

    it("keeps a long preset intact while a session is running", () => {
      useTimerStore.setState({
        status: "running",
        secondsRemaining: 400,
        totalSeconds: 7200,
      });
      useTimerStore.getState().setDurations(7200, 1200, 3600);

      usePresetsStore.getState().applyPreset(makePreset());

      const state = useTimerStore.getState();
      expect(state.durations.work).toBe(7200);
      expect(state.secondsRemaining).toBe(400);
    });

    it("clamps a preset that exceeds the duration policy", () => {
      usePresetsStore
        .getState()
        .applyPreset(
          makePreset({ work_duration: 99_999, short_break_duration: 9_999 }),
        );

      const state = useTimerStore.getState();
      expect(state.durations.work).toBe(MAX_DURATION_SECONDS.work);
      expect(state.durations.short).toBe(MAX_DURATION_SECONDS.shortBreak);
    });
  });
});
