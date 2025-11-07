import { OllamaAPI } from './core/apis/ollamaIntegration';

async function testOllamaAPI() {
  try {
    console.log('Testing Ollama status...');
    const isRunning = await OllamaAPI.isOllamaRunning();
    console.log('Ollama is running:', isRunning);
  } catch (error) {
    console.error('Ollama status error:', error);
  }

  try {
    console.log('Testing Ollama model listing...');
    const models = await OllamaAPI.listModels();
    console.log('Available models:', models);
  } catch (error) {
    console.error('Ollama model listing error:', error);
  }

  try {
    console.log('Testing Ollama text generation...');
    const text = await OllamaAPI.generateText('Write a short poem about technology');
    console.log('Generated text:', text);
  } catch (error) {
    console.error('Ollama text generation error:', error);
  }

  try {
    console.log('Testing Ollama chat...');
    const response = await OllamaAPI.chat([
      { role: 'user', content: 'Hello, how are you?' }
    ]);
    console.log('Chat response:', response);
  } catch (error) {
    console.error('Ollama chat error:', error);
  }

  try {
    console.log('Testing Ollama embedding...');
    const embedding = await OllamaAPI.embedText('Hello, world!');
    console.log('Embedding (first 10 values):', embedding.slice(0, 10));
  } catch (error) {
    console.error('Ollama embedding error:', error);
  }
}

testOllamaAPI();