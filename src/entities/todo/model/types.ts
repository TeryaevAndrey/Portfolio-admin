import type { Project } from "@/entities/project";

export enum TodoStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export const TODO_STATUS_LABELS: Record<TodoStatus, string> = {
  [TodoStatus.TODO]: "К выполнению",
  [TodoStatus.IN_PROGRESS]: "В процессе",
  [TodoStatus.DONE]: "Готово",
};

export const TODO_STATUS_COLORS: Record<TodoStatus, string> = {
  [TodoStatus.TODO]: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  [TodoStatus.IN_PROGRESS]: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  [TodoStatus.DONE]: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

export interface Todo {
  id: number;
  title: string;
  deadline: string | null;
  status: TodoStatus;
  project: Pick<Project, "id" | "title"> | null;
  projectId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetTodosParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TodoStatus;
}

export interface GetTodosResponse {
  items: Todo[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateTodoParams {
  title: string;
  deadline?: string | null;
  status?: TodoStatus;
  projectId?: number | null;
}

export type UpdateTodoParams = Partial<CreateTodoParams>;
