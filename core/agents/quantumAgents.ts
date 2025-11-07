import { randomBytes } from 'crypto';
import { WalletService, ZentixWallet } from '../economy/walletService';
import type { AgentActivity, RewardTracking } from '../types';

/**
 * Zentix Quantum & Topological Agents
 * Advanced AI-powered passive income through quantum probability and network topology
 * 
 * @module quantumAgents
 * @version 1.0.0
 */

/**
 * Quantum superposition state for a reward
 */
interface QuantumRewardState {
  possible_outcomes: Array<{ amount: number; probability: number }>;
  collapsed_amount?: number;
  collapsed_at?: string;
}

/**
 * Network topology for referral relationships
 */
interface NetworkNode {
  did: string;
  depth: number;
  connections: string[];
  centrality_score: number;
}

/**
 * Topological reward calculation
 */
interface TopologicalReward {
  base_reward: number;
  topology_multiplier: number;
  final_reward: number;
  reasoning: string;
}

/**
 * Quantum Probability Referral Agent
 * Uses superposition to distribute rewards across multiple network paths
 */
export class QuantumProbabilityReferralAgent {
  /**
   * Calculate reward using quantum superposition
   * Each referral exists in multiple probability states until "collapsed"
   * 
   * @param referredUserTier - Tier of referred user
   * @param networkDepth - Depth in referral tree
   * @param referrerReputation - Reputation score (0-100)
   * @returns Quantum superposition of possible rewards
   */
  static calculateQuantumReward(
    referredUserTier: 'bronze' | 'silver' | 'gold' | 'platinum',
    networkDepth: number,
    referrerReputation: number
  ): QuantumRewardState {
    // Base rewards for each tier
    const baseRewards = {
      bronze: 10,
      silver: 25,
      gold: 50,
      platinum: 100,
    };

    const baseAmount = baseRewards[referredUserTier];

    // Quantum superposition: multiple possible outcomes
    const possibleOutcomes = [
      {
        amount: baseAmount,
        probability: 0.4, // Base reward - 40% chance
      },
      {
        amount: Math.floor(baseAmount * 1.2),
        probability: 0.3, // 20% boost - 30% chance
      },
      {
        amount: Math.floor(baseAmount * 1.5),
        probability: 0.2, // 50% boost - 20% chance
      },
      {
        amount: Math.floor(baseAmount * 2.0),
        probability: 0.1, // 2x multiplier - 10% chance (rare!)
      },
    ];

    // Apply network depth dampening (deeper in tree = lower probability of high rewards)
    const depthDampening = Math.max(0.5, 1.0 - networkDepth * 0.1);

    // Apply reputation boost
    const reputationBoost = 1.0 + (referrerReputation / 100) * 0.5;

    // Adjust probabilities
    const adjustedOutcomes = possibleOutcomes.map((outcome) => ({
      amount: Math.floor(outcome.amount * depthDampening * reputationBoost),
      probability: outcome.probability * reputationBoost,
    }));

    // Re-normalize probabilities to sum to 1
    const totalProb = adjustedOutcomes.reduce((sum, o) => sum + o.probability, 0);
    const normalizedOutcomes = adjustedOutcomes.map((outcome) => ({
      ...outcome,
      probability: outcome.probability / totalProb,
    }));

    return {
      possible_outcomes: normalizedOutcomes,
    };
  }

  /**
   * Collapse quantum superposition and award actual reward
   * 
   * @param quantumState - Quantum superposition state
   * @param wallet - User's wallet
   * @returns Collapsed reward and updated wallet
   */
  static collapseAndReward(
    quantumState: QuantumRewardState,
    wallet: ZentixWallet
  ): { collapsed_amount: number; wallet: ZentixWallet; activity: AgentActivity } {
    // Collapse superposition using quantum random selection
    const random = Math.random();
    let accumulatedProb = 0;
    let collapsedAmount = quantumState.possible_outcomes[0].amount;

    for (const outcome of quantumState.possible_outcomes) {
      accumulatedProb += outcome.probability;
      if (random <= accumulatedProb) {
        collapsedAmount = outcome.amount;
        break;
      }
    }

    // Award the collapsed amount
    const updatedWallet = WalletService.reward(
      wallet,
      collapsedAmount,
      `Quantum referral reward (superposition collapsed)`,
      {
        quantum_state: quantumState,
        collapsed_amount: collapsedAmount,
      }
    );

    const activity: AgentActivity = {
      id: randomBytes(8).toString('hex'),
      agent_did: wallet.agent_did || '',
      activity_type: 'referral',
      description: `Quantum superposition collapsed: ${collapsedAmount} ZXT awarded`,
      reward_earned: collapsedAmount,
      timestamp: new Date().toISOString(),
      metadata: {
        quantum_collapse: true,
        possible_outcomes: quantumState.possible_outcomes.length,
      },
    };

    return { collapsed_amount: collapsedAmount, wallet: updatedWallet, activity };
  }

