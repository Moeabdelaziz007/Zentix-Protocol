/**
 * Qdrant Vector Database Service
 * Persistent storage and retrieval of embedding vectors for semantic search
 * 
 * @module qdrantService
 * @version 1.0.0
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
import { AgentLogger } from '../utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * Qdrant Service
 * Provides vector storage and semantic search capabilities
 */
export class QdrantService {
  private static instance: QdrantService;
  private client: QdrantClient | null = null;
  private isConnected: boolean = false;
  private collections: Set<string> = new Set();

  private constructor() {}

  static getInstance(): QdrantService {
    if (!QdrantService.instance) {
      QdrantService.instance = new QdrantService();
    }
    return QdrantService.instance;
  }

  /**
   * Connect to Qdrant server
   */
  async connect(): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'QdrantService',
      'connect',
      async () => {
        try {
          const url = process.env.QDRANT_URL;
          const apiKey = process.env.QDRANT_API_KEY;

          if (!url) {
            console.warn('⚠️ Qdrant URL not configured. Running in mock mode.');
            return false;
          }

          this.client = new QdrantClient({
            url,
            apiKey,
          });

          // Test connection
          await this.client.getCollections();
          
          this.isConnected = true;
          console.log('✅ Qdrant connected');
          
          // Initialize collections
          await this.initializeCollections();
          
          return true;
        } catch (error) {
          console.error('Failed to connect to Qdrant:', error);
          console.warn('Continuing without vector search capabilities');
          return false;
        }
      }
    );
  }

  /**
   * Initialize default collections
   */
  private async initializeCollections() {
    const defaultCollections = [
      { name: 'cognito_sphere', vectorSize: 768 },
      { name: 'smart_search', vectorSize: 768 },
      { name: 'creator_studio', vectorSize: 1408 }, // Multimodal embeddings
      { name: 'knowledge_base', vectorSize: 768 },
    ];

    for (const collection of defaultCollections) {
      await this.createCollectionIfNotExists(collection.name, collection.vectorSize);
    }
  }

  /**
   * Create a collection if it doesn't exist
   */
  private async createCollectionIfNotExists(name: string, vectorSize: number = 768) {
    if (!this.isConnected || !this.client) return;

    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(c => c.name === name);

      if (!exists) {
        await this.client.createCollection(name, {
          vectors: {
            size: vectorSize,
            distance: 'Cosine',
          },
        });
        console.log(`Created Qdrant collection: ${name}`);
      }

      this.collections.add(name);
    } catch (error) {
      console.error(`Error creating collection ${name}:`, error);
    }
  }

  /**
   * Create a new collection
   * @param name - Collection name
   * @param vectorSize - Size of vectors (default: 768 for most embeddings)
   */
  async createCollection(name: string, vectorSize: number = 768): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'QdrantService',
      'createCollection',
      async () => {
        if (!this.isConnected || !this.client) {
          console.warn('Qdrant not connected');
          return false;
        }

        try {
          await this.client.createCollection(name, {
            vectors: {
              size: vectorSize,
              distance: 'Cosine', // Cosine similarity for semantic search
            },
          });

          this.collections.add(name);
          console.log(`Created collection: ${name}`);
          return true;
        } catch (error) {
          console.error(`Error creating collection ${name}:`, error);
          return false;
        }
      },
      { name, vectorSize }
    );
  }

  /**
   * Upsert vectors into a collection
   * @param collection - Collection name
   * @param points - Array of points with id, vector, and optional payload
   */
  async upsertVectors(
    collection: string,
    points: Array<{
      id: string | number;
      vector: number[];
      payload?: Record<string, any>;
    }>
  ): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'QdrantService',
      'upsertVectors',
      async () => {
        if (!this.isConnected || !this.client) {
          return false;
        }

        try {
          await this.client.upsert(collection, {
            points,
          });

          console.log(`Upserted ${points.length} vectors to ${collection}`);
          return true;
        } catch (error) {
          console.error(`Error upserting vectors to ${collection}:`, error);
          return false;
        }
      },
      { collection, pointsCount: points.length }
    );
  }

  /**
   * Perform semantic search
   * @param collection - Collection name
   * @param vector - Query vector
   * @param limit - Number of results (default: 10)
   * @param filter - Optional filter conditions
   * @returns Search results with scores
   */
  async search(
    collection: string,
    vector: number[],
    limit: number = 10,
    filter?: Record<string, any>
  ): Promise<Array<{
    id: string | number;
    score: number;
    payload?: Record<string, any>;
  }>> {
    return AgentLogger.measurePerformance(
      'QdrantService',
      'search',
      async () => {
        if (!this.isConnected || !this.client) {
          return [];
        }

        try {
          const searchParams: any = {
            vector,
            limit,
          };

          if (filter) {
            searchParams.filter = filter;
          }

          const results = await this.client.search(collection, searchParams);
          
          return results.map(result => ({
            id: result.id,
            score: result.score,
            payload: result.payload
          }));
        } catch (error) {
          console.error(`Error searching in ${collection}:`, error);
          return [];
        }
      },
      { collection, vectorLength: vector.length, limit, hasFilter: !!filter }
    );
  }

  /**
   * Delete vectors by ID
   * @param collection - Collection name
   * @param ids - Array of IDs to delete
   */
  async deleteVectors(collection: string, ids: Array<string | number>): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'QdrantService',
      'deleteVectors',
      async () => {
        if (!this.isConnected || !this.client) {
          return false;
        }

        try {
          await this.client.delete(collection, {
            points: ids,
          });

          console.log(`Deleted ${ids.length} vectors from ${collection}`);
          return true;
        } catch (error) {
          console.error(`Error deleting vectors from ${collection}:`, error);
          return false;
        }
      },
      { collection, idsCount: ids.length }
    );
  }

  /**
   * Get a vector by ID
   * @param collection - Collection name
   * @param id - Vector ID
   */
  async getVector(collection: string, id: string | number): Promise<{
    id: string | number;
    vector: number[];
    payload?: Record<string, any>;
  } | null> {
    return AgentLogger.measurePerformance(
      'QdrantService',
      'getVector',
      async () => {
        if (!this.isConnected || !this.client) {
          return null;
        }

        try {
          const results = await this.client.retrieve(collection, {
            ids: [id],
            with_vector: true,
            with_payload: true,
          });

          if (results.length === 0) return null;

          const result = results[0];
          return {
            id: result.id,
            vector: Array.isArray(result.vector) ? result.vector : [],
            payload: result.payload,
          };
        } catch (error) {
          console.error(`Error retrieving vector from ${collection}:`, error);
          return null;
        }
      },
      { collection, id }
    );
  }

  /**
   * RAG (Retrieval Augmented Generation)
   * Retrieve relevant context for a query
   * 
   * @param collection - Collection to search
   * @param queryVector - Embedded query vector
   * @param limit - Number of context items (default: 5)
   * @returns Context text for prompt augmentation
   */
  async rag(
    collection: string,
    queryVector: number[],
    limit: number = 5
  ): Promise<string> {
    return AgentLogger.measurePerformance(
      'QdrantService',
      'rag',
      async () => {
        const results = await this.search(collection, queryVector, limit);

        if (results.length === 0) {
          return '';
        }

        // Combine relevant context
        const context = results
          .map((r, idx) => {
            const text = r.payload?.text || r.payload?.content || '';
            const source = r.payload?.source || 'Unknown';
            return `[${idx + 1}] (Source: ${source}, Relevance: ${r.score.toFixed(2)})\n${text}`;
          })
          .join('\n\n');

        return context;
      },
      { collection, vectorLength: queryVector.length, limit }
    );
  }

  /**
   * List all collections
   */
  async listCollections(): Promise<string[]> {
    return AgentLogger.measurePerformance(
      'QdrantService',
      'listCollections',
      async () => {
        if (!this.isConnected || !this.client) {
          return [];
        }

        try {
          const result = await this.client.getCollections();
          return result.collections.map(c => c.name);
        } catch (error) {
          console.error('Error listing collections:', error);
          return [];
        }
      }
    );
  }

  /**
   * Delete a collection
   * @param name - Collection name
   */
  async deleteCollection(name: string): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'QdrantService',
      'deleteCollection',
      async () => {
        if (!this.isConnected || !this.client) {
          return false;
        }

        try {
          await this.client.deleteCollection(name);
          this.collections.delete(name);
          console.log(`Deleted collection: ${name}`);
          return true;
        } catch (error) {
          console.error(`Error deleting collection ${name}:`, error);
          return false;
        }
      },
      { name }
    );
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isConnected;
  }
}