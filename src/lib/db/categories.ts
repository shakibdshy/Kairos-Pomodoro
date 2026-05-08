import { getDb } from "./schema";
import type { Category } from "./types";

export async function getCategories(): Promise<Category[]> {
  const database = await getDb();
  return database.select("SELECT * FROM categories ORDER BY name ASC");
}

export async function getCategory(id: number): Promise<Category | null> {
  const database = await getDb();
  const rows = await database.select<Category[]>(
    "SELECT * FROM categories WHERE id = $1",
    [id],
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function addCategory(
  name: string,
  color?: string,
): Promise<number> {
  const database = await getDb();
  const { DEFAULT_CATEGORY_COLOR } = await import("@/lib/constants");
  const result = await database.execute(
    "INSERT INTO categories (name, color) VALUES ($1, $2)",
    [name, color ?? DEFAULT_CATEGORY_COLOR],
  );
  return result.lastInsertId as number;
}

export async function updateCategory(
  id: number,
  name: string,
  color: string,
): Promise<void> {
  const database = await getDb();
  await database.execute(
    "UPDATE categories SET name = $1, color = $2 WHERE id = $3",
    [name, color, id],
  );
}

export async function deleteCategory(id: number): Promise<void> {
  const database = await getDb();
  await database.execute(
    "UPDATE sessions SET category_id = NULL WHERE category_id = $1",
    [id],
  );
  await database.execute("DELETE FROM categories WHERE id = $1", [id]);
}
