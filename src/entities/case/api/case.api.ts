import { axiosInstance } from "@/shared/api/base";
import type { GetCasesParams, GetCasesResponse, ReorderCaseItem } from "../model/types";

export const caseApi = {
  getCasesList: async (params?: GetCasesParams): Promise<GetCasesResponse> => {
    const response = await axiosInstance.get("/cases", { params });
    return response.data;
  },

  reorderCases: async (items: ReorderCaseItem[]): Promise<{ success: boolean }> => {
    const response = await axiosInstance.patch("/cases/reorder", { items });
    return response.data;
  },
};
