import { axiosInstance } from "@/shared/api/base";
import type {
  CreateServiceParams,
  GetServicesParams,
  GetServicesResponse,
  Service,
  UpdateServiceParams,
} from "../model/types";

export const serviceApi = {
  getList: async (params?: GetServicesParams): Promise<GetServicesResponse> => {
    const res = await axiosInstance.get<GetServicesResponse>("/services", { params });
    return res.data;
  },

  getOne: async (id: number): Promise<Service> => {
    const res = await axiosInstance.get<Service>(`/services/${id}`);
    return res.data;
  },

  create: async (params: CreateServiceParams): Promise<Service> => {
    const res = await axiosInstance.post<Service>("/services", params);
    return res.data;
  },

  update: async (id: number, params: UpdateServiceParams): Promise<Service> => {
    const res = await axiosInstance.patch<Service>(`/services/${id}`, params);
    return res.data;
  },

  remove: async (id: number): Promise<{ success: boolean }> => {
    const res = await axiosInstance.delete<{ success: boolean }>(`/services/${id}`);
    return res.data;
  },
};
