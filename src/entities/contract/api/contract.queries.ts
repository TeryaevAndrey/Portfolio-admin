import { queryOptions } from "@tanstack/react-query";
import { contractApi } from "./contract.api";
import type { GetContractsParams } from "../model/types";

export const contractQueries = {
  allKeys: () => ["contracts"] as const,
  listKeys: () => [...contractQueries.allKeys(), "list"] as const,
  detailKeys: () => [...contractQueries.allKeys(), "detail"] as const,

  list: (params?: GetContractsParams) =>
    queryOptions({
      queryKey: [...contractQueries.listKeys(), params],
      queryFn: () => contractApi.getList(params),
    }),

  detail: (id: number) =>
    queryOptions({
      queryKey: [...contractQueries.detailKeys(), id],
      queryFn: () => contractApi.getOne(id),
    }),
};
