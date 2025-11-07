/**
 * Smart Search Embeddings Integration
 * Semantic search capabilities using embedding models
 * 
 * @module smartSearchEmbeddings
 * @version 1.0.0
 */

import { EmbeddingModelsAPI } from '../apis/embeddingModelsAPI';
import { VectorDatabaseService } from '../services/vectorDatabaseService';
import { AgentLogger } from '../utils/agentLogger';

/**
 * Smart Search Embeddings Service
 * Enhances search with semantic understanding instead of just keyword matching
 */
export class SmartSearchEmbeddings {
  private static readonly COLLECTION_NAME = 'smart_search';
  private vectorDb: VectorDatabaseService;

  constructor() {
    this.vectorDb = VectorDatabaseService.getInstance();
  }

  private getCollectionName(): string {
    return SmartSearchEmbeddings.COLLECTION_NAME;
  }

  /**
   * Index content for semantic search
   * @param id - Unique identifier for the content
   * @param content - Text content to index
   * @param metadata - Additional metadata (title, url, etc.)
   */
  async indexContent(
    id: string,
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'SmartSearchEmbeddings',
      'indexContent',
      async () => {
        try {
          // Generate embedding using the best available model
          const embedding = await EmbeddingModelsAPI.generateTextEmbeddingWithGemini(content);
          
          // Prepare metadata
          const payload = {
            content,
            indexedAt: new Date().toISOString(),
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

          if (success) {
            console.log(`✅ Indexed content for search: ${id}`);
          } else {
            console.error(`❌ Failed to index content for search: ${id}`);
          }

          return success;
        } catch (error) {
          console.error('Error indexing content for search:', error);
          return false;
        }
      },
      { id, contentLength: content.length, metadataKeys: Object.keys(metadata) }
    );
  }

  /**
   * Perform semantic search
   * @param query - Search query
   * @param limit - Number of results to return
   * @param filter - Optional filters
   */
  async semanticSearch(
    query: string,
    limit: number = 10,
    filter?: Record<string, any>
  ): Promise<Array<{
    id: string;
    title: string;
    content: string;
    url?: string;
    score: number;
    metadata?: Record<string, any>;
  }>> {
    return AgentLogger.measurePerformance(
      'SmartSearchEmbeddings',
      'semanticSearch',
      async () => {
        try {
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
          return results.map(result => ({
            id: result.id.toString(),
            title: result.payload?.title || 'Untitled',
            content: result.payload?.content || '',
            url: result.payload?.url,
            score: result.score,
            metadata: result.payload
          }));
        } catch (error) {
          console.error('Error performing semantic search:', error);
          return [];
        }
      },
      { query, limit, hasFilter: !!filter }
    );
  }

  /**
   * Perform hybrid search (keyword + semantic)
   * @param query - Search query
   * @param limit - Number of results to return
   */
  async hybridSearch(
    query: string,
    limit: number = 10
  ): Promise<Array<{
    id: string;
    title: string;
    content: string;
    url?: string;
    semanticScore: number;
    keywordScore: number;
    combinedScore: number;
    metadata?: Record<string, any>;
  }>> {
    return AgentLogger.measurePerformance(
      'SmartSearchEmbeddings',
      'hybridSearch',
      async () => {
        try {
          // Perform semantic search
          const semanticResults = await this.semanticSearch(query, limit * 2);
          
          // In a real implementation, we would also perform keyword search
          // and combine the results. For now, we'll just return semantic results
          // with mock keyword scores.
          
          return semanticResults.map(result => ({
            id: result.id,
            title: result.title,
            content: result.content,
            url: result.url,
            semanticScore: result.score,
            keywordScore: 0.8, // Mock value
            combinedScore: (result.score + 0.8) / 2, // Simple average
            metadata: result.metadata
          })).sort((a, b) => b.combinedScore - a.combinedScore).slice(0, limit);
        } catch (error) {
          console.error('Error performing hybrid search:', error);
          return [];
        }
      },
      { query, limit }
    );
  }

  /**
   * Get search suggestions based on partial query
   * @param partialQuery - Partial search query
   * @param limit - Number of suggestions to return
   */
  async getSuggestions(
    partialQuery: string,
    limit: number = 5
  ): Promise<Array<{
    text: string;
    relevance: number;
  }>> {
    return AgentLogger.measurePerformance(
      'SmartSearchEmbeddings',
      'getSuggestions',
      async () => {
        try {
          // In a real implementation, this would search for similar queries
          // or popular search terms. For now, we'll return mock suggestions.
          
          // Generate embedding for the partial query
          const queryEmbedding = await EmbeddingModelsAPI.generateTextEmbeddingWithGemini(partialQuery);
          
          // Search for similar indexed content to generate suggestions
          const results = await this.vectorDb.search(
            this.getCollectionName(),
            queryEmbedding,
            limit
          );

          // Extract unique terms from results to form suggestions
          const suggestions = results.map(result => ({
            text: result.payload?.title || result.payload?.content?.substring(0, 50) + '...' || 'Untitled',
            relevance: result.score
          }));

          return suggestions;
        } catch (error) {
          console.error('Error getting search suggestions:', error);
          return [];
        }
      },
      { partialQuery, limit }
    );
  }

  /**
   * Search within a specific context or domain
   * @param query - Search query
   * @param context - Context/domain to search within
   * @param limit - Number of results to return
   */
  async contextualSearch(
    query: string,
    context: string,
    limit: number = 10
  ): Promise<Array<{
    id: string;
    title: string;
    content: string;
    url?: string;
    score: number;
    contextRelevance: number;
    metadata?: Record<string, any>;
  }>> {
    return AgentLogger.measurePerformance(
      'SmartSearchEmbeddings',
      'contextualSearch',
      async () => {
        try {
          // Generate embeddings for both query and context
          const queryEmbedding = await EmbeddingModelsAPI.generateTextEmbeddingWithGemini(query);
          const contextEmbedding = await EmbeddingModelsAPI.generateTextEmbeddingWithGemini(context);
          
          // Search in vector database
          const results = await this.vectorDb.search(
            this.getCollectionName(),
            queryEmbedding,
            limit
          );

          // Calculate context relevance for each result
          const resultsWithContextRelevance = await Promise.all(
            results.map(async result => {
              // Calculate similarity between result content and context
              const resultEmbedding = await EmbeddingModelsAPI.generateTextEmbeddingWithGemini(
                result.payload?.content || ''
              );
              
              const contextRelevance = EmbeddingModelsAPI.calculateSimilarity(
                contextEmbedding,
                resultEmbedding
              );

              return {
                id: result.id.toString(),
                title: result.payload?.title || 'Untitled',
                content: result.payload?.content || '',
                url: result.payload?.url,
                score: result.score,
                contextRelevance,
                metadata: result.payload
              };
            })
          );

          // Sort by a combination of search score and context relevance
          return resultsWithContextRelevance
            .sort((a, b) => (b.score + b.contextRelevance) - (a.score + a.contextRelevance))
            .slice(0, limit);
        } catch (error) {
          console.error('Error performing contextual search:', error);
          return [];
        }
      },
      { query, context, limit }
    );
  }
}