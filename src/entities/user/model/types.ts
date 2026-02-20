import type { PaginationParams, PaginationResponse } from "@/shared/types/pagination.types";

export enum UserRole {
  admin = 'ADMIN',
  user = 'USER',
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersParams extends PaginationParams {
  search?: string;
  role?: UserRole;
}

export interface GetUsersResponse extends PaginationResponse<User[]> {}