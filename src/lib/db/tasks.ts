import { getDb } from "./schema";

export async function getTasks(): Promise<
  {
    id: number;
    name: string;
    project?: string;
    priority?: "low" | "medium" | "high";
    estimated_pomos: number;
    completed_pomos: number;
    category_id: number | null;
    created_at: string;
    archived: number;
  }[]
> {
  const database = await getDb();
  return database.select<
    {
      id: number;
      name: string;
      project?: string;
      priority?: "low" | "medium" | "high";
      estimated_pomos: number;
      completed_pomos: number;
      category_id: number | null;
      created_at: string;
      archived: number;
    }[]
  >("SELECT * FROM tasks WHERE archived = 0 ORDER BY created_at DESC");
}

export async function addTask(
  name: string,
  estimatedPomos: number,
  project?: string,
  priority?: string,
  categoryId?: number | null,
): Promise<number> {
  const database = await getDb();
  const result = await database.execute(
    "INSERT INTO tasks (name, estimated_pomos, project, priority, category_id) VALUES ($1, $2, $3, $4, $5)",
    [
      name,
      estimatedPomos,
      project ?? null,
      priority ?? null,
      categoryId ?? null,
    ],
  );
  return result.lastInsertId as number;
}

export async function toggleTaskArchived(
  id: number,
  archived: boolean,
): Promise<void> {
  const database = await getDb();
  await database.execute("UPDATE tasks SET archived = $1 WHERE id = $2", [
    archived ? 1 : 0,
    id,
  ]);
}

export async function updateTask(
  id: number,
  name?: string,
  estimatedPomos?: number,
  project?: string | null,
  priority?: string | null,
  categoryId?: number | null,
): Promise<void> {
  const database = await getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (estimatedPomos !== undefined) {
    fields.push(`estimated_pomos = $${paramIndex++}`);
    values.push(estimatedPomos);
  }
  if (project !== undefined) {
    fields.push(`project = $${paramIndex++}`);
    values.push(project ?? null);
  }
  if (priority !== undefined) {
    fields.push(`priority = $${paramIndex++}`);
    values.push(priority ?? null);
  }
  if (categoryId !== undefined) {
    fields.push(`category_id = $${paramIndex++}`);
    values.push(categoryId ?? null);
  }

  if (fields.length === 0) return;
  values.push(id);
  await database.execute(
    `UPDATE tasks SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values,
  );
}

export async function deleteTask(id: number): Promise<void> {
  const database = await getDb();
  await database.execute("DELETE FROM sessions WHERE task_id = $1", [id]);
  await database.execute("DELETE FROM tasks WHERE id = $1", [id]);
}

export async function incrementTaskPomos(id: number): Promise<void> {
  const database = await getDb();
  await database.execute(
    "UPDATE tasks SET completed_pomos = completed_pomos + 1 WHERE id = $1",
    [id],
  );
}

export async function getTaskTimeToday(taskId: number): Promise<number> {
  const database = await getDb();
  const rows = await database.select<{ total: number }[]>(
    "SELECT COALESCE(SUM(duration_sec), 0) AS total FROM sessions WHERE task_id = $1 AND date(started_at) = date('now', 'localtime') AND completed = 1",
    [taskId],
  );
  return rows[0]?.total ?? 0;
}
