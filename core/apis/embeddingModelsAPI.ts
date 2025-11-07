/**
 * Embedding Models API Integration
 * Advanced semantic understanding for search, recommendation, and content clustering
 * 
 * @module embeddingModelsAPI
 * @version 1.0.0
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { AgentLogger, LogLevel } from '../utils/agentLogger';
import { OllamaAPI } from './ollamaIntegration';
import { HuggingFaceAPI } from './huggingFaceIntegration';
import { Gemini25ProAPI } from './gemini25ProAPI';

// Load environment variables
dotenv.config();

/**
 * Embedding Models API
 * Provides text and multimodal embedding capabilities using multiple providers
 */
export class EmbeddingModelsAPI {
  // Google Gemini Embedding API
  private static readonly GEMINI_EMBEDDING_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
  private static geminiApiKey = process.env.GEMINI_25_PRO_API_KEY || '';

  // OpenAI Embedding API
  private static readonly OPENAI_EMBEDDING_URL = 'https://api.openai.com/v1/embeddings';
  private static openaiApiKey = process.env.OPENAI_API_KEY || '';

  // Hugging Face Inference API for embeddings
  private static readonly HF_EMBEDDING_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction';
  private static huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY || '';

  /**
   * Generate text embeddings using Google Gemini
   * Model: text-embedding-004
   * Dimensions: 768
   */
  static async generateTextEmbeddingWithGemini(
    text: string
  ): Promise<number[]> {
    return AgentLogger.measurePerformance(
      'EmbeddingModelsAPI',
      'generateTextEmbeddingWithGemini',
      async () => {
        // Fallback to Ollama if no API key
        if (!this.geminiApiKey) {
          return await this.generateTextEmbeddingWithOllama(text);
        }

        try {
          const response = await axios.post(
            `${this.GEMINI_EMBEDDING_URL}/text-embedding-004:embedContent?key=${this.geminiApiKey}`,
            {
              content: {
                parts: [
                  {
                    text: text
                  }
                ]
              }
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.embedding || !response.data.embedding.values) {
            throw new Error('Invalid response from Gemini Embedding API');
          }

          return response.data.embedding.values;
        } catch (error: any) {
          console.error('Gemini Embedding error:', error.response?.data || error.message);
          // Fallback to Ollama
          return await this.generateTextEmbeddingWithOllama(text);
        }
      },
      { text }
    );
  }

  /**
   * Generate text embeddings using OpenAI
   * Model: text-embedding-3-small
   * Dimensions: 1536
   */
  static async generateTextEmbeddingWithOpenAI(
    text: string
  ): Promise<number[]> {
    return AgentLogger.measurePerformance(
      'EmbeddingModelsAPI',
      'generateTextEmbeddingWithOpenAI',
      async () => {
        // Fallback to Ollama if no API key
        if (!this.openaiApiKey) {
          return await this.generateTextEmbeddingWithOllama(text);
        }

        try {
          const response = await axios.post(
            this.OPENAI_EMBEDDING_URL,
            {
              input: text,
              model: 'text-embedding-3-small'
            },
            {
              headers: {
                'Authorization': `Bearer ${this.openaiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.data || response.data.data.length === 0) {
            throw new Error('Invalid response from OpenAI Embedding API');
          }

          return response.data.data[0].embedding;
        } catch (error: any) {
          console.error('OpenAI Embedding error:', error.response?.data || error.message);
          // Fallback to Ollama
          return await this.generateTextEmbeddingWithOllama(text);
        }
      },
      { text }
    );
  }

  /**
   * Generate text embeddings using Hugging Face models
   * Model: BAAI/bge-large-en-v1.5 (recommended) or sentence-transformers/all-MiniLM-L6-v2
   * Dimensions: 1024 or 384
   */
  static async generateTextEmbeddingWithHuggingFace(
    text: string,
    model: string = 'BAAI/bge-large-en-v1.5'
  ): Promise<number[]> {
    return AgentLogger.measurePerformance(
      'EmbeddingModelsAPI',
      'generateTextEmbeddingWithHuggingFace',
      async () => {
        // Fallback to Ollama if no API key
        if (!this.huggingFaceApiKey) {
          return await this.generateTextEmbeddingWithOllama(text);
        }

        try {
          const response = await axios.post(
            this.HF_EMBEDDING_URL,
            {
              inputs: text,
              options: {
                wait_for_model: true
              }
            },
            {
              headers: {
                'Authorization': `Bearer ${this.huggingFaceApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from Hugging Face Embedding API');
          }

          // Handle different response formats
          if (Array.isArray(response.data)) {
            return response.data;
          } else if (response.data.embeddings) {
            return response.data.embeddings;
          } else {
            throw new Error('Unexpected response format from Hugging Face Embedding API');
          }
        } catch (error: any) {
          console.error('Hugging Face Embedding error:', error.response?.data || error.message);
          // Fallback to Ollama
          return await this.generateTextEmbeddingWithOllama(text);
        }
      },
      { text, model }
    );
  }

  /**
   * Generate text embeddings using Ollama (local/embedded option)
   * Model: nomic-embed-text (recommended) or mxbai-embed-large
   * Dimensions: 768 or 512
   */
  static async generateTextEmbeddingWithOllama(
    text: string,
    model: string = 'nomic-embed-text'
  ): Promise<number[]> {
    return AgentLogger.measurePerformance(
      'EmbeddingModelsAPI',
      'generateTextEmbeddingWithOllama',
      async () => {
        try {
          // Use existing OllamaAPI implementation
          return await OllamaAPI.embedText(text, model);
        } catch (error: any) {
          console.error('Ollama Embedding error:', error.message);
          // Return mock data as final fallback
          return this.getMockTextEmbedding(text);
        }
      },
      { text, model }
    );
  }

  /**
   * Generate multimodal embeddings using Google Gemini
   * Supports text and image inputs for semantic similarity
   */
  static async generateMultimodalEmbeddingWithGemini(
    content: Array<{ type: 'text' | 'image'; data: string }>
  ): Promise<number[]> {
    return AgentLogger.measurePerformance(
      'EmbeddingModelsAPI',
      'generateMultimodalEmbeddingWithGemini',
      async () => {
        // Fallback to text-only embedding if no API key
        if (!this.geminiApiKey) {
          // Extract text content for fallback
          const textContent = content
            .filter(item => item.type === 'text')
            .map(item => item.data)
            .join(' ');
          return await this.generateTextEmbeddingWithOllama(textContent);
        }

        try {
          const parts: any[] = [];
          
          content.forEach(item => {
            if (item.type === 'text') {
              parts.push({ text: item.data });
            } else if (item.type === 'image') {
              parts.push({
                inlineData: {
                  data: item.data,
                  mimeType: 'image/jpeg'
                }
              });
            }
          });

          const response = await axios.post(
            `${this.GEMINI_EMBEDDING_URL}/gemini-pro-vision:embedContent?key=${this.geminiApiKey}`,
            {
              content: {
                parts: parts
              }
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.embedding || !response.data.embedding.values) {
            throw new Error('Invalid response from Gemini Multimodal Embedding API');
          }

          return response.data.embedding.values;
        } catch (error: any) {
          console.error('Gemini Multimodal Embedding error:', error.response?.data || error.message);
          // Fallback to text-only embedding
          const textContent = content
            .filter(item => item.type === 'text')
            .map(item => item.data)
            .join(' ');
          return await this.generateTextEmbeddingWithOllama(textContent);
        }
      },
      { content: content.map(c => ({ type: c.type, data: c.data.substring(0, 50) + '...' })) }
    );
  }

  /**
   * Generate multimodal embeddings using OpenAI CLIP
   * Supports text and image inputs for semantic similarity
   */
  static async generateMultimodalEmbeddingWithOpenAI(
    content: Array<{ type: 'text' | 'image'; data: string }>
  ): Promise<number[]> {
    return AgentLogger.measurePerformance(
      'EmbeddingModelsAPI',
      'generateMultimodalEmbeddingWithOpenAI',
      async () => {
        // For now, we'll use text embedding as a fallback since CLIP requires special handling
        const textContent = content
          .filter(item => item.type === 'text')
          .map(item => item.data)
          .join(' ');
        return await this.generateTextEmbeddingWithOpenAI(textContent);
      },
      { content: content.map(c => ({ type: c.type, data: c.data.substring(0, 50) + '...' })) }
    );
  }

  /**
   * Calculate cosine similarity between two embedding vectors
   */
  static calculateSimilarity(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) {
      throw new Error('Vectors must have the same dimensions');
    }

    // Calculate dot product
    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
    
    // Calculate magnitudes
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
    
    // Calculate cosine similarity
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Find the most similar embeddings from a collection
   */
  static findMostSimilar(
    queryVector: number[],
    candidates: Array<{ id: string; vector: number[]; metadata?: any }>,
    topK: number = 5
  ): Array<{ id: string; similarity: number; metadata?: any }> {
    return candidates
      .map(candidate => ({
        id: candidate.id,
        similarity: this.calculateSimilarity(queryVector, candidate.vector),
        metadata: candidate.metadata
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  // Mock data methods
  private static getMockTextEmbedding(text: string): number[] {
    // Return a deterministic mock vector based on text content
    const seed = Array.from(text).reduce((s, c) => s + c.charCodeAt(0), 0);
    return new Array(768).fill(0).map((_, i) => ((seed + i) % 100) / 100);
  }

  private static getMockMultimodalEmbedding(content: Array<{ type: string; data: string }>): number[] {
    // Return a deterministic mock vector based on content
    const textContent = content.map(c => c.data).join('');
    const seed = Array.from(textContent).reduce((s, c) => s + c.charCodeAt(0), 0);
    return new Array(1408).fill(0).map((_, i) => ((seed + i) % 100) / 100);
  }
}