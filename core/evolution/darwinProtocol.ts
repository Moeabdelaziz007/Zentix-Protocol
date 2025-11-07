/**
 * Darwin Protocol Orchestrator
 * Manages the evolutionary loop for self-improving agent teams
 * 
 * @module darwinProtocol
 * @version 1.0.0
 */

import { AIXTeam, EvolutionMetadata } from './aixSchemaTypes';
import { MutationEngine, Mutation } from './mutationEngine';
import { AgentLogger, LogLevel } from '../utils/agentLogger';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Simple manifest parser for JSON files (to avoid dependency issues)
async function parseManifest(manifestPath: string): Promise<AIXTeam> {
  const content = fs.readFileSync(manifestPath, 'utf8');
  return JSON.parse(content);
}

/**
 * Variant of an AIX team for A/B testing
 */
export interface TeamVariant {
  id: string;
  aixHash: string;
  team: AIXTeam;
  trafficSplit: number; // Percentage of traffic (0-100)
  fitnessScore?: number;
}

/**
 * Experiment configuration
 */
export interface ExperimentConfig {
  experimentId: string;
  name: string;
  variants: TeamVariant[];
  fitnessMetric: string;
  duration: string; // e.g., "24h"
}

/**
 * Results of an A/B test experiment
 */
export interface ExperimentResults {
  experimentId: string;
  winner?: TeamVariant;
  variants: TeamVariant[];
  duration: number; // in hours
  startTime: Date;
  endTime: Date;
}

/**
 * Request router for traffic splitting
 */
export class RequestRouter {
  private experiments: Map<string, ExperimentConfig> = new Map();

  /**
   * Register a new experiment
   * 
   * @param config - Experiment configuration
   */
  registerExperiment(config: ExperimentConfig): void {
    this.experiments.set(config.experimentId, config);
    AgentLogger.log(LogLevel.INFO, 'RequestRouter', 'Experiment registered', { 
      experimentId: config.experimentId,
      variantCount: config.variants.length
    });
  }

  /**
   * Route a request to the appropriate variant based on user ID
   * 
   * @param userId - User ID for consistent hashing
   * @param experimentId - Experiment ID
   * @returns Variant ID or null if no experiment found
   */
  routeRequest(userId: string, experimentId: string): string | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return null;
    }

    // Use consistent hashing based on user ID
    const hash = this.hashUserId(userId);
    let cumulativePercentage = 0;

    for (const variant of experiment.variants) {
      cumulativePercentage += variant.trafficSplit;
      if (hash <= cumulativePercentage) {
        return variant.id;
      }
    }

    // Fallback to the last variant
    return experiment.variants[experiment.variants.length - 1]?.id || null;
  }

  /**
   * Hash user ID to a percentage value (0-100)
   * 
   * @param userId - User ID to hash
   * @returns Percentage value between 0 and 100
   */
  private hashUserId(userId: string): number {
    const hash = crypto.createHash('md5').update(userId).digest('hex');
    // Convert first 8 hex chars to a number and map to 0-100
    const num = parseInt(hash.substring(0, 8), 16);
    return (num % 10000) / 100; // 0-100 with 2 decimal places
  }
}

/**
 * Analytics service for tracking experiment metrics
 */
export class AnalyticsService {
  private metrics: Map<string, Map<string, number[]>> = new Map();

  /**
   * Track a metric for a specific variant
   * 
   * @param experimentId - Experiment ID
   * @param variantId - Variant ID
   * @param metricName - Name of the metric
   * @param value - Metric value
   */
  trackMetric(experimentId: string, variantId: string, metricName: string, value: number): void {
    if (!this.metrics.has(experimentId)) {
      this.metrics.set(experimentId, new Map());
    }

    const experimentMetrics = this.metrics.get(experimentId)!;
    const key = `${variantId}_${metricName}`;
    
    if (!experimentMetrics.has(key)) {
      experimentMetrics.set(key, []);
    }

    experimentMetrics.get(key)!.push(value);
  }

  /**
   * Calculate fitness score for a variant
   * 
   * @param experimentId - Experiment ID
   * @param variantId - Variant ID
   * @param fitnessMetric - Fitness metric formula
   * @returns Calculated fitness score
   */
  calculateFitnessScore(experimentId: string, variantId: string, fitnessMetric: string): number {
    const experimentMetrics = this.metrics.get(experimentId);
    if (!experimentMetrics) {
      return 0;
    }

    // For demo purposes, we'll simulate a simple fitness calculation
    // In a real implementation, this would parse and evaluate the fitnessMetric formula
    const apiCosts = experimentMetrics.get(`${variantId}_api_cost`) || [];
    const affiliateRevenue = experimentMetrics.get(`${variantId}_affiliate_revenue`) || [];

    const totalApiCosts = apiCosts.reduce((sum, cost) => sum + cost, 0);
    const totalAffiliateRevenue = affiliateRevenue.reduce((sum, revenue) => sum + revenue, 0);

    // Simple fitness calculation: revenue - costs
    return totalAffiliateRevenue - totalApiCosts;
  }

