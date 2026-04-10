import { axiosInstance } from "@/shared/api/base";
import type {
  Contract,
  CreateContractParams,
  GetContractsParams,
  GetContractsResponse,
  UpdateContractParams,
} from "../model/types";

export const contractApi = {
  getList: async (params?: GetContractsParams): Promise<GetContractsResponse> => {
    const response = await axiosInstance.get<GetContractsResponse>("/contracts", { params });
    return response.data;
  },

  getOne: async (id: number): Promise<Contract> => {
    const response = await axiosInstance.get<Contract>(`/contracts/${id}`);
    return response.data;
  },

  create: async (params: CreateContractParams): Promise<Contract> => {
    const response = await axiosInstance.post<Contract>("/contracts", params);
    return response.data;
  },

  update: async (id: number, params: UpdateContractParams): Promise<Contract> => {
    const response = await axiosInstance.patch<Contract>(`/contracts/${id}`, params);
    return response.data;
  },

  remove: async (id: number): Promise<{ success: boolean }> => {
    const response = await axiosInstance.delete<{ success: boolean }>(`/contracts/${id}`);
    return response.data;
  },
};
