/**
 * Google Cloud Translation API Service
 * Professional-grade translation for LingoLeap
 * 
 * @module googleTranslationAPI
 * @version 1.0.0
 */

import { TranslationServiceClient } from '@google-cloud/translate';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Google Translation API Service
 * Provides high-quality translation using Google's neural machine translation
 */
export class GoogleTranslationAPI {
  private static client: TranslationServiceClient | null = null;
  private static projectId: string | undefined;

  /**
   * Initialize the Google Translation API client
   */
  private static initializeClient(): void {
    if (!this.client) {
      // Check if we have Google Cloud credentials
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
      
      if (!credentialsPath || !this.projectId) {
        console.warn('⚠️  Google Cloud Translation not configured. Running in mock mode.');
        this.client = null;
        return;
      }
      
      try {
        // Initialize the Translation service client
        this.client = new TranslationServiceClient({
          keyFilename: credentialsPath
        });
      } catch (error) {
        console.error('Failed to initialize Google Translation API client:', error);
        this.client = null;
      }
    }
  }

  /**
   * Translate text using Google Cloud Translation API
   * @param text - Text to translate
   * @param sourceLanguage - Source language code (e.g., 'en', 'es', 'fr')
   * @param targetLanguage - Target language code (e.g., 'es', 'fr', 'de')
   * @returns Translated text and pronunciation
   */
  public static async translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<{ translatedText: string; pronunciation?: string }> {
    // Initialize client if not already done
    this.initializeClient();
    
    // If Google Cloud is not configured, fall back to free APIs
    if (!this.client || !this.projectId) {
      console.log('Google Cloud Translation not available, falling back to free APIs');
      // We'll import the free translation service dynamically to avoid circular dependencies
      return this.fallbackToFreeTranslation(text, sourceLanguage, targetLanguage);
    }
    
    try {
      // Prepare the request
      const request = {
        parent: `projects/${this.projectId}/locations/global`,
        contents: [text],
        mimeType: 'text/plain',
        sourceLanguageCode: sourceLanguage,
        targetLanguageCode: targetLanguage,
      };
      
      // Perform the translation
      const [response] = await this.client.translateText(request);
      
      // Extract the translation result
      const translation = response.translations?.[0];
      
      if (!translation || !translation.translatedText) {
        throw new Error('No translation returned from Google Cloud Translation API');
      }
      
      return {
        translatedText: translation.translatedText,
        pronunciation: translation?.detectedLanguageCode ? undefined : undefined // Google API doesn't provide pronunciation
      };
    } catch (error) {
      console.error('Google Translation API error:', error);
      // Fall back to free APIs on error
      return this.fallbackToFreeTranslation(text, sourceLanguage, targetLanguage);
    }
  }

  /**
   * Fallback to free translation APIs when Google Cloud is not available
   * @param text - Text to translate
   * @param sourceLanguage - Source language code
   * @param targetLanguage - Target language code
   * @returns Translated text
   */
  private static async fallbackToFreeTranslation(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<{ translatedText: string; pronunciation?: string }> {
    try {
      // Dynamically import to avoid circular dependencies
      const { translateWithFreeAPIs } = await import('./translationService');
      return await translateWithFreeAPIs(text, sourceLanguage, targetLanguage);
    } catch (error) {
      console.error('Fallback translation failed:', error);
      throw new Error('All translation services failed');
    }
  }
  
  /**
   * Detect language of text using Google Cloud Translation API
   * @param text - Text to detect language for
   * @returns Detected language code and confidence
   */
  public static async detectLanguage(text: string): Promise<{ language: string; confidence: number } | null> {
    // Initialize client if not already done
    this.initializeClient();
    
    // If Google Cloud is not configured, return null
    if (!this.client || !this.projectId) {
      return null;
    }
    
    try {
      // Prepare the request
      const request = {
        parent: `projects/${this.projectId}/locations/global`,
        content: text,
      };
      
      // Perform language detection
      const [response] = await this.client.detectLanguage(request);
      
      // Extract the detection result
      const detection = response.languages?.[0];
      
      if (!detection || !detection.languageCode) {
        return null;
      }
      
      return {
        language: detection.languageCode,
        confidence: detection.confidence || 0
      };
    } catch (error) {
      console.error('Google Language Detection API error:', error);
      return null;
    }
  }
  
  /**
   * Get supported languages from Google Cloud Translation API
   * @returns Array of supported language codes and names
   */
  public static async getSupportedLanguages(): Promise<Array<{ languageCode: string; displayName: string }>> {
    // Initialize client if not already done
    this.initializeClient();
    
    // If Google Cloud is not configured, return basic language list
    if (!this.client || !this.projectId) {
      return this.getDefaultLanguageList();
    }
    
    try {
      // Prepare the request
      const request = {
        parent: `projects/${this.projectId}/locations/global`,
        displayLanguageCode: 'en',
      };
      
      // Get supported languages
      const [response] = await this.client.getSupportedLanguages(request);
      
      // Extract language information
      return (response.languages || []).map(lang => ({
        languageCode: lang.languageCode || '',
        displayName: lang.displayName || ''
      })).filter(lang => lang.languageCode);
    } catch (error) {
      console.error('Google Supported Languages API error:', error);
      return this.getDefaultLanguageList();
    }
  }
  
  /**
   * Default language list for fallback
   * @returns Basic list of common languages
   */
  private static getDefaultLanguageList(): Array<{ languageCode: string; displayName: string }> {
    return [
      { languageCode: 'en', displayName: 'English' },
      { languageCode: 'es', displayName: 'Spanish' },
      { languageCode: 'fr', displayName: 'French' },
      { languageCode: 'de', displayName: 'German' },
      { languageCode: 'it', displayName: 'Italian' },
      { languageCode: 'pt', displayName: 'Portuguese' },
      { languageCode: 'ru', displayName: 'Russian' },
      { languageCode: 'zh', displayName: 'Chinese' },
      { languageCode: 'ja', displayName: 'Japanese' },
      { languageCode: 'ko', displayName: 'Korean' },
      { languageCode: 'ar', displayName: 'Arabic' },
      { languageCode: 'hi', displayName: 'Hindi' }
    ];
  }
}