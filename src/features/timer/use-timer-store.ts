import { create } from "zustand";
import type { TimerPhase, TimerStatus } from "@/features/timer/timer-types";
import { TimerEngine } from "@/features/timer/timer-engine";
import { SessionService } from "@/features/timer/session-service";
import {
  DEFAULT_WORK_SEC,
  DEFAULT_SHORT_BREAK_SEC,
  DEFAULT_LONG_BREAK_SEC,
  POMOS_BEFORE_LONG_BREAK,
} from "@/lib/constants";
import { getTasks, getCategory } from "@/lib/db";
import type { Category } from "@/lib/db/types";
import { sendNotification, playChime } from "@/lib/notifications";
import { useSettingsStore } from "@/features/settings/use-settings-store";
import { useTaskStore } from "@/features/tasks/use-task-store";

interface TimerDurations {
  work: number;
  short: number;
  long: number;
}

interface TimerStore {
  phase: TimerPhase;
  status: TimerStatus;
  secondsRemaining: number;
  totalSeconds: number;
  completedPomos: number;
  activeTaskId: number | null;
  currentSessionId: number | null;
  selectedCategory: Category | null;
  overtimeSeconds: number;
  durations: TimerDurations;

  start: (duration?: number) => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  reset: () => void;
  setPhase: (phase: TimerPhase) => void;
  setActiveTask: (taskId: number | null) => Promise<void>;
  setDurations: (work: number, short: number, long: number) => void;
  setDurationForCurrentPhase: (seconds: number) => void;
  adjustDuration: (minutes: number) => void;
  finishSession: (mood?: string, notes?: string) => Promise<void>;
  abandonSession: () => Promise<void>;
  setSelectedCategory: (category: Category | null) => void;
  confirmStartNextPhase: (mood?: string, notes?: string) => Promise<void>;
  addFiveMinutes: () => void;
  endWithoutBreak: () => Promise<void>;
  isFullscreenFocus: boolean;
  setFullscreenFocus: (active: boolean) => void;
}

function getPhaseDuration(
  phase: TimerPhase,
  durations: TimerDurations,
): number {
  return durations[
    phase === "work" ? "work" : phase === "short_break" ? "short" : "long"
  ];
}

function getPhaseDurationKey(phase: TimerPhase): keyof TimerDurations {
  return phase === "work" ? "work" : phase === "short_break" ? "short" : "long";
}

function determineBreakPhase(
  durationSec: number,
  durations: TimerDurations,
): TimerPhase {
  const longDelta = Math.abs(durationSec - durations.long);
  const shortDelta = Math.abs(durationSec - durations.short);
  return longDelta <= shortDelta ? "long_break" : "short_break";
}

function getNextPhase(
  currentPhase: TimerPhase,
  pomosCompleted: number,
  durations: TimerDurations,
): { phase: TimerPhase; duration: number } {
  if (currentPhase === "work") {
    if (pomosCompleted % POMOS_BEFORE_LONG_BREAK === 0) {
      return { phase: "long_break", duration: durations.long };
    }
    return { phase: "short_break", duration: durations.short };
  }
  return { phase: "work", duration: durations.work };
}

const engine = new TimerEngine();

