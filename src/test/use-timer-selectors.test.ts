import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTimerStore } from "@/features/timer/use-timer-store";
import { useTimerSelectors } from "@/components/timer/use-timer-selectors";

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

vi.mock("@/features/settings/use-settings-store", () => {
  const settings = {
    autoStartBreaks: false,
    timerStyle: "floral",
    pomosBeforeLongBreak: 4,
  };
  // Selectors use the hook form; the timer store calls getState().
  const useSettingsStore = Object.assign(
    vi.fn((selector: (s: { settings: typeof settings }) => unknown) =>
      selector({ settings }),
    ),
    { getState: vi.fn(() => ({ settings })) },
  );
  return { useSettingsStore };
});

beforeEach(() => {
  vi.clearAllMocks();
  useTimerStore.setState({
    phase: "work",
    status: "idle",
    secondsRemaining: 1200,
    totalSeconds: 1200,
    completedPomos: 0,
    activeTaskId: null,
    currentSessionId: null,
    selectedCategory: null,
    overtimeSeconds: 0,
    startedAt: null,
  });
});

// Local-time constructor so formatTimeAmPm output is deterministic in any TZ.
const START = new Date(2026, 0, 15, 10, 0, 0).getTime();

describe("useTimerSelectors: finish summary values", () => {
  it("shows focused time and the true focus window after a pause", () => {
    useTimerStore.setState({
      status: "paused",
      totalSeconds: 1200,
      secondsRemaining: 800,
      overtimeSeconds: 0,
      startedAt: START,
    });

    const { result } = renderHook(() => useTimerSelectors());

    expect(result.current.focusedDurationLabel).toBe("7min");
    expect(result.current.focusWindowLabel).toBe("10:00AM → 10:06AM");
  });

  it("shows sub-minute focused time in seconds", () => {
    useTimerStore.setState({
      status: "paused",
      totalSeconds: 600,
      secondsRemaining: 555,
      overtimeSeconds: 0,
      startedAt: START,
    });

    const { result } = renderHook(() => useTimerSelectors());

    expect(result.current.focusedDurationLabel).toBe("45s");
  });

  it("counts overtime in the focused time and window when complete", () => {
    useTimerStore.setState({
      status: "focus_complete",
      totalSeconds: 600,
      secondsRemaining: 0,
      overtimeSeconds: 90,
      startedAt: START,
    });

    const { result } = renderHook(() => useTimerSelectors());

    expect(result.current.focusedDurationLabel).toBe("12min");
    expect(result.current.focusWindowLabel).toBe("10:00AM → 10:11AM");
  });
});
