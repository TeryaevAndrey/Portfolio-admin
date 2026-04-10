import { axiosInstance } from "@/shared/api/base";
import type {
  CreateLeadParams,
  GetLeadsParams,
  GetLeadsResponse,
  Lead,
  UpdateLeadParams,
} from "../model/types";

export const leadApi = {
  getList: async (params?: GetLeadsParams): Promise<GetLeadsResponse> => {
    const res = await axiosInstance.get<GetLeadsResponse>("/leads", { params });
    return res.data;
  },

  getOne: async (id: number): Promise<Lead> => {
    const res = await axiosInstance.get<Lead>(`/leads/${id}`);
    return res.data;
  },

  create: async (params: CreateLeadParams): Promise<Lead> => {
    const res = await axiosInstance.post<Lead>("/leads", params);
    return res.data;
  },

  update: async (id: number, params: UpdateLeadParams): Promise<Lead> => {
    const res = await axiosInstance.patch<Lead>(`/leads/${id}`, params);
    return res.data;
  },

  remove: async (id: number): Promise<{ success: boolean }> => {
    const res = await axiosInstance.delete<{ success: boolean }>(`/leads/${id}`);
    return res.data;
  },
};
