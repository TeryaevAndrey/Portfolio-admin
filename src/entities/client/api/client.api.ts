import { axiosInstance } from "@/shared/api/base";
import type { GetClientsParams, GetClientsResponse, Client } from "../model/types";

export interface UpdateClientParams {
  fullName?: string;
  telegram?: string;
  phone?: string;
  email?: string;
  source?: string;
}

export const clientApi = {
  getClientsList: async (params?: GetClientsParams): Promise<GetClientsResponse> => {
    const response = await axiosInstance.get<GetClientsResponse>("/clients", {
      params,
    });
    return response.data;
  },

  updateClient: async (id: number, params: UpdateClientParams): Promise<Client> => {
    const response = await axiosInstance.patch<Client>(`/clients/${id}`, params);
    return response.data;
  },
};
