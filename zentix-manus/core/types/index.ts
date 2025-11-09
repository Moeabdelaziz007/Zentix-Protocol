// Supabase Schema Types (simplified for implementation)

export interface Agent {
  id: string;
  did: string;
  status: 'active' | 'inactive';
  compliance_score: number;
  last_audit_date: string;
}

export interface Guardian {
  id: string;
  did: string;
  name: string;
  points: number;
}

export interface Violation {
  id: string;
  agent_did: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export interface Audit {
  id: string;
  date: string;
  total_agents: number;
  violations_count: number;
  critical_issues_count: number;
  avg_compliance_score: number;
  recommendations: string[];
  raw_result: string; // JSON string of AuditResult
}

export interface Reward {
  id: string;
  guardian_did: string;
  amount: number;
  week: number;
  transaction_hash: string | null;
}

export interface Transaction {
  id: string;
  hash: string;
  from_address: string;
  to_address: string;
  value: string;
  timestamp: string;
}

// Cron Job Result Types

export interface AuditResult {
  date: string;
  totalAgents: number;
  violations: number;
  criticalIssues: number;
  avgComplianceScore: number;
  recommendations: string[];
}

export interface RewardDistribution {
  week: number;
  totalRewards: number;
  guardiansRewarded: number;
  topPerformers: Array<{ did: string; rewards: number }>;
}

// Utility Types
export type TableName = 'agents' | 'guardians' | 'violations' | 'audits' | 'rewards' | 'transactions';

export type SupabaseSchema = {
  agents: Agent;
  guardians: Guardian;
  violations: Violation;
  audits: Audit;
  rewards: Reward;
  transactions: Transaction;
};

export type SupabaseData = Agent | Guardian | Violation | Audit | Reward | Transaction;
