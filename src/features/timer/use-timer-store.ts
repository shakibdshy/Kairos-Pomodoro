import { create } from "zustand";
import type { TimerPhase, TimerStatus } from "@/features/timer/timer-types";
import { createTimerWorker } from "@/features/timer/use-timer-worker";
import {
  DEFAULT_WORK_SEC,
  DEFAULT_SHORT_BREAK_SEC,
  DEFAULT_LONG_BREAK_SEC,
  POMOS_BEFORE_LONG_BREAK,
} from "@/lib/constants";
import {
  addSession,
  incrementTaskPomos,
  startSession as dbStartSession,
  finishSession as dbFinishSession,
  abandonSession as dbAbandonSession,
  getTasks,
  getCategory,
} from "@/lib/db";
import type { Category } from "@/lib/db";
import { sendNotification, playChime } from "@/lib/notifications";
import { useSettingsStore } from "@/features/settings/use-settings-store";

interface TimerStore {
  phase: TimerPhase;
  status: TimerStatus;
  secondsRemaining: number;
  totalSeconds: number;
  completedPomos: number;
  activeTaskId: number | null;
  currentSessionId: number | null;
  selectedCategory: Category | null;
  worker: Worker | null;
  overtimeSeconds: number;
  overtimeNotifInterval: ReturnType<typeof setInterval> | null;

  start: (duration?: number) => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  reset: () => void;
  setPhase: (phase: TimerPhase) => void;
  setActiveTask: (taskId: number | null) => void;
  setDurations: (work: number, short: number, long: number) => void;
  adjustDuration: (minutes: number) => void;
  finishSession: (mood?: string, notes?: string) => Promise<void>;
  abandonSession: () => Promise<void>;
  setSelectedCategory: (category: Category | null) => void;
  startNextPhase: () => void;
  confirmStartNextPhase: (mood?: string, notes?: string) => Promise<void>;
  addFiveMinutes: () => void;
  endWithoutBreak: () => Promise<void>;
}

let durations = {
  work: DEFAULT_WORK_SEC,
  short: DEFAULT_SHORT_BREAK_SEC,
  long: DEFAULT_LONG_BREAK_SEC,
};

function getPhaseDuration(phase: TimerPhase): number {
  return durations[
    phase === "work" ? "work" : phase === "short_break" ? "short" : "long"
  ];
}

function getNextPhase(
  currentPhase: TimerPhase,
  pomosCompleted: number,
): {
  phase: TimerPhase;
  duration: number;
} {
  if (currentPhase === "work") {
    if (pomosCompleted % POMOS_BEFORE_LONG_BREAK === 0) {
      return { phase: "long_break", duration: durations.long };
    }
    return { phase: "short_break", duration: durations.short };
  }
  return { phase: "work", duration: durations.work };
}

