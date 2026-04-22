export type TimerPhase = "work" | "short_break" | "long_break";

export type TimerStatus = "idle" | "running" | "paused" | "focus_complete";

export interface TimerState {
  phase: TimerPhase;
  status: TimerStatus;
  secondsRemaining: number;
  totalSeconds: number;
  completedPomos: number;
  activeTaskId: number | null;
  overtimeSeconds: number;
}
