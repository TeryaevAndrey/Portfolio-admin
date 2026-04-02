import { axiosInstance } from "@/shared/api/base";
import type { Sphere } from "../model/types";

export const sphereApi = {
  getAll: async (): Promise<Sphere[]> => {
    const response = await axiosInstance.get<Sphere[]>("/spheres");
    return response.data;
  },
  create: async (name: string): Promise<Sphere> => {
    const response = await axiosInstance.post<Sphere>("/spheres", { name });
    return response.data;
  },
  update: async (id: number, name: string): Promise<Sphere> => {
    const response = await axiosInstance.patch<Sphere>(`/spheres/${id}`, { name });
    return response.data;
  },
  remove: async (id: number): Promise<{ success: boolean }> => {
    const response = await axiosInstance.delete<{ success: boolean }>(`/spheres/${id}`);
    return response.data;
  },
};
