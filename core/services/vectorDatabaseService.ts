/**
 * Vector Database Service
 * Persistent storage and retrieval of embedding vectors for semantic search
 * 
 * @module vectorDatabaseService
 * @version 1.0.0
 */

import { AgentLogger } from '../utils/agentLogger';
import { QdrantService } from './qdrantService';

/**
 * Vector Database Service
 * Provides vector storage and semantic search capabilities using Qdrant
 */
export class VectorDatabaseService {
  private static instance: VectorDatabaseService;
  private qdrantService: QdrantService;
  private isConnected: boolean = false;
  private collections: Set<string> = new Set();

  private constructor() {
    this.qdrantService = QdrantService.getInstance();
  }

  static getInstance(): VectorDatabaseService {
    if (!VectorDatabaseService.instance) {
      VectorDatabaseService.instance = new VectorDatabaseService();
    }
    return VectorDatabaseService.instance;
  }

  /**
   * Connect to vector database (Qdrant)
   */
  async connect(): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'VectorDatabaseService',
      'connect',
      async () => {
        // Connect to Qdrant service
        const qdrantConnected = await this.qdrantService.connect();
        this.isConnected = qdrantConnected;
        
        if (qdrantConnected) {
          console.log('✅ Vector Database connected (Qdrant)');
          // Initialize collections
          await this.initializeCollections();
        } else {
          console.warn('⚠️ Vector Database running in mock mode (in-memory storage)');
        }
        
        return qdrantConnected;
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
    if (!this.collections.has(name)) {
      await this.createCollection(name, vectorSize);
    }
  }

