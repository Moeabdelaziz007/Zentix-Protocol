import { z } from 'zod';

/**
 * AIX Schema - Agent Identity & Persona System
 * Defines the metadata and personality of a digital being
 * 
 * @module aixSchema
 * @version 0.1.0
 */

export const FeelingSchema = z.object({
  valence: z.number().min(-1).max(1),
  arousal: z.number().min(0).max(1),
  motivation: z.number().min(0).max(1),
  decayRate: z.number().optional().default(0.01),
  lastUpdated: z.string().datetime().optional(),
});

export type AgentFeelings = z.infer<typeof FeelingSchema>;

export const SkillSchema = z.object({
  name: z.string(),
  description: z.string(),
  mcp: z.string().optional(),
  enabled: z.boolean().default(true),
});

export type Skill = z.infer<typeof SkillSchema>;

export const AIXAgentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  version: z.string().default('0.1.0'),
  meta: z.object({
    created: z.string().datetime(),
    author: z.string().optional(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
  }),
  persona: z.object({
    archetype: z.enum(['analyst', 'creative', 'helper', 'guardian', 'explorer']),
    tone: z.string(),
    values: z.array(z.string()),
  }),
  skills: z.array(SkillSchema).default([]),
  feelings: FeelingSchema.default({
    valence: 0,
    arousal: 0.5,
    motivation: 0.5,
    decayRate: 0.01,
  }),
  memory: z.object({
    episodic: z.array(z.any()).default([]),
    semantic: z.record(z.any()).default({}),
  }).default({}),
});

export type AIXAgent = z.infer<typeof AIXAgentSchema>;

/**
 * Validate and create an AIX agent
 * 
 * @param data - Raw agent data
 * @returns Validated AIXAgent object
 * @throws ZodError if validation fails
 */
export const createAIXAgent = (data: unknown): AIXAgent => {
  return AIXAgentSchema.parse(data);
};

/**
 * Validate agent feelings
 * 
 * @param data - Raw feelings data
 * @returns Validated AgentFeelings object
 * @throws ZodError if validation fails
 */
export const validateFeelings = (data: unknown): AgentFeelings => {
  return FeelingSchema.parse(data);
};
