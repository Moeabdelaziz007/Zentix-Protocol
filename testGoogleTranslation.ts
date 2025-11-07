import { GoogleTranslationAPI } from './core/apis/googleTranslationAPI';

async function testGoogleTranslation() {
  console.log('Testing Google Translation API...');
  
  try {
    // Test translation
    const result = await GoogleTranslationAPI.translateText(
      'Hello, how are you today?',
      'en',
      'es'
    );
    
    console.log('Translation result:', result);
    
    // Test language detection
    const detection = await GoogleTranslationAPI.detectLanguage('Bonjour, comment allez-vous?');
    console.log('Language detection result:', detection);
    
    // Test supported languages
    const languages = await GoogleTranslationAPI.getSupportedLanguages();
    console.log('Supported languages count:', languages.length);
    console.log('First 5 languages:', languages.slice(0, 5));
  } catch (error) {
    console.error('Error testing Google Translation API:', error);
  }
}

testGoogleTranslation();