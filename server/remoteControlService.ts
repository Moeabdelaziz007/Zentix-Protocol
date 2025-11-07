/**
 * Remote Control Service
 * System control using Gemini Computer Controller API
 * 
 * @module remoteControlService
 * @version 1.0.0
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { AgentLogger } from '../core/utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * Remote Control Service
 * Enables system control through natural language commands
 */
export class RemoteControlService {
  // Gemini Computer Controller API configuration
  private static readonly GEMINI_CONTROLLER_URL = 'https://gemini-controller.googleapis.com/v1';
  private static geminiApiKey = process.env.GEMINI_COMPUTER_CONTROLLER_API_KEY || '';

  /**
   * Execute a natural language command using Gemini Computer Controller
   * @param command Natural language command
   * @param sessionId Session identifier for continuity
   * @returns Execution result
   */
  static async executeCommand(
    command: string,
    sessionId?: string
  ): Promise<{
    success: boolean;
    actionSequence: Array<{
      type: 'click' | 'type' | 'navigate' | 'wait' | 'screenshot';
      target?: string;
      content?: string;
      duration?: number;
      result?: string;
    }>;
    finalState: string;
    sessionId: string;
    confidence: number;
  }> {
    return AgentLogger.measurePerformance(
      'RemoteControlService',
      'executeCommand',
      async () => {
        if (!this.geminiApiKey) {
          throw new Error('GEMINI_COMPUTER_CONTROLLER_API_KEY is not configured');
        }

        try {
          const response = await axios.post(
            `${this.GEMINI_CONTROLLER_URL}/execute`,
            {
              command,
              session_id: sessionId
            },
            {
              headers: {
                'Authorization': `Bearer ${this.geminiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from Gemini Computer Controller API');
          }

          return response.data;
        } catch (error: any) {
          console.error('Gemini Computer Controller API error:', error.response?.data || error.message);
          throw new Error(`Gemini Computer Controller API error: ${error.message}`);
        }
      },
      { hasSessionId: !!sessionId }
    );
  }

  /**
   * Get the current state of the system
   * @param sessionId Session identifier
   * @returns Current system state
   */
  static async getSystemState(
    sessionId: string
  ): Promise<{
    screenDescription: string;
    activeWindow: string;
    availableActions: string[];
    sessionId: string;
  }> {
    return AgentLogger.measurePerformance(
      'RemoteControlService',
      'getSystemState',
      async () => {
        if (!this.geminiApiKey) {
          throw new Error('GEMINI_COMPUTER_CONTROLLER_API_KEY is not configured');
        }

        try {
          const response = await axios.post(
            `${this.GEMINI_CONTROLLER_URL}/state`,
            {
              session_id: sessionId
            },
            {
              headers: {
                'Authorization': `Bearer ${this.geminiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from Gemini Computer Controller API');
          }

          return response.data;
        } catch (error: any) {
          console.error('Gemini Computer Controller API error:', error.response?.data || error.message);
          throw new Error(`Gemini Computer Controller API error: ${error.message}`);
        }
      },
      { sessionId }
    );
  }

  /**
   * Take a screenshot of the current screen
   * @param sessionId Session identifier
   * @returns Screenshot data
   */
  static async takeScreenshot(
    sessionId: string
  ): Promise<{
    image: string; // Base64 encoded image
    timestamp: string;
    sessionId: string;
  }> {
    return AgentLogger.measurePerformance(
      'RemoteControlService',
      'takeScreenshot',
      async () => {
        if (!this.geminiApiKey) {
          throw new Error('GEMINI_COMPUTER_CONTROLLER_API_KEY is not configured');
        }

        try {
          const response = await axios.post(
            `${this.GEMINI_CONTROLLER_URL}/screenshot`,
            {
              session_id: sessionId
            },
            {
              headers: {
                'Authorization': `Bearer ${this.geminiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from Gemini Computer Controller API');
          }

          return response.data;
        } catch (error: any) {
          console.error('Gemini Computer Controller API error:', error.response?.data || error.message);
          throw new Error(`Gemini Computer Controller API error: ${error.message}`);
        }
      },
      { sessionId }
    );
  }

  /**
   * Start a new control session
   * @returns Session identifier
   */
  static async startSession(): Promise<{
    sessionId: string;
    timestamp: string;
  }> {
    return AgentLogger.measurePerformance(
      'RemoteControlService',
      'startSession',
      async () => {
        if (!this.geminiApiKey) {
          throw new Error('GEMINI_COMPUTER_CONTROLLER_API_KEY is not configured');
        }

        try {
          const response = await axios.post(
            `${this.GEMINI_CONTROLLER_URL}/session`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${this.geminiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from Gemini Computer Controller API');
          }

          return response.data;
        } catch (error: any) {
          console.error('Gemini Computer Controller API error:', error.response?.data || error.message);
          throw new Error(`Gemini Computer Controller API error: ${error.message}`);
        }
      }
    );
  }

  /**
   * End a control session
   * @param sessionId Session identifier
   * @returns Success status
   */
  static async endSession(
    sessionId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return AgentLogger.measurePerformance(
      'RemoteControlService',
      'endSession',
      async () => {
        if (!this.geminiApiKey) {
          throw new Error('GEMINI_COMPUTER_CONTROLLER_API_KEY is not configured');
        }

        try {
          const response = await axios.delete(
            `${this.GEMINI_CONTROLLER_URL}/session/${sessionId}`,
            {
              headers: {
                'Authorization': `Bearer ${this.geminiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from Gemini Computer Controller API');
          }

          return response.data;
        } catch (error: any) {
          console.error('Gemini Computer Controller API error:', error.response?.data || error.message);
          throw new Error(`Gemini Computer Controller API error: ${error.message}`);
        }
      },
      { sessionId }
    );
  }

  /**
   * Describe the current screen for accessibility
   * @param sessionId Session identifier
   * @returns Screen description
   */
  static async describeScreen(
    sessionId: string
  ): Promise<{
    description: string;
    elements: Array<{
      type: string;
      label: string;
      position: { x: number; y: number };
    }>;
    actions: string[];
    sessionId: string;
  }> {
    return AgentLogger.measurePerformance(
      'RemoteControlService',
      'describeScreen',
      async () => {
        if (!this.geminiApiKey) {
          throw new Error('GEMINI_COMPUTER_CONTROLLER_API_KEY is not configured');
        }

        try {
          const response = await axios.post(
            `${this.GEMINI_CONTROLLER_URL}/describe`,
            {
              session_id: sessionId
            },
            {
              headers: {
                'Authorization': `Bearer ${this.geminiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data) {
            throw new Error('Invalid response from Gemini Computer Controller API');
          }

          return response.data;
        } catch (error: any) {
          console.error('Gemini Computer Controller API error:', error.response?.data || error.message);
          throw new Error(`Gemini Computer Controller API error: ${error.message}`);
        }
      },
      { sessionId }
    );
  }
}