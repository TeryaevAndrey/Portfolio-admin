export type ContractStatus = 'draft' | 'sent' | 'signed' | 'cancelled';

export interface Contract {
  id: number;
  title: string;
  clientId: number | null;
  client: {
    id: number;
    fullName: string;
    email: string | null;
    telegram: string | null;
    phone: string | null;
  } | null;
  status: ContractStatus;
  signedAt: string | null;
  expiresAt: string | null;
  amount: number | null;
  currency: string | null;
  description: string | null;
  fileUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetContractsParams {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: number;
}

export interface GetContractsResponse {
  items: Contract[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateContractParams {
  title: string;
  clientId?: number;
  status?: ContractStatus;
  signedAt?: string;
  expiresAt?: string;
  amount?: number;
  currency?: string;
  description?: string;
  fileUrl?: string;
}

export type UpdateContractParams = Partial<CreateContractParams>;
