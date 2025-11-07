/**
 * Mutation Engine for Darwin Protocol
 * Generates intelligent variations of AIX team manifests
 * 
 * @module mutationEngine
 * @version 1.0.0
 */

import { AIXTeam, EvolutionMetadata } from './aixSchemaTypes';
import { AgentLogger, LogLevel } from '../utils/agentLogger';
import * as crypto from 'crypto';

/**
 * Types of mutations that can be applied to an AIX team manifest
 */
export type MutationType = 
  | 'swap_adjective'        // Persona & Rule Mutations
  | 'toggle_rule'
  | 'refine_rule'
  | 'swap_llm_model'        // Tool & API Mutations
  | 'swap_service_provider'
  | 'adjust_api_parameter'
  | 'reorder_playbook_steps' // Workflow & Skill Mutations
  | 'mutate_skill_prompt'
  | 'substitute_skill'
  | 'add_specialist_agent'   // Team Composition Mutations
  | 'clone_agent'
  | 'reassign_role';

/**
 * Mutation operation definition
 */
export interface Mutation {
  id: string;
  type: MutationType;
  description: string;
  apply: (team: AIXTeam) => AIXTeam;
}

/**
 * Mutation Engine
 * Generates intelligent variations of AIX team manifests for evolutionary optimization
 */
export class MutationEngine {
  private static instance: MutationEngine;
  
  // Predefined adjective swaps for persona mutations
  private adjectiveSwaps = [
    { from: "trendy", to: "professional" },
    { from: "knowledgeable", to: "data-driven" },
    { from: "trustworthy", to: "efficient" },
    { from: "friendly", to: "concise" },
    { from: "casual", to: "formal" },
    { from: "enthusiastic", to: "analytical" }
  ];
  
  // LLM model swaps
  private llmModelSwaps = [
    { from: "gpt-4-turbo", to: "claude-3-opus" },
    { from: "gpt-4", to: "claude-3-sonnet" },
    { from: "claude-3-opus", to: "gpt-4-turbo" },
    { from: "gpt-3.5-turbo", to: "llama-2-70b" }
  ];
  
  // Service provider swaps
  private serviceProviderSwaps = [
    { from: "DeepL_API", to: "Google_Translate_API" },
    { from: "Google_Translate_API", to: "Azure_Translator" },
    { from: "OpenAI_API", to: "Anthropic_API" },
    { from: "Anthropic_API", to: "OpenAI_API" }
  ];

  private constructor() {}

  public static getInstance(): MutationEngine {
    if (!MutationEngine.instance) {
      MutationEngine.instance = new MutationEngine();
    }
    return MutationEngine.instance;
  }

  /**
   * Generate a set of mutations for an AIX team manifest
   * 
   * @param team - The original AIX team manifest
   * @param count - Number of mutations to generate
   * @returns Array of mutation operations
   */
  generateMutations(team: AIXTeam, count: number = 3): Mutation[] {
    AgentLogger.log(LogLevel.INFO, 'MutationEngine', 'Generating mutations', { 
      teamName: team.appName, 
      mutationCount: count 
    });
    
    const mutations: Mutation[] = [];
    
    for (let i = 0; i < count; i++) {
      // Randomly select a mutation type
      const mutationTypes: MutationType[] = [
        'swap_adjective', 'toggle_rule', 'refine_rule',
        'swap_llm_model', 'swap_service_provider', 'adjust_api_parameter',
        'reorder_playbook_steps', 'mutate_skill_prompt', 'substitute_skill',
        'add_specialist_agent', 'clone_agent', 'reassign_role'
      ];
      const randomType = mutationTypes[Math.floor(Math.random() * mutationTypes.length)];
      
      // Generate a specific mutation based on the type
      const mutation = this.generateSpecificMutation(team, randomType, i);
      if (mutation) {
        mutations.push(mutation);
      }
    }
    
    AgentLogger.log(LogLevel.SUCCESS, 'MutationEngine', 'Mutations generated', { 
      teamName: team.appName, 
      generatedCount: mutations.length 
    });
    
    return mutations;
  }

