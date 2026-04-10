import type { GetTodosParams } from "../model/types";

export const todoQueries = {
  listKeys: (params?: GetTodosParams) =>
    params
      ? (["todos", "list", params] as const)
      : (["todos", "list"] as const),
  detailKeys: (id: number) => ["todos", "detail", id] as const,
};