  /**
   * Calculate wave interference effect for network
   * Multiple referral paths can amplify or dampen each other
   * 
   * @param networkNodes - Nodes in referral network
   * @returns Amplification/dampening factor
   */
  static calculateWaveInterference(networkNodes: NetworkNode[]): number {
    if (networkNodes.length < 2) return 1.0;

    // Calculate network density
    const totalConnections = networkNodes.reduce((sum, node) => sum + node.connections.length, 0);
    const maxConnections = (networkNodes.length * (networkNodes.length - 1)) / 2;
    const density = totalConnections / Math.max(1, maxConnections);

    // Wave interference: density creates constructive/destructive interference
    // High density = constructive interference (amplification)
    // Low density = destructive interference (dampening)
    const interferencePattern = Math.cos(density * Math.PI);
    const amplification = 1.0 + interferencePattern * 0.3;

    return Math.max(0.7, Math.min(1.3, amplification));
  }
}

/**
 * Topological Arbitrage Agent
 * Detects cycles and loops in price data (topological cycles)
 */
export class TopologicalArbitrageAgent {
  /**
   * Detect arbitrage loops in token pairs
   * A→B→C→A price cycle
   * 
   * @param prices - Price data for multiple tokens on multiple exchanges
   * @returns Found arbitrage loops with profit opportunity
   */
  static detectArbitrageLoops(
    prices: Array<{ token: string; exchange: string; price: number }>
  ): Array<{
    loop: string[];
    profit_percentage: number;
    complexity: number; // 2-hop, 3-hop, etc.
  }> {
    const tokenExchangeMap = new Map<string, Map<string, number>>();

    // Build graph
    prices.forEach(({ token, exchange, price }) => {
      if (!tokenExchangeMap.has(token)) {
        tokenExchangeMap.set(token, new Map());
      }
      tokenExchangeMap.get(token)!.set(exchange, price);
    });

    const loops: Array<{
      loop: string[];
      profit_percentage: number;
      complexity: number;
    }> = [];

    const tokens = Array.from(tokenExchangeMap.keys());

    // Find 2-hop loops (A→B→A)
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        const tokenA = tokens[i];
        const tokenB = tokens[j];

        const exchangesA = Array.from(tokenExchangeMap.get(tokenA)!.entries());
        const exchangesB = Array.from(tokenExchangeMap.get(tokenB)!.entries());

        for (const [exchangeX, priceAx] of exchangesA) {
          for (const [exchangeY, priceBx] of exchangesB) {
            // Check if we can close the loop
            const priceBx2 = tokenExchangeMap.get(tokenB)!.get(exchangeX);
            const priceAx2 = tokenExchangeMap.get(tokenA)!.get(exchangeY);

            if (priceBx2 && priceAx2) {
              // Calculate profit: A@X → B@X → B@Y → A@Y
              const profitRatio = (priceBx2 / priceAx) * (priceAx2 / priceBx);
              const profitPercentage = (profitRatio - 1) * 100;

              if (profitPercentage > 0.5) {
                loops.push({
                  loop: [
                    `${tokenA}@${exchangeX}`,
                    `${tokenB}@${exchangeX}`,
                    `${tokenB}@${exchangeY}`,
                    `${tokenA}@${exchangeY}`,
                  ],
                  profit_percentage: profitPercentage,
                  complexity: 2,
                });
              }
            }
          }
        }
      }
    }

    // Sort by profit
    return loops.sort((a, b) => b.profit_percentage - a.profit_percentage);
  }

  /**
   * Calculate persistent homology features
   * Identifies stable structures in price topology
   * 
   * @param priceHistory - Historical prices
   * @returns Stability score (0-1)
   */
  static calculatePersistentHomology(priceHistory: number[]): number {
    if (priceHistory.length < 3) return 0.5;

    // Calculate variance at different scales
    const scales = [3, 5, 10];
    let stabilityScore = 0;

    scales.forEach((scale) => {
      if (scale > priceHistory.length) return;

      let variance = 0;
      for (let i = 0; i < priceHistory.length - scale; i++) {
        const window = priceHistory.slice(i, i + scale);
        const mean = window.reduce((a, b) => a + b) / window.length;
        const windowVariance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / window.length;
        variance += windowVariance;
      }

      // Normalize and add to stability
      const normalizedVariance = variance / (priceHistory.length - scale);
      stabilityScore += Math.exp(-normalizedVariance); // Exponential decay of high variance
    });

    return Math.min(1, stabilityScore / scales.length);
  }
}

