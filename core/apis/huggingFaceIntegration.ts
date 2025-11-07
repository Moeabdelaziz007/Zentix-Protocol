/**
 * Hugging Face API Integration
 * Zero-cost AI model inference for text, image, and audio generation
 * 
 * @module huggingFaceIntegration
 * @version 1.0.0
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { AgentLogger, LogLevel } from '../utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * Hugging Face Inference API
 * Rate limit: 30,000 requests/month (free tier)
 * Get API key: https://huggingface.co/settings/tokens
 */
export class HuggingFaceAPI {
  private static readonly BASE_URL = 'https://router.huggingface.co/hf-inference';
  private static apiKey = process.env.HUGGING_FACE_API_KEY || '';

  /**
   * Text generation using Hugging Face models
   */
  static async generateText(prompt: string, model: string = 'gpt2'): Promise<string> {
    return AgentLogger.measurePerformance(
      'HuggingFaceAPI',
      'generateText',
      async () => {
        if (!this.apiKey) {
          // Return mock data when no API key
          return this.getMockText(prompt);
        }

        try {
          const response = await axios.post(
            `${this.BASE_URL}/${model}`,
            { inputs: prompt },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from Hugging Face API');
          }

          // Handle different response formats
          if (typeof response.data === 'string') {
            return response.data;
          } else if (Array.isArray(response.data) && response.data.length > 0) {
            return response.data[0].generated_text || response.data[0];
          } else if (response.data.generated_text) {
            return response.data.generated_text;
          } else {
            throw new Error('Unexpected response format from Hugging Face API');
          }
        } catch (error: any) {
          console.error('Hugging Face Text Generation error:', error.response?.data || error.message);
          throw new Error(`Hugging Face Text Generation error: ${error.message}`);
        }
      },
      { prompt, model }
    );
  }

  /**
   * Text classification using Hugging Face models
   */
  static async classifyText(text: string, model: string = 'facebook/bart-large-mnli'): Promise<Array<{
    label: string;
    score: number;
  }>> {
    return AgentLogger.measurePerformance(
      'HuggingFaceAPI',
      'classifyText',
      async () => {
        if (!this.apiKey) {
          // Return mock data when no API key
          return this.getMockClassification(text);
        }

        try {
          const response = await axios.post(
            `${this.BASE_URL}/${model}`,
            { inputs: text },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from Hugging Face API');
          }

          // Handle different response formats
          if (Array.isArray(response.data) && response.data.length > 0) {
            return response.data[0];
          } else {
            return response.data;
          }
        } catch (error: any) {
          console.error('Hugging Face Text Classification error:', error.response?.data || error.message);
          throw new Error(`Hugging Face Text Classification error: ${error.message}`);
        }
      },
      { text, model }
    );
  }

  /**
   * Image generation using Hugging Face models
   */
  static async generateImage(prompt: string, model: string = 'stabilityai/stable-diffusion-2-1'): Promise<string> {
    return AgentLogger.measurePerformance(
      'HuggingFaceAPI',
      'generateImage',
      async () => {
        if (!this.apiKey) {
          // Return mock data when no API key
          return this.getMockImage(prompt);
        }

        try {
          const response = await axios.post(
            `${this.BASE_URL}/${model}`,
            { inputs: prompt },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              },
              responseType: 'arraybuffer'
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from Hugging Face API');
          }

          // Convert binary image data to base64
          const base64 = Buffer.from(response.data).toString('base64');
          return `data:image/png;base64,${base64}`;
        } catch (error: any) {
          console.error('Hugging Face Image Generation error:', error.response?.data || error.message);
          throw new Error(`Hugging Face Image Generation error: ${error.message}`);
        }
      },
      { prompt, model }
    );
  }

  /**
   * Text-to-speech using Hugging Face models
   */
  static async textToSpeech(text: string, model: string = 'facebook/fastspeech2-en-ljspeech'): Promise<string> {
    return AgentLogger.measurePerformance(
      'HuggingFaceAPI',
      'textToSpeech',
      async () => {
        if (!this.apiKey) {
          // Return mock data when no API key
          return this.getMockAudio(text);
        }

        try {
          const response = await axios.post(
            `${this.BASE_URL}/${model}`,
            { inputs: text },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              },
              responseType: 'arraybuffer'
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from Hugging Face API');
          }

          // Convert binary audio data to base64
          const base64 = Buffer.from(response.data).toString('base64');
          return `data:audio/wav;base64,${base64}`;
        } catch (error: any) {
          console.error('Hugging Face Text-to-Speech error:', error.response?.data || error.message);
          throw new Error(`Hugging Face Text-to-Speech error: ${error.message}`);
        }
      },
      { text, model }
    );
  }

  /**
   * Get list of available models
   */
  static async listModels(filter: string = ''): Promise<Array<{
    id: string;
    pipeline_tag: string;
    downloads: number;
    likes: number;
  }>> {
    return AgentLogger.measurePerformance(
      'HuggingFaceAPI',
      'listModels',
      async () => {
        if (!this.apiKey) {
          // Return mock data when no API key
          return this.getMockModels();
        }

        try {
          const response = await axios.get(
            `https://huggingface.co/api/models`,
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              },
              params: {
                filter: filter,
                limit: 20
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from Hugging Face API');
          }

          return response.data.map((model: any) => ({
            id: model.id,
            pipeline_tag: model.pipeline_tag,
            downloads: model.downloads,
            likes: model.likes
          }));
        } catch (error: any) {
          console.error('Hugging Face List Models error:', error.response?.data || error.message);
          throw new Error(`Hugging Face List Models error: ${error.message}`);
        }
      },
      { filter }
    );
  }

  // Mock data methods
  private static getMockText(prompt: string): string {
    return `This is a mock response for the prompt: "${prompt}". In a real implementation with a Hugging Face API key, this would be generated by an AI model.`;
  }

  private static getMockClassification(text: string): Array<{ label: string; score: number }> {
    return [
      { label: 'positive', score: 0.8 },
      { label: 'negative', score: 0.15 },
      { label: 'neutral', score: 0.05 }
    ];
  }

  private static getMockImage(prompt: string): string {
    // Return a base64 encoded placeholder image
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  }

  private static getMockAudio(text: string): string {
    // Return a base64 encoded placeholder audio
    return 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
  }

  private static getMockModels(): Array<{ id: string; pipeline_tag: string; downloads: number; likes: number }> {
    return [
      { id: 'gpt2', pipeline_tag: 'text-generation', downloads: 1000000, likes: 5000 },
      { id: 'facebook/bart-large-mnli', pipeline_tag: 'zero-shot-classification', downloads: 500000, likes: 3000 },
      { id: 'stabilityai/stable-diffusion-2-1', pipeline_tag: 'text-to-image', downloads: 2000000, likes: 10000 },
      { id: 'facebook/fastspeech2-en-ljspeech', pipeline_tag: 'text-to-speech', downloads: 300000, likes: 2000 }
    ];
  }
}