  /**
   * Apply a mutation to an AIX team manifest
   * 
   * @param team - The original AIX team manifest
   * @param mutation - The mutation to apply
   * @returns Mutated AIX team manifest
   */
  applyMutation(team: AIXTeam, mutation: Mutation): AIXTeam {
    AgentLogger.log(LogLevel.INFO, 'MutationEngine', 'Applying mutation', { 
      teamName: team.appName, 
      mutationId: mutation.id,
      mutationType: mutation.type
    });
    
    // Apply the mutation
    const mutatedTeam = mutation.apply({ ...team });
    
    // Update evolution metadata
    const evolution: EvolutionMetadata = {
      generation: (team.evolution?.generation || 0) + 1,
      parent_generation_hash: this.generateHash(JSON.stringify(team)),
      fitness_metric: team.evolution?.fitness_metric || "default",
      mutation_history: [
        ...(team.evolution?.mutation_history || []),
        {
          mutation_id: mutation.id,
          description: mutation.description,
          timestamp: new Date().toISOString(),
        }
      ]
    };
    
    mutatedTeam.evolution = evolution;
    
    AgentLogger.log(LogLevel.SUCCESS, 'MutationEngine', 'Mutation applied', { 
      teamName: team.appName, 
      mutationId: mutation.id
    });
    
    return mutatedTeam;
  }

