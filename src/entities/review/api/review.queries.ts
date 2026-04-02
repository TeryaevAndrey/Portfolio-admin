import type { GetReviewsParams } from "../model/types";

export const reviewQueries = {
  listKeys: (params?: GetReviewsParams) =>
    params ? (["reviews", "list", params] as const) : (["reviews", "list"] as const),
  detailKeys: (id: number) => ["reviews", "detail", id] as const,
};
