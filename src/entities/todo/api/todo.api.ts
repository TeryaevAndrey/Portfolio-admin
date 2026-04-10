import { axiosInstance } from "@/shared/api/base";
import type {
  CreateTodoParams,
  GetTodosParams,
  GetTodosResponse,
  Todo,
  UpdateTodoParams,
} from "../model/types";

export const todoApi = {
  getList: async (params?: GetTodosParams): Promise<GetTodosResponse> => {
    const res = await axiosInstance.get<GetTodosResponse>("/todos", { params });
    return res.data;
  },

  getOne: async (id: number): Promise<Todo> => {
    const res = await axiosInstance.get<Todo>(`/todos/${id}`);
    return res.data;
  },

  create: async (params: CreateTodoParams): Promise<Todo> => {
    const res = await axiosInstance.post<Todo>("/todos", params);
    return res.data;
  },

  update: async (id: number, params: UpdateTodoParams): Promise<Todo> => {
    const res = await axiosInstance.patch<Todo>(`/todos/${id}`, params);
    return res.data;
  },

  remove: async (id: number): Promise<{ success: boolean }> => {
    const res = await axiosInstance.delete<{ success: boolean }>(`/todos/${id}`);
    return res.data;
  },
};
