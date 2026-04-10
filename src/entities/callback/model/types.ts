export interface Callback {
  id: number;
  name: string;
  email: string;
  telegram: string | null;
  service: string | null;
  description: string;
  isRead: boolean;
  createdAt: string;
}

export interface GetCallbacksParams {
  page?: number;
  limit?: number;
  search?: string;
  onlyUnread?: boolean;
}

export interface GetCallbacksResponse {
  items: Callback[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
