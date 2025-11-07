/**
 * AIX Schema Types
 * Defines the types for AIX team manifests
 * 
 * @module aixSchemaTypes
 * @version 1.0.0
 */

export interface EvolutionMetadata {
  generation: number;
  parent_generation_hash?: string;
  fitness_metric: string;
  last_fitness_score?: number;
  mutation_history: Array<{
    mutation_id: string;
    description: string;
    fitness_impact?: string;
    timestamp: string;
  }>;
}

export interface AIXTeam {
  version: string;
  appName: string;
  mission: string;
  team: Array<{
    agentId: string;
    role: string;
    description: string;
  }>;
  persona: string;
  rules: string[];
  tools: string[];
  workflows: string[];
  skills: Array<{
    skillId: string;
    description: string;
    path: string;
  }>;
  evolution?: EvolutionMetadata;
}