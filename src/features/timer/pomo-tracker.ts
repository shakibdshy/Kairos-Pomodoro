import type { TimerPhase } from "@/features/timer/timer-types";
import { useTaskStore } from "@/features/tasks/use-task-store";

export function recordPomoCompletion(
  phase: TimerPhase,
  activeTaskId: number | null,
) {
  if (phase === "work" && activeTaskId) {
    useTaskStore.getState().incrementPomos(activeTaskId);
  }
}
