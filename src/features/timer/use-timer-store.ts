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
}

let durations = {
  work: DEFAULT_WORK_SEC,
  short: DEFAULT_SHORT_BREAK_SEC,
  long: DEFAULT_LONG_BREAK_SEC,
};

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

  start: async (duration?: number) => {
    const state = get();
    state.worker?.terminate();

    const secs =
      duration ??
      durations[
        state.phase === "work"
          ? "work"
          : state.phase === "short_break"
            ? "short"
            : "long"
      ];

    const sessionId = await dbStartSession(
      state.activeTaskId,
      state.phase,
      state.selectedCategory?.id,
      state.selectedCategory?.name,
    );

    const worker = createTimerWorker();

    worker.onmessage = (e: MessageEvent) => {
      const { type, remaining } = e.data;
      if (type === "tick") {
        set({ secondsRemaining: remaining });
      }
      if (type === "done") {
        get().skip();
      }
    };

    worker.postMessage({ command: "start", seconds: secs });

    set({
      status: "running",
      secondsRemaining: secs,
      totalSeconds: secs,
      currentSessionId: sessionId,
      worker,
    });
  },

  pause: () => {
    const { worker } = get();
    worker?.postMessage({ command: "pause" });
    set({ status: "paused" });
  },

  resume: () => {
    const { worker } = get();
    worker?.postMessage({ command: "resume" });
    set({ status: "running" });
  },

  skip: () => {
    const state = get();
    const {
      phase,
      secondsRemaining,
      totalSeconds,
      activeTaskId,
      completedPomos,
    } = state;

    const completed = secondsRemaining <= 0;
    addSession(activeTaskId, phase, totalSeconds - secondsRemaining, completed);

    if (phase === "work" && completed && activeTaskId) {
      incrementTaskPomos(activeTaskId);
    }

    state.worker?.terminate();

    const newPomos =
      phase === "work" && completed ? completedPomos + 1 : completedPomos;
    let nextPhase: TimerPhase;
    let nextDuration: number;

    if (phase === "work") {
      if (completed && newPomos % POMOS_BEFORE_LONG_BREAK === 0) {
        nextPhase = "long_break";
        nextDuration = durations.long;
      } else if (completed) {
        nextPhase = "short_break";
        nextDuration = durations.short;
      } else {
        nextPhase = "short_break";
        nextDuration = durations.short;
      }
    } else {
      nextPhase = "work";
      nextDuration = durations.work;
    }

    const newWorker = createTimerWorker();
    newWorker.onmessage = (e: MessageEvent) => {
      const { type, remaining } = e.data;
      if (type === "tick") {
        set({ secondsRemaining: remaining });
      }
      if (type === "done") {
        get().skip();
      }
    };

    newWorker.postMessage({ command: "start", seconds: nextDuration });

    set({
      phase: nextPhase,
      status: "running",
      secondsRemaining: nextDuration,
      totalSeconds: nextDuration,
      completedPomos: newPomos,
      worker: newWorker,
    });
  },

  reset: () => {
    get().worker?.terminate();
    const phase = get().phase;
    const duration =
      durations[
        phase === "work" ? "work" : phase === "short_break" ? "short" : "long"
      ];
    set({
      status: "idle",
      secondsRemaining: duration,
      totalSeconds: duration,
      worker: null,
    });
  },

  setPhase: (phase: TimerPhase) => {
    get().worker?.terminate();
    const duration =
      durations[
        phase === "work" ? "work" : phase === "short_break" ? "short" : "long"
      ];
    set({
      phase,
      status: "idle",
      secondsRemaining: duration,
      totalSeconds: duration,
      worker: null,
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
      } catch {
        // silently fail — user can still pick intention manually
      }
    }
  },

  setDurations: (work: number, short: number, long: number) => {
    durations = { work, short, long };
    const { phase, status } = get();
    if (status === "idle") {
      const dur =
        phase === "work" ? work : phase === "short_break" ? short : long;
      set({ secondsRemaining: dur, totalSeconds: dur });
    }
  },

  adjustDuration: (minutes: number) => {
    const { status } = get();
    if (status !== "idle") return;

    const { phase } = get();
    const key =
      phase === "work" ? "work" : phase === "short_break" ? "short" : "long";
    const currentDuration = durations[key];
    const newDuration = Math.max(60, currentDuration + minutes * 60);
    durations[key] = newDuration;
    set({ secondsRemaining: newDuration, totalSeconds: newDuration });
  },

  finishSession: async (mood?: string, notes?: string) => {
    const { worker, currentSessionId, activeTaskId, phase } = get();
    worker?.terminate();

    if (currentSessionId) {
      await dbFinishSession(currentSessionId, mood, notes);

      if (phase === "work" && activeTaskId) {
        incrementTaskPomos(activeTaskId);
      }
    }

    set({
      status: "idle",
      currentSessionId: null,
      worker: null,
      completedPomos: get().completedPomos + (phase === "work" ? 1 : 0),
    });
  },

  abandonSession: async () => {
    const { worker, currentSessionId } = get();
    worker?.terminate();

    if (currentSessionId) {
      await dbAbandonSession(currentSessionId);
    }

    const phase = get().phase;
    const duration =
      durations[
        phase === "work" ? "work" : phase === "short_break" ? "short" : "long"
      ];

    set({
      status: "idle",
      secondsRemaining: duration,
      totalSeconds: duration,
      currentSessionId: null,
      worker: null,
    });
  },

  setSelectedCategory: (category: Category | null) => {
    set({ selectedCategory: category });
  },
}));
