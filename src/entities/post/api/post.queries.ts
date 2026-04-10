import { queryOptions } from "@tanstack/react-query";
import type { GetPostsParams } from "../model/types";
import { postApi } from "./post.api";

export const postQueries = {
  allKeys: () => ["posts"] as const,
  listKeys: () => [...postQueries.allKeys(), "list"] as const,
  detailKeys: () => [...postQueries.allKeys(), "detail"] as const,

  list: (params?: GetPostsParams) =>
    queryOptions({
      queryKey: [...postQueries.listKeys(), params] as const,
      queryFn: () => postApi.getList(params),
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: [...postQueries.detailKeys(), id] as const,
      queryFn: () => postApi.getOne(id),
    }),
};
