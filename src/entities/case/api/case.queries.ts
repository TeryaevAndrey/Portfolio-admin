import { queryOptions } from "@tanstack/react-query";
import type { GetCasesParams } from "../model/types";
import { caseApi } from "./case.api";

export const caseQueries = {
  allKeys: () => ["cases"] as const,
  listKeys: () => [...caseQueries.allKeys(), "list"] as const,

  list: (params?: GetCasesParams) =>
    queryOptions({
      queryKey: [...caseQueries.listKeys(), params] as const,
      queryFn: () => caseApi.getCasesList(params),
    }),
};
