import { getDb } from "./schema";
import type {
  CategoryAnalytics,
  CategoryBreakdown,
  DayData,
  MoodStat,
  SessionNoteEntry,
  CompletedTaskEntry,
} from "./types";
import { computeDailyScore } from "@/lib/productivity-score";
import {
  CONSISTENCY_STREAK_THRESHOLD,
  DEFAULT_CATEGORY_COLOR,
  EARLY_BIRD_HOUR,
  MARATHON_SESSIONS_PER_DAY,
  MONTHLY_QUALIFYING_SESSIONS,
} from "@/lib/constants";

export async function getCategoryBreakdown(
  startDate?: string,
  endDate?: string,
): Promise<CategoryBreakdown[]> {
  const database = await getDb();
  if (startDate && endDate) {
    return database.select<CategoryBreakdown[]>(
      `SELECT
        s.category_id,
        NULL AS intention,
        c.name AS category_name,
        c.color AS category_color,
        COALESCE(SUM(s.duration_sec), 0) AS total_seconds,
        COUNT(*) AS session_count
      FROM sessions s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE date(s.started_at) >= $1 AND date(s.started_at) <= $2
        AND s.completed = 1 AND s.phase = 'work'
      GROUP BY s.category_id, c.name, c.color
      ORDER BY total_seconds DESC`,
      [startDate, endDate],
    );
  }
  return database.select<CategoryBreakdown[]>(`
    SELECT
      s.category_id,
      NULL AS intention,
      c.name AS category_name,
      c.color AS category_color,
      COALESCE(SUM(s.duration_sec), 0) AS total_seconds,
      COUNT(*) AS session_count
    FROM sessions s
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE date(s.started_at) = date('now', 'localtime')
      AND s.completed = 1 AND s.phase = 'work'
    GROUP BY s.category_id, c.name, c.color
    ORDER BY total_seconds DESC
  `);
}

export async function getAllCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  const database = await getDb();
  return database.select<CategoryBreakdown[]>(`
    SELECT
      s.category_id,
      NULL AS intention,
      c.name AS category_name,
      c.color AS category_color,
      COALESCE(SUM(s.duration_sec), 0) AS total_seconds,
      COUNT(*) AS session_count
    FROM sessions s
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE s.completed = 1 AND s.phase = 'work'
    GROUP BY s.category_id, c.name, c.color
    ORDER BY total_seconds DESC
  `);
}

export async function getWeeklyData(
  startDate?: string,
  endDate?: string,
): Promise<DayData[]> {
  const database = await getDb();
  const query = `
    SELECT
      date(started_at) AS date,
      CASE CAST(strftime('%w', started_at) AS INTEGER)
        WHEN 0 THEN 'Sun' WHEN 1 THEN 'Mon' WHEN 2 THEN 'Tue'
        WHEN 3 THEN 'Wed' WHEN 4 THEN 'Thu' WHEN 5 THEN 'Fri'
        ELSE 'Sat'
      END AS day_name,
      COALESCE(SUM(duration_sec), 0) AS total_seconds,
      COUNT(*) AS session_count
    FROM sessions
    WHERE date(started_at) >= $1 AND date(started_at) <= $2
      AND completed = 1 AND phase = 'work'
    GROUP BY date(started_at)
    ORDER BY date(started_at) ASC`;
  return database.select<DayData[]>(query, [startDate ?? "", endDate ?? ""]);
}

export async function getAllTimeStats(): Promise<{
  total_focus_seconds: number;
  total_sessions: number;
  avg_session_seconds: number;
  longest_session_seconds: number;
  total_break_seconds: number;
  avg_break_seconds: number;
}> {
  const database = await getDb();
  const rows = await database.select<
    {
      total_focus_seconds: number;
      total_sessions: number;
      avg_session_seconds: number;
      longest_session_seconds: number;
      total_break_seconds: number;
      avg_break_seconds: number;
    }[]
  >(`
    SELECT
      COALESCE(SUM(CASE WHEN phase = 'work' AND completed = 1 THEN duration_sec ELSE 0 END), 0) AS total_focus_seconds,
      COALESCE(SUM(CASE WHEN phase = 'work' AND completed = 1 THEN 1 ELSE 0 END), 0) AS total_sessions,
      COALESCE(AVG(CASE WHEN phase = 'work' AND completed = 1 THEN duration_sec END), 0) AS avg_session_seconds,
      COALESCE(MAX(CASE WHEN phase = 'work' AND completed = 1 THEN duration_sec END), 0) AS longest_session_seconds,
      COALESCE(SUM(CASE WHEN phase != 'work' AND completed = 1 THEN duration_sec ELSE 0 END), 0) AS total_break_seconds,
      COALESCE(AVG(CASE WHEN phase != 'work' AND completed = 1 THEN duration_sec END), 0) AS avg_break_seconds
    FROM sessions
  `);
  return (
    rows[0] ?? {
      total_focus_seconds: 0,
      total_sessions: 0,
      avg_session_seconds: 0,
      longest_session_seconds: 0,
      total_break_seconds: 0,
      avg_break_seconds: 0,
    }
  );
}

