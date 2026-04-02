import { queryOptions } from "@tanstack/react-query";
import { sphereApi } from "./sphere.api";

export const sphereQueries = {
  allKeys: () => ["spheres"] as const,
  listKeys: () => [...sphereQueries.allKeys(), "list"] as const,
  list: () =>
    queryOptions({
      queryKey: sphereQueries.listKeys(),
      queryFn: () => sphereApi.getAll(),
    }),
};
