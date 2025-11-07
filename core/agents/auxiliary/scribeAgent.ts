/**
 * Scribe Agent - Memory and Note Taker
 * Specialized agent for logging important information and saving to vector database
 * 
 * @module scribeAgent
 * @version 1.0.0
 */

import { ZentixAgent } from '../../base/ZentixAgent';
import { AgentLogger, LogLevel } from '../../utils/agentLogger';
import { QdrantService } from '../../services/qdrantService';
import * as crypto from 'crypto';

/**
 * Scribe Agent
 * Takes notes and logs important information to a vector database
 */
export class ScribeAgent extends ZentixAgent {
  private static instance: ScribeAgent;
  private qdrantService: QdrantService;
  private collectionName: string;

  private constructor(collectionName: string = 'knowledge_base') {
    super({
      name: 'Scribe Agent',
      description: 'Specialized agent for logging important information and saving to vector database',
      capabilities: [
        'Knowledge logging',
        'Vector database storage',
        'Information contextualization',
        'Learning from agent interactions'
      ],
      version: '1.0.0'
    });
    
    this.qdrantService = QdrantService.getInstance();
    this.collectionName = collectionName;
  }

  public static getInstance(collectionName?: string): ScribeAgent {
    if (!ScribeAgent.instance) {
      ScribeAgent.instance = new ScribeAgent(collectionName);
    }
    return ScribeAgent.instance;
  }

  /**
   * Initialize the Scribe Agent
   */
  async initialize(): Promise<void> {
    return AgentLogger.measurePerformance(
      'ScribeAgent',
      'initialize',
      async () => {
        try {
          // Initialize Qdrant service
          await this.qdrantService.connect();
          
          // Ensure collection exists
          const collections = await this.qdrantService.listCollections();
          if (!collections.includes(this.collectionName)) {
            await this.qdrantService.createCollection(this.collectionName, 768);
          }
          
          AgentLogger.log(LogLevel.SUCCESS, 'ScribeAgent', 'Scribe Agent initialized');
          this.initialized = true;
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'ScribeAgent', 'Failed to initialize Scribe Agent', {}, error as Error);
          throw error;
        }
      }
    );
  }

  /**
   * Execute a scribe task
   * 
   * @param task - Task to execute
   * @returns Task result
   */
  async executeTask(task: any): Promise<any> {
    // Implementation of the abstract method
    AgentLogger.log(LogLevel.INFO, 'ScribeAgent', 'Executing scribe task', { taskType: task?.type });
    
    // Handle different types of scribe tasks
    switch (task?.type) {
      case 'log_information':
        return await this.logInformation(task.content, task.metadata, task.context);
      case 'retrieve_information':
        return await this.retrieveInformation(task.query, task.limit);
      default:
        throw new Error(`Unknown scribe task type: ${task?.type}`);
    }
  }

  /**
   * Log information to the vector database
   * 
   * @param content - Content to log
   * @param metadata - Additional metadata
   * @param context - Context from the host agent
   */
  async logInformation(content: string, metadata: any = {}, context: any = {}): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'ScribeAgent',
      'logInformation',
      async () => {
        try {
          // Create a knowledge entry
          const knowledgeEntry = {
            content,
            timestamp: new Date().toISOString(),
            metadata: {
              ...metadata,
              agentContext: context,
              source: this.config.name
            }
          };
          
          // Generate a unique ID for this entry
          const entryId = this.generateEntryId(content, metadata);
          
          // In a real implementation, we would embed the content using an embedding model
          // For now, we'll use a mock embedding (768-dimensional vector of random values)
          const mockEmbedding = this.generateMockEmbedding(768);
          
          // Save to vector database
          const success = await this.qdrantService.upsertVectors(this.collectionName, [{
            id: entryId,
            vector: mockEmbedding,
            payload: knowledgeEntry
          }]);
          
          if (success) {
            AgentLogger.log(LogLevel.SUCCESS, 'ScribeAgent', 'Information logged successfully', { entryId });
          } else {
            AgentLogger.log(LogLevel.WARN, 'ScribeAgent', 'Failed to log information', { entryId });
          }
          
          return success;
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'ScribeAgent', 'Failed to log information', { content }, error as Error);
          return false;
        }
      }
    );
  }

  /**
   * Retrieve relevant information from the knowledge base
   * 
   * @param query - Query to search for
   * @param limit - Number of results to return
   * @returns Relevant knowledge entries
   */
  async retrieveInformation(query: string, limit: number = 5): Promise<any[]> {
    return AgentLogger.measurePerformance(
      'ScribeAgent',
      'retrieveInformation',
      async () => {
        try {
          // In a real implementation, we would embed the query using an embedding model
          // For now, we'll use a mock embedding
          const mockQueryEmbedding = this.generateMockEmbedding(768);
          
          // Search the vector database
          const results = await this.qdrantService.search(
            this.collectionName, 
            mockQueryEmbedding, 
            limit
          );
          
          AgentLogger.log(LogLevel.SUCCESS, 'ScribeAgent', 'Information retrieved', { 
            query, 
            resultCount: results.length 
          });
          
          return results.map(result => result.payload);
        } catch (error) {
          AgentLogger.log(LogLevel.ERROR, 'ScribeAgent', 'Failed to retrieve information', { query }, error as Error);
          return [];
        }
      }
    );
  }

  /**
   * Generate a unique entry ID based on content and metadata
   * 
   * @param content - Content of the entry
   * @param metadata - Metadata of the entry
   * @returns Unique entry ID
   */
  private generateEntryId(content: string, metadata: any): string {
    // Simple hash function for demo purposes
    const hash = crypto.createHash('md5');
    hash.update(content + JSON.stringify(metadata));
    return hash.digest('hex');
  }

  /**
   * Generate a mock embedding for demonstration purposes
   * 
   * @param size - Size of the embedding vector
   * @returns Mock embedding vector
   */
  private generateMockEmbedding(size: number): number[] {
    // Generate a vector of random values between -1 and 1
    return Array.from({ length: size }, () => Math.random() * 2 - 1);
  }
}