function clearOvertimeNotif(store: TimerStore) {
  if (store.overtimeNotifInterval) {
    clearInterval(store.overtimeNotifInterval);
  }
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  phase: "work",
  status: "idle",
  secondsRemaining: durations.work,
  totalSeconds: durations.work,
  completedPomos: 0,
  activeTaskId: null,
  currentSessionId: null,
  selectedCategory: null,
  worker: null,
  overtimeSeconds: 0,
  overtimeNotifInterval: null,

  start: async (duration?: number) => {
    const state = get();
    state.worker?.terminate();
    clearOvertimeNotif(state);

    const secs = duration ?? getPhaseDuration(state.phase);

    const sessionId = await dbStartSession(
      state.activeTaskId,
      state.phase,
      state.selectedCategory?.id,
      state.selectedCategory?.name,
    );

    const worker = createTimerWorker();

    worker.onmessage = (e: MessageEvent) => {
      const { type, remaining, overtime } = e.data;
      if (type === "tick") {
        set({ secondsRemaining: remaining });
      }
      if (type === "done") {
        handleTimerDone();
      }
      if (type === "overtime_tick") {
        set({ overtimeSeconds: overtime });
      }
    };

    worker.postMessage({ command: "start", seconds: secs });

    set({
      status: "running",
      secondsRemaining: secs,
      totalSeconds: secs,
      currentSessionId: sessionId,
      worker,
      overtimeSeconds: 0,
    });
  },

  pause: () => {
    const { worker } = get();
    worker?.postMessage({ command: "pause" });
    set({ status: "paused" });
  },

  resume: () => {
    const { worker, status } = get();
    worker?.postMessage({ command: "resume" });
    set({ status: status === "focus_complete" ? "focus_complete" : "running" });
  },

  skip: () => {
    const state = get();
    const {
      phase,
      secondsRemaining,
      totalSeconds,
      activeTaskId,
      completedPomos,
      overtimeSeconds,
    } = state;

    const completed = secondsRemaining <= 0 || overtimeSeconds > 0;
    addSession(
      activeTaskId,
      phase,
      totalSeconds - secondsRemaining + overtimeSeconds,
      completed,
    );

    if (phase === "work" && completed && activeTaskId) {
      incrementTaskPomos(activeTaskId);
    }

    if (completed) {
      const notifType =
        phase === "work"
          ? ("session-complete" as const)
          : ("break-over" as const);
      sendNotification(notifType, `Your ${phase.replace("_", " ")} has ended.`);
    }

    state.worker?.terminate();
    clearOvertimeNotif(state);

    const newPomos =
      phase === "work" && completed ? completedPomos + 1 : completedPomos;

    const next = getNextPhase(phase, newPomos);

    set({
      phase: next.phase,
      status: phase === "work" && completed ? "running" : "idle",
      secondsRemaining: next.duration,
      totalSeconds: next.duration,
      completedPomos: newPomos,
      worker: null,
      overtimeSeconds: 0,
    });

    if (phase === "work" && completed) {
      get().start(next.duration);
    }
  },

  reset: () => {
    const state = get();
    state.worker?.terminate();
    clearOvertimeNotif(state);
    const duration = getPhaseDuration(state.phase);
    set({
      status: "idle",
      secondsRemaining: duration,
      totalSeconds: duration,
      worker: null,
      overtimeSeconds: 0,
      overtimeNotifInterval: null,
    });
  },

  setPhase: (phase: TimerPhase) => {
    const state = get();
    state.worker?.terminate();
    clearOvertimeNotif(state);
    const duration = getPhaseDuration(phase);
    set({
      phase,
      status: "idle",
      secondsRemaining: duration,
      totalSeconds: duration,
      worker: null,
      overtimeSeconds: 0,
      overtimeNotifInterval: null,
    });
  },

  setActiveTask: async (taskId: number | null) => {
    set({ activeTaskId: taskId });
    if (taskId) {
      try {
        const tasks = await getTasks();
        const task = tasks.find((t) => t.id === taskId);
        if (task?.category_id) {
          const category = await getCategory(task.category_id);
          if (category) set({ selectedCategory: category });
        }
      } catch {}
    }
  },

  setDurations: (work: number, short: number, long: number) => {
    durations = { work, short, long };
    const { phase, status } = get();
    if (status === "idle") {
      const dur = getPhaseDuration(phase);
      set({ secondsRemaining: dur, totalSeconds: dur });
    }
  },

  adjustDuration: (minutes: number) => {
    const { status, worker } = get();
    const { phase } = get();
    const key =
      phase === "work" ? "work" : phase === "short_break" ? "short" : "long";

    if (status === "idle") {
      const currentDuration = durations[key];
      const newDuration = Math.max(60, currentDuration + minutes * 60);
      durations[key] = newDuration;
      set({ secondsRemaining: newDuration, totalSeconds: newDuration });
    } else {
      const deltaSec = minutes * 60;
      set((s) => {
        const newTotal = Math.max(60, s.totalSeconds + deltaSec);
        const newRemaining = Math.max(0, s.secondsRemaining + deltaSec);
        return {
          totalSeconds: newTotal,
          secondsRemaining: newRemaining,
        };
      });
      if (status === "running" && worker) {
        worker.postMessage({ command: "add_time", seconds: deltaSec });
      }
    }
  },

  finishSession: async (mood?: string, notes?: string) => {
    const state = get();
    const { worker, currentSessionId, activeTaskId, phase } = state;
    worker?.terminate();
    clearOvertimeNotif(state);

    if (currentSessionId) {
      await dbFinishSession(currentSessionId, undefined, mood, notes);

      sendNotification(
        "session-complete",
        "Great work! Your focus session has been recorded.",
      );

      if (phase === "work" && activeTaskId) {
        incrementTaskPomos(activeTaskId);
      }
    }

    const duration = getPhaseDuration("work");
    set({
      status: "idle",
      phase: "work",
      secondsRemaining: duration,
      totalSeconds: duration,
      currentSessionId: null,
      worker: null,
      completedPomos: get().completedPomos + (phase === "work" ? 1 : 0),
      overtimeSeconds: 0,
      overtimeNotifInterval: null,
    });
  },

  abandonSession: async () => {
    const state = get();
    const { worker, currentSessionId } = state;
    worker?.terminate();
    clearOvertimeNotif(state);

    if (currentSessionId) {
      await dbAbandonSession(currentSessionId);
    }

    const duration = getPhaseDuration(state.phase);

    set({
      status: "idle",
      secondsRemaining: duration,
      totalSeconds: duration,
      currentSessionId: null,
      worker: null,
      overtimeSeconds: 0,
      overtimeNotifInterval: null,
    });
  },

  setSelectedCategory: (category: Category | null) => {
    set({ selectedCategory: category });
  },

  startNextPhase: () => {
    // Just signals the UI to show the finish modal
    // The actual phase transition happens in confirmStartNextPhase
  },

  confirmStartNextPhase: async (mood?: string, notes?: string) => {
    const state = get();
    const {
      worker,
      currentSessionId,
      activeTaskId,
      phase,
      totalSeconds,
      overtimeSeconds,
    } = state;
    worker?.terminate();
    clearOvertimeNotif(state);

    if (currentSessionId) {
      const actualDuration = totalSeconds + overtimeSeconds;
      await dbFinishSession(currentSessionId, actualDuration, mood, notes);
      if (phase === "work" && activeTaskId) {
        incrementTaskPomos(activeTaskId);
      }
    }

    const newPomos =
      state.phase === "work" ? state.completedPomos + 1 : state.completedPomos;

    const next = getNextPhase(state.phase, newPomos);

    set({
      phase: next.phase,
      status: "idle",
      secondsRemaining: next.duration,
      totalSeconds: next.duration,
      completedPomos: newPomos,
      worker: null,
      currentSessionId: null,
      overtimeSeconds: 0,
      overtimeNotifInterval: null,
    });

    get().start(next.duration);
  },

  addFiveMinutes: () => {
    const state = get();
    const { worker, overtimeSeconds } = state;

    clearOvertimeNotif(state);

    if (overtimeSeconds > 0 || state.secondsRemaining <= 0) {
      const newRemaining = 5 * 60;
      worker?.terminate();

      const newWorker = createTimerWorker();
      newWorker.onmessage = (e: MessageEvent) => {
        const { type, remaining, overtime } = e.data;
        if (type === "tick") {
          set({ secondsRemaining: remaining });
        }
        if (type === "done") {
          handleTimerDone();
        }
        if (type === "overtime_tick") {
          set({ overtimeSeconds: overtime });
        }
      };

      newWorker.postMessage({ command: "start", seconds: newRemaining });

      set({
        status: "running",
        secondsRemaining: newRemaining,
        totalSeconds: newRemaining,
        worker: newWorker,
        overtimeSeconds: 0,
      });
    } else {
      worker?.postMessage({ command: "add_time", seconds: 5 * 60 });
      set((s) => ({
        totalSeconds: s.totalSeconds + 5 * 60,
      }));
    }
  },

  endWithoutBreak: async () => {
    const state = get();
    const {
      worker,
      currentSessionId,
      activeTaskId,
      phase,
      totalSeconds,
      overtimeSeconds,
    } = state;
    worker?.terminate();
    clearOvertimeNotif(state);

    if (currentSessionId) {
      const actualDuration = totalSeconds + overtimeSeconds;
      await dbFinishSession(currentSessionId, actualDuration);
      if (phase === "work" && activeTaskId) {
        incrementTaskPomos(activeTaskId);
      }
    }

    const duration = getPhaseDuration("work");
    set({
      phase: "work",
      status: "idle",
      secondsRemaining: duration,
      totalSeconds: duration,
      currentSessionId: null,
      worker: null,
      completedPomos: get().completedPomos + (phase === "work" ? 1 : 0),
      overtimeSeconds: 0,
      overtimeNotifInterval: null,
    });
  },
}));

