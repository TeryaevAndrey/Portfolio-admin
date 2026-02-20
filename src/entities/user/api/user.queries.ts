import { queryOptions } from "@tanstack/react-query";
import type { GetUsersParams } from "../model/types";
import { userApi } from "./user.api";

export const userQueries = {
  allKeys: () => ["users"] as const,
  listKeys: () => [...userQueries.allKeys(), "list"] as const,

  list: (params?: GetUsersParams) =>
    queryOptions({
      queryKey: [...userQueries.listKeys(), params] as const,
      queryFn: () => userApi.getUsersList(params),
    }),
};
