export interface Task {
  id: number;
  name: string;
  project?: string;
  priority?: "low" | "medium" | "high";
  estimated_pomos: number;
  completed_pomos: number;
  created_at: string;
  archived: number;
}
