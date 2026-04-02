import { axiosInstance } from "@/shared/api/base";
import type {
  GetProjectsParams,
  GetProjectsResponse,
  Project,
  Task,
  CreateProjectParams,
  UpdateProjectParams,
  CreateTaskParams,
  UpdateTaskParams,
  ProjectStatus,
} from "../model/types";

export const projectApi = {
  getList: async (params?: GetProjectsParams): Promise<GetProjectsResponse> => {
    const response = await axiosInstance.get<GetProjectsResponse>("/projects", { params });
    return response.data;
  },
  getOne: async (id: number): Promise<Project> => {
    const response = await axiosInstance.get<Project>(`/projects/${id}`);
    return response.data;
  },
  create: async (params: CreateProjectParams): Promise<Project> => {
    const response = await axiosInstance.post<Project>("/projects", params);
    return response.data;
  },
  update: async (id: number, params: UpdateProjectParams): Promise<Project> => {
    const response = await axiosInstance.patch<Project>(`/projects/${id}`, params);
    return response.data;
  },
  updateStatus: async (id: number, status: ProjectStatus): Promise<Project> => {
    const response = await axiosInstance.patch<Project>(`/projects/${id}/status`, { status });
    return response.data;
  },
  remove: async (id: number): Promise<{ success: boolean }> => {
    const response = await axiosInstance.delete<{ success: boolean }>(`/projects/${id}`);
    return response.data;
  },
  createTask: async (projectId: number, params: CreateTaskParams): Promise<Task> => {
    const response = await axiosInstance.post<Task>(`/projects/${projectId}/tasks`, params);
    return response.data;
  },
  updateTask: async (projectId: number, taskId: number, params: UpdateTaskParams): Promise<Task> => {
    const response = await axiosInstance.patch<Task>(`/projects/${projectId}/tasks/${taskId}`, params);
    return response.data;
  },
  removeTask: async (projectId: number, taskId: number): Promise<{ success: boolean }> => {
    const response = await axiosInstance.delete<{ success: boolean }>(`/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },
  clearAll: async (): Promise<{ deleted: number }> => {
    const response = await axiosInstance.delete<{ deleted: number }>('/projects/clear');
    return response.data;
  },
};
