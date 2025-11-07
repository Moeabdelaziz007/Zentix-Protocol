/**
 * Ollama Local AI Model Integration
 * Zero-cost local AI model inference for text generation
 * 
 * @module ollamaIntegration
 * @version 1.0.0
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { AgentLogger, LogLevel } from '../utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * Ollama Local AI API
 * Run local AI models on user's machine
 * Get Ollama: https://ollama.com/
 */
export class OllamaAPI {
  // Default Ollama endpoint (can be overridden with environment variable)
  private static readonly BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  private static readonly DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL || 'llama2';

  /**
   * Check if Ollama is running locally
   */
  static async isOllamaRunning(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.BASE_URL}/api/tags`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.log('Ollama is not running locally');
      return false;
    }
  }

  /**
   * Get list of available local models
   */
  static async listModels(): Promise<Array<{
    name: string;
    model: string;
    modified_at: string;
    size: number;
    digest: string;
    details: any;
  }>> {
    return AgentLogger.measurePerformance(
      'OllamaAPI',
      'listModels',
      async () => {
        // Check if Ollama is running
        const isRunning = await this.isOllamaRunning();
        if (!isRunning) {
          // Return mock data when Ollama is not running
          return this.getMockModels();
        }

        try {
          const response = await axios.get(`${this.BASE_URL}/api/tags`);
          
          if (!response.data || !response.data.models) {
            throw new Error('Invalid response from Ollama API');
          }

          return response.data.models;
        } catch (error: any) {
          console.error('Ollama List Models error:', error.response?.data || error.message);
          // Return mock data on error
          return this.getMockModels();
        }
      }
    );
  }

  /**
   * Generate text using local Ollama models
   */
  static async generateText(prompt: string, model: string = this.DEFAULT_MODEL, options: {
    temperature?: number;
    max_tokens?: number;
    stop?: string[];
  } = {}): Promise<string> {
    return AgentLogger.measurePerformance(
      'OllamaAPI',
      'generateText',
      async () => {
        // Check if Ollama is running
        const isRunning = await this.isOllamaRunning();
        if (!isRunning) {
          // Return mock data when Ollama is not running
          return this.getMockText(prompt);
        }

        try {
          const response = await axios.post(
            `${this.BASE_URL}/api/generate`,
            {
              model: model,
              prompt: prompt,
              stream: false,
              options: {
                temperature: options.temperature || 0.7,
                num_predict: options.max_tokens || 2048,
                stop: options.stop || []
              }
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.response) {
            throw new Error('Invalid response from Ollama API');
          }

          return response.data.response;
        } catch (error: any) {
          console.error('Ollama Text Generation error:', error.response?.data || error.message);
          // Return mock data on error
          return this.getMockText(prompt);
        }
      },
      { prompt, model, options }
    );
  }

  /**
   * Chat with local Ollama models
   */
  static async chat(messages: Array<{role: string; content: string}>, model: string = this.DEFAULT_MODEL, options: {
    temperature?: number;
    max_tokens?: number;
  } = {}): Promise<string> {
    return AgentLogger.measurePerformance(
      'OllamaAPI',
      'chat',
      async () => {
        // Check if Ollama is running
        const isRunning = await this.isOllamaRunning();
        if (!isRunning) {
          // Return mock data when Ollama is not running
          return this.getMockChat(messages);
        }

        try {
          const response = await axios.post(
            `${this.BASE_URL}/api/chat`,
            {
              model: model,
              messages: messages,
              stream: false,
              options: {
                temperature: options.temperature || 0.7,
                num_predict: options.max_tokens || 2048
              }
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.message || !response.data.message.content) {
            throw new Error('Invalid response from Ollama API');
          }

          return response.data.message.content;
        } catch (error: any) {
          console.error('Ollama Chat error:', error.response?.data || error.message);
          // Return mock data on error
          return this.getMockChat(messages);
        }
      },
      { messages, model, options }
    );
  }

  /**
   * Embed text using local Ollama models
   */
  static async embedText(text: string, model: string = 'nomic-embed-text'): Promise<number[]> {
    return AgentLogger.measurePerformance(
      'OllamaAPI',
      'embedText',
      async () => {
        // Check if Ollama is running
        const isRunning = await this.isOllamaRunning();
        if (!isRunning) {
          // Return mock data when Ollama is not running
          return this.getMockEmbedding(text);
        }

        try {
          const response = await axios.post(
            `${this.BASE_URL}/api/embeddings`,
            {
              model: model,
              prompt: text
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.embedding) {
            throw new Error('Invalid response from Ollama API');
          }

          return response.data.embedding;
        } catch (error: any) {
          console.error('Ollama Embedding error:', error.response?.data || error.message);
          // Return mock data on error
          return this.getMockEmbedding(text);
        }
      },
      { text, model }
    );
  }

  // Mock data methods
  private static getMockModels(): Array<{ name: string; model: string; modified_at: string; size: number; digest: string; details: any }> {
    return [
      {
        name: 'llama2:latest',
        model: 'llama2:latest',
        modified_at: new Date().toISOString(),
        size: 3825819519,
        digest: 'sha256:7851446982d0290095de197425003191e4ab020862ec166130871f154439130d',
        details: {
          parent_model: '',
          format: 'gguf',
          family: 'llama',
          families: ['llama'],
          parameter_size: '7B',
          quantization_level: 'Q4_0'
        }
      },
      {
        name: 'mistral:latest',
        model: 'mistral:latest',
        modified_at: new Date().toISOString(),
        size: 4108922828,
        digest: 'sha256:6152938b79730077c31741365a0524e6270093089605a02a1f1d7f174b40f4fa',
        details: {
          parent_model: '',
          format: 'gguf',
          family: 'llama',
          families: ['llama'],
          parameter_size: '7B',
          quantization_level: 'Q4_0'
        }
      },
      {
        name: 'nomic-embed-text:latest',
        model: 'nomic-embed-text:latest',
        modified_at: new Date().toISOString(),
        size: 274980298,
        digest: 'sha256:9d19f2d3f6961d78e56b337357c1202b54dc738c0b109a68e0b2173b5f7b63d4',
        details: {
          parent_model: '',
          format: 'gguf',
          family: 'nomic-bert',
          families: ['nomic-bert'],
          parameter_size: '137M',
          quantization_level: 'Q4_0'
        }
      }
    ];
  }

  private static getMockText(prompt: string): string {
    return `This is a mock response for the prompt: "${prompt}". In a real implementation with Ollama running locally, this would be generated by a local AI model.`;
  }

  private static getMockChat(messages: Array<{role: string; content: string}>): string {
    const lastMessage = messages[messages.length - 1];
    return `This is a mock response to: "${lastMessage.content}". In a real implementation with Ollama running locally, this would be generated by a local AI model.`;
  }

  private static getMockEmbedding(text: string): number[] {
    // Return a mock 768-dimensional embedding vector
    return Array(768).fill(0).map(() => Math.random() * 2 - 1);
  }
}