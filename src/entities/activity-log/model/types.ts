export type ActivityAction = 'CREATED' | 'UPDATED' | 'DELETED';

export interface ActivityLog {
  id: number;
  action: ActivityAction;
  entityType: string;
  entityId: number | null;
  description: string;
  createdAt: string;
}

export interface GetActivityLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  entityType?: string;
  action?: ActivityAction | '';
}

export interface GetActivityLogsResponse {
  items: ActivityLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