export async function getCurrentStreak(): Promise<number> {
  const database = await getDb();
  const rows = await database.select<{ days: string }[]>(
    "SELECT DISTINCT date(started_at) as days FROM sessions WHERE completed = 1 AND phase = 'work' ORDER BY days DESC",
  );
  if (rows.length === 0) return 0;
  // Snapshot once so all local parts come from the same instant.
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  let streak = 0;
  for (const row of rows) {
    const [ay, am, ad] = today.split("-").map(Number);
    const [by, bm, bd] = row.days.split("-").map(Number);
    const dateA = new Date(ay, am - 1, ad);
    const dateB = new Date(by, bm - 1, bd);
    const diffDays = Math.round(
      (dateA.getTime() - dateB.getTime()) / 86400000,
    );
    if (diffDays === streak) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export async function getBestStreak(): Promise<number> {
  const database = await getDb();
  const rows = await database.select<{ days: string }[]>(
    "SELECT DISTINCT date(started_at) as days FROM sessions WHERE completed = 1 AND phase = 'work' ORDER BY days ASC",
  );
  if (rows.length === 0) return 0;
  let bestStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < rows.length; i++) {
    const [ay, am, ad] = rows[i - 1].days.split("-").map(Number);
    const [by, bm, bd] = rows[i].days.split("-").map(Number);
    const dateA = new Date(ay, am - 1, ad);
    const dateB = new Date(by, bm - 1, bd);
    const diffDays = Math.round(
      (dateB.getTime() - dateA.getTime()) / 86400000,
    );
    if (diffDays === 1) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  return bestStreak;
}

export interface AchievementProgress {
  currentStreak: number;
  bestStreak: number;
  earlyBird: boolean;
  marathon: boolean;
  qualifyingMonths: number;
}

export async function getAchievementProgress(): Promise<AchievementProgress> {
  const database = await getDb();
  const [currentStreak, bestStreak, earlyBirdRows, marathonRows, monthRows] =
    await Promise.all([
      getCurrentStreak(),
      getBestStreak(),
      database.select<{ count: number }[]>(
        `SELECT COUNT(*) AS count FROM sessions
         WHERE completed = 1 AND phase = 'work'
           AND CAST(strftime('%H', started_at) AS INTEGER) < ${EARLY_BIRD_HOUR}`,
      ),
      database.select<{ count: number }[]>(
        `SELECT COUNT(*) AS count FROM (
           SELECT date(started_at) AS day, COUNT(*) AS sessionCount
           FROM sessions
           WHERE completed = 1 AND phase = 'work'
           GROUP BY date(started_at)
           HAVING sessionCount >= ${MARATHON_SESSIONS_PER_DAY}
         )`,
      ),
      database.select<{ month: string }[]>(
        `SELECT strftime('%Y-%m', started_at) AS month
         FROM sessions
         WHERE completed = 1 AND phase = 'work'
         GROUP BY strftime('%Y-%m', started_at)
         HAVING COUNT(*) >= ${MONTHLY_QUALIFYING_SESSIONS}`,
      ),
    ]);

  return {
    currentStreak,
    bestStreak,
    earlyBird: (earlyBirdRows[0]?.count ?? 0) > 0,
    marathon: (marathonRows[0]?.count ?? 0) > 0,
    qualifyingMonths: monthRows.length,
  };
}

export async function getCategoryAnalytics(
  startDate?: string,
  endDate?: string,
): Promise<CategoryAnalytics[]> {
  const database = await getDb();
  const hasRange = Boolean(startDate && endDate);
  const rangeClause = hasRange
    ? "AND date(s.started_at) >= $1 AND date(s.started_at) <= $2"
    : "";
  const params = hasRange ? [startDate!, endDate!] : [];
  const rows = await database.select<
    {
      category_id: number | null;
      // COALESCE in the query guarantees both are non-null.
      category_name: string;
      category_color: string;
      total_focus_seconds: number;
      session_count: number;
      avg_session_seconds: number;
      active_days: number;
    }[]
  >(
    `SELECT
       s.category_id,
       COALESCE(c.name, 'Uncategorized') AS category_name,
       COALESCE(c.color, '${DEFAULT_CATEGORY_COLOR}') AS category_color,
       COALESCE(SUM(s.duration_sec), 0) AS total_focus_seconds,
       COUNT(*) AS session_count,
       COALESCE(AVG(s.duration_sec), 0) AS avg_session_seconds,
       COUNT(DISTINCT date(s.started_at)) AS active_days
     FROM sessions s
     LEFT JOIN categories c ON s.category_id = c.id
     WHERE s.completed = 1 AND s.phase = 'work' ${rangeClause}
     GROUP BY s.category_id, c.name, c.color
     ORDER BY total_focus_seconds DESC`,
    params,
  );

  const totalFocus = rows.reduce((sum, row) => sum + row.total_focus_seconds, 0);
  const dayCount = hasRange
    ? Math.max(
        1,
        Math.round(
          (new Date(`${endDate}T00:00:00`).getTime() -
            new Date(`${startDate}T00:00:00`).getTime()) /
            86400000,
        ) + 1,
      )
    : undefined;

  return rows.map((row) => ({
    ...row,
    // COALESCE above already guarantees non-null name/color.
    daily_avg_seconds:
      dayCount !== undefined
        ? Math.round(row.total_focus_seconds / dayCount)
        : row.active_days > 0
          ? Math.round(row.total_focus_seconds / row.active_days)
          : 0,
    percentage_of_focus:
      totalFocus > 0 ? Math.round((row.total_focus_seconds / totalFocus) * 100) : 0,
  }));
}

export async function getMoodDistribution(
  startDate?: string,
  endDate?: string,
): Promise<MoodStat[]> {
  const database = await getDb();
  if (startDate && endDate) {
    return database.select<MoodStat[]>(
      `SELECT mood, COUNT(*) AS count
       FROM sessions
       WHERE date(started_at) >= $1 AND date(started_at) <= $2
         AND completed = 1 AND mood IS NOT NULL AND mood != ''
       GROUP BY mood
       ORDER BY count DESC`,
      [startDate, endDate],
    );
  }
  return database.select<MoodStat[]>(
    `SELECT mood, COUNT(*) AS count
     FROM sessions
     WHERE completed = 1 AND mood IS NOT NULL AND mood != ''
     GROUP BY mood
     ORDER BY count DESC`,
  );
}

export async function getSessionNotes(
  startDate?: string,
  endDate?: string,
): Promise<SessionNoteEntry[]> {
  const database = await getDb();
  if (startDate && endDate) {
    return database.select<SessionNoteEntry[]>(
      `SELECT
        s.id,
        s.started_at,
        s.ended_at,
        s.duration_sec,
        s.mood,
        s.notes,
        c.name AS category_name,
        c.color AS category_color,
        t.name AS task_name
      FROM sessions s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN tasks t ON s.task_id = t.id
      WHERE date(s.started_at) >= $1 AND date(s.started_at) <= $2
        AND s.completed = 1 AND s.notes IS NOT NULL AND s.notes != ''
      ORDER BY s.started_at DESC`,
      [startDate, endDate],
    );
  }
  return database.select<SessionNoteEntry[]>(
    `SELECT
      s.id,
      s.started_at,
      s.ended_at,
      s.duration_sec,
      s.mood,
      s.notes,
      c.name AS category_name,
      c.color AS category_color,
      t.name AS task_name
    FROM sessions s
    LEFT JOIN categories c ON s.category_id = c.id
    LEFT JOIN tasks t ON s.task_id = t.id
    WHERE s.completed = 1 AND s.notes IS NOT NULL AND s.notes != ''
    ORDER BY s.started_at DESC`,
  );
}

export async function getCompletedTasksForPeriod(
  startDate?: string,
  endDate?: string,
): Promise<CompletedTaskEntry[]> {
  const database = await getDb();
  if (startDate && endDate) {
    return database.select<CompletedTaskEntry[]>(
      `SELECT
        s.task_id,
        t.name AS task_name,
        c.name AS category_name,
        c.color AS category_color,
        COALESCE(SUM(s.duration_sec), 0) AS total_seconds,
        COUNT(*) AS session_count,
        t.completed_pomos,
        t.estimated_pomos
      FROM sessions s
      LEFT JOIN tasks t ON s.task_id = t.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE date(s.started_at) >= $1 AND date(s.started_at) <= $2
        AND s.completed = 1 AND s.task_id IS NOT NULL
      GROUP BY s.task_id
      ORDER BY total_seconds DESC`,
      [startDate, endDate],
    );
  }
  return database.select<CompletedTaskEntry[]>(
    `SELECT
      s.task_id,
      t.name AS task_name,
      c.name AS category_name,
      c.color AS category_color,
      COALESCE(SUM(s.duration_sec), 0) AS total_seconds,
      COUNT(*) AS session_count,
      t.completed_pomos,
      t.estimated_pomos
    FROM sessions s
    LEFT JOIN tasks t ON s.task_id = t.id
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE s.completed = 1 AND s.task_id IS NOT NULL
    GROUP BY s.task_id
    ORDER BY total_seconds DESC`,
  );
}

/**
 * Today's productivity score (0–100). Aggregates today's focus time, started
 * vs completed sessions, current streak, and mood distribution, then runs them
 * through the pure computeDailyScore() function.
 */
export async function getDailyScore(
  day?: string,
  streakDays?: number,
): Promise<number> {
  const database = await getDb();
  const dayClause = day
    ? "date(started_at) = $1"
    : "date(started_at) = date('now', 'localtime')";

  const totals = await database.select<
    {
      focus_seconds: number;
      started: number;
      completed: number;
      focused: number;
      neutral: number;
      distracted: number;
    }[]
  >(
    `SELECT
      COALESCE(SUM(CASE WHEN completed = 1 THEN duration_sec ELSE 0 END), 0) AS focus_seconds,
      COUNT(*) AS started,
      COALESCE(SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END), 0) AS completed,
      COALESCE(SUM(CASE WHEN mood = 'focused' THEN 1 ELSE 0 END), 0) AS focused,
      COALESCE(SUM(CASE WHEN mood = 'neutral' THEN 1 ELSE 0 END), 0) AS neutral,
      COALESCE(SUM(CASE WHEN mood = 'distracted' THEN 1 ELSE 0 END), 0) AS distracted
    FROM sessions
    WHERE phase = 'work' AND ${dayClause}`,
    day ? [day] : [],
  );

  const t = totals[0] ?? {
    focus_seconds: 0,
    started: 0,
    completed: 0,
    focused: 0,
    neutral: 0,
    distracted: 0,
  };

  const streak = streakDays ?? await getCurrentStreak().catch(() => 0);

  return computeDailyScore({
    focusSeconds: t.focus_seconds,
    sessionsStarted: t.started,
    sessionsCompleted: t.completed,
    streakDays: streak,
    moodCounts: { focused: t.focused, neutral: t.neutral, distracted: t.distracted },
  });
}

export interface BadgeAward {
  id: "early_bird" | "marathon" | "consistency";
  title: string;
  description: string;
  earned: boolean;
}

/**
 * Evaluate the three achievement badges from real session/streak data.
 * - Early Bird: any completed work session started before 7 AM.
 * - Marathon: any day with 4+ completed work sessions.
 * - Consistency: a current or historical streak of 7+ days.
 */
export async function getEarnedBadges(streaks?: {
  currentStreak?: number;
  bestStreak?: number;
}): Promise<BadgeAward[]> {
  const progress = await getAchievementProgress().catch(() => ({
    currentStreak: 0,
    bestStreak: 0,
    earlyBird: false,
    marathon: false,
    qualifyingMonths: 0,
  }));
  const bestStreak = streaks?.bestStreak ?? progress.bestStreak;
  const currentStreak = streaks?.currentStreak ?? progress.currentStreak;
  const consistency = Math.max(bestStreak, currentStreak) >= CONSISTENCY_STREAK_THRESHOLD;

  return [
    {
      id: "early_bird",
      title: "Early Bird",
      description: "Complete a focus session before 7 AM",
      earned: progress.earlyBird,
    },
    {
      id: "marathon",
      title: "Marathon Runner",
      description: "Complete 4+ focus sessions in one day",
      earned: progress.marathon,
    },
    {
      id: "consistency",
      title: "Consistency King",
      description: "Maintain a 7-day streak",
      earned: consistency,
    },
  ];
}