  /**
   * Get all metrics for an experiment
   * 
   * @param experimentId - Experiment ID
   * @returns Map of metrics
   */
  getExperimentMetrics(experimentId: string): Map<string, number[]> | undefined {
    return this.metrics.get(experimentId);
  }
}

/**
 * Darwin Protocol Orchestrator
 * Manages the evolutionary loop for self-improving agent teams
 */
export class DarwinProtocol {
  private static instance: DarwinProtocol;
  private mutationEngine: MutationEngine;
  private experiments: Map<string, ExperimentResults> = new Map();
  private requestRouter: RequestRouter;
  private analyticsService: AnalyticsService;

  private constructor() {
    this.mutationEngine = MutationEngine.getInstance();
    this.requestRouter = new RequestRouter();
    this.analyticsService = new AnalyticsService();
  }

  public static getInstance(): DarwinProtocol {
    if (!DarwinProtocol.instance) {
      DarwinProtocol.instance = new DarwinProtocol();
    }
    return DarwinProtocol.instance;
  }

  /**
   * Initialize the Darwin Protocol
   */
  async initialize(): Promise<void> {
    AgentLogger.log(LogLevel.INFO, 'DarwinProtocol', 'Initializing Darwin Protocol');
    
    // In a real implementation, this would connect to monitoring systems
    // and set up experiment tracking
    
    AgentLogger.log(LogLevel.SUCCESS, 'DarwinProtocol', 'Darwin Protocol initialized');
  }

