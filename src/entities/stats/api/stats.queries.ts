import { useQuery } from "@tanstack/react-query";
import { statsApi } from "./stats.api";

export const statsQueries = {
  summaryKey: () => ["stats", "summary"] as const,
  earningsKey: (year?: number) => ["stats", "earnings", year] as const,
  yearsKey: () => ["stats", "years"] as const,
  topEarningsKey: (limit?: number) => ["stats", "clients", "earnings", limit] as const,
  topExpensiveKey: (limit?: number) => ["stats", "clients", "expensive", limit] as const,
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
