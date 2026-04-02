import { axiosInstance } from "@/shared/api/base";
import type {
  EarningsByMonth,
  ClientEarningsStat,
  ClientExpensiveStat,
  StatsSummary,
} from "../model/types";

export const statsApi = {
  getSummary: async (): Promise<StatsSummary> => {
    const res = await axiosInstance.get<StatsSummary>("/stats/summary");
    return res.data;
  },

  getEarningsByMonth: async (year?: number): Promise<EarningsByMonth[]> => {
    const res = await axiosInstance.get<EarningsByMonth[]>("/stats/earnings", {
      params: year ? { year } : undefined,
    });
    return res.data;
  },

  getAvailableYears: async (): Promise<number[]> => {
    const res = await axiosInstance.get<number[]>("/stats/earnings/years");
    return res.data;
  },

  getTopClientsByEarnings: async (
    limit = 10
  ): Promise<ClientEarningsStat[]> => {
    const res = await axiosInstance.get<ClientEarningsStat[]>(
      "/stats/clients/top-earnings",
      { params: { limit } }
    );
    return res.data;
  },

  getTopClientsByExpensiveOrder: async (
    limit = 10
  ): Promise<ClientExpensiveStat[]> => {
    const res = await axiosInstance.get<ClientExpensiveStat[]>(
      "/stats/clients/top-expensive",
      { params: { limit } }
    );
    return res.data;
  },
};
