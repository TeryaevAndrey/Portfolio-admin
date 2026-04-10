export { leadApi } from "./api/lead.api";
export { leadQueries } from "./api/lead.queries";
export type {
  Lead,
  GetLeadsParams,
  GetLeadsResponse,
  CreateLeadParams,
  UpdateLeadParams,
} from "./model/types";
export {
  LeadStatus,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
} from "./model/types";
