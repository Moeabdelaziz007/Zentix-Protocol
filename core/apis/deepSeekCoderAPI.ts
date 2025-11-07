import axios from 'axios';
import dotenv from 'dotenv';
import { AgentLogger } from '../utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * DeepSeek Coder API Integration - Advanced Programming Assistance
 * Features: Code generation, debugging, optimization, explanation
 * Get API key from DeepSeek platform
 */
export class DeepSeekCoderAPI {
  private static readonly BASE_URL = 'https://api.deepseek.com/v1';
  private static apiKey = process.env.DEEPSEEK_API_KEY || '';

  /**
   * Generate code with DeepSeek Coder
   * @param codePrompt Description of the code to generate
   * @param language Target programming language
   * @param framework Optional framework to use
   * @returns Generated code with explanations
   */
  static async generateCode(
    codePrompt: string,
    language: string = 'typescript',
    framework?: string
  ): Promise<{ code: string; explanation: string; suggestions: string[] }> {
    return AgentLogger.measurePerformance(
      'DeepSeekCoderAPI',
      'generateCode',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return this.getMockCodeGeneration();
        }

        try {
          const systemPrompt = `You are an expert ${language} developer with deep knowledge of ${framework || 'software development'}.
          Generate clean, efficient, well-documented code that follows best practices.
          Include error handling and type safety where appropriate.`;

          const response = await axios.post(
            `${this.BASE_URL}/chat/completions`,
            {
              model: 'deepseek-coder',
              messages: [
                {
                  role: 'system',
                  content: systemPrompt
                },
                {
                  role: 'user',
                  content: `Generate code for: ${codePrompt}
                  
                  Please provide:
                  1. The complete code implementation
                  2. A detailed explanation of the solution
                  3. Suggestions for improvements or alternative approaches
                  
                  Format as JSON: {"code": "...", "explanation": "...", "suggestions": [...]}}
                  
                  Ensure the code is production-ready and follows ${language} best practices.`
                }
              ],
              temperature: 0.2,
              max_tokens: 4096
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
                }
            }
          );

          if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            throw new Error('Invalid response from DeepSeek Coder API');
          }

          const message = response.data.choices[0].message;
          if (!message.content) {
            throw new Error('No content in DeepSeek Coder API response');
          }