  /**
   * Start an evolutionary experiment for an AIX team
   * 
   * @param manifestPath - Path to the team.aix.json file
   * @param variantCount - Number of variants to create (default: 3)
   * @param experimentDuration - Duration of experiment in hours (default: 24)
   * @returns Experiment results
   */
  async runEvolutionExperiment(
    manifestPath: string,
    variantCount: number = 3,
    experimentDuration: number = 24
  ): Promise<ExperimentResults> {
    AgentLogger.log(LogLevel.INFO, 'DarwinProtocol', 'Starting evolution experiment', { 
      manifestPath,
      variantCount,
      experimentDuration
    });
    
    try {
      // 1. Parse the original manifest
      const originalTeam = await parseManifest(manifestPath);
      
      // 2. Generate mutations
      const mutations = this.mutationEngine.generateMutations(originalTeam, variantCount);
      
      // 3. Create variants
      const variants: TeamVariant[] = [
        // Control variant (original)
        {
          id: 'A',
          aixHash: this.generateHash(JSON.stringify(originalTeam)),
          team: originalTeam,
          trafficSplit: 80 // 80% traffic to control
        }
      ];
      
      // Mutated variants
      mutations.forEach((mutation, index) => {
        const mutatedTeam = this.mutationEngine.applyMutation(originalTeam, mutation);
        const variantId = String.fromCharCode(66 + index); // B, C, D, etc.
        variants.push({
          id: variantId,
          aixHash: this.generateHash(JSON.stringify(mutatedTeam)),
          team: mutatedTeam,
          trafficSplit: 20 / variantCount // Split remaining 20% among variants
        });
      });
      
      // 4. Register experiment with request router
      const experimentId = `exp-${Date.now()}`;
      const experimentConfig: ExperimentConfig = {
        experimentId,
        name: `Evolution Experiment for ${originalTeam.appName}`,
        variants,
        fitnessMetric: originalTeam.evolution?.fitness_metric || "default",
        duration: `${experimentDuration}h`
      };
      
      this.requestRouter.registerExperiment(experimentConfig);
      
      // 5. Simulate running the experiment
      const startTime = new Date();
      AgentLogger.log(LogLevel.INFO, 'DarwinProtocol', 'Running A/B test experiment', { 
        experimentId,
        variantCount: variants.length,
        duration: experimentDuration
      });
      
      // In a real implementation, this would:
      // - Deploy variants to different environments
      // - Route traffic according to allocations
      // - Monitor fitness metrics
      // - Collect results over time
      
      // For demonstration, we'll simulate results
      const results = await this.simulateExperiment(variants, experimentDuration);
      
      const endTime = new Date();
      
      const experimentResults: ExperimentResults = {
        experimentId,
        variants: results,
        duration: experimentDuration,
        startTime,
        endTime
      };
      
      // 6. Determine winner
      const winner = this.determineWinner(results);
      if (winner) {
        experimentResults.winner = winner;
        AgentLogger.log(LogLevel.SUCCESS, 'DarwinProtocol', 'Experiment completed - winner determined', { 
          experimentId,
          winnerId: winner.id,
          winnerScore: winner.fitnessScore
        });
      }
      
      // 7. Store experiment results
      this.experiments.set(experimentId, experimentResults);
      
      return experimentResults;
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'DarwinProtocol', 'Failed to run evolution experiment', { 
        manifestPath 
      }, error as Error);
      throw error;
    }
  }

  /**
   * Promote a winning variant to become the new main branch
   * 
   * @param manifestPath - Path to the original team.aix.json file
   * @param winner - The winning variant
   * @returns Path to the new manifest file
   */
  async promoteWinner(manifestPath: string, winner: TeamVariant): Promise<string> {
    AgentLogger.log(LogLevel.INFO, 'DarwinProtocol', 'Promoting winning variant', { 
      manifestPath,
      winnerId: winner.id
    });
    
    try {
      // Generate new manifest path (increment generation)
      const dir = path.dirname(manifestPath);
      const ext = path.extname(manifestPath);
      const baseName = path.basename(manifestPath, ext);
      const newGeneration = (winner.team.evolution?.generation || 0);
      const newManifestPath = path.join(dir, `${baseName}_gen${newGeneration}${ext}`);
      
      // Write the winning variant to the new manifest file
      fs.writeFileSync(newManifestPath, JSON.stringify(winner.team, null, 2));
      
      AgentLogger.log(LogLevel.SUCCESS, 'DarwinProtocol', 'Winner promoted successfully', { 
        newManifestPath 
      });
      
      return newManifestPath;
    } catch (error) {
      AgentLogger.log(LogLevel.ERROR, 'DarwinProtocol', 'Failed to promote winner', {}, error as Error);
      throw error;
    }
  }

  /**
   * Get experiment history
   * 
   * @returns Map of experiment results
   */
  getExperimentHistory(): Map<string, ExperimentResults> {
    return new Map(this.experiments);
  }

  /**
   * Get the request router for traffic splitting
   * 
   * @returns Request router instance
   */
  getRequestRouter(): RequestRouter {
    return this.requestRouter;
  }

  /**
   * Get the analytics service for metric tracking
   * 
   * @returns Analytics service instance
   */
  getAnalyticsService(): AnalyticsService {
    return this.analyticsService;
  }

  /**
   * Simulate an A/B test experiment
   * 
   * @param variants - Team variants to test
   * @param duration - Duration in hours
   * @returns Updated variants with fitness scores
   */
  private async simulateExperiment(variants: TeamVariant[], duration: number): Promise<TeamVariant[]> {
    // Simulate experiment running for the specified duration
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Assign random fitness scores to variants
    return variants.map(variant => {
      // Control variant gets a baseline score
      if (variant.id === 'A') {
        return {
          ...variant,
          fitnessScore: 1000 + Math.random() * 100 // 1000-1100
        };
      }
      
      // Mutated variants get scores that may be better or worse
      const baseScore = 1000;
      const variation = (Math.random() - 0.5) * 200; // -100 to +100
      return {
        ...variant,
        fitnessScore: baseScore + variation
      };
    });
  }

  /**
   * Determine the winner of an experiment
   * 
   * @param variants - Team variants with fitness scores
   * @returns Winning variant or null if no clear winner
   */
  private determineWinner(variants: TeamVariant[]): TeamVariant | null {
    if (variants.length === 0) return null;
    
    // Find the variant with the highest fitness score
    const winner = variants.reduce((best, current) => {
      if (!best.fitnessScore) return current;
      if (!current.fitnessScore) return best;
      return current.fitnessScore > best.fitnessScore ? current : best;
    });
    
    // Only declare a winner if it's significantly better than control
    const control = variants.find(v => v.id === 'A');
    if (control && winner.id !== 'A') {
      const improvement = ((winner.fitnessScore! - control.fitnessScore!) / control.fitnessScore!) * 100;
      if (improvement > 2) { // At least 2% improvement
        return winner;
      }
    }
    
    return null; // No significant winner
  }

  /**
   * Generate a hash for a given string
   * 
   * @param content - Content to hash
   * @returns MD5 hash of the content
   */
  private generateHash(content: string): string {
    const hash = crypto.createHash('md5');
    hash.update(content);
    return hash.digest('hex');
  }
}