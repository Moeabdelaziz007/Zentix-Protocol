import { searchImagesWithFreeAPIs, searchImagesWithUnsplash, searchImagesWithPixabay, searchImagesWithPexels } from './server/creatorStudioService';

async function testImageSearch() {
  try {
    console.log('Testing Unsplash directly...');
    const unsplashResult = await searchImagesWithUnsplash('nature', 2);
    console.log('Unsplash result:', unsplashResult);
  } catch (error) {
    console.error('Unsplash error:', error);
  }

  try {
    console.log('Testing Pixabay directly...');
    const pixabayResult = await searchImagesWithPixabay('nature', 2);
    console.log('Pixabay result:', pixabayResult);
  } catch (error) {
    console.error('Pixabay error:', error);
  }

  try {
    console.log('Testing Pexels directly...');
    const pexelsResult = await searchImagesWithPexels('nature', 2);
    console.log('Pexels result:', pexelsResult);
  } catch (error) {
    console.error('Pexels error:', error);
  }

  try {
    console.log('Testing free APIs integration...');
    const result = await searchImagesWithFreeAPIs('nature', 3);
    console.log('Free APIs result:', result);
  } catch (error) {
    console.error('Free APIs error:', error);
  }
}

testImageSearch();