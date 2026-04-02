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
