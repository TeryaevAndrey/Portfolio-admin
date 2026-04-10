import { queryOptions } from "@tanstack/react-query";
import { invoiceApi } from "./invoice.api";
import type { GetInvoicesParams } from "../model/types";

export const invoiceQueries = {
  allKeys: () => ["invoices"] as const,
  listKeys: () => [...invoiceQueries.allKeys(), "list"] as const,
  detailKeys: () => [...invoiceQueries.allKeys(), "detail"] as const,

  list: (params?: GetInvoicesParams) =>
    queryOptions({
      queryKey: [...invoiceQueries.listKeys(), params],
      queryFn: () => invoiceApi.getList(params),
    }),

  detail: (id: number) =>
    queryOptions({
      queryKey: [...invoiceQueries.detailKeys(), id],
      queryFn: () => invoiceApi.getOne(id),
    }),
};
