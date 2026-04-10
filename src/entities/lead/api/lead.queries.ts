import type { GetLeadsParams } from "../model/types";

export const leadQueries = {
  listKeys: (params?: GetLeadsParams) =>
    params
      ? (["leads", "list", params] as const)
      : (["leads", "list"] as const),
  detailKeys: (id: number) => ["leads", "detail", id] as const,
};
