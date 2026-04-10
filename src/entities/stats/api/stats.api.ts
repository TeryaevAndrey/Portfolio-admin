import { axiosInstance } from "@/shared/api/base";
import type {
  EarningsByMonth,
  ClientEarningsStat,
  ClientExpensiveStat,
  StatsSummary,
  DashboardSummary,
  CallbacksByDay,
  LeadsFunnelItem,
  LeadSourceItem,
  ProjectByStatusItem,
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

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await axiosInstance.get<DashboardSummary>("/stats/dashboard");
    return res.data;
  },

  getCallbacksByDay: async (days = 30): Promise<CallbacksByDay[]> => {
    const res = await axiosInstance.get<CallbacksByDay[]>("/stats/callbacks/by-day", {
      params: { days },
    });
    return res.data;
  },

  getLeadsFunnel: async (): Promise<LeadsFunnelItem[]> => {
    const res = await axiosInstance.get<LeadsFunnelItem[]>("/stats/leads/funnel");
    return res.data;
  },

  getLeadSources: async (): Promise<LeadSourceItem[]> => {
    const res = await axiosInstance.get<LeadSourceItem[]>("/stats/leads/sources");
    return res.data;
  },

  getProjectsByStatus: async (): Promise<ProjectByStatusItem[]> => {
    const res = await axiosInstance.get<ProjectByStatusItem[]>("/stats/projects/by-status");
    return res.data;
  },
};
