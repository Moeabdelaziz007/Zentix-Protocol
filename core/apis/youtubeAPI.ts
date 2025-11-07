/**
 * Google YouTube Data API Integration
 * Video search and data retrieval
 * 
 * @module youtubeAPI
 * @version 1.0.0
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { AgentLogger, LogLevel } from '../utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * Google YouTube Data API - Video search and data
 * Rate limit: 10,000 quota units/day (free tier)
 * Get API key: https://console.cloud.google.com/apis/api/youtube.googleapis.com
 */
export class YouTubeAPI {
  private static readonly BASE_URL = 'https://www.googleapis.com/youtube/v3';
  private static apiKey = process.env.YOUTUBE_API_KEY || '';

  /**
   * Search for videos
   */
  static async searchVideos(query: string, maxResults: number = 10, type: string = 'video'): Promise<Array<{
    id: string;
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnail: string;
    viewCount: number;
    likeCount: number;
    duration: string;
  }>> {
    return AgentLogger.measurePerformance(
      'YouTubeAPI',
      'searchVideos',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return this.getMockVideos(query, maxResults);
        }

        try {
          // First, search for videos
          const searchParams = new URLSearchParams({
            key: this.apiKey,
            q: query,
            type: type,
            part: 'snippet',
            maxResults: maxResults.toString(),
            order: 'relevance'
          });

          const searchResponse = await axios.get(`${this.BASE_URL}/search?${searchParams}`, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!searchResponse.data || !searchResponse.data.items) {
            return [];
          }

          // Get video IDs for detailed information
          const videoIds = searchResponse.data.items
            .filter((item: any) => item.id && item.id.videoId)
            .map((item: any) => item.id.videoId)
            .join(',');

          if (!videoIds) {
            return [];
          }

          // Get detailed video statistics
          const detailsParams = new URLSearchParams({
            key: this.apiKey,
            id: videoIds,
            part: 'statistics,contentDetails'
          });

          const detailsResponse = await axios.get(`${this.BASE_URL}/videos?${detailsParams}`, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          // Combine search results with detailed information
          const detailedVideos = detailsResponse.data.items.reduce((acc: any, item: any) => {
            acc[item.id] = item;
            return acc;
          }, {});

          return searchResponse.data.items.map((item: any) => {
            const videoDetails = detailedVideos[item.id.videoId] || {};
            const stats = videoDetails.statistics || {};
            const contentDetails = videoDetails.contentDetails || {};
            
            return {
              id: item.id.videoId,
              title: item.snippet.title,
              description: item.snippet.description,
              channelTitle: item.snippet.channelTitle,
              publishedAt: item.snippet.publishedAt,
              thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
              viewCount: parseInt(stats.viewCount) || 0,
              likeCount: parseInt(stats.likeCount) || 0,
              duration: contentDetails.duration || 'PT0S'
            };
          });
        } catch (error: any) {
          console.error('YouTube API error:', error.response?.data || error.message);
          throw new Error(`YouTube API error: ${error.message}`);
        }
      },
      { query, maxResults, type }
    );
  }

  /**
   * Get top performing videos for a topic
   */
  static async getTopVideos(topic: string, maxResults: number = 5): Promise<Array<any>> {
    return AgentLogger.measurePerformance(
      'YouTubeAPI',
      'getTopVideos',
      async () => {
        return await this.searchVideos(topic, maxResults, 'video');
      },
      { topic, maxResults }
    );
  }

  /**
   * Get video by ID
   */
  static async getVideoById(videoId: string): Promise<any> {
    return AgentLogger.measurePerformance(
      'YouTubeAPI',
      'getVideoById',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return this.getMockVideo(videoId);
        }

        try {
          const params = new URLSearchParams({
            key: this.apiKey,
            id: videoId,
            part: 'snippet,statistics,contentDetails'
          });

          const response = await axios.get(`${this.BASE_URL}/videos?${params}`, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.data || !response.data.items || response.data.items.length === 0) {
            return null;
          }

          const item = response.data.items[0];
          const stats = item.statistics || {};
          const contentDetails = item.contentDetails || {};

          return {
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
            viewCount: parseInt(stats.viewCount) || 0,
            likeCount: parseInt(stats.likeCount) || 0,
            commentCount: parseInt(stats.commentCount) || 0,
            duration: contentDetails.duration || 'PT0S'
          };
        } catch (error: any) {
          console.error('YouTube API error:', error.response?.data || error.message);
          throw new Error(`YouTube API error: ${error.message}`);
        }
      },
      { videoId }
    );
  }

  private static getMockVideos(query: string, maxResults: number): Array<any> {
    const mockVideos = [];
    for (let i = 0; i < Math.min(maxResults, 5); i++) {
      mockVideos.push({
        id: `mock-video-${i}`,
        title: `Mock Video ${i+1} about ${query}`,
        description: `This is a mock video about ${query}. It contains educational content and examples.`,
        channelTitle: 'Mock Channel',
        publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: `https://via.placeholder.com/320x180?text=Video+${i+1}`,
        viewCount: Math.floor(Math.random() * 100000),
        likeCount: Math.floor(Math.random() * 10000),
        duration: `PT${Math.floor(Math.random() * 10) + 1}M${Math.floor(Math.random() * 60)}S`
      });
    }
    return mockVideos;
  }

  private static getMockVideo(videoId: string): any {
    return {
      id: videoId,
      title: 'Mock Video Title',
      description: 'This is a mock video description with educational content.',
      channelTitle: 'Mock Channel',
      publishedAt: new Date().toISOString(),
      thumbnail: 'https://via.placeholder.com/480x360?text=Mock+Video',
      viewCount: 50000,
      likeCount: 5000,
      commentCount: 250,
      duration: 'PT5M30S'
    };
  }

  /**
   * Analyze video content for educational or language learning opportunities
   * @param videoId The YouTube video ID
   * @returns Analysis of video content including key phrases and learning opportunities
   */
  static async analyzeVideoContent(videoId: string): Promise<{
    keyPhrases: string[];
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    learningOpportunities: string[];
    transcript?: string;
    language?: string;
  }> {
    return AgentLogger.measurePerformance(
      'YouTubeAPI',
      'analyzeVideoContent',
      async () => {
        // In a real implementation, this would fetch and analyze the video transcript
        // For now, we'll return mock data
        return {
          keyPhrases: [
            'artificial intelligence',
            'machine learning',
            'neural networks',
            'deep learning',
            'data science'
          ],
          difficultyLevel: 'intermediate',
          learningOpportunities: [
            'Technical terminology',
            'Industry concepts',
            'Current trends'
          ],
          transcript: 'This is a mock transcript of the video content...',
          language: 'en'
        };
      },
      { videoId }
    );
  }

  /**
   * Get related videos based on a topic
   * @param topic The topic to search for related videos
   * @param maxResults Maximum number of results to return
   * @returns Array of related videos
   */
  static async getRelatedVideos(topic: string, maxResults: number = 10): Promise<Array<{
    id: string;
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnail: string;
    viewCount: number;
    likeCount: number;
    duration: string;
    relevanceScore: number;
  }>> {
    return AgentLogger.measurePerformance(
      'YouTubeAPI',
      'getRelatedVideos',
      async () => {
        // Search for videos related to the topic
        const videos = await this.searchVideos(topic, maxResults, 'video');
        
        // Add relevance scores and sort by relevance
        return videos.map(video => ({
          ...video,
          relevanceScore: Math.random() // Mock relevance score
        })).sort((a, b) => b.relevanceScore - a.relevanceScore);
      },
      { topic, maxResults }
    );
  }

  /**
   * Generate content suggestions for video creation
   * @param topic The main topic
   * @param targetAudience The target audience
   * @returns Content suggestions and structure
   */
  static async generateContentSuggestions(topic: string, targetAudience: string = 'general'): Promise<{
    titleIdeas: string[];
    descriptionOutline: string;
    keyPoints: string[];
    suggestedTags: string[];
    estimatedDuration: string;
  }> {
    return AgentLogger.measurePerformance(
      'YouTubeAPI',
      'generateContentSuggestions',
      async () => {
        // In a real implementation, this would use AI to generate content suggestions
        // For now, we'll return mock data
        return {
          titleIdeas: [
            `The Ultimate Guide to ${topic}`,
            `${topic}: Everything You Need to Know`,
            `Mastering ${topic} in 2024`
          ],
          descriptionOutline: `Learn all about ${topic} in this comprehensive guide...`,
          keyPoints: [
            'Introduction to the topic',
            'Key concepts and terminology',
            'Practical applications',
            'Common mistakes to avoid',
            'Best practices and tips'
          ],
          suggestedTags: [topic.toLowerCase(), 'tutorial', 'guide', 'education'],
          estimatedDuration: 'PT10M'
        };
      },
      { topic, targetAudience }
    );
  }
}