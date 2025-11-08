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
 * Zentix Sentinel Multi-Agent System (ZSMAS) Orchestrator
 * Coordinates all ZSMAS agents to process user intents and execute strategies
 */

import { AgentLogger, LogLevel } from '../../../../core/utils/agentLogger';
import { WalletService, ZentixWallet } from '../../../../core/economy/walletService';
import { StrategyAgent } from './strategyAgent';
import { RiskAgent } from './riskAgent';
import { AuditAgent } from './auditAgent';
import { ExecutionAgent } from './executionAgent';
import { LivingAssetService } from './livingAssetService';
import type { 
  UserIntent, 
  StrategyProposal, 
  RiskAssessment, 
  AuditReport, 
  ExecutionPlan,
  ZSMASVault
} from './types';

/**
 * ZSMAS Orchestrator Class
 */
export class ZSMASOrchestrator {
  private strategyAgent: StrategyAgent;
  private riskAgent: RiskAgent;
  private auditAgent: AuditAgent;
  private executionAgent: ExecutionAgent;
  private livingAssetService: LivingAssetService | null = null;
  private vaults: Map<string, ZSMASVault> = new Map();

  constructor() {
    this.strategyAgent = new StrategyAgent('ZSMAS.StrategyAgent');
    this.riskAgent = new RiskAgent('ZSMAS.RiskAgent');
    this.auditAgent = new AuditAgent('ZSMAS.AuditAgent');
    this.executionAgent = new ExecutionAgent('ZSMAS.ExecutionAgent');
    this.livingAssetService = LivingAssetService.getInstance();
    
    AgentLogger.log(LogLevel.INFO, 'ZSMAS', 'orchestrator_initialized');
  }

  /**
   * Process user intent through all agents
   */
  async processUserIntent(intent: UserIntent, wallet: ZentixWallet): Promise<{
    success: boolean;
    strategy?: StrategyProposal;
    riskAssessment?: RiskAssessment;
    auditReport?: AuditReport;
    executionPlan?: ExecutionPlan;
    transactionHash?: string;
    error?: string;
  }> {
    return AgentLogger.measurePerformance(
      'ZSMAS',
      'process_user_intent',
      async () => {
        AgentLogger.log(LogLevel.INFO, 'ZSMAS', 'processing_user_intent', { 
          intentId: intent.id,
          userDid: intent.user_did
        });

        try {
          // Step 1: Strategy Agent proposes strategy
          const strategy = await this.strategyAgent.process(intent);
          
          // Step 2: Risk Agent assesses risk
          const riskAssessment = await this.riskAgent.process(strategy);
          
          // Step 3: Audit Agent checks compliance
          const auditReport = await this.auditAgent.process(strategy);
          
          // Check if strategy is approved
          if (riskAssessment.veto || !auditReport.approved) {
            AgentLogger.log(LogLevel.WARN, 'ZSMAS', 'strategy_rejected', { 
              intentId: intent.id,
              veto: riskAssessment.veto,
              approved: auditReport.approved
            });
            
            return {
              success: false,
              strategy,
              riskAssessment,
              auditReport,
              error: riskAssessment.veto ? 
                `Strategy vetoed: ${riskAssessment.veto_reason}` : 
                'Strategy failed audit compliance checks'
            };
          }
          
          // Step 4: Execution Agent creates execution plan
          const executionPlan = await this.executionAgent.process(strategy, auditReport, riskAssessment);
          
          // Step 5: Execution Agent executes plan
          const executionResult = await this.executionAgent.executePlan(executionPlan, wallet);
          
          if (executionResult.success) {
            AgentLogger.log(LogLevel.SUCCESS, 'ZSMAS', 'strategy_executed_successfully', { 
              intentId: intent.id,
              transactionHash: executionResult.transactionHash
            });
            
            // Update vault performance
            await this.updateVaultPerformance(intent.user_did, strategy);
            
            return {
              success: true,
              strategy,
              riskAssessment,
              auditReport,
              executionPlan,
              transactionHash: executionResult.transactionHash
            };
          } else {
            AgentLogger.log(LogLevel.ERROR, 'ZSMAS', 'strategy_execution_failed', { 
              intentId: intent.id,
              error: executionResult.error
            });
            
            return {
              success: false,
              strategy,
              riskAssessment,
              auditReport,
              executionPlan,
              error: executionResult.error
            };
          }
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'ZSMAS', 'processing_error', { 
            intentId: intent.id,
            error: error instanceof Error ? error.message : String(error)
          });
          
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      }
    );
  }

