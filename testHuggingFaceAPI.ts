import { HuggingFaceAPI } from './core/apis/huggingFaceIntegration';

async function testHuggingFaceAPI() {
  try {
    console.log('Testing Hugging Face text generation...');
    const text = await HuggingFaceAPI.generateText('Write a short poem about technology');
    console.log('Generated text:', text);
  } catch (error) {
    console.error('Text generation error:', error);
  }

  try {
    console.log('Testing Hugging Face text classification...');
    const classification = await HuggingFaceAPI.classifyText('I love this product!');
    console.log('Classification:', classification);
  } catch (error) {
    console.error('Text classification error:', error);
  }

  try {
    console.log('Testing Hugging Face image generation...');
    const image = await HuggingFaceAPI.generateImage('A beautiful sunset');
    console.log('Generated image (first 50 chars):', image.substring(0, 50));
  } catch (error) {
    console.error('Image generation error:', error);
  }

  try {
    console.log('Testing Hugging Face text-to-speech...');
    const audio = await HuggingFaceAPI.textToSpeech('Hello, world!');
    console.log('Generated audio (first 50 chars):', audio.substring(0, 50));
  } catch (error) {
    console.error('Text-to-speech error:', error);
  }

  try {
    console.log('Testing Hugging Face model listing...');
    const models = await HuggingFaceAPI.listModels();
    console.log('Available models:', models);
  } catch (error) {
    console.error('Model listing error:', error);
  }
}

testHuggingFaceAPI();