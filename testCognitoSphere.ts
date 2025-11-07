/**
 * Test script for CognitoSphere with Redis and Qdrant integration
 */

import dotenv from 'dotenv';
dotenv.config();

import { CognitoSphereEmbeddings } from './core/features/cognitoSphereEmbeddings';

async function testCognitoSphere() {
  console.log('Testing CognitoSphere with Redis and Qdrant integration...\n');
  
  // Initialize the service
  const cognitoSphere = new CognitoSphereEmbeddings();
  
  // Test saving content
  console.log('1. Saving content to CognitoSphere...');
  const saveResult = await cognitoSphere.saveContentWithEmbedding(
    'test-content-1',
    'This is a sample note about artificial intelligence and machine learning concepts.',
    {
      tags: ['AI', 'ML', 'technology'],
      source: 'test',
      author: 'system'
    }
  );
  console.log('   Save result:', saveResult);
  
  // Test searching for similar content
  console.log('\n2. Searching for similar content...');
  const searchResults = await cognitoSphere.searchSimilarContent(
    'machine learning concepts',
    5
  );
  console.log('   Search results:', searchResults.length, 'items found');
  searchResults.forEach((result, index) => {
    console.log(`   ${index + 1}. ID: ${result.id}, Similarity: ${result.similarity.toFixed(4)}`);
  });
  
  // Test getting content by ID
  console.log('\n3. Retrieving content by ID...');
  const content = await cognitoSphere.getContentById('test-content-1');
  console.log('   Retrieved content:', content ? 'Found' : 'Not found');
  if (content) {
    console.log('   Content preview:', content.content.substring(0, 50) + '...');
  }
  
  // Test finding related content
  console.log('\n4. Finding related content...');
  const relatedContent = await cognitoSphere.findRelatedContent('test-content-1', 3);
  console.log('   Related content:', relatedContent.length, 'items found');
  
  console.log('\n✅ CognitoSphere test completed successfully!');
}

// Run the test
testCognitoSphere().catch(console.error);