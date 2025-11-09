export interface Guardian {
  did: string;
  name: string;
  status: 'active' | 'inactive';
  complianceScore: number;
}

export interface Report {
  reportId: string;
  did: string;
  violationType: string;
  timestamp: number;
}

export interface AuditLog {
  did: string;
  timestamp: number;
  details: string;
}
