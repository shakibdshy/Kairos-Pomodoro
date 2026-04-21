export interface Task {
  id: number;
  name: string;
  project?: string;
  priority?: "low" | "medium" | "high";
  estimated_pomos: number;
  completed_pomos: number;
  category_id?: number | null;
  created_at: string;
  archived: number;
}
