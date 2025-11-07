/**
 * Redis Service
 * High-performance caching and session storage using Redis
 * 
 * @module redisService
 * @version 1.0.0
 */

import Redis from 'ioredis';
import dotenv from 'dotenv';
import { AgentLogger } from '../utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * Redis Service
 * Provides caching, session storage, and pub/sub capabilities
 */
export class RedisService {
  private static instance: RedisService;
  private client: Redis | null = null;
  private isConnected: boolean = false;

  private constructor() {}

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * Connect to Redis server
   */
  async connect(): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'RedisService',
      'connect',
      async () => {
        try {
          const redisUrl = process.env.REDIS_URL;
          
          if (!redisUrl) {
            console.warn('⚠️ Redis URL not configured. Running in mock mode.');
            return false;
          }

          this.client = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            retryStrategy(times) {
              const delay = Math.min(times * 50, 2000);
              return delay;
            },
          });

          this.client.on('connect', () => {
            console.log('✅ Redis connected');
            this.isConnected = true;
          });

          this.client.on('error', (err) => {
            console.error('❌ Redis error:', err);
            this.isConnected = false;
          });

          // Test connection
          await this.client.ping();
          
          return true;
        } catch (error) {
          console.error('Failed to connect to Redis:', error);
          return false;
        }
      }
    );
  }

  /**
   * Cache a value with TTL (Time To Live)
   * @param key - Cache key
   * @param value - Value to cache (will be JSON stringified)
   * @param ttl - Time to live in seconds (default: 1 hour)
   */
  async cache(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'RedisService',
      'cache',
      async () => {
        if (!this.isConnected || !this.client) {
          console.warn('Redis not connected, skipping cache');
          return false;
        }

        try {
          const serialized = JSON.stringify(value);
          await this.client.setex(key, ttl, serialized);
          return true;
        } catch (error) {
          console.error('Redis cache error:', error);
          return false;
        }
      },
      { key, ttl }
    );
  }

  /**
   * Get a cached value
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  async get<T = any>(key: string): Promise<T | null> {
    return AgentLogger.measurePerformance(
      'RedisService',
      'get',
      async () => {
        if (!this.isConnected || !this.client) {
          return null;
        }

        try {
          const value = await this.client.get(key);
          if (!value) return null;
          
          return JSON.parse(value) as T;
        } catch (error) {
          console.error('Redis get error:', error);
          return null;
        }
      },
      { key }
    );
  }

  /**
   * Delete a specific key
   * @param key - Cache key to delete
   */
  async delete(key: string): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'RedisService',
      'delete',
      async () => {
        if (!this.isConnected || !this.client) {
          return false;
        }

        try {
          await this.client.del(key);
          return true;
        } catch (error) {
          console.error('Redis delete error:', error);
          return false;
        }
      },
      { key }
    );
  }

  /**
   * Set a value with no expiration
   * @param key - Key
   * @param value - Value
   */
  async set(key: string, value: any): Promise<boolean> {
    return AgentLogger.measurePerformance(
      'RedisService',
      'set',
      async () => {
        if (!this.isConnected || !this.client) {
          return false;
        }

        try {
          const serialized = JSON.stringify(value);
          await this.client.set(key, serialized);
          return true;
        } catch (error) {
          console.error('Redis set error:', error);
          return false;
        }
      },
      { key }
    );
  }

  /**
   * Increment a counter
   * @param key - Counter key
   * @param by - Amount to increment by (default: 1)
   * @returns New value
   */
  async increment(key: string, by: number = 1): Promise<number> {
    return AgentLogger.measurePerformance(
      'RedisService',
      'increment',
      async () => {
        if (!this.isConnected || !this.client) {
          return 0;
        }

        try {
          return await this.client.incrby(key, by);
        } catch (error) {
          console.error('Redis increment error:', error);
          return 0;
        }
      },
      { key, by }
    );
  }

  /**
   * Get TTL (Time To Live) for a key
   * @param key - Cache key
   * @returns TTL in seconds, or -1 if no expiration, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    return AgentLogger.measurePerformance(
      'RedisService',
      'ttl',
      async () => {
        if (!this.isConnected || !this.client) {
          return -2;
        }

        try {
          return await this.client.ttl(key);
        } catch (error) {
          console.error('Redis TTL error:', error);
          return -2;
        }
      },
      { key }
    );
  }

  /**
   * Invalidate cache by pattern
   * @param pattern - Key pattern (e.g., 'user:*', 'knowledge:*')
   */
  async invalidate(pattern: string): Promise<void> {
    return AgentLogger.measurePerformance(
      'RedisService',
      'invalidate',
      async () => {
        if (!this.isConnected || !this.client) {
          return;
        }

        try {
          const keys = await this.client.keys(pattern);
          if (keys.length > 0) {
            await this.client.del(...keys);
            console.log(`Invalidated ${keys.length} keys matching ${pattern}`);
          }
        } catch (error) {
          console.error('Redis invalidate error:', error);
        }
      },
      { pattern }
    );
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      console.log('Redis disconnected');
    }
  }

  /**
   * Get connection status
   */
  isReady(): boolean {
    return this.isConnected;
  }
}