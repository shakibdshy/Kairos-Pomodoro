import { getDb } from "./schema";
import type { JournalEntry } from "./types";

/** ISO date (YYYY-MM-DD) for "today" in the user's local timezone. */
function todayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function addJournalEntry(content: string, date?: string): Promise<number> {
  const database = await getDb();
  const result = await database.execute(
    `INSERT INTO journal_entries (date, content) VALUES ($1, $2)`,
    [date ?? todayDate(), content],
  );
  return result.lastInsertId as number;
}

export async function updateJournalEntry(id: number, content: string): Promise<void> {
  const database = await getDb();
  await database.execute(
    `UPDATE journal_entries SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [content, id],
  );
}

export async function deleteJournalEntry(id: number): Promise<void> {
  const database = await getDb();
  await database.execute(`DELETE FROM journal_entries WHERE id = $1`, [id]);
}

export async function getJournalEntries(
  startDate?: string,
  endDate?: string,
): Promise<JournalEntry[]> {
  const database = await getDb();
  if (startDate && endDate) {
    return database.select<JournalEntry[]>(
      `SELECT * FROM journal_entries
       WHERE date >= $1 AND date <= $2
       ORDER BY date DESC, created_at DESC`,
      [startDate, endDate],
    );
  }
  return database.select<JournalEntry[]>(
    `SELECT * FROM journal_entries ORDER BY date DESC, created_at DESC`,
  );
}
