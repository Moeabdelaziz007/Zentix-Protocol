import { translateWithFreeAPIs, translateWithLibreTranslate, translateWithMyMemory } from './core/apis/translationService';

async function testTranslation() {
  try {
    console.log('Testing LibreTranslate directly...');
    const libreResult = await translateWithLibreTranslate('Hello world', 'en', 'es');
    console.log('LibreTranslate result:', libreResult);
  } catch (error) {
    console.error('LibreTranslate error:', error);
  }

  try {
    console.log('Testing MyMemory directly...');
    const myMemoryResult = await translateWithMyMemory('Hello world', 'en', 'es');
    console.log('MyMemory result:', myMemoryResult);
  } catch (error) {
    console.error('MyMemory error:', error);
  }

  try {
    console.log('Testing free APIs integration...');
    const result = await translateWithFreeAPIs('Hello world', 'en', 'es');
    console.log('Free APIs result:', result);
  } catch (error) {
    console.error('Free APIs error:', error);
  }
}

testTranslation();