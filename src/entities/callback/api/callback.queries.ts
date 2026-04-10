import type { GetCallbacksParams } from "../model/types";

export const callbackQueries = {
  listKeys: (params?: GetCallbacksParams) =>
    params
      ? (["callbacks", "list", params] as const)
      : (["callbacks", "list"] as const),
  detailKeys: (id: number) => ["callbacks", "detail", id] as const,
  unreadCountKeys: () => ["callbacks", "unread-count"] as const,
};
