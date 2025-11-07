import { RedisService } from './core/services/redisService';
import { QdrantService } from './core/services/qdrantService';
import { VectorDatabaseService } from './core/services/vectorDatabaseService';

async function testServices() {
  console.log('Testing Redis and Qdrant services...');
  
  // Test Redis
  console.log('\n--- Testing Redis Service ---');
  const redisService = RedisService.getInstance();
  const redisConnected = await redisService.connect();
  console.log('Redis connected:', redisConnected);
  
  if (redisConnected) {
    // Test caching
    await redisService.cache('test:key', { message: 'Hello from Redis!' }, 60);
    const cachedValue = await redisService.get('test:key');
    console.log('Cached value:', cachedValue);
    
    // Test deletion
    await redisService.delete('test:key');
    const deletedValue = await redisService.get('test:key');
    console.log('Deleted value:', deletedValue);
  }
  
  // Test Qdrant
  console.log('\n--- Testing Qdrant Service ---');
  const qdrantService = QdrantService.getInstance();
  const qdrantConnected = await qdrantService.connect();
  console.log('Qdrant connected:', qdrantConnected);
  
  if (qdrantConnected) {
    // Test collection creation
    const collectionCreated = await qdrantService.createCollection('test_collection', 4);
    console.log('Collection created:', collectionCreated);
    
    // Test upsert
    if (collectionCreated) {
      const upsertSuccess = await qdrantService.upsertVectors('test_collection', [
        {
          id: 'test-point-1',
          vector: [0.1, 0.2, 0.3, 0.4],
          payload: { text: 'This is a test point' }
        }
      ]);
      console.log('Upsert success:', upsertSuccess);
      
      // Test search
      const searchResults = await qdrantService.search('test_collection', [0.1, 0.2, 0.3, 0.4], 5);
      console.log('Search results:', searchResults);
      
      // Test get vector
      const vector = await qdrantService.getVector('test_collection', 'test-point-1');
      console.log('Retrieved vector:', vector);
      
      // Test delete
      const deleteSuccess = await qdrantService.deleteVectors('test_collection', ['test-point-1']);
      console.log('Delete success:', deleteSuccess);
      
      // Delete collection
      await qdrantService.deleteCollection('test_collection');
    }
  }
  
  // Test Vector Database Service
  console.log('\n--- Testing Vector Database Service ---');
  const vectorDb = VectorDatabaseService.getInstance();
  const vectorDbConnected = await vectorDb.connect();
  console.log('Vector DB connected:', vectorDbConnected);
  
  if (vectorDbConnected) {
    // Test collection creation
    const collectionCreated = await vectorDb.createCollection('test_vector_collection', 4);
    console.log('Vector DB collection created:', collectionCreated);
    
    // Test upsert
    if (collectionCreated) {
      const upsertSuccess = await vectorDb.upsertVectors('test_vector_collection', [
        {
          id: 'vector-test-1',
          vector: [0.5, 0.6, 0.7, 0.8],
          payload: { content: 'This is a vector test point' }
        }
      ]);
      console.log('Vector DB upsert success:', upsertSuccess);
      
      // Test search
      const searchResults = await vectorDb.search('test_vector_collection', [0.5, 0.6, 0.7, 0.8], 5);
      console.log('Vector DB search results:', searchResults);
      
      // Test get vector
      const vector = await vectorDb.getVector('test_vector_collection', 'vector-test-1');
      console.log('Vector DB retrieved vector:', vector);
    }
  }
  
  console.log('\n--- Test completed ---');
}

testServices().catch(console.error);