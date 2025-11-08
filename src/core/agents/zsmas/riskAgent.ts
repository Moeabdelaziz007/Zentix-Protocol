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
 * Zentix Sentinel Multi-Agent System (ZSMAS) Risk Agent
 * The "conscience" that validates strategies through stress testing
 */

import { BaseZSMASAgent } from './baseAgent';
import { AgentLogger, LogLevel } from '../../utils/agentLogger';
import type { 
  StrategyProposal, 
  RiskAssessment 
} from './types';

/**
 * Stress Test Scenario Interface
 */
interface StressTestScenario {
  id: string;
  name: string;
  description: string;
  probability: number; // 0-1
  impact: number; // 0-100
  parameters: Record<string, any>;
}

/**
 * Risk Agent Class
 */
export class RiskAgent extends BaseZSMASAgent {
  private stressTestScenarios: StressTestScenario[] = [];

  constructor(name: string = 'RiskAgent') {
    super('risk', name);
    this.initializeStressTestScenarios();
  }

  /**
   * Process strategy proposal and perform risk assessment
   */
  async process(strategy: StrategyProposal): Promise<RiskAssessment> {
    return this.measurePerformance(
      'assess_risk',
      async () => {
        this.log(LogLevel.INFO, 'assessing_strategy_risk', { 
          strategyId: strategy.id,
          userDid: strategy.user_did
        });

        // Perform stress testing
        const stressTestResults = await this.performStressTesting(strategy);
        
        // Calculate risk metrics
        const riskMetrics = this.calculateRiskMetrics(strategy, stressTestResults);
        
        // Determine if strategy should be vetoed
        const { veto, vetoReason } = this.determineVeto(strategy, riskMetrics);
        
        const assessment: RiskAssessment = {
          id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          strategy_id: strategy.id,
          agent_id: this.getAgentId(),
          stress_test_results: stressTestResults,
          risk_metrics: riskMetrics,
          scenarios_tested: this.stressTestScenarios.length,
          failed_scenarios: this.countFailedScenarios(stressTestResults),
          overall_risk_score: this.calculateOverallRiskScore(riskMetrics),
          veto,
          veto_reason: veto ? vetoReason : undefined,
          created_at: new Date().toISOString()
        };
        
        this.log(LogLevel.SUCCESS, 'risk_assessment_completed', { 
          assessmentId: assessment.id,
          overallRiskScore: assessment.overall_risk_score,
          veto: assessment.veto
        });
        
        return assessment;
      }
    );
  }

  /**
   * Initialize stress test scenarios
   */
  private initializeStressTestScenarios(): void {
    this.stressTestScenarios = [
      {
        id: 'market_crash',
        name: 'Market Crash',
        description: 'Sudden 20% drop in asset prices',
        probability: 0.05,
        impact: 80,
        parameters: {
          price_drop: 0.20,
          duration: '1_day',
          assets_affected: 'all'
        }
      },
      {
        id: 'liquidity_dry_up',
        name: 'Liquidity Dry-Up',
        description: 'Sudden loss of liquidity in DEX pools',
        probability: 0.10,
        impact: 70,
        parameters: {
          liquidity_loss: 0.80,
          duration: '1_hour',
          pools_affected: 'major'
        }
      },
      {
        id: 'oracle_attack',
        name: 'Oracle Attack',
        description: 'Price manipulation through oracle attacks',
        probability: 0.02,
        impact: 90,
        parameters: {
          price_manipulation: 0.30,
          duration: '30_minutes',
          oracles_affected: 'decentralized'
        }
      },
      {
        id: 'bridge_failure',
        name: 'Bridge Failure',
        description: 'Cross-chain bridge failure or exploit',
        probability: 0.03,
        impact: 85,
        parameters: {
          funds_lost: 0.50,
          duration: 'indefinite',
          bridges_affected: 'cross_chain'
        }
      },
      {
        id: 'yield_farm_exploit',
        name: 'Yield Farm Exploit',
        description: 'Smart contract exploit in yield farming protocol',
        probability: 0.08,
        impact: 75,
        parameters: {
          funds_lost: 0.30,
          duration: '1_day',
          protocols_affected: 'yield_farming'
        }
      },
      {
        id: 'regulatory_shutdown',
        name: 'Regulatory Shutdown',
        description: 'Sudden regulatory intervention',
        probability: 0.01,
        impact: 100,
        parameters: {
          market_impact: 1.0,
          duration: 'indefinite',
          scope: 'global'
        }
      }
    ];
    
    this.log(LogLevel.INFO, 'stress_test_scenarios_initialized', { 
      count: this.stressTestScenarios.length 
    });
  }

  /**
   * Perform stress testing on strategy
   */
  private async performStressTesting(strategy: StrategyProposal): Promise<Record<string, any>> {
    this.log(LogLevel.DEBUG, 'performing_stress_testing', { 
      strategyId: strategy.id,
      scenarios: this.stressTestScenarios.length
    });
    
    const results: Record<string, any> = {};
    
    // Simulate stress testing for each scenario
    for (const scenario of this.stressTestScenarios) {
      // In a real implementation, this would run complex simulations
      // For this demo, we'll simulate results based on strategy characteristics
      
      const scenarioResult = await this.simulateScenario(strategy, scenario);
      results[scenario.id] = scenarioResult;
    }
    
    return results;
  }