/**
 * Topology-Based Gamification Agent
 * Organizes tasks/rewards as simplicial complexes
 */
export class TopologyGamificationAgent {
  /**
   * Calculate reward based on network topology
   * Considers connectivity, centrality, and clustering
   * 
   * @param userDID - User DID
   * @param networkNodes - All users in network
   * @param baseReward - Base reward amount
   * @returns Topological reward calculation
   */
  static calculateTopologicalReward(
    userDID: string,
    networkNodes: NetworkNode[],
    baseReward: number
  ): TopologicalReward {
    // Find user node
    const userNode = networkNodes.find((n) => n.did === userDID);
    if (!userNode) {
      return {
        base_reward: baseReward,
        topology_multiplier: 1.0,
        final_reward: baseReward,
        reasoning: 'User not in network',
      };
    }

    // Calculate centrality (degree centrality simplified)
    const maxDegree = Math.max(...networkNodes.map((n) => n.connections.length));
    const degreeCentrality = userNode.connections.length / Math.max(1, maxDegree);

    // Calculate clustering coefficient (local density)
    let connectedPairs = 0;
    let maxConnections = 0;

    for (let i = 0; i < userNode.connections.length; i++) {
      for (let j = i + 1; j < userNode.connections.length; j++) {
        const node1 = networkNodes.find((n) => n.did === userNode.connections[i]);
        const node2 = networkNodes.find((n) => n.did === userNode.connections[j]);

        if (node1 && node2 && node1.connections.includes(node2.did)) {
          connectedPairs++;
        }

        maxConnections++;
      }
    }

    const clusteringCoefficient = maxConnections > 0 ? connectedPairs / maxConnections : 0;

    // Topological multiplier combines centrality and clustering
    // Higher centrality = more connected (good for spreading rewards)
    // Higher clustering = more cohesive group (bonus for teamwork)
    const topologyMultiplier = 1.0 + degreeCentrality * 0.5 + clusteringCoefficient * 0.3;

    const finalReward = Math.floor(baseReward * topologyMultiplier);

    return {
      base_reward: baseReward,
      topology_multiplier: topologyMultiplier,
      final_reward: finalReward,
      reasoning: `Degree centrality: ${(degreeCentrality * 100).toFixed(1)}%, Clustering: ${(clusteringCoefficient * 100).toFixed(1)}%`,
    };
  }

  /**
   * Identify simplices (cliques) in network for group bonuses
   * A simplex is a fully connected group of users
   * 
   * @param networkNodes - Network nodes
   * @returns Found simplices with bonus multipliers
   */
  static findSimplices(
    networkNodes: NetworkNode[]
  ): Array<{ members: string[]; size: number; bonus_multiplier: number }> {
    const simplices: Array<{ members: string[]; size: number; bonus_multiplier: number }> = [];

    // Find all maximal cliques (simplified for performance)
    // Looking for groups of 3+ fully connected users
    for (let i = 0; i < networkNodes.length; i++) {
      for (let j = i + 1; j < networkNodes.length; j++) {
        for (let k = j + 1; k < networkNodes.length; k++) {
          const node1 = networkNodes[i];
          const node2 = networkNodes[j];
          const node3 = networkNodes[k];

          // Check if all three are connected
          if (
            node1.connections.includes(node2.did) &&
            node1.connections.includes(node3.did) &&
            node2.connections.includes(node3.did)
          ) {
            simplices.push({
              members: [node1.did, node2.did, node3.did],
              size: 3,
              bonus_multiplier: 1.5, // 50% bonus for being in active group
            });
          }
        }
      }
    }

    return simplices.sort((a, b) => b.size - a.size).slice(0, 10);
  }
}