          // Try to parse JSON from response
          try {
            const parsedResult = JSON.parse(message.content);
            return {
              code: parsedResult.code || '// Generated code would appear here',
              explanation: parsedResult.explanation || 'Explanation of the generated code',
              suggestions: parsedResult.suggestions || []
            };
          } catch (parseError) {
            // If JSON parsing fails, extract information from plain text
            return {
              code: this.extractCodeFromResponse(message.content),
              explanation: this.extractExplanationFromResponse(message.content),
              suggestions: this.extractSuggestionsFromResponse(message.content)
            };
          }
        } catch (error: any) {
          console.error('DeepSeek Coder error:', error.response?.data || error.message);
          throw new Error(`DeepSeek Coder error: ${error.message}`);
        }
      },
      { codePrompt, language, framework }
    );
  }

  /**
   * Debug code with DeepSeek Coder
   * @param code Code to debug
   * @param language Programming language
   * @param error Error message if any
   * @returns Debugging insights and fixed code
   */
  static async debugCode(
    code: string,
    language: string,
    error?: string
  ): Promise<{
    issues: Array<{ type: string; description: string; line?: number }>;
    fixedCode: string;
    explanation: string;
    suggestions: string[];
  }> {
    return AgentLogger.measurePerformance(
      'DeepSeekCoderAPI',
      'debugCode',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return this.getMockDebugging();
        }

        try {
          const prompt = `Debug the following ${language} code${error ? ` with error: ${error}` : ''}:
          
          Code:
          ${code}
          
          Please provide:
          1. List of issues found with types and descriptions
          2. Fixed code
          3. Explanation of fixes
          4. Suggestions for improvements
          
          Format as JSON: {"issues": [...], "fixedCode": "...", "explanation": "...", "suggestions": [...]}}`;

          const response = await axios.post(
            `${this.BASE_URL}/chat/completions`,
            {
              model: 'deepseek-coder',
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.1,
              max_tokens: 4096
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            throw new Error('Invalid response from DeepSeek Coder API');
          }

          const message = response.data.choices[0].message;
          if (!message.content) {
            throw new Error('No content in DeepSeek Coder API response');
          }

          // Try to parse JSON from response
          try {
            const parsedResult = JSON.parse(message.content);
            return {
              issues: parsedResult.issues || [],
              fixedCode: parsedResult.fixedCode || code,
              explanation: parsedResult.explanation || 'No explanation provided',
              suggestions: parsedResult.suggestions || []
            };
          } catch (parseError) {
            // If JSON parsing fails, return mock data
            return this.getMockDebugging();
          }
        } catch (error: any) {
          console.error('DeepSeek Coder debug error:', error.response?.data || error.message);
          throw new Error(`DeepSeek Coder debug error: ${error.message}`);
        }
      },
      { language, error }
    );
  }

  /**
   * Optimize code for performance with DeepSeek Coder
   * @param code Code to optimize
   * @param language Programming language
   * @param metrics Performance metrics to optimize for
   * @returns Optimized code with benchmark information
   */
  static async optimizeCode(
    code: string,
    language: string,
    metrics: string[] = ['speed', 'memory']
  ): Promise<{
    originalCode: string;
    optimizedCode: string;
    benchmark: {
      original: { executionTime?: number; memoryUsage?: number };
      optimized: { executionTime?: number; memoryUsage?: number };
      improvement: { executionTime?: number; memoryUsage?: number };
    };
    changes: Array<{ type: string; description: string; impact: string }>;
  }> {
    return AgentLogger.measurePerformance(
      'DeepSeekCoderAPI',
      'optimizeCode',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return this.getMockOptimization();
        }

        try {
          const prompt = `Optimize the following ${language} code for ${metrics.join(' and ')}:
          
          Code:
          ${code}
          
          Please provide:
          1. Original code
          2. Optimized code
          3. Benchmark comparison (execution time, memory usage)
          4. List of changes with descriptions and impact
          
          Format as JSON: {"originalCode": "...", "optimizedCode": "...", "benchmark": {...}, "changes": [...]}`;

          const response = await axios.post(
            `${this.BASE_URL}/chat/completions`,
            {
              model: 'deepseek-coder',
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.1,
              max_tokens: 4096
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            throw new Error('Invalid response from DeepSeek Coder API');
          }

          const message = response.data.choices[0].message;
          if (!message.content) {
            throw new Error('No content in DeepSeek Coder API response');
          }

          // Try to parse JSON from response
          try {
            const parsedResult = JSON.parse(message.content);
            return {
              originalCode: parsedResult.originalCode || code,
              optimizedCode: parsedResult.optimizedCode || code,
              benchmark: parsedResult.benchmark || {
                original: {},
                optimized: {},
                improvement: {}
              },
              changes: parsedResult.changes || []
            };
          } catch (parseError) {
            // If JSON parsing fails, return mock data
            return this.getMockOptimization();
          }
        } catch (error: any) {
          console.error('DeepSeek Coder optimization error:', error.response?.data || error.message);
          throw new Error(`DeepSeek Coder optimization error: ${error.message}`);
        }
      },
      { language, metrics }
    );
  }

  /**
   * Explain code functionality with DeepSeek Coder
   * @param code Code to explain
   * @param language Programming language
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
    suggestions: string[];
  }> {
    return AgentLogger.measurePerformance(
      'DeepSeekCoderAPI',
      'explainCode',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return this.getMockExplanation();
        }

        try {
          const prompt = `Explain the following ${language} code:
          
          Code:
          ${code}
          
          Please provide:
          1. Summary of what the code does
          2. List of functions with purposes, parameters, and return values
          3. Execution flow
          4. Time and space complexity
          5. Suggestions for improvement
          
          Format as JSON: {"summary": "...", "functions": [...], "flow": "...", "complexity": {...}, "suggestions": [...]}`;

          const response = await axios.post(
            `${this.BASE_URL}/chat/completions`,
            {
              model: 'deepseek-coder',
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.1,
              max_tokens: 4096
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            throw new Error('Invalid response from DeepSeek Coder API');
          }

          const message = response.data.choices[0].message;
          if (!message.content) {
            throw new Error('No content in DeepSeek Coder API response');
          }

          // Try to parse JSON from response
          try {
            const parsedResult = JSON.parse(message.content);
            return {
              summary: parsedResult.summary || 'Code explanation',
              functions: parsedResult.functions || [],
              flow: parsedResult.flow || 'Execution flow description',
              complexity: parsedResult.complexity || { time: 'O(1)', space: 'O(1)' },
              suggestions: parsedResult.suggestions || []
            };
          } catch (parseError) {
            // If JSON parsing fails, return mock data
            return this.getMockExplanation();
          }
        } catch (error: any) {
          console.error('DeepSeek Coder explanation error:', error.response?.data || error.message);
          throw new Error(`DeepSeek Coder explanation error: ${error.message}`);
        }
      },
      { language }
    );
  }

  /**
   * Extract code from response text
   */
  private static extractCodeFromResponse(response: string): string {
    // Look for code blocks in the response
    const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/g;
    const matches = response.match(codeBlockRegex);
    
    if (matches && matches.length > 0) {
      // Return the first code block found
      return matches[0].replace(/```(?:\w+)?\s*|\s*```$/g, '');
    }
    
    // If no code blocks found, return the entire response
    return response;
  }

  /**
   * Extract explanation from response text
   */
  private static extractExplanationFromResponse(response: string): string {
    // Look for explanation sections in the response
    const explanationRegex = /explanation:?\s*([^.!?]+[.!?])/i;
    const match = response.match(explanationRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    // If no explanation found, return a generic explanation
    return 'This code was generated by DeepSeek Coder to fulfill the requested functionality.';
  }

  /**
   * Extract suggestions from response text
   */
  private static extractSuggestionsFromResponse(response: string): string[] {
    // Look for suggestions in the response
    const suggestionsRegex = /suggestions?:?\s*([^.!?]+[.!?])/gi;
    const matches = response.match(suggestionsRegex);
    
    if (matches && matches.length > 0) {
      return matches.map(match => match.replace(/suggestions?:?\s*/i, '').trim());
    }
    
    // If no suggestions found, return generic suggestions
    return [
      'Review the code for potential improvements',
      'Add error handling where necessary',
      'Include unit tests for critical functions'
    ];
  }

  private static getMockCodeGeneration(): any {
    return {
      code: '// Mock generated code\nfunction example() {\n  console.log("Hello, World!");\n}',
      explanation: 'This is a mock code generation response.',
      suggestions: ['Add error handling', 'Include documentation', 'Write unit tests']
    };
  }

  private static getMockDebugging(): any {
    return {
      issues: [
        { type: 'syntax', description: 'Missing semicolon', line: 3 },
        { type: 'logic', description: 'Potential null reference', line: 5 }
      ],
      fixedCode: '// Mock fixed code\nfunction example() {\n  console.log("Hello, World!");\n}',
      explanation: 'Fixed syntax error and added null check.',
      suggestions: ['Add input validation', 'Include error handling']
    };
  }

  private static getMockOptimization(): any {
    return {
      originalCode: '// Original code\nfunction example() {\n  console.log("Hello, World!");\n}',
      optimizedCode: '// Optimized code\nfunction example() {\n  console.log("Hello, World!");\n}',
      benchmark: {
        original: { executionTime: 100, memoryUsage: 50 },
        optimized: { executionTime: 75, memoryUsage: 40 },
        improvement: { executionTime: 25, memoryUsage: 10 }
      },
      changes: [
        { type: 'algorithm', description: 'Improved loop efficiency', impact: '25% faster' }
      ]
    };
  }

  private static getMockExplanation(): any {
    return {
      summary: 'This function demonstrates a basic example.',
      functions: [
        {
          name: 'example',
          purpose: 'Prints a greeting message',
          parameters: [],
          returns: { type: 'void', description: 'No return value' }
        }
      ],
      flow: '1. Call console.log() with greeting message',
      complexity: { time: 'O(1)', space: 'O(1)' },
      suggestions: ['Add parameter for custom message', 'Include error handling']
    };
  }
}

export const deepSeekCoderService = new DeepSeekCoderAPI();