  /**
   * Simulate a specific stress test scenario
   */
  private async simulateScenario(
    strategy: StrategyProposal, 
    scenario: StressTestScenario
  ): Promise<Record<string, any>> {
    // Simplified simulation - in reality this would be much more complex
    const baseImpact = scenario.impact;
    const strategyRisk = strategy.risk_score;
    
    // Adjust impact based on strategy risk level
    // Higher risk strategies are more vulnerable to stress scenarios
    const adjustedImpact = baseImpact * (strategyRisk / 100);
    
    // Simulate some randomness
    const finalImpact = adjustedImpact * (0.8 + Math.random() * 0.4);
    
    // Determine if scenario would cause failure
    const failureThreshold = 60; // 60% impact considered failure
    const wouldFail = finalImpact > failureThreshold;
    
    return {
      scenario_id: scenario.id,
      scenario_name: scenario.name,
      impact: finalImpact,
      would_fail: wouldFail,
      probability: scenario.probability,
      expected_loss: wouldFail ? (finalImpact / 100) * strategy.expected_return : 0,
      simulation_time: Date.now()
    };
  }

  /**
   * Calculate risk metrics for strategy
   */
  private calculateRiskMetrics(
    strategy: StrategyProposal, 
    stressTestResults: Record<string, any>
  ): RiskAssessment['risk_metrics'] {
    // Calculate Value at Risk (VaR) - simplified
    let totalExpectedLoss = 0;
    let totalProbability = 0;
    
    for (const result of Object.values(stressTestResults)) {
      if (typeof result === 'object' && result.expected_loss) {
        totalExpectedLoss += result.expected_loss * result.probability;
        totalProbability += result.probability;
      }
    }
    
    const valueAtRisk = totalProbability > 0 ? totalExpectedLoss / totalProbability : 0;
    
    // Calculate max drawdown (simplified)
    const maxDrawdown = Math.min(100, valueAtRisk * 2);
    
    // Calculate Sharpe ratio (simplified)
    const riskFreeRate = 2.0; // 2% risk-free rate
    const sharpeRatio = strategy.expected_return > 0 ? 
      (strategy.expected_return - riskFreeRate) / strategy.risk_score : 0;
    
    // Use strategy's existing risk score as volatility measure
    const volatility = strategy.risk_score;
    
    return {
      value_at_risk: valueAtRisk,
      max_drawdown: maxDrawdown,
      sharpe_ratio: sharpeRatio,
      volatility: volatility
    };
  }

  /**
   * Count failed scenarios
   */
  private countFailedScenarios(stressTestResults: Record<string, any>): number {
    let count = 0;
    for (const result of Object.values(stressTestResults)) {
      if (typeof result === 'object' && result.would_fail) {
        count++;
      }
    }
    return count;
  }

  /**
   * Calculate overall risk score
   */
  private calculateOverallRiskScore(riskMetrics: RiskAssessment['risk_metrics']): number {
    // Weighted average of risk metrics
    const weights = {
      value_at_risk: 0.3,
      max_drawdown: 0.3,
      volatility: 0.4
    };
    
    const score = 
      (riskMetrics.value_at_risk * weights.value_at_risk) +
      (riskMetrics.max_drawdown * weights.max_drawdown) +
      (riskMetrics.volatility * weights.volatility);
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Determine if strategy should be vetoed
   */
  private determineVeto(
    strategy: StrategyProposal, 
    riskMetrics: RiskAssessment['risk_metrics']
  ): { veto: boolean; vetoReason?: string } {
    // Veto if overall risk is too high
    if (strategy.risk_score > 80) {
      return {
        veto: true,
        vetoReason: 'Strategy risk score exceeds maximum threshold (80%)'
      };
    }
    
    // Veto if VaR is too high
    if (riskMetrics.value_at_risk > 15) {
      return {
        veto: true,
        vetoReason: 'Value at Risk exceeds maximum threshold (15%)'
      };
    }
    
    // Veto if max drawdown is too high
    if (riskMetrics.max_drawdown > 40) {
      return {
        veto: true,
        vetoReason: 'Maximum drawdown exceeds maximum threshold (40%)'
      };
    }
    
    // Veto if Sharpe ratio is too low
    if (riskMetrics.sharpe_ratio < 0.5 && strategy.expected_return > 5) {
      return {
        veto: true,
        vetoReason: 'Sharpe ratio too low for expected return'
      };
    }
    
    return { veto: false };
  }

  /**
   * Add custom stress test scenario
   */
  addStressTestScenario(scenario: StressTestScenario): void {
    this.stressTestScenarios.push(scenario);
    this.log(LogLevel.INFO, 'stress_test_scenario_added', { 
      scenarioId: scenario.id,
      scenarioName: scenario.name
    });
  }

  /**
   * Remove stress test scenario
   */
  removeStressTestScenario(scenarioId: string): void {
    const initialLength = this.stressTestScenarios.length;
    this.stressTestScenarios = this.stressTestScenarios.filter(s => s.id !== scenarioId);
    
    if (this.stressTestScenarios.length < initialLength) {
      this.log(LogLevel.INFO, 'stress_test_scenario_removed', { scenarioId });
    } else {
      this.log(LogLevel.WARN, 'stress_test_scenario_not_found', { scenarioId });
    }
  }
}