export const useTimerStore = create<TimerStore>((set, get) => {
  function onTimerDone() {
    const state = get();
    const { phase } = state;

    playChime();

    const settings = useSettingsStore.getState().settings;
    const isWorkPhase = phase === "work";

    if (isWorkPhase && settings.autoStartBreaks) {
      state.skip();
      return;
    }

    engine.startOvertime(0);

    const phaseLabel = isWorkPhase ? "focus" : phase.replace("_", " ");
    const durationMin = Math.round(state.totalSeconds / 60);

    sendNotification(
      isWorkPhase ? "focus-complete" : "break-over",
      `Your ${durationMin}m ${phaseLabel} is complete. You're now in overtime.`,
    );

    set({
      status: "focus_complete",
      secondsRemaining: 0,
      overtimeSeconds: 0,
    });
  }

  engine.setCallbacks({
    onTick: (remaining) => set({ secondsRemaining: remaining }),
    onDone: onTimerDone,
    onOvertimeTick: (overtime) => set({ overtimeSeconds: overtime }),
  });

  return {
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
    isFullscreenFocus: false,
    setFullscreenFocus: (active) => set({ isFullscreenFocus: active }),

    start: async (duration?: number) => {
      const state = get();
      const secs = duration ?? getPhaseDuration(state.phase, state.durations);

      // Auto-detect break phase based on actual duration
      let resolvedPhase = state.phase;
      if (resolvedPhase === "short_break" || resolvedPhase === "long_break") {
        resolvedPhase = determineBreakPhase(secs, state.durations);
      }

      const sessionId = await SessionService.start(
        state.activeTaskId,
        resolvedPhase,
        state.selectedCategory?.id,
        state.selectedCategory?.name,
      );

      engine.start(secs);

      set({
        phase: resolvedPhase,
        status: "running",
        secondsRemaining: secs,
        totalSeconds: secs,
        currentSessionId: sessionId,
        overtimeSeconds: 0,
      });
    },

    pause: () => {
      engine.pause();
      set({ status: "paused" });
    },

    resume: () => {
      engine.resume();
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
        overtimeSeconds,
      } = state;

      const completed = secondsRemaining <= 0 || overtimeSeconds > 0;
      const elapsed = Math.max(0, totalSeconds - secondsRemaining + overtimeSeconds);
      SessionService.recordSkip(
        activeTaskId,
        phase,
        elapsed,
        completed,
      );

      if (phase === "work" && completed && activeTaskId) {
        useTaskStore.getState().incrementPomos(activeTaskId);
      }

      if (completed) {
        const notifType =
          phase === "work"
            ? ("session-complete" as const)
            : ("break-over" as const);
        sendNotification(
          notifType,
          `Your ${phase.replace("_", " ")} has ended.`,
        );
      }

      engine.terminate();

      const newPomos =
        phase === "work" && completed ? completedPomos + 1 : completedPomos;
      const next = getNextPhase(phase, newPomos, state.durations);

      set({
        phase: next.phase,
        status: phase === "work" && completed ? "running" : "idle",
        secondsRemaining: next.duration,
        totalSeconds: next.duration,
        completedPomos: newPomos,
        overtimeSeconds: 0,
      });

      if (phase === "work" && completed) {
        get().start(next.duration);
      }
    },

    reset: () => {
      engine.terminate();
      const duration = getPhaseDuration(get().phase, get().durations);
      set({
        status: "idle",
        secondsRemaining: duration,
        totalSeconds: duration,
        overtimeSeconds: 0,
      });
    },

    setPhase: (phase: TimerPhase) => {
      engine.terminate();
      const duration = getPhaseDuration(phase, get().durations);
      set({
        phase,
        status: "idle",
        secondsRemaining: duration,
        totalSeconds: duration,
        overtimeSeconds: 0,
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
            set({ selectedCategory: category || null });
          } else {
            set({ selectedCategory: null });
          }
        } catch (err) {
          console.error(
            "[TimerStore] Failed to load category for task:",
            taskId,
            err,
          );
        }
      } else {
        set({ selectedCategory: null });
      }
    },

    setDurations: (work: number, short: number, long: number) => {
      const durations = { work, short, long };
      const { phase, status } = get();
      if (status === "idle") {
        const dur = getPhaseDuration(phase, durations);
        set({ durations, secondsRemaining: dur, totalSeconds: dur });
      } else {
        set({ durations });
      }
    },

    setDurationForCurrentPhase: (seconds: number) => {
      const { status, phase, durations } = get();
      if (status !== "idle") return;
      const nextDuration = Math.max(1, Math.floor(seconds));
      const key = getPhaseDurationKey(phase);
      const nextDurations = { ...durations, [key]: nextDuration };
      set({
        durations: nextDurations,
        secondsRemaining: nextDuration,
        totalSeconds: nextDuration,
      });
    },

    adjustDuration: (minutes: number) => {
      const { status, phase, durations } = get();
      const key = getPhaseDurationKey(phase);
      const deltaSec = minutes * 60;

      if (status === "idle") {
        const currentDuration = durations[key];
        const newDuration = Math.max(60, currentDuration + deltaSec);
        const newDurations = { ...durations, [key]: newDuration };
        set({
          durations: newDurations,
          secondsRemaining: newDuration,
          totalSeconds: newDuration,
        });
      } else {
        set((s) => {
          const newTotal = Math.max(60, s.totalSeconds + deltaSec);
          const newRemaining = Math.max(0, s.secondsRemaining + deltaSec);
          return { totalSeconds: newTotal, secondsRemaining: newRemaining };
        });
        if (status === "running") {
          engine.addTime(deltaSec);
        }
      }
    },

    finishSession: async (mood?: string, notes?: string) => {
      const state = get();
      const { currentSessionId, activeTaskId, phase } = state;
      engine.terminate();

      if (currentSessionId) {
        await SessionService.finish(currentSessionId, undefined, mood, notes);
        sendNotification(
          "session-complete",
          "Great work! Your focus session has been recorded.",
        );
        if (phase === "work" && activeTaskId) {
          useTaskStore.getState().incrementPomos(activeTaskId);
        }
      }

      const duration = getPhaseDuration("work", state.durations);
      set({
        status: "idle",
        phase: "work",
        secondsRemaining: duration,
        totalSeconds: duration,
        currentSessionId: null,
        completedPomos: get().completedPomos + (phase === "work" ? 1 : 0),
        overtimeSeconds: 0,
        isFullscreenFocus: false,
      });
    },

    abandonSession: async () => {
      const state = get();
      const { currentSessionId } = state;
      engine.terminate();

      if (currentSessionId) {
        await SessionService.abandon(currentSessionId);
      }

      const duration = getPhaseDuration(state.phase, state.durations);
      set({
        status: "idle",
        secondsRemaining: duration,
        totalSeconds: duration,
        currentSessionId: null,
        overtimeSeconds: 0,
        isFullscreenFocus: false,
      });
    },

    setSelectedCategory: (category: Category | null) => {
      set({ selectedCategory: category });
    },

    confirmStartNextPhase: async (mood?: string, notes?: string) => {
      const state = get();
      const {
        currentSessionId,
        activeTaskId,
        phase,
        totalSeconds,
        overtimeSeconds,
      } = state;
      engine.terminate();

      if (currentSessionId) {
        const actualDuration = totalSeconds + overtimeSeconds;
        await SessionService.finish(
          currentSessionId,
          actualDuration,
          mood,
          notes,
        );
        if (phase === "work" && activeTaskId) {
          useTaskStore.getState().incrementPomos(activeTaskId);
        }
      }

      const newPomos =
        state.phase === "work"
          ? state.completedPomos + 1
          : state.completedPomos;
      const next = getNextPhase(state.phase, newPomos, state.durations);

      set({
        phase: next.phase,
        status: "idle",
        secondsRemaining: next.duration,
        totalSeconds: next.duration,
        completedPomos: newPomos,
        currentSessionId: null,
        overtimeSeconds: 0,
      });

      get().start(next.duration);
    },

    addFiveMinutes: () => {
      const state = get();
      const { overtimeSeconds } = state;

      if (overtimeSeconds > 0 || state.secondsRemaining <= 0) {
        engine.terminate();
        get().start(5 * 60);
      } else {
        const addedSec = 5 * 60;
        engine.addTime(addedSec);
        set((s) => ({
          totalSeconds: s.totalSeconds + addedSec,
          secondsRemaining: s.secondsRemaining + addedSec,
        }));
      }
    },

    endWithoutBreak: async () => {
      const state = get();
      const {
        currentSessionId,
        activeTaskId,
        phase,
        totalSeconds,
        overtimeSeconds,
      } = state;
      engine.terminate();

      if (currentSessionId) {
        const actualDuration = totalSeconds + overtimeSeconds;
        await SessionService.finish(currentSessionId, actualDuration);
        if (phase === "work" && activeTaskId) {
          useTaskStore.getState().incrementPomos(activeTaskId);
        }
      }

      const duration = getPhaseDuration("work", state.durations);
      set({
        phase: "work",
        status: "idle",
        secondsRemaining: duration,
        totalSeconds: duration,
        currentSessionId: null,
        completedPomos: get().completedPomos + (phase === "work" ? 1 : 0),
        overtimeSeconds: 0,
        isFullscreenFocus: false,
      });
    },
  };
});