  /**
   * Generate a specific mutation based on type
   * 
   * @param team - The original AIX team manifest
   * @param type - The type of mutation to generate
   * @param index - Index for unique ID generation
   * @returns Mutation operation or null if not applicable
   */
  private generateSpecificMutation(team: AIXTeam, type: MutationType, index: number): Mutation | null {
    const mutationId = `mut-${Date.now()}-${index}`;
    
    switch (type) {
      // Persona & Rule Mutations
      case 'swap_adjective': {
        if (this.adjectiveSwaps.length === 0) return null;
        const swap = this.adjectiveSwaps[Math.floor(Math.random() * this.adjectiveSwaps.length)];
        return {
          id: mutationId,
          type: 'swap_adjective',
          description: `Swapped adjective '${swap.from}' to '${swap.to}' in persona`,
          apply: (team: AIXTeam) => {
            const mutated = { ...team };
            mutated.persona = mutated.persona.replace(new RegExp(swap.from, 'gi'), swap.to);
            return mutated;
          }
        };
      }
        
      case 'toggle_rule': {
        if (team.rules.length === 0) return null;
        const ruleIndex = Math.floor(Math.random() * team.rules.length);
        const rule = team.rules[ruleIndex];
        return {
          id: mutationId,
          type: 'toggle_rule',
          description: `Toggled rule: ${rule}`,
          apply: (team: AIXTeam) => {
            const mutated = { ...team };
            // For demo, we'll just modify the rule text to indicate it's toggled
            mutated.rules[ruleIndex] = `[TOGGLED] ${rule}`;
            return mutated;
          }
        };
      }
        
      case 'refine_rule': {
        if (team.rules.length === 0) return null;
        const ruleIndex = Math.floor(Math.random() * team.rules.length);
        const rule = team.rules[ruleIndex];
        return {
          id: mutationId,
          type: 'refine_rule',
          description: `Refined rule: ${rule}`,
          apply: (team: AIXTeam) => {
            const mutated = { ...team };
            // For demo, we'll make the rule more specific
            mutated.rules[ruleIndex] = `Strictly adhere to: ${rule}`;
            return mutated;
          }
        };
      }
        
      // Tool & API Mutations
      case 'swap_llm_model': {
        if (this.llmModelSwaps.length === 0) return null;
        const swap = this.llmModelSwaps[Math.floor(Math.random() * this.llmModelSwaps.length)];
        return {
          id: mutationId,
          type: 'swap_llm_model',
          description: `Swapped LLM model from '${swap.from}' to '${swap.to}'`,
          apply: (team: AIXTeam) => {
            const mutated = { ...team };
            // Replace model references in tools
            mutated.tools = mutated.tools.map(tool => 
              tool.replace(new RegExp(swap.from, 'gi'), swap.to)
            );
            return mutated;
          }
        };
      }
        
      case 'swap_service_provider': {
        if (this.serviceProviderSwaps.length === 0) return null;
        const swap = this.serviceProviderSwaps[Math.floor(Math.random() * this.serviceProviderSwaps.length)];
        return {
          id: mutationId,
          type: 'swap_service_provider',
          description: `Swapped service provider from '${swap.from}' to '${swap.to}'`,
          apply: (team: AIXTeam) => {
            const mutated = { ...team };
            // Replace service provider references in tools
            mutated.tools = mutated.tools.map(tool => 
              tool.replace(new RegExp(swap.from, 'gi'), swap.to)
            );
            return mutated;
          }
        };
      }
        
      case 'adjust_api_parameter': {
        return {
          id: mutationId,
          type: 'adjust_api_parameter',
          description: "Adjusted API parameter (temperature) from 0.5 to 0.9",
          apply: (team: AIXTeam) => {
            const mutated = { ...team };
            // For demo, we'll add a parameter adjustment note to the tools
            mutated.tools = mutated.tools.map(tool => 
              tool.includes('_API') ? `${tool} [temperature: 0.9]` : tool
            );
            return mutated;
          }
        };
      }
        
      // Workflow & Skill Mutations
      case 'reorder_playbook_steps': {
        if (team.workflows.length < 2) return null;
        return {
          id: mutationId,
          type: 'reorder_playbook_steps',
          description: "Reordered playbook steps for efficiency",
          apply: (team: AIXTeam) => {
            const mutated = { ...team };
            // Reverse the order of workflows for demo
            mutated.workflows = [...mutated.workflows].reverse();
            return mutated;
          }
        };
      }
        
      case 'mutate_skill_prompt': {
        if (team.skills.length === 0) return null;
        const skillIndex = Math.floor(Math.random() * team.skills.length);
        const skill = team.skills[skillIndex];
        return {
          id: mutationId,
          type: 'mutate_skill_prompt',
          description: `Mutated prompt for skill: ${skill.skillId}`,
          apply: (team: AIXTeam) => {
            const mutated = { ...team };
            // For demo, we'll modify the skill path to indicate mutation
            mutated.skills[skillIndex] = {
              ...mutated.skills[skillIndex],
              path: `${mutated.skills[skillIndex].path}?mutated=true`
            };
            return mutated;
          }
        };
      }
        
      case 'substitute_skill': {
        if (team.skills.length === 0) return null;
        const skillIndex = Math.floor(Math.random() * team.skills.length);
        const skill = team.skills[skillIndex];
        return {
          id: mutationId,
          type: 'substitute_skill',
          description: `Substituted skill '${skill.skillId}' with simpler alternative`,
          apply: (team: AIXTeam) => {
            const mutated = { ...team };
            // For demo, we'll replace the skill with a simplified version
            mutated.skills[skillIndex] = {
              ...mutated.skills[skillIndex],
              skillId: `Quick_${mutated.skills[skillIndex].skillId}`,
              description: `Simplified version of ${mutated.skills[skillIndex].description}`
            };
            return mutated;
          }
        };
      }
        
      // Team Composition Mutations
      case 'add_specialist_agent': {
        return {
          id: mutationId,
          type: 'add_specialist_agent',
          description: "Added PromoCodeScoutAgent specialist",
          apply: (team: AIXTeam) => {
            const mutated = { ...team };
            // Add a new specialist agent
            mutated.team.push({
              agentId: `PromoCodeScoutAgent_${mutationId}`,
              role: "Promo Code Specialist",
              description: "Specialized agent for finding promotional codes"
            });
            return mutated;
          }
        };
      }
        
      case 'clone_agent': {
        if (team.team.length === 0) return null;
        const agentIndex = Math.floor(Math.random() * team.team.length);
        const agent = team.team[agentIndex];
        return {
          id: mutationId,
          type: 'clone_agent',
          description: `Cloned agent: ${agent.agentId}`,
          apply: (team: AIXTeam) => {
            const mutated = { ...team };
            // Clone an existing agent
            mutated.team.push({
              ...agent,
              agentId: `${agent.agentId}_clone_${mutationId}`
            });
            return mutated;
          }
        };
      }
        
      case 'reassign_role': {
        if (team.team.length < 2) return null;
        return {
          id: mutationId,
          type: 'reassign_role',
          description: "Reassigned role between agents",
          apply: (team: AIXTeam) => {
            const mutated = { ...team };
            // Swap roles between first two agents for demo
            if (mutated.team.length >= 2) {
              const tempRole = mutated.team[0].role;
              mutated.team[0].role = mutated.team[1].role;
              mutated.team[1].role = tempRole;
            }
            return mutated;
          }
        };
      }
        
      default:
        return null;
    }
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