import { queryOptions } from "@tanstack/react-query";
import type { GetClientsParams } from "../model/types";
import { clientApi } from "./client.api";

export const clientQueries = {
  allKeys: () => ["clients"] as const,
  listKeys: () => [...clientQueries.allKeys(), "list"] as const,

  list: (params?: GetClientsParams) =>
    queryOptions({
      queryKey: [...clientQueries.listKeys(), params] as const,
      queryFn: () => clientApi.getClientsList(params),
    }),
};
