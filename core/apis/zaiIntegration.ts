import axios from 'axios';
import dotenv from 'dotenv';
import { AgentLogger } from '../utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * z.ai API Integration - Deep Code Analysis and Intelligent Refactoring
 * Features: Code analysis, refactoring suggestions, performance optimization
 * Get API key from z.ai platform
 */
export class ZaiIntegration {
  private static readonly BASE_URL = 'https://api.z.ai/v1';
  private static apiKey = process.env.ZAI_API_KEY || '';

  /**
   * Analyze code for potential improvements
   * @param code The code to analyze
   * @param language The programming language
   * @param analysisType Type of analysis to perform
   * @returns Analysis results with suggestions
   */
  static async analyzeCode(
    code: string,
    language: string,
    analysisType: 'performance' | 'security' | 'maintainability' | 'all' = 'all'
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
  }> {
    return AgentLogger.measurePerformance(
      'ZaiIntegration',
      'analyzeCode',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return this.getMockCodeAnalysis();
        }

        try {
          const response = await axios.post(
            `${this.BASE_URL}/code/analyze`,
            {
              code,
              language,
              analysis_type: analysisType
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from z.ai API');
          }

          return response.data;
        } catch (error: any) {
          console.error('z.ai API error:', error.response?.data || error.message);
          throw new Error(`z.ai API error: ${error.message}`);
        }
      },
      { language, analysisType }
    );
  }

  /**
   * Generate refactoring suggestions for code
   * @param code The code to refactor
   * @param language The programming language
   * @param goals Refactoring goals
   * @returns Refactored code with explanations
   */
  static async refactorCode(
    code: string,
    language: string,
    goals: string[] = ['improve readability', 'optimize performance']
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
  }> {
    return AgentLogger.measurePerformance(
      'ZaiIntegration',
      'refactorCode',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return this.getMockRefactoredCode();
        }

        try {
          const response = await axios.post(
            `${this.BASE_URL}/code/refactor`,
            {
              code,
              language,
              goals
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from z.ai API');
          }

          return response.data;
        } catch (error: any) {
          console.error('z.ai API error:', error.response?.data || error.message);
          throw new Error(`z.ai API error: ${error.message}`);
        }
      },
      { language, goals }
    );
  }

  /**
   * Generate unit tests for code
   * @param code The code to test
   * @param language The programming language
   * @param framework Testing framework
   * @returns Generated tests with coverage information
   */
  static async generateTests(
    code: string,
    language: string,
    framework: string = 'jest'
  ): Promise<{
    tests: string;
    coverage: {
      lines: number;
      functions: number;
      branches: number;
      statements: number;
    };
    suggestions: string[];
  }> {
    return AgentLogger.measurePerformance(
      'ZaiIntegration',
      'generateTests',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return this.getMockGeneratedTests();
        }

        try {
          const response = await axios.post(
            `${this.BASE_URL}/code/test`,
            {
              code,
              language,
              framework
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from z.ai API');
          }

          return response.data;
        } catch (error: any) {
          console.error('z.ai API error:', error.response?.data || error.message);
          throw new Error(`z.ai API error: ${error.message}`);
        }
      },
      { language, framework }
    );
  }

  /**
   * Optimize code for performance
   * @param code The code to optimize
   * @param language The programming language
   * @param metrics Performance metrics to optimize for
   * @returns Optimized code with benchmark results
   */
  static async optimizeCode(
    code: string,
    language: string,
    metrics: string[] = ['speed', 'memory']
  ): Promise<{
    originalCode: string;
    optimizedCode: string;
    benchmark: {
      original: { executionTime: number; memoryUsage: number };
      optimized: { executionTime: number; memoryUsage: number };
      improvement: { executionTime: number; memoryUsage: number };
    };
    changes: Array<{
      type: string;
      description: string;
      impact: string;
    }>;
  }> {
    return AgentLogger.measurePerformance(
      'ZaiIntegration',
      'optimizeCode',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return this.getMockOptimizedCode();
        }

        try {
          const response = await axios.post(
            `${this.BASE_URL}/code/optimize`,
            {
              code,
              language,
              metrics
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from z.ai API');
          }

          return response.data;
        } catch (error: any) {
          console.error('z.ai API error:', error.response?.data || error.message);
          throw new Error(`z.ai API error: ${error.message}`);
        }
      },
      { language, metrics }
    );
  }

  /**
   * Explain code functionality
   * @param code The code to explain
   * @param language The programming language
   * @returns Explanation of code functionality
   */
  static async explainCode(
    code: string,
    language: string
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
  }> {
    return AgentLogger.measurePerformance(
      'ZaiIntegration',
      'explainCode',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return this.getMockCodeExplanation();
        }

        try {
          const response = await axios.post(
            `${this.BASE_URL}/code/explain`,
            {
              code,
              language
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from z.ai API');
          }

          return response.data;
        } catch (error: any) {
          console.error('z.ai API error:', error.response?.data || error.message);
          throw new Error(`z.ai API error: ${error.message}`);
        }
      },
      { language }
    );
  }

  private static getMockCodeAnalysis(): any {
    return {
      issues: [
        {
          type: 'performance',
          severity: 'medium',
          location: { line: 15, column: 4 },
          description: 'Inefficient loop detected',
          suggestion: 'Consider using Array.map() instead of a for loop for better readability',
          codeExample: '// Replace with: const results = items.map(item => processItem(item));'
        },
        {
          type: 'maintainability',
          severity: 'low',
          location: { line: 23, column: 2 },
          description: 'Magic number detected',
          suggestion: 'Extract 42 to a named constant for better readability',
          codeExample: 'const ANSWER_TO_EVERYTHING = 42;'
        }
      ],
      score: 85,
      summary: 'Code analysis complete with 2 suggestions for improvement'
    };
  }

  private static getMockRefactoredCode(): any {
    return {
      originalCode: 'function example() { /* original code */ }',
      refactoredCode: 'function example() { /* refactored code */ }',
      changes: [
        {
          type: 'replace',
          location: { startLine: 5, endLine: 10 },
          description: 'Simplified complex conditional logic',
          reason: 'Improved readability and reduced nesting'
        }
      ],
      explanation: 'Refactored code for better readability and performance'
    };
  }

  private static getMockGeneratedTests(): any {
    return {
      tests: '// Generated unit tests\n// describe("example", () => {...})',
      coverage: {
        lines: 95,
        functions: 90,
        branches: 85,
        statements: 95
      },
      suggestions: [
        'Add edge case tests for empty inputs',
        'Include performance tests for large datasets'
      ]
    };
  }

  private static getMockOptimizedCode(): any {
    return {
      originalCode: 'function example() { /* original code */ }',
      optimizedCode: 'function example() { /* optimized code */ }',
      benchmark: {
        original: { executionTime: 100, memoryUsage: 50 },
        optimized: { executionTime: 75, memoryUsage: 40 },
        improvement: { executionTime: 25, memoryUsage: 10 }
      },
      changes: [
        {
          type: 'algorithm',
          description: 'Replaced bubble sort with quicksort',
          impact: '25% faster execution'
        }
      ]
    };
  }

  private static getMockCodeExplanation(): any {
    return {
      summary: 'This function processes user data and returns formatted results',
      functions: [
        {
          name: 'processUserData',
          purpose: 'Processes and validates user data',
          parameters: [
            { name: 'data', type: 'object', description: 'User data object' },
            { name: 'options', type: 'object', description: 'Processing options' }
          ],
          returns: { type: 'object', description: 'Processed user data' }
        }
      ],
      flow: '1. Validate input data -> 2. Process data -> 3. Format results -> 4. Return results',
      complexity: { time: 'O(n)', space: 'O(1)' }
    };
  }
}

export const zaiService = new ZaiIntegration();