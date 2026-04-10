export interface ProposalTemplate {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetProposalTemplatesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetProposalTemplatesResponse {
  items: ProposalTemplate[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateProposalTemplateParams {
  title: string;
  content: string;
}

export type UpdateProposalTemplateParams = Partial<CreateProposalTemplateParams>;
