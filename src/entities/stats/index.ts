export { statsApi } from "./api/stats.api";
export {
  statsQueries,
  useSummary,
  useEarningsByMonth,
  useAvailableYears,
  useTopClientsByEarnings,
  useTopClientsByExpensiveOrder,
  useDashboardSummary,
  useCallbacksByDay,
  useLeadsFunnel,
  useLeadSources,
  useProjectsByStatus,
} from "./api/stats.queries";
export type {
  EarningsByMonth,
  ClientEarningsStat,
  ClientExpensiveStat,
  StatsSummary,
  DashboardSummary,
  CallbacksByDay,
  LeadsFunnelItem,
  LeadSourceItem,
  ProjectByStatusItem,
} from "./model/types";
