export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetServicesParams {
  page?: number;
  limit?: number;
  search?: string;
  onlyPublished?: boolean;
}

export interface GetServicesResponse {
  items: Service[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateServiceParams {
  name: string;
  description: string;
  price: number;
  duration: string;
  isPublished?: boolean;
}

export type UpdateServiceParams = Partial<CreateServiceParams>;