async function handleTimerDone() {
  const state = useTimerStore.getState();
  const { phase } = state;

  playChime();

  const settings = useSettingsStore.getState().settings;
  const isWorkPhase = phase === "work";

  if (isWorkPhase && settings.autoStartBreaks) {
    state.skip();
    return;
  }

  state.worker?.terminate();

  const overtimeWorker = createTimerWorker();
  overtimeWorker.onmessage = (e: MessageEvent) => {
    const { type, overtime } = e.data;
    if (type === "overtime_tick") {
      useTimerStore.setState({ overtimeSeconds: overtime });
    }
  };
  overtimeWorker.postMessage({ command: "start_overtime", startFrom: 0 });

  const phaseLabel = isWorkPhase ? "focus" : phase.replace("_", " ");
  const durationMin = Math.round(state.totalSeconds / 60);

  sendNotification(
    isWorkPhase ? "focus-complete" : "break-over",
    `Your ${durationMin}m ${phaseLabel} is complete. You're now in overtime.`,
  );

  const notifInterval = setInterval(() => {
    playChime();
  }, 60_000);

  useTimerStore.setState({
    status: "focus_complete",
    secondsRemaining: 0,
    worker: overtimeWorker,
    overtimeSeconds: 0,
    overtimeNotifInterval: notifInterval,
  });
}
