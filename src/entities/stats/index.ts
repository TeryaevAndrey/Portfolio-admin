export { statsApi } from "./api/stats.api";
export {
  statsQueries,
  useSummary,
  useEarningsByMonth,
  useAvailableYears,
  useTopClientsByEarnings,
  useTopClientsByExpensiveOrder,
} from "./api/stats.queries";
export type {
  EarningsByMonth,
  ClientEarningsStat,
  ClientExpensiveStat,
  StatsSummary,
} from "./model/types";
