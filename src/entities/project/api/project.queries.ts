import { queryOptions } from "@tanstack/react-query";
import type { GetProjectsParams } from "../model/types";
import { projectApi } from "./project.api";

export const projectQueries = {
  allKeys: () => ["projects"] as const,
  listKeys: () => [...projectQueries.allKeys(), "list"] as const,
  detailKeys: () => [...projectQueries.allKeys(), "detail"] as const,

  list: (params?: GetProjectsParams) =>
    queryOptions({
      queryKey: [...projectQueries.listKeys(), params] as const,
      queryFn: () => projectApi.getList(params),
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: [...projectQueries.detailKeys(), id] as const,
      queryFn: () => projectApi.getOne(id),
    }),
};
