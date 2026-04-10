export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: number;
  number: string;
  clientId: number | null;
  client: {
    id: number;
    fullName: string;
    email: string | null;
    telegram: string | null;
    phone: string | null;
  } | null;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  description: string | null;
  fileUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetInvoicesParams {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: number;
  status?: InvoiceStatus;
}

export interface GetInvoicesResponse {
  items: Invoice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateInvoiceParams {
  number: string;
  clientId?: number;
  status?: InvoiceStatus;
  amount: number;
  currency?: string;
  issuedAt?: string;
  dueAt?: string;
  paidAt?: string;
  description?: string;
  fileUrl?: string;
}

export type UpdateInvoiceParams = Partial<CreateInvoiceParams>;
