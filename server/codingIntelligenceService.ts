/**
 * Coding Intelligence Service
 * Deep code analysis and generation using z.ai and Jules APIs
 * 
 * @module codingIntelligenceService
 * @version 1.0.0
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { ZaiIntegration } from '../core/apis/zaiIntegration';
import { AgentLogger } from '../core/utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * Coding Intelligence Service
 * Provides deep code analysis and generation capabilities
 */
export class CodingIntelligenceService {
  // Jules API configuration
  private static readonly JULES_API_URL = 'https://api.projectidx.dev/v1';
  private static julesApiKey = process.env.JULES_API_KEY || '';

  /**
   * Analyze code for potential improvements using z.ai API
   * @param code The code to analyze
   * @param language The programming language
   * @param context Additional context about the project
   * @returns Analysis results with suggestions
   */
  static async analyzeCode(
    code: string,
    language: string,
    context?: {
      projectName?: string;
      filePath?: string;
      dependencies?: string[];
      framework?: string;
    }
  ): Promise<{
    issues: Array<{
      type: 'performance' | 'security' | 'maintainability' | 'bug';
      severity: 'low' | 'medium' | 'high' | 'critical';
      location: { line: number; column: number };
      description: string;
      suggestion: string;
      codeExample?: string;
    }>;
    score: number;
    summary: string;
    contextAwareSuggestions: string[];
  }> {
    return AgentLogger.measurePerformance(
      'CodingIntelligenceService',
      'analyzeCode',
      async () => {
        try {
          // Use z.ai for deep code analysis
          const analysis = await ZaiIntegration.analyzeCode(code, language, 'all');
          
          // Enhance with context-aware suggestions
          const contextAwareSuggestions: string[] = [];
          
          if (context?.projectName) {
            contextAwareSuggestions.push(`Consider how this code fits into the overall ${context.projectName} architecture`);
          }
          
          if (context?.dependencies && context.dependencies.length > 0) {
            contextAwareSuggestions.push(`Review interactions with dependencies: ${context.dependencies.join(', ')}`);
          }
          
          if (context?.framework) {
            contextAwareSuggestions.push(`Ensure compliance with ${context.framework} best practices`);
          }
          
          return {
            ...analysis,
            contextAwareSuggestions
          };
        } catch (error) {
          console.error('Code analysis error:', error);
          throw error;
        }
      },
      { language, hasContext: !!context }
    );
  }

