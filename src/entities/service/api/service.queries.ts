import type { GetServicesParams } from "../model/types";

export const serviceQueries = {
  listKeys: (params?: GetServicesParams) =>
    params
      ? (["services", "list", params] as const)
      : (["services", "list"] as const),
  detailKeys: (id: number) => ["services", "detail", id] as const,
};
