/**
 * Tables removed by Settings → Privacy → "Clear All Data".
 *
 * Every table `initDb` creates must appear here, ordered so dependent rows go
 * before the parents they reference: `time_blocks` and `sessions` both point at
 * `tasks` and `categories`. A table missing from this list survives the wipe
 * while the UI still reports that all data was cleared, so
 * `data-wipe.test.ts` asserts this stays in step with the schema.
 */
export const WIPED_TABLES = [
  "time_blocks",
  "sessions",
  "journal_entries",
  "badge_awards",
  "presets",
  "tasks",
  "categories",
  "settings",
  "_schema_meta",
] as const;

export type WipedTable = (typeof WIPED_TABLES)[number];
