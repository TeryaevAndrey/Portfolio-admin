import { axiosInstance } from "@/shared/api/base";
import type {
  CreateProposalTemplateParams,
  GetProposalTemplatesParams,
  GetProposalTemplatesResponse,
  ProposalTemplate,
  UpdateProposalTemplateParams,
} from "../model/types";

export const proposalTemplateApi = {
  getList: async (
    params?: GetProposalTemplatesParams
  ): Promise<GetProposalTemplatesResponse> => {
    const res = await axiosInstance.get<GetProposalTemplatesResponse>(
      "/proposal-templates",
      { params }
    );
    return res.data;
  },

  getOne: async (id: number): Promise<ProposalTemplate> => {
    const res = await axiosInstance.get<ProposalTemplate>(
      `/proposal-templates/${id}`
    );
    return res.data;
  },

  create: async (
    params: CreateProposalTemplateParams
  ): Promise<ProposalTemplate> => {
    const res = await axiosInstance.post<ProposalTemplate>(
      "/proposal-templates",
      params
    );
    return res.data;
  },

  update: async (
    id: number,
    params: UpdateProposalTemplateParams
  ): Promise<ProposalTemplate> => {
    const res = await axiosInstance.patch<ProposalTemplate>(
      `/proposal-templates/${id}`,
      params
    );
    return res.data;
  },

  remove: async (id: number): Promise<{ success: boolean }> => {
    const res = await axiosInstance.delete<{ success: boolean }>(
      `/proposal-templates/${id}`
    );
    return res.data;
  },
};
