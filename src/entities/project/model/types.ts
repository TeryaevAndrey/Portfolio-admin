import type { PaginationParams, PaginationResponse } from "@/shared/types/pagination.types";
import type { Sphere } from "@/entities/sphere";
import type { Client } from "@/entities/client";

export enum ProjectStatus {
  DRAFT = "DRAFT",
  IN_PROGRESS = "IN_PROGRESS",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: "Черновик",
  [ProjectStatus.IN_PROGRESS]: "В процессе",
  [ProjectStatus.PAUSED]: "Приостановлен",
  [ProjectStatus.COMPLETED]: "Завершён",
  [ProjectStatus.CANCELLED]: "Отменён",
};

export interface Task {
  id: number;
  title: string;
  description: string | null;
  cost: number | null;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  title: string;
  description: string | null;
  sphere: Sphere | null;
  sphereId: number | null;
  client: Client | null;
  clientId: number | null;
  startDate: string | null;
  endDate: string | null;
  deadline: string | null;
  totalCost: number | null;
  paidAmount: number | null;
  expenses: number | null;
  status: ProjectStatus;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface GetProjectsParams extends PaginationParams {
  search?: string;
  status?: ProjectStatus;
  sphereId?: number;
  clientId?: number;
}

export interface GetProjectsResponse extends PaginationResponse<Project[]> {}

export interface CreateProjectParams {
  title: string;
  description?: string;
  sphereId?: number;
  clientId?: number;
  startDate?: string;
  endDate?: string;
  deadline?: string;
  totalCost?: number;
  paidAmount?: number;
  expenses?: number;
  status?: ProjectStatus;
}

export type UpdateProjectParams = Partial<CreateProjectParams>;

export interface CreateTaskParams {
  title: string;
  description?: string;
  cost?: number;
}

export type UpdateTaskParams = Partial<CreateTaskParams>;
