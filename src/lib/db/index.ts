export { initDb } from "./schema";
export { getDb } from "./schema";
export type { Session, Category, CategoryBreakdown, CategoryAnalytics, DayData, WeekSession, WeekSummary, MoodStat, SessionNoteEntry, CompletedTaskEntry, TimeBlock, TimeBlockWithMeta, JournalEntry } from "./types";
export {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskArchived,
  incrementTaskPomos,
  getTaskTimeToday,
} from "./tasks";
export {
  addSession,
  addLoggedSession,
  updateLoggedSession,
  deleteSession,
  startSession,
  finishSession,
  abandonSession,
  getSessions,
  getTodaySessions,
  getWeekSessions,
  getWeekSummary,
} from "./sessions";
export { getSetting, setSetting } from "./settings";
export {
  getCategories,
  getCategory,
  addCategory,
  updateCategory,
  deleteCategory,
} from "./categories";
export {
  getCategoryBreakdown,
  getAllCategoryBreakdown,
  getCategoryAnalytics,
  getWeeklyData,
  getAllTimeStats,
  getCurrentStreak,
  getBestStreak,
  getAchievementProgress,
  getMoodDistribution,
  getSessionNotes,
  getCompletedTasksForPeriod,
  getDailyScore,
  getEarnedBadges,
} from "./analytics";
export type { BadgeAward } from "./analytics";
export {
  getBadgeAwards,
  getUnannouncedBadgeAwards,
  recordBadgeAward,
  markBadgeAnnounced,
} from "./achievements";
export type { BadgeAwardRow } from "./achievements";
export { getPresets, addPreset, updatePreset, deletePreset } from "./presets";
export type { TimerPreset } from "./presets";
export {
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalEntries,
} from "./journal";
export {
  addTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
  getTimeBlock,
  getWeekTimeBlocks,
  markTimeBlockCompleted,
} from "./time-blocks";
export type { TimeBlockInput } from "./time-blocks";
