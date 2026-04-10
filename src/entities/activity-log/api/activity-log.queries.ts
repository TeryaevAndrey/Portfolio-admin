import { queryOptions } from "@tanstack/react-query";
import { activityLogApi } from "./activity-log.api";
import type { GetActivityLogsParams } from "../model/types";

export const activityLogQueries = {
  allKeys: () => ["activity-log"] as const,
  listKeys: () => [...activityLogQueries.allKeys(), "list"] as const,

  list: (params?: GetActivityLogsParams) =>
    queryOptions({
      queryKey: [...activityLogQueries.listKeys(), params],
      queryFn: () => activityLogApi.getList(params),
    }),
};