  /**
   * Create a new ZSMAS vault for a user
   */
  async createVault(userDid: string): Promise<ZSMASVault> {
    return AgentLogger.measurePerformance(
      'ZSMAS',
      'create_vault',
      async () => {
        AgentLogger.log(LogLevel.INFO, 'ZSMAS', 'creating_vault', { userDid });
        
        const vault: ZSMASVault = {
          id: `vault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user_did: userDid,
          vault_address: `zsmas:${Math.random().toString(16).substr(2, 32)}`,
          total_value: 0,
          asset_allocation: {},
          risk_level: 50, // Default medium risk
          performance_history: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        this.vaults.set(userDid, vault);
        
        AgentLogger.log(LogLevel.SUCCESS, 'ZSMAS', 'vault_created', { 
          vaultId: vault.id,
          userDid
        });
        
        return vault;
      }
    );
  }

  /**
   * Get user's ZSMAS vault
   */
  getVault(userDid: string): ZSMASVault | undefined {
    return this.vaults.get(userDid);
  }

  /**
   * Update vault performance after strategy execution
   */
  private async updateVaultPerformance(userDid: string, strategy: StrategyProposal): Promise<void> {
    AgentLogger.log(LogLevel.DEBUG, 'ZSMAS', 'updating_vault_performance', { userDid });
    
    const vault = this.vaults.get(userDid);
    if (!vault) return;
    
    // Update asset allocation
    vault.asset_allocation = { ...strategy.proposed_allocation };
    
    // Update risk level
    vault.risk_level = strategy.risk_score;
    
    // Add performance record
    const performance = {
      timestamp: new Date().toISOString(),
      value: vault.total_value * (1 + (strategy.expected_return / 100 / 365)), // Daily return
      daily_return: strategy.expected_return / 365,
      strategy_id: strategy.id
    };
    
    vault.performance_history.push(performance);
    
    // Keep only recent performance records (last 365 days)
    if (vault.performance_history.length > 365) {
      vault.performance_history = vault.performance_history.slice(-365);
    }
    
    vault.updated_at = new Date().toISOString();
    
    AgentLogger.log(LogLevel.INFO, 'ZSMAS', 'vault_performance_updated', { 
      vaultId: vault.id,
      userDid,
      newValue: performance.value
    });
  }

  /**
   * Get vault performance summary
   */
  async getVaultPerformanceSummary(userDid: string): Promise<{
    total_value: number;
    risk_level: number;
    annualized_return: number;
    volatility: number;
    sharpe_ratio: number;
  } | undefined> {
    return AgentLogger.measurePerformance(
      'ZSMAS',
      'get_vault_performance',
      async () => {
        const vault = this.vaults.get(userDid);
        if (!vault) return undefined;
        
        // Calculate annualized return
        if (vault.performance_history.length === 0) {
          return {
            total_value: vault.total_value,
            risk_level: vault.risk_level,
            annualized_return: 0,
            volatility: 0,
            sharpe_ratio: 0
          };
        }
        
        // Calculate average daily return
        const totalReturn = vault.performance_history.reduce((sum, record) => 
          sum + record.daily_return, 0);
        const avgDailyReturn = totalReturn / vault.performance_history.length;
        
        // Annualized return (assuming 365 days)
        const annualizedReturn = avgDailyReturn * 365;
        
        // Calculate volatility (standard deviation of daily returns)
        const variance = vault.performance_history.reduce((sum, record) => 
          sum + Math.pow(record.daily_return - avgDailyReturn, 2), 0) / 
          vault.performance_history.length;
        const volatility = Math.sqrt(variance) * Math.sqrt(365); // Annualized volatility
        
        // Calculate Sharpe ratio (assuming 2% risk-free rate)
        const riskFreeRate = 0.02;
        const sharpeRatio = volatility > 0 ? 
          (annualizedReturn - riskFreeRate) / volatility : 0;
        
        return {
          total_value: vault.total_value,
          risk_level: vault.risk_level,
          annualized_return: annualizedReturn * 100, // Convert to percentage
          volatility: volatility * 100, // Convert to percentage
          sharpe_ratio: sharpeRatio
        };
      }
    );
  }

  /**
   * Get all agents
   */
  getAgents(): {
    strategyAgent: StrategyAgent;
    riskAgent: RiskAgent;
    auditAgent: AuditAgent;
    executionAgent: ExecutionAgent;
  } {
    return {
      strategyAgent: this.strategyAgent,
      riskAgent: this.riskAgent,
      auditAgent: this.auditAgent,
      executionAgent: this.executionAgent
    };
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<{
    active: boolean;
    agents: { type: string; active: boolean; name: string }[];
    vaultsCount: number;
    lastProcessedIntent?: string;
  }> {
    return {
      active: true,
      agents: [
        { 
          type: 'strategy', 
          active: this.strategyAgent.getIsActive(), 
          name: this.strategyAgent.getName() 
        },
        { 
          type: 'risk', 
          active: this.riskAgent.getIsActive(), 
          name: this.riskAgent.getName() 
        },
        { 
          type: 'audit', 
          active: this.auditAgent.getIsActive(), 
          name: this.auditAgent.getName() 
        },
        { 
          type: 'execution', 
          active: this.executionAgent.getIsActive(), 
          name: this.executionAgent.getName() 
        }
      ],
      vaultsCount: this.vaults.size
    };
  }
}