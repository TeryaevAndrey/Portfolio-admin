import type { WithNull } from "@/shared/types/main.types";
import type { PaginationParams, PaginationResponse } from "@/shared/types/pagination.types";

export interface Case {
  id: number;
  images: string[];
  title: string;
  description: WithNull<string>;
  link: WithNull<string>;
  sortOrder: number;
  created_at: string;
}

export interface GetCasesParams extends PaginationParams {}

export interface GetCasesResponse extends PaginationResponse<Case[]> {}

export interface ReorderCaseItem {
  id: number;
  sortOrder: number;
}