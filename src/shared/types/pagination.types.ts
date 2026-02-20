export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PaginationResponse<I = unknown> = {
  items: I;
  meta: PaginationMeta;
};
