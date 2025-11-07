/**
 * CognitoSphere Embeddings Integration
 * Semantic memory and intelligent note-taking using embedding models
 * 
 * @module cognitoSphereEmbeddings
 * @version 1.0.0
 */

import { EmbeddingModelsAPI } from '../apis/embeddingModelsAPI';
import { VectorDatabaseService } from '../services/vectorDatabaseService';
import { AgentLogger } from '../utils/agentLogger';
import { RedisService } from '../services/redisService';

/**
 * CognitoSphere Embeddings Service
 * Enhances CognitoSphere with semantic understanding and intelligent search
 */
export class CognitoSphereEmbeddings {
  private static readonly COLLECTION_NAME = 'cognito_sphere';
  private static readonly CACHE_TTL = 3600; // 1 hour
  private vectorDb: VectorDatabaseService;
  private redisService: RedisService;

  constructor() {
    this.vectorDb = VectorDatabaseService.getInstance();
    this.redisService = RedisService.getInstance();
  }

  private getCollectionName(): string {
    return CognitoSphereEmbeddings.COLLECTION_NAME;
  }

  /**
   * Save a note or webpage with semantic embeddings
   * @param id - Unique identifier for the content
   * @param content - Text content to save
   * @param metadata - Additional metadata (tags, source, etc.)
   */
  async saveContentWithEmbedding(
    id: string,
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'CognitoSphereEmbeddings',
      'saveContentWithEmbedding',
      async () => {
        try {
          // Generate embedding using the best available model
          const embedding = await EmbeddingModelsAPI.generateTextEmbeddingWithGemini(content);
          
          // Prepare metadata
          const payload = {
            content,
            timestamp: new Date().toISOString(),
            ...metadata
          };

          // Store in vector database
          const success = await this.vectorDb.upsertVectors(this.getCollectionName(), [
            {
              id,
              vector: embedding,
              payload
            }
          ]);

          // Invalidate cache for this content
          await this.redisService.delete(`cognitosphere:content:${id}`);
          await this.redisService.invalidate(`cognitosphere:search:*`);

          if (success) {
            console.log(`✅ Saved content with embedding: ${id}`);
          } else {
            console.error(`❌ Failed to save content with embedding: ${id}`);
          }

          return success;
        } catch (error) {
          console.error('Error saving content with embedding:', error);
          return false;
        }
      },
      { id, contentLength: content.length, metadataKeys: Object.keys(metadata) }
    );
  }

  /**
   * Search for semantically similar content
   * @param query - Search query
   * @param limit - Number of results to return
   * @param filter - Optional filters
   */
  async searchSimilarContent(
    query: string,
    limit: number = 10,
    filter?: Record<string, any>
  ): Promise<Array<{
    id: string;
    content: string;
    similarity: number;
    metadata?: Record<string, any>;
  }>> {
    return AgentLogger.measurePerformance(
      'CognitoSphereEmbeddings',
      'searchSimilarContent',
      async () => {
        try {
          // Check cache first
          const cacheKey = `cognitosphere:search:${query}:${limit}:${JSON.stringify(filter || {})}`;
          const cachedResult = await this.redisService.get(cacheKey);
          if (cachedResult) {
            console.log('✅ Returning cached search results');
            return cachedResult as Array<{
              id: string;
              content: string;
              similarity: number;
              metadata?: Record<string, any>;
            }>;
          }

          // Generate embedding for the query
          const queryEmbedding = await EmbeddingModelsAPI.generateTextEmbeddingWithGemini(query);
          
          // Search in vector database
          const results = await this.vectorDb.search(
            this.getCollectionName(),
            queryEmbedding,
            limit,
            filter
          );

          // Format results
          const formattedResults = results.map(result => ({
            id: result.id.toString(),
            content: result.payload?.content || '',
            similarity: result.score,
            metadata: result.payload
          }));

          // Cache results
          await this.redisService.cache(cacheKey, formattedResults, CognitoSphereEmbeddings.CACHE_TTL);

          return formattedResults;
        } catch (error) {
          console.error('Error searching similar content:', error);
          return [];
        }
      },
      { query, limit, hasFilter: !!filter }
    );
  }

  /**
   * Find related content based on existing content
   * @param contentId - ID of existing content
   * @param limit - Number of related items to return
   */
  async findRelatedContent(
    contentId: string,
    limit: number = 5
  ): Promise<Array<{
    id: string;
    content: string;
    similarity: number;
    metadata?: Record<string, any>;
  }>> {
    return AgentLogger.measurePerformance(
      'CognitoSphereEmbeddings',
      'findRelatedContent',
      async () => {
        try {
          // Check cache first
          const cacheKey = `cognitosphere:related:${contentId}:${limit}`;
          const cachedResult = await this.redisService.get(cacheKey);
          if (cachedResult) {
            console.log('✅ Returning cached related content');
            return cachedResult as Array<{
              id: string;
              content: string;
              similarity: number;
              metadata?: Record<string, any>;
            }>;
          }

          // Get the existing content
          const existingContent = await this.vectorDb.getVector(this.getCollectionName(), contentId);
          if (!existingContent) {
            console.warn(`Content not found: ${contentId}`);
            return [];
          }

          // Search for similar content
          const results = await this.vectorDb.search(
            this.getCollectionName(),
            existingContent.vector,
            limit + 1 // +1 to exclude the original content
          );

          // Filter out the original content and format results
          const formattedResults = results
            .filter(result => result.id.toString() !== contentId)
            .map(result => ({
              id: result.id.toString(),
              content: result.payload?.content || '',
              similarity: result.score,
              metadata: result.payload
            }))
            .slice(0, limit);

          // Cache results
          await this.redisService.cache(cacheKey, formattedResults, CognitoSphereEmbeddings.CACHE_TTL);

          return formattedResults;
        } catch (error) {
          console.error('Error finding related content:', error);
          return [];
        }
      },
      { contentId, limit }
    );
  }

  /**
   * Get content by ID with caching
   * @param id - Content ID
   */
  async getContentById(id: string): Promise<{
    id: string;
    content: string;
    metadata?: Record<string, any>;
  } | null> {
    return AgentLogger.measurePerformance(
      'CognitoSphereEmbeddings',
      'getContentById',
      async () => {
        try {
          // Check cache first
          const cacheKey = `cognitosphere:content:${id}`;
          const cachedResult = await this.redisService.get(cacheKey);
          if (cachedResult) {
            console.log('✅ Returning cached content');
            return cachedResult as {
              id: string;
              content: string;
              metadata?: Record<string, any>;
            };
          }

          // Get from vector database
          const result = await this.vectorDb.getVector(this.getCollectionName(), id);
          if (!result) {
            return null;
          }

          const formattedResult = {
            id: result.id.toString(),
            content: result.payload?.content || '',
            metadata: result.payload
          };

          // Cache result
          await this.redisService.cache(cacheKey, formattedResult, CognitoSphereEmbeddings.CACHE_TTL);

          return formattedResult;
        } catch (error) {
          console.error('Error getting content by ID:', error);
          return null;
        }
      },
      { id }
    );
  }

  /**
   * Cluster similar content together
   * @param threshold - Similarity threshold for clustering (0.0 - 1.0)
   */
  async clusterContent(
    threshold: number = 0.7
  ): Promise<Array<{
    clusterId: string;
    items: Array<{
      id: string;
      content: string;
      metadata?: Record<string, any>;
    }>;
  }>> {
    return AgentLogger.measurePerformance(
      'CognitoSphereEmbeddings',
      'clusterContent',
      async () => {
        try {
          // Check cache first
          const cacheKey = `cognitosphere:clusters:${threshold}`;
          const cachedResult = await this.redisService.get(cacheKey);
          if (cachedResult) {
            console.log('✅ Returning cached clusters');
            return cachedResult as Array<{
              clusterId: string;
              items: Array<{
                id: string;
                content: string;
                metadata?: Record<string, any>;
              }>;
            }>;
          }

          // This is a simplified clustering algorithm
          // In a real implementation, you might use more sophisticated methods
          
          console.log('Content clustering not fully implemented in this mock version');
          const result: Array<{
            clusterId: string;
            items: Array<{
              id: string;
              content: string;
              metadata?: Record<string, any>;
            }>;
          }> = [];
          
          // Cache result
          await this.redisService.cache(cacheKey, result, CognitoSphereEmbeddings.CACHE_TTL);

          return result;
        } catch (error) {
          console.error('Error clustering content:', error);
          return [];
        }
      },
      { threshold }
    );
  }

  /**
   * Get content recommendations based on user interests
   * @param userProfile - User's interest profile
   * @param limit - Number of recommendations
   */
  async recommendContent(
    userProfile: string,
    limit: number = 5
  ): Promise<Array<{
    id: string;
    content: string;
    relevance: number;
    metadata?: Record<string, any>;
  }>> {
    return AgentLogger.measurePerformance(
      'CognitoSphereEmbeddings',
      'recommendContent',
      async () => {
        try {
          // Check cache first
          const cacheKey = `cognitosphere:recommendations:${userProfile.length}:${limit}`;
          const cachedResult = await this.redisService.get(cacheKey);
          if (cachedResult) {
            console.log('✅ Returning cached recommendations');
            return cachedResult as Array<{
              id: string;
              content: string;
              relevance: number;
              metadata?: Record<string, any>;
            }>;
          }

          // Generate embedding for user profile
          const profileEmbedding = await EmbeddingModelsAPI.generateTextEmbeddingWithGemini(userProfile);
          
          // Search for relevant content
          const results = await this.vectorDb.search(
            this.getCollectionName(),
            profileEmbedding,
            limit
          );

          // Format results
          const formattedResults = results.map(result => ({
            id: result.id.toString(),
            content: result.payload?.content || '',
            relevance: result.score,
            metadata: result.payload
          }));

          // Cache results
          await this.redisService.cache(cacheKey, formattedResults, CognitoSphereEmbeddings.CACHE_TTL);

          return formattedResults;
        } catch (error) {
          console.error('Error recommending content:', error);
          return [];
        }
      },
      { userProfileLength: userProfile.length, limit }
    );
  }
}