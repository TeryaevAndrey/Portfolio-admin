import { axiosInstance } from "@/shared/api/base";
import type { GetActivityLogsParams, GetActivityLogsResponse } from "../model/types";

export const activityLogApi = {
  getList: async (params?: GetActivityLogsParams): Promise<GetActivityLogsResponse> => {
    const response = await axiosInstance.get<GetActivityLogsResponse>("/activity-log", { params });
    return response.data;
  },

  clear: async (): Promise<{ deleted: number }> => {
    const response = await axiosInstance.delete<{ deleted: number }>("/activity-log");
    return response.data;
  },
};
