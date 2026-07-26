import {
  startSession as dbStartSession,
  finishSession as dbFinishSession,
  abandonSession as dbAbandonSession,
  addSession,
  addLoggedSession,
} from "@/lib/db";
import { reconcileAchievements } from "@/features/achievements/achievement-service";
import { useAchievementStore } from "@/features/achievements/use-achievement-store";

export const SessionService = {
  async start(
    activeTaskId: number | null,
    phase: string,
    categoryId?: number | null,
    intention?: string | null,
  ): Promise<number> {
    return dbStartSession(activeTaskId, phase, categoryId, intention);
  },

  async finish(
    sessionId: number,
    durationSec?: number,
    mood?: string,
    notes?: string,
  ): Promise<void> {
    await dbFinishSession(sessionId, durationSec, mood, notes);
    const unlocked = await reconcileAchievements(sessionId, true).catch(() => []);
    useAchievementStore.getState().enqueue(unlocked);
  },

  async abandon(sessionId: number): Promise<void> {
    await dbAbandonSession(sessionId);
  },

  async recordSkip(
    activeTaskId: number | null,
    phase: string,
    elapsedSec: number,
    completed: boolean,
  ): Promise<void> {
    await addSession(activeTaskId, phase, elapsedSec, completed);
    if (completed && phase === "work") {
      const unlocked = await reconcileAchievements(null, true).catch(() => []);
      useAchievementStore.getState().enqueue(unlocked);
    }
  },

  async recordLoggedSession(input: {
    taskId: number | null;
    phase: string;
    startedAt: string;
    endedAt: string;
    durationSec: number;
    categoryId?: number | null;
    intention?: string | null;
  }): Promise<number> {
    const sessionId = await addLoggedSession(input);
    const unlocked = await reconcileAchievements(sessionId, true).catch(() => []);
    useAchievementStore.getState().enqueue(unlocked);
    return sessionId;
  },
};
