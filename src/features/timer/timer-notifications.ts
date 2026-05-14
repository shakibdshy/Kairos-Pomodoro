import type { TimerPhase } from "@/features/timer/timer-types";
import { sendNotification, playChime } from "@/lib/notifications";

export function notifyPhaseComplete(
  phase: TimerPhase,
  durationMin: number,
) {
  playChime();

  const phaseLabel = phase === "work" ? "focus" : phase.replace("_", " ");
  const isWorkPhase = phase === "work";

  sendNotification(
    isWorkPhase ? "focus-complete" : "break-over",
    `Your ${durationMin}m ${phaseLabel} is complete. You're now in overtime.`,
  );
}

export function notifySessionComplete() {
  sendNotification(
    "session-complete",
    "Great work! Your focus session has been recorded.",
  );
}

export function notifySkipped(phase: TimerPhase) {
  sendNotification(
    phase === "work" ? ("session-complete" as const) : ("break-over" as const),
    `Your ${phase.replace("_", " ")} has ended.`,
  );
}
