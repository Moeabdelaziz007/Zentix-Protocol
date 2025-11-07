import dotenv from 'dotenv';
dotenv.config();

console.log('Environment variables:');
console.log('QDRANT_URL:', process.env.QDRANT_URL);
console.log('REDIS_URL:', process.env.REDIS_URL);

// Test Redis connection with more detailed error handling
import Redis from 'ioredis';

async function testRedisDirect() {
  console.log('\n--- Testing Redis Direct Connection ---');
  try {
    const redis = new Redis(process.env.REDIS_URL || '', {
      retryStrategy: (times) => {
        console.log(`Redis retry attempt ${times}`);
        return Math.min(times * 50, 2000);
      },
      connectTimeout: 10000,
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });

    redis.on('ready', () => {
      console.log('✅ Redis ready');
    });

    redis.on('close', () => {
      console.log('❌ Redis connection closed');
    });

    // Wait a bit for connection
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      await redis.ping();
      console.log('✅ Redis ping successful');
      
      // Test set/get
      await redis.set('test', 'Hello Redis!');
      const value = await redis.get('test');
      console.log('Retrieved value:', value);
      
      await redis.quit();
    } catch (err) {
      console.error('Redis operation error:', err);
      await redis.quit();
    }
  } catch (error) {
    console.error('Redis connection error:', error);
  }
}

// Test Qdrant connection
import { QdrantClient } from '@qdrant/js-client-rest';

async function testQdrantDirect() {
  console.log('\n--- Testing Qdrant Direct Connection ---');
  try {
    const client = new QdrantClient({
      url: process.env.QDRANT_URL || '',
      apiKey: process.env.QDRANT_API_KEY,
    });

    console.log('Attempting to connect to Qdrant...');
    const collections = await client.getCollections();
    console.log('✅ Qdrant connected successfully');
    console.log('Collections:', collections.collections.map(c => c.name));
  } catch (error) {
    console.error('❌ Qdrant connection error:', error);
  }
}

async function main() {
  await testRedisDirect();
  await testQdrantDirect();
  console.log('\n--- Tests completed ---');
}

main().catch(console.error);