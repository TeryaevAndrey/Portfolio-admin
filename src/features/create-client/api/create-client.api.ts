import { axiosInstance } from "@/shared/api/base";
import type { CreateClientParams } from "../model/types";

export const createClientApi = {
  createClient: async (params: CreateClientParams) => {
    const response = await axiosInstance.post("/clients", params);
    return response.data;
  },
};
