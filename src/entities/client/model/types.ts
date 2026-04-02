import type { PaginationParams, PaginationResponse } from "@/shared/types/pagination.types";

export interface Client {
  id: number;
  fullName: string;
  telegram: string | null;
  phone: string | null;
  email: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetClientsParams extends PaginationParams {
  search?: string;
}

export interface GetClientsResponse extends PaginationResponse<Client[]> {}
