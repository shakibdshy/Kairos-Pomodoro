import { getDb } from "./schema";
import type { TimeBlock, TimeBlockWithMeta } from "./types";

export interface TimeBlockInput {
  title: string | null;
  /** Local-naive `yyyy-MM-dd HH:mm:ss` datetime string (matches sessions). */
  start_time: string;
  /** Local-naive `yyyy-MM-dd HH:mm:ss` datetime string (matches sessions). */
  end_time: string;
  task_id?: number | null;
  category_id?: number | null;
  color?: string | null;
  /** Focus session created from this block, so it counts toward stats. */
  session_id?: number | null;
}

function validateRange(start: string, end: string): void {
  if (new Date(end).getTime() <= new Date(start).getTime()) {
    throw new Error("Invalid time range: end_time must be after start_time");
  }
}

export async function addTimeBlock(input: TimeBlockInput): Promise<number> {
  validateRange(input.start_time, input.end_time);
  const database = await getDb();
  const result = await database.execute(
    `INSERT INTO time_blocks (title, start_time, end_time, task_id, category_id, color, session_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.title,
      input.start_time,
      input.end_time,
      input.task_id ?? null,
      input.category_id ?? null,
      input.color ?? null,
      input.session_id ?? null,
    ],
  );
  return result.lastInsertId as number;
}

export async function updateTimeBlock(
  id: number,
  input: Partial<TimeBlockInput>,
): Promise<void> {
  if (input.start_time !== undefined && input.end_time !== undefined) {
    validateRange(input.start_time, input.end_time);
  }
  const database = await getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  let paramIndex = 1;

  if (input.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(input.title);
  }
  if (input.start_time !== undefined) {
    fields.push(`start_time = $${paramIndex++}`);
    values.push(input.start_time);
  }
  if (input.end_time !== undefined) {
    fields.push(`end_time = $${paramIndex++}`);
    values.push(input.end_time);
  }
  if (input.task_id !== undefined) {
    fields.push(`task_id = $${paramIndex++}`);
    values.push(input.task_id);
  }
  if (input.category_id !== undefined) {
    fields.push(`category_id = $${paramIndex++}`);
    values.push(input.category_id);
  }
  if (input.color !== undefined) {
    fields.push(`color = $${paramIndex++}`);
    values.push(input.color);
  }
  if (input.session_id !== undefined) {
    fields.push(`session_id = $${paramIndex++}`);
    values.push(input.session_id);
  }

  if (fields.length === 0) return;
  values.push(id);
  await database.execute(
    `UPDATE time_blocks SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values,
  );
}

export async function deleteTimeBlock(id: number): Promise<void> {
  const database = await getDb();
  await database.execute(`DELETE FROM time_blocks WHERE id = $1`, [id]);
}

export async function getTimeBlock(id: number): Promise<TimeBlock | null> {
  const database = await getDb();
  const rows = await database.select<TimeBlock[]>(
    `SELECT * FROM time_blocks WHERE id = $1`,
    [id],
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function getWeekTimeBlocks(
  weekStart: string,
  weekEnd: string,
): Promise<TimeBlockWithMeta[]> {
  const database = await getDb();
  return database.select<TimeBlockWithMeta[]>(
    `SELECT
      tb.*,
      t.name AS task_name,
      c.name AS category_name,
      c.color AS category_color
    FROM time_blocks tb
    LEFT JOIN tasks t ON tb.task_id = t.id
    LEFT JOIN categories c ON tb.category_id = c.id
    WHERE date(tb.start_time) >= $1 AND date(tb.start_time) <= $2
    ORDER BY tb.start_time ASC`,
    [weekStart, weekEnd],
  );
}

export async function markTimeBlockCompleted(
  id: number,
  completed: boolean,
): Promise<void> {
  const database = await getDb();
  await database.execute(`UPDATE time_blocks SET completed = $1 WHERE id = $2`, [
    completed ? 1 : 0,
    id,
  ]);
}
