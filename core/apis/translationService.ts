/**
 * Free Translation API Services
 * LibreTranslate and MyMemory API integrations
 * Zero-cost translation services for LingoLeap
 * 
 * @module translationService
 * @version 1.0.0
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import Google Translation API
import { GoogleTranslationAPI } from './googleTranslationAPI';

// LibreTranslate API
const LIBRETRANSLATE_API_URL = 'https://libretranslate.de/translate';
// MyMemory API
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

/**
 * Translate text using LibreTranslate API
 * @param text - Text to translate
 * @param sourceLang - Source language code
 * @param targetLang - Target language code
 * @returns Translated text
 */
export const translateWithLibreTranslate = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ translatedText: string; pronunciation?: string }> => {
  try {
    const response = await axios.post(LIBRETRANSLATE_API_URL, {
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    });

    // Check if we got a valid response
    if (response.data && response.data.translatedText) {
      return {
        translatedText: response.data.translatedText,
        // LibreTranslate doesn't provide pronunciation
      };
    } else {
      throw new Error('LibreTranslate returned invalid response');
    }
  } catch (error: any) {
    console.error('LibreTranslate API error:', error.response?.data || error.message);
    throw new Error(`LibreTranslate API error: ${error.message}`);
  }
};

/**
 * Translate text using MyMemory API
 * @param text - Text to translate
 * @param sourceLang - Source language code
 * @param targetLang - Target language code
 * @returns Translated text
 */
export const translateWithMyMemory = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ translatedText: string; pronunciation?: string }> => {
  try {
    const response = await axios.get(MYMEMORY_API_URL, {
      params: {
        q: text,
        langpair: `${sourceLang}|${targetLang}`
      }
    });

    // Check if we got a valid response
    if (response.data && response.data.responseStatus === 200 && response.data.responseData && response.data.responseData.translatedText) {
      return {
        translatedText: response.data.responseData.translatedText,
        // MyMemory doesn't provide pronunciation
      };
    } else {
      throw new Error(`MyMemory API error: ${response.data.responseDetails || 'Invalid response'}`);
    }
  } catch (error: any) {
    console.error('MyMemory API error:', error.response?.data || error.message);
    throw new Error(`MyMemory API error: ${error.message}`);
  }
};

/**
 * Translate text using multiple translation APIs with priority
 * @param text - Text to translate
 * @param sourceLang - Source language code
 * @param targetLang - Target language code
 * @returns Translated text
 */
export const translateWithFreeAPIs = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ translatedText: string; pronunciation?: string }> => {
  // Try Google Cloud Translation first (highest quality)
  try {
    const googleResult = await GoogleTranslationAPI.translateText(text, sourceLang, targetLang);
    if (googleResult.translatedText) {
      return googleResult;
    }
  } catch (error) {
    console.log('Google Translation failed, trying LibreTranslate');
  }
  
  // Try LibreTranslate second
  try {
    const libreResult = await translateWithLibreTranslate(text, sourceLang, targetLang);
    if (libreResult.translatedText) {
      return libreResult;
    }
  } catch (error) {
    console.log('LibreTranslate failed, trying MyMemory');
  }

  // Fall back to MyMemory
  try {
    const myMemoryResult = await translateWithMyMemory(text, sourceLang, targetLang);
    if (myMemoryResult.translatedText) {
      return myMemoryResult;
    }
  } catch (error) {
    console.log('MyMemory failed');
  }

  console.log('All translation APIs failed');
  throw new Error('All translation APIs failed');
};

/**
 * Get dictionary definition using Free Dictionary API
 * @param word - Word to look up
 * @param language - Language code
 * @returns Dictionary entry
 */
export const getDictionaryDefinition = async (
  word: string,
  language: string = 'en'
): Promise<any> => {
  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/${language}/${word}`);
    return response.data;
  } catch (error: any) {
    console.error('Free Dictionary API error:', error.response?.data || error.message);
    throw new Error(`Free Dictionary API error: ${error.message}`);
  }
};