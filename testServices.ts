import dotenv from 'dotenv';
dotenv.config();

console.log('Environment variables:');
console.log('QDRANT_URL:', process.env.QDRANT_URL);
console.log('REDIS_URL:', process.env.REDIS_URL);

// Test Redis connection
import { RedisService } from './core/services/redisService';

async function testRedis() {
  console.log('\n--- Testing Redis ---');
  const redis = RedisService.getInstance();
  const connected = await redis.connect();
  console.log('Redis connected:', connected);
  
  if (connected) {
    console.log('Testing Redis operations...');
    await redis.cache('test:key', { message: 'Hello Redis!' }, 60);
    const value = await redis.get('test:key');
    console.log('Retrieved from Redis:', value);
    await redis.delete('test:key');
  }
}

// Test Qdrant connection
import { QdrantService } from './core/services/qdrantService';

async function testQdrant() {
  console.log('\n--- Testing Qdrant ---');
  const qdrant = QdrantService.getInstance();
  const connected = await qdrant.connect();
  console.log('Qdrant connected:', connected);
  
  if (connected) {
    console.log('Testing Qdrant operations...');
    const created = await qdrant.createCollection('test_collection', 4);
    console.log('Collection created:', created);
    
    if (created) {
      const upserted = await qdrant.upsertVectors('test_collection', [
        {
          id: 'test-1',
          vector: [0.1, 0.2, 0.3, 0.4],
          payload: { text: 'Hello Qdrant!' }
        }
      ]);
      console.log('Vector upserted:', upserted);
      
      const results = await qdrant.search('test_collection', [0.1, 0.2, 0.3, 0.4], 5);
      console.log('Search results:', results);
      
      await qdrant.deleteCollection('test_collection');
    }
  }
}

async function main() {
  await testRedis();
  await testQdrant();
  console.log('\n--- Tests completed ---');
}

main().catch(console.error);