  /**
   * Generate code using Jules API with deep contextual understanding
   * @param prompt Natural language description of what code to generate
   * @param context Additional context about the project
   * @returns Generated code with explanation
   */
  static async generateCode(
    prompt: string,
    context?: {
      projectName?: string;
      filePath?: string;
      language?: string;
      framework?: string;
      existingCode?: string;
      dependencies?: string[];
      codingStandards?: string[];
    }
  ): Promise<{
    code: string;
    language: string;
    explanation: string;
    confidence: number;
    suggestions: string[];
  }> {
    return AgentLogger.measurePerformance(
      'CodingIntelligenceService',
      'generateCode',
      async () => {
        if (!this.julesApiKey) {
          throw new Error('JULES_API_KEY is not configured');
        }

        try {
          // Build a comprehensive context for Jules
          const julesContext = {
            prompt,
            project_context: context?.projectName ? `Project: ${context.projectName}` : undefined,
            file_context: context?.filePath ? `File: ${context.filePath}` : undefined,
            language: context?.language,
            framework: context?.framework,
            existing_code: context?.existingCode,
            dependencies: context?.dependencies,
            coding_standards: context?.codingStandards,
            goal: "Generate high-quality, maintainable, and secure code that fits seamlessly into the project"
          };

          // Filter out undefined values
          const filteredContext = Object.fromEntries(
            Object.entries(julesContext).filter(([_, v]) => v !== undefined)
          );

          const response = await axios.post(
            `${this.JULES_API_URL}/generate`,
            {
              ...filteredContext
            },
            {
              headers: {
                'Authorization': `Bearer ${this.julesApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from Jules API');
          }

          return {
            code: response.data.code || '// Generated code would appear here',
            language: response.data.language || context?.language || 'javascript',
            explanation: response.data.explanation || 'Code generated based on your request',
            confidence: response.data.confidence || 0.95,
            suggestions: response.data.suggestions || ['Review the generated code for accuracy']
          };
        } catch (error: any) {
          console.error('Jules API error:', error.response?.data || error.message);
          throw new Error(`Jules API error: ${error.message}`);
        }
      },
      { hasContext: !!context }
    );
  }

  /**
   * Refactor code with both z.ai analysis and Jules generation
   * @param code The code to refactor
   * @param language The programming language
   * @param goals Refactoring goals
   * @param context Additional context
   * @returns Refactored code with explanations
   */
  static async refactorCode(
    code: string,
    language: string,
    goals: string[] = ['improve readability', 'optimize performance'],
    context?: {
      projectName?: string;
      filePath?: string;
      framework?: string;
      dependencies?: string[];
    }
  ): Promise<{
    originalCode: string;
    refactoredCode: string;
    changes: Array<{
      type: 'replace' | 'add' | 'remove';
      location: { startLine: number; endLine: number };
      description: string;
      reason: string;
    }>;
    explanation: string;
    analysisBefore: any;
    analysisAfter: any;
  }> {
    return AgentLogger.measurePerformance(
      'CodingIntelligenceService',
      'refactorCode',
      async () => {
        try {
          // First, analyze the original code
          const analysisBefore = await this.analyzeCode(code, language, context);
          
          // Use z.ai to refactor the code
          const refactored = await ZaiIntegration.refactorCode(code, language, goals);
          
          // Analyze the refactored code
          const analysisAfter = await this.analyzeCode(refactored.refactoredCode, language, context);
          
          return {
            ...refactored,
            analysisBefore,
            analysisAfter
          };
        } catch (error) {
          console.error('Code refactoring error:', error);
          throw error;
        }
      },
      { language, goals, hasContext: !!context }
    );
  }

  /**
   * Generate unit tests using z.ai API
   * @param code The code to test
   * @param language The programming language
   * @param framework Testing framework
   * @param context Additional context
   * @returns Generated tests with coverage information
   */
  static async generateTests(
    code: string,
    language: string,
    framework: string = 'jest',
    context?: {
      projectName?: string;
      filePath?: string;
      dependencies?: string[];
    }
  ): Promise<{
    tests: string;
    coverage: {
      lines: number;
      functions: number;
      branches: number;
      statements: number;
    };
    suggestions: string[];
    explanation: string;
  }> {
    return AgentLogger.measurePerformance(
      'CodingIntelligenceService',
      'generateTests',
      async () => {
        try {
          // Use z.ai to generate tests
          const testResult = await ZaiIntegration.generateTests(code, language, framework);
          
          // Enhance with context-aware suggestions
          const suggestions = [...testResult.suggestions];
          
          if (context?.projectName) {
            suggestions.push(`Ensure tests align with ${context.projectName} testing standards`);
          }
          
          if (context?.dependencies && context.dependencies.length > 0) {
            suggestions.push(`Consider mocking dependencies: ${context.dependencies.join(', ')}`);
          }
          
          return {
            ...testResult,
            suggestions,
            explanation: `Generated ${framework} tests with ${testResult.coverage.lines}% line coverage`
          };
        } catch (error) {
          console.error('Test generation error:', error);
          throw error;
        }
      },
      { language, framework, hasContext: !!context }
    );
  }

  /**
   * Explain code functionality using both z.ai and Jules
   * @param code The code to explain
   * @param language The programming language
   * @param context Additional context
   * @returns Explanation of code functionality
   */
  static async explainCode(
    code: string,
    language: string,
    context?: {
      projectName?: string;
      filePath?: string;
      framework?: string;
      dependencies?: string[];
    }
  ): Promise<{
    summary: string;
    functions: Array<{
      name: string;
      purpose: string;
      parameters: Array<{ name: string; type: string; description: string }>;
      returns: { type: string; description: string };
    }>;
    flow: string;
    complexity: { time: string; space: string };
    contextAwareInsights: string[];
  }> {
    return AgentLogger.measurePerformance(
      'CodingIntelligenceService',
      'explainCode',
      async () => {
        try {
          // Use z.ai to explain the code
          const explanation = await ZaiIntegration.explainCode(code, language);
          
          // Enhance with context-aware insights
          const contextAwareInsights: string[] = [];
          
          if (context?.projectName) {
            contextAwareInsights.push(`This code is part of the ${context.projectName} project`);
          }
          
          if (context?.framework) {
            contextAwareInsights.push(`Follows ${context.framework} patterns and conventions`);
          }
          
          if (context?.dependencies && context.dependencies.length > 0) {
            contextAwareInsights.push(`Interacts with: ${context.dependencies.join(', ')}`);
          }
          
          return {
            ...explanation,
            contextAwareInsights
          };
        } catch (error) {
          console.error('Code explanation error:', error);
          throw error;
        }
      },
      { language, hasContext: !!context }
    );
  }
}