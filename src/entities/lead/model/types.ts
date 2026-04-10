export enum LeadStatus {
  NEW = "NEW",
  DISCUSSION = "DISCUSSION",
  NO_DEAL = "NO_DEAL",
  CONVERTED = "CONVERTED",
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: "Новый",
  [LeadStatus.DISCUSSION]: "Обсуждение",
  [LeadStatus.NO_DEAL]: "Не договорились",
  [LeadStatus.CONVERTED]: "Перешёл в проект",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  [LeadStatus.DISCUSSION]: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  [LeadStatus.NO_DEAL]: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  [LeadStatus.CONVERTED]: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

export interface Lead {
  id: number;
  name: string;
  contact: string;
  source: string | null;
  project: string | null;
  status: LeadStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
}

export interface GetLeadsResponse {
  items: Lead[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateLeadParams {
  name: string;
  contact: string;
  source?: string | null;
  project?: string | null;
  status?: LeadStatus;
  note?: string | null;
}

export type UpdateLeadParams = Partial<CreateLeadParams>;