/**
 * Quantum Staking Superposition Agent
 * Simulates multiple staking strategies in parallel
 */
export class QuantumStakingAgent {
  /**
   * Simulate parallel staking strategies
   * 
   * @param amountToStake - Amount to stake
   * @param apy - Annual percentage yield
   * @param strategies - Different strategies to simulate
   * @returns Best strategy and simulated profits
   */
  static simulateParallelStrategies(
    amountToStake: number,
    apy: number,
    strategies: Array<{ name: string; lockPeriod: number; compoundFrequency: number }>
  ): Array<{
    strategy: string;
    period: number;
    final_amount: number;
    profit: number;
    optimal: boolean;
  }> {
    const results = strategies.map((strategy) => {
      // Calculate compound interest
      const rate = apy / 100;
      const compoundsPerYear = strategy.compoundFrequency;
      const years = strategy.lockPeriod / 365;

      const finalAmount = amountToStake * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * years);
      const profit = finalAmount - amountToStake;

      return {
        strategy: strategy.name,
        period: strategy.lockPeriod,
        final_amount: finalAmount,
        profit: profit,
        optimal: false,
      };
    });

    // Mark the best one
    const best = results.reduce((max, curr) => (curr.profit > max.profit ? curr : max));
    const optimalIndex = results.indexOf(best);
    if (optimalIndex !== -1) {
      results[optimalIndex].optimal = true;
    }

    return results;
  }

  /**
   * Suggest optimal unstaking time based on quantum prediction
   * 
   * @param historicalYields - Past yields
   * @param currentStake - Current stake amount
   * @returns Optimal unstaking time and expected returns
   */
  static predictOptimalUnstakeTime(
    historicalYields: number[],
    currentStake: number
  ): { days_to_wait: number; expected_return: number; confidence: number } {
    if (historicalYields.length < 3) {
      return { days_to_wait: 30, expected_return: currentStake * 0.01, confidence: 0.3 };
    }

    // Calculate trend
    const mean = historicalYields.reduce((a, b) => a + b) / historicalYields.length;
    const variance = historicalYields.reduce((sum, y) => sum + Math.pow(y - mean, 2), 0) / historicalYields.length;
    const trend = (historicalYields[historicalYields.length - 1] - historicalYields[0]) / historicalYields.length;

    // Predict optimal time
    const daysToWait = trend > 0 ? 7 : 14; // Wait longer if trend is positive
    const dailyYield = mean;
    const expectedReturn = currentStake * (dailyYield / 100) * (daysToWait / 365);
    const confidence = Math.min(1, 1 - Math.sqrt(variance) / (mean + 0.001));

    return {
      days_to_wait: daysToWait,
      expected_return: expectedReturn,
      confidence: confidence,
    };
  }
}

/**
 * Quantum Prediction & Forecast Agent
 * Uses quantum probability for transaction timing
 */
export class QuantumPredictionAgent {
  /**
   * Predict best transaction time using quantum probability
   * 
   * @param priceHistory - Historical prices
   * @param gasHistory - Historical gas prices
   * @returns Recommended times to transact
   */
  static predictBestTransactionTimes(
    priceHistory: number[],
    gasHistory: number[]
  ): Array<{ confidence: number; recommended_in_hours: number; reason: string }> {
    const recommendations: Array<{ confidence: number; recommended_in_hours: number; reason: string }> =
      [];

    // Analyze price momentum
    const recentPrices = priceHistory.slice(-10);
    const momentum = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0];

    if (momentum > 0.05) {
      recommendations.push({
        confidence: 0.8,
        recommended_in_hours: 24,
        reason: 'Strong upward momentum detected',
      });
    } else if (momentum < -0.05) {
      recommendations.push({
        confidence: 0.7,
        recommended_in_hours: 1,
        reason: 'Downward momentum - transact soon to minimize loss',
      });
    }

    // Analyze gas prices
    const avgGas = gasHistory.reduce((a, b) => a + b) / gasHistory.length;
    const currentGas = gasHistory[gasHistory.length - 1];

    if (currentGas < avgGas * 0.8) {
      recommendations.push({
        confidence: 0.9,
        recommended_in_hours: 0,
        reason: 'Gas prices extremely low - transact immediately',
      });
    } else if (currentGas > avgGas * 1.2) {
      recommendations.push({
        confidence: 0.7,
        recommended_in_hours: 6,
        reason: 'High gas prices - wait for decrease',
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }
}