  /**
   * Create a new collection
   * @param name - Collection name
   * @param vectorSize - Size of vectors (default: 768 for most embeddings)
   */
  async createCollection(name: string, vectorSize: number = 768): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'VectorDatabaseService',
      'createCollection',
      async () => {
        if (this.collections.has(name)) {
          return true;
        }

        try {
          // Use Qdrant service to create collection
          const success = await this.qdrantService.createCollection(name, vectorSize);
          if (success) {
            this.collections.add(name);
            console.log(`Created collection: ${name}`);
          }
          return success;
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
      'VectorDatabaseService',
      'upsertVectors',
      async () => {
        if (!this.isConnected) {
          console.warn('Vector database not connected, using mock implementation');
          return this.mockUpsertVectors(collection, points);
        }

        try {
          // Use Qdrant service to upsert vectors
          return await this.qdrantService.upsertVectors(collection, points);
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
      'VectorDatabaseService',
      'search',
      async () => {
        if (!this.isConnected) {
          console.warn('Vector database not connected, using mock implementation');
          return this.mockSearch(collection, vector, limit, filter);
        }

        try {
          // Use Qdrant service to search
          return await this.qdrantService.search(collection, vector, limit, filter);
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
      'VectorDatabaseService',
      'deleteVectors',
      async () => {
        if (!this.isConnected) {
          console.warn('Vector database not connected, using mock implementation');
          return this.mockDeleteVectors(collection, ids);
        }

        try {
          // Use Qdrant service to delete vectors
          return await this.qdrantService.deleteVectors(collection, ids);
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
      'VectorDatabaseService',
      'getVector',
      async () => {
        if (!this.isConnected) {
          console.warn('Vector database not connected, using mock implementation');
          return this.mockGetVector(collection, id);
        }

        try {
          // Use Qdrant service to get vector
          return await this.qdrantService.getVector(collection, id);
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
      'VectorDatabaseService',
      'rag',
      async () => {
        if (!this.isConnected) {
          console.warn('Vector database not connected, using mock implementation');
          return this.mockRag(collection, queryVector, limit);
        }

        try {
          // Use Qdrant service for RAG
          return await this.qdrantService.rag(collection, queryVector, limit);
        } catch (error) {
          console.error(`Error in RAG for ${collection}:`, error);
          return '';
        }
      },
      { collection, vectorLength: queryVector.length, limit }
    );
  }

  /**
   * List all collections
   */
  async listCollections(): Promise<string[]> {
    return AgentLogger.measurePerformance(
      'VectorDatabaseService',
      'listCollections',
      async () => {
        if (!this.isConnected) {
          return Array.from(this.collections);
        }

        try {
          // Use Qdrant service to list collections
          return await this.qdrantService.listCollections();
        } catch (error) {
          console.error('Error listing collections:', error);
          return Array.from(this.collections);
        }
      }
    );
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isConnected;
  }

  // Mock implementations for fallback when Qdrant is not available
  private inMemoryStorage: Map<string, Array<{
    id: string | number;
    vector: number[];
    payload?: Record<string, any>;
  }>> = new Map();

  private mockUpsertVectors(
    collection: string,
    points: Array<{
      id: string | number;
      vector: number[];
      payload?: Record<string, any>;
    }>
  ): boolean {
    try {
      // Get or create collection storage
      let collectionStorage = this.inMemoryStorage.get(collection);
      if (!collectionStorage) {
        collectionStorage = [];
        this.inMemoryStorage.set(collection, collectionStorage);
        this.collections.add(collection);
      }

      // Upsert each point
      for (const point of points) {
        // Check if point already exists
        const existingIndex = collectionStorage.findIndex(p => p.id === point.id);
        
        if (existingIndex >= 0) {
          // Update existing point
          collectionStorage[existingIndex] = point;
        } else {
          // Add new point
          collectionStorage.push(point);
        }
      }

      console.log(`[MOCK] Upserted ${points.length} vectors to ${collection}`);
      return true;
    } catch (error) {
      console.error(`[MOCK] Error upserting vectors to ${collection}:`, error);
      return false;
    }
  }

  private mockSearch(
    collection: string,
    vector: number[],
    limit: number = 10,
    filter?: Record<string, any>
  ): Array<{
    id: string | number;
    score: number;
    payload?: Record<string, any>;
  }> {
    try {
      const collectionStorage = this.inMemoryStorage.get(collection);
      if (!collectionStorage) {
        return [];
      }

      // Calculate similarity scores for all points
      const scoredPoints = collectionStorage
        .map(point => {
          // Apply filter if provided
          if (filter) {
            let matchesFilter = true;
            for (const [key, value] of Object.entries(filter)) {
              if (!point.payload || point.payload[key] !== value) {
                matchesFilter = false;
                break;
              }
            }
            if (!matchesFilter) return null;
          }

          const score = this.calculateCosineSimilarity(vector, point.vector);
          return {
            id: point.id,
            score,
            payload: point.payload
          };
        })
        .filter(point => point !== null) as Array<{
          id: string | number;
          score: number;
          payload?: Record<string, any>;
        }>;

      // Sort by score (descending) and limit results
      scoredPoints.sort((a, b) => b.score - a.score);
      
      return scoredPoints.slice(0, limit);
    } catch (error) {
      console.error(`[MOCK] Error searching in ${collection}:`, error);
      return [];
    }
  }

  private mockDeleteVectors(collection: string, ids: Array<string | number>): boolean {
    try {
      const collectionStorage = this.inMemoryStorage.get(collection);
      if (!collectionStorage) {
        return false;
      }

      // Filter out points with matching IDs
      const filteredStorage = collectionStorage.filter(point => !ids.includes(point.id));
      this.inMemoryStorage.set(collection, filteredStorage);

      console.log(`[MOCK] Deleted ${ids.length} vectors from ${collection}`);
      return true;
    } catch (error) {
      console.error(`[MOCK] Error deleting vectors from ${collection}:`, error);
      return false;
    }
  }

  private mockGetVector(collection: string, id: string | number): {
    id: string | number;
    vector: number[];
    payload?: Record<string, any>;
  } | null {
    try {
      const collectionStorage = this.inMemoryStorage.get(collection);
      if (!collectionStorage) {
        return null;
      }

      const point = collectionStorage.find(p => p.id === id);
      return point || null;
    } catch (error) {
      console.error(`[MOCK] Error retrieving vector from ${collection}:`, error);
      return null;
    }
  }

  private mockRag(
    collection: string,
    queryVector: number[],
    limit: number = 5
  ): string {
    const results = this.mockSearch(collection, queryVector, limit);

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
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private calculateCosineSimilarity(vector1: number[], vector2: number[]): number {
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
}