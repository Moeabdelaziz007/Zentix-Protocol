/**
 * MIT License
 * 
 * Copyright (c) 2025 Mohamed Hossameldin Abdelaziz
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * Contact Information:
 * Mohamed Hossameldin Abdelaziz
 * Email: Mabdela1@students.kennesaw.edu
 * Alternate Email: Amrikyy@gmail.com
 * Phone: +201094228044
 * WhatsApp: +17706160211
 * LinkedIn: https://www.linkedin.com/in/mohamed-abdelaziz-815797347/
 */

/**
 * Zentix Sentinel Multi-Agent System (ZSMAS) Types
 * Core types and interfaces for the multi-agent system
 */

import type { ZentixWallet } from '../../economy/walletService';
import type { AgentActivity, MicroInvestment } from '../../types';

/**
 * ZSMAS Agent Types
 */
export type ZSMASAgentType = 
  | 'strategy'      // Strategy Agent - proposes strategies
  | 'risk'          // Risk Agent - validates strategies
  | 'audit'         // Audit Agent - compliance checking
  | 'execution'     // Execution Agent - executes plans
  | 'sentinel';     // Sentinel Agent - monitors and manages

/**
 * User Intent Interface
 */
export interface UserIntent {
  id: string;
  user_did: string;
  goal: string;              // e.g., "maximize yield, medium risk"
  risk_tolerance: number;    // 1-100 scale
  time_horizon: 'short' | 'medium' | 'long';
  assets: string[];          // Asset symbols user wants to manage
  created_at: string;
  updated_at: string;
}

/**
 * Strategy Proposal Interface
 */
export interface StrategyProposal {
  id: string;
  agent_id: string;
  user_did: string;
  intent_id: string;
  proposed_allocation: Record<string, number>; // Asset -> percentage
  expected_return: number;                    // Annualized return percentage
  risk_score: number;                         // 1-100 scale
  confidence: number;                         // 1-100 scale
  timeframe: 'short' | 'medium' | 'long';
  metadata: Record<string, any>;
  created_at: string;
}

/**
 * Risk Assessment Interface
 */
export interface RiskAssessment {
  id: string;
  strategy_id: string;
  agent_id: string;
  stress_test_results: Record<string, any>;
  risk_metrics: {
    value_at_risk: number;
    max_drawdown: number;
    sharpe_ratio: number;
    volatility: number;
  };
  scenarios_tested: number;
  failed_scenarios: number;
  overall_risk_score: number;  // 1-100 scale
  veto: boolean;               // Whether agent has vetoed the strategy
  veto_reason?: string;
  created_at: string;
}

/**
 * Audit Report Interface
 */
export interface AuditReport {
  id: string;
  strategy_id: string;
  agent_id: string;
  compliance_check: boolean;
  protocol_rules_violations: string[];
  regulatory_compliance: boolean;
  regulatory_issues: string[];
  approved: boolean;
  audit_notes: string;
  created_at: string;
}

/**
 * Execution Plan Interface
 */
export interface ExecutionPlan {
  id: string;
  strategy_id: string;
  agent_id: string;
  steps: ExecutionStep[];
  total_gas_estimate: number;
  estimated_completion_time: number; // in milliseconds
  flash_loan_required: boolean;
  flash_loan_amount?: number;
  flash_loan_token?: string;
  created_at: string;
}

/**
 * Execution Step Interface
 */
export interface ExecutionStep {
  id: string;
  order: number;
  type: 'swap' | 'bridge' | 'deposit' | 'withdraw' | 'stake' | 'harvest';
  chain_id: number;
  contract_address: string;
  token_in?: string;
  token_out?: string;
  amount_in?: number;
  amount_out?: number;
  slippage_tolerance?: number;
  metadata?: Record<string, any>;
}

/**
 * Conscious Decision Interface (for CDL integration)
 */
export interface ConsciousDecision {
  decision_id: string;
  agent_id: string;
  timestamp: string;
  intent_to_execute: ExecutionPlan;
  data_sources: string[];
  reasoning_log: string;  // Natural language explanation
  decision_hash: string;  // Keccak-256 hash of the full decision object
  offchain_storage_url?: string; // IPFS/Arweave link to full decision JSON
}

/**
 * ZSMAS Vault Interface
 */
export interface ZSMASVault {
  id: string;
  user_did: string;
  vault_address: string;
  total_value: number;
  asset_allocation: Record<string, number>; // Asset -> value
  current_strategy_id?: string;
  risk_level: number;  // 1-100 scale
  performance_history: VaultPerformance[];
  created_at: string;
  updated_at: string;
}

/**
 * Vault Performance Interface
 */
export interface VaultPerformance {
  timestamp: string;
  value: number;
  daily_return: number;
  strategy_id?: string;
  notes?: string;
}