export interface EarningsByMonth {
  year: number;
  month: number;
  totalCost: number;
  paidAmount: number;
  projectCount: number;
}

export interface ClientEarningsStat {
  clientId: number;
  clientName: string;
  totalPaid: number;
  totalCost: number;
  projectCount: number;
}

export interface ClientExpensiveStat {
  clientId: number;
  clientName: string;
  maxCost: number;
  projectTitle: string;
}

export interface StatsSummary {
  totalEarned: number;
  totalPaid: number;
  totalProjects: number;
  completedProjects: number;
  activeClients: number;
}

export interface DashboardSummary {
  totalEarned: number;
  totalPaid: number;
  totalProjects: number;
  completedProjects: number;
  activeClients: number;
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  totalCallbacks: number;
  unreadCallbacks: number;
}

export interface CallbacksByDay {
  date: string;
  count: number;
}

export interface LeadsFunnelItem {
  status: string;
  label: string;
  count: number;
}

export interface LeadSourceItem {
  source: string;
  count: number;
}

export interface ProjectByStatusItem {
  status: string;
  label: string;
  count: number;
}
