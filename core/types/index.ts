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
  status?: 'active' | 'inactive';
  complianceScore?: number;
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

// New Smart Feature Types

export interface Lead {
  id: string;
  email: string;
  name?: string;
  source: 'landing' | 'referral' | 'social' | 'campaign';
  status: 'new' | 'contacted' | 'converted' | 'inactive';
  metadata?: Record<string, any>;
  created_at: string;
  referrer_did?: string;
}

export interface Referral {
  id: string;
  referrer_did: string;
  referee_did?: string;
  referee_email?: string;
  status: 'pending' | 'completed' | 'rewarded';
  reward_amount: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  created_at: string;
  completed_at?: string;
  metadata?: Record<string, any>;
}

export interface AgentActivity {
  id: string;
  agent_did: string;
  activity_type: 'task' | 'referral' | 'arbitrage' | 'investment' | 'content_generation' | 'monitoring';
  description: string;
  reward_earned: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface MicroInvestment {
  id: string;
  user_did: string;
  agent_did?: string;
  investment_type: 'arbitrage' | 'staking' | 'yield_farming' | 'auto_compound';
  initial_amount: number;
  current_value: number;
  total_profit: number;
  status: 'active' | 'paused' | 'completed';
  started_at: string;
  last_update: string;
  metadata?: Record<string, any>;
}

export interface RewardTracking {
  id: string;
  user_did: string;
  reward_type: 'referral' | 'guardian' | 'arbitrage' | 'investment' | 'content' | 'engagement';
  amount: number;
  source_id: string;
  status: 'pending' | 'processed' | 'claimed';
  transaction_hash?: string;
  created_at: string;
  processed_at?: string;
}

export interface AnalyticsEvent {
  id: string;
  user_did?: string;
  event_type: 'page_view' | 'signup' | 'referral_click' | 'reward_claim' | 'investment_start' | 'content_share';
  event_data: Record<string, any>;
  timestamp: string;
  session_id?: string;
  ip_address?: string;
}

// Utility Types
export type TableName = 'agents' | 'guardians' | 'violations' | 'audits' | 'rewards' | 'transactions' | 'leads' | 'referrals' | 'agent_activities' | 'micro_investments' | 'reward_tracking' | 'analytics_events';

export type SupabaseSchema = {
  agents: Agent;
  guardians: Guardian;
  violations: Violation;
  audits: Audit;
  rewards: Reward;
  transactions: Transaction;
  leads: Lead;
  referrals: Referral;
  agent_activities: AgentActivity;
  micro_investments: MicroInvestment;
  reward_tracking: RewardTracking;
  analytics_events: AnalyticsEvent;
};

export type SupabaseData = Agent | Guardian | Violation | Audit | Reward | Transaction | Lead | Referral | AgentActivity | MicroInvestment | RewardTracking | AnalyticsEvent;
