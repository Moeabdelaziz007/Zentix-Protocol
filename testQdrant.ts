// Simple Qdrant test
import dotenv from 'dotenv';
dotenv.config();

import { QdrantClient } from '@qdrant/js-client-rest';

async function testQdrant() {
  console.log('Testing Qdrant connection...');
  console.log('QDRANT_URL:', process.env.QDRANT_URL);
  
  try {
    const client = new QdrantClient({
      url: process.env.QDRANT_URL || '',
      apiKey: process.env.QDRANT_API_KEY,
    });

    console.log('Attempting to connect to Qdrant...');
    const collections = await client.getCollections();
    console.log('✅ Qdrant connected successfully');
    console.log('Collections:', collections.collections.map(c => c.name));
    
    // Try to create a test collection
    try {
      await client.createCollection('test_collection', {
        vectors: {
          size: 4,
          distance: 'Cosine',
        },
      });
      console.log('✅ Created test collection');
      
      // Insert a test point
      await client.upsert('test_collection', {
        points: [
          {
            id: 1,
            vector: [0.1, 0.2, 0.3, 0.4],
            payload: { text: 'Hello Qdrant!' }
          }
        ]
      });
      console.log('✅ Inserted test point');
      
      // Search for the point
      const results = await client.search('test_collection', {
        vector: [0.1, 0.2, 0.3, 0.4],
        limit: 5
      });
      console.log('✅ Search results:', results);
      
      // Clean up
      await client.deleteCollection('test_collection');
      console.log('✅ Cleaned up test collection');
      
    } catch (err) {
      console.error('Error with collection operations:', err);
    }
  } catch (error) {
    console.error('❌ Qdrant connection error:', error);
  }
}

testQdrant().catch(console.error);