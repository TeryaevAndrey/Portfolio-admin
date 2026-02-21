import { axiosInstance } from "@/shared/api/base";
import type { GetCasesParams, GetCasesResponse } from "../model/types";

export const caseApi = {
  getCasesList: async (params?: GetCasesParams): Promise<GetCasesResponse> => {
    const response = await axiosInstance.get("/cases", { params });

    return response.data;
  },
};
