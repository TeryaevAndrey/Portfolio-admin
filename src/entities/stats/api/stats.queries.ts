import { useQuery } from "@tanstack/react-query";
import { statsApi } from "./stats.api";

export const statsQueries = {
  summaryKey: () => ["stats", "summary"] as const,
  earningsKey: (year?: number) => ["stats", "earnings", year] as const,
  yearsKey: () => ["stats", "years"] as const,
  topEarningsKey: (limit?: number) => ["stats", "clients", "earnings", limit] as const,
  topExpensiveKey: (limit?: number) => ["stats", "clients", "expensive", limit] as const,
  dashboardKey: () => ["stats", "dashboard"] as const,
  callbacksByDayKey: (days?: number) => ["stats", "callbacks", "by-day", days] as const,
  leadsFunnelKey: () => ["stats", "leads", "funnel"] as const,
  leadSourcesKey: () => ["stats", "leads", "sources"] as const,
  projectsByStatusKey: () => ["stats", "projects", "by-status"] as const,
};

export const useSummary = () =>
  useQuery({
    queryKey: statsQueries.summaryKey(),
    queryFn: statsApi.getSummary,
  });

export const useEarningsByMonth = (year?: number) =>
  useQuery({
    queryKey: statsQueries.earningsKey(year),
    queryFn: () => statsApi.getEarningsByMonth(year),
  });

export const useAvailableYears = () =>
  useQuery({
    queryKey: statsQueries.yearsKey(),
    queryFn: statsApi.getAvailableYears,
  });

export const useTopClientsByEarnings = (limit = 10) =>
  useQuery({
    queryKey: statsQueries.topEarningsKey(limit),
    queryFn: () => statsApi.getTopClientsByEarnings(limit),
  });

export const useTopClientsByExpensiveOrder = (limit = 10) =>
  useQuery({
    queryKey: statsQueries.topExpensiveKey(limit),
    queryFn: () => statsApi.getTopClientsByExpensiveOrder(limit),
  });

export const useDashboardSummary = () =>
  useQuery({
    queryKey: statsQueries.dashboardKey(),
    queryFn: statsApi.getDashboardSummary,
    refetchInterval: 60_000,
  });

export const useCallbacksByDay = (days = 30) =>
  useQuery({
    queryKey: statsQueries.callbacksByDayKey(days),
    queryFn: () => statsApi.getCallbacksByDay(days),
  });

export const useLeadsFunnel = () =>
  useQuery({
    queryKey: statsQueries.leadsFunnelKey(),
    queryFn: statsApi.getLeadsFunnel,
  });

export const useLeadSources = () =>
  useQuery({
    queryKey: statsQueries.leadSourcesKey(),
    queryFn: statsApi.getLeadSources,
  });

export const useProjectsByStatus = () =>
  useQuery({
    queryKey: statsQueries.projectsByStatusKey(),
    queryFn: statsApi.getProjectsByStatus,
  });
