import type { GetProposalTemplatesParams } from "../model/types";

export const proposalTemplateQueries = {
  listKeys: (params?: GetProposalTemplatesParams) =>
    params
      ? (["proposal-templates", "list", params] as const)
      : (["proposal-templates", "list"] as const),
  detailKeys: (id: number) => ["proposal-templates", "detail", id] as const,
};
