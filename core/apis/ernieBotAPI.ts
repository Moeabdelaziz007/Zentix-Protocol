import axios from 'axios';
import dotenv from 'dotenv';
import { AgentLogger } from '../utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * ERNIE Bot API Integration - Enhanced Asian Language Understanding
 * Features: Chinese, Japanese, Korean language processing, cultural insights
 * Get API key from Baidu ERNIE Bot platform
 */
export class ErnieBotAPI {
  private static readonly BASE_URL = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1';
  private static apiKey = process.env.ERNIE_BOT_API_KEY || '';
  private static secretKey = process.env.ERNIE_BOT_SECRET_KEY || '';
  private static accessToken: string | null = null;
  private static tokenExpiration: number | null = null;

  /**
   * Get access token for ERNIE Bot API
   * @returns Access token
   */
  private static async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
      return this.accessToken;
    }

    if (!this.apiKey || !this.secretKey) {
      throw new Error('ERNIE Bot API key and secret key are required');
    }

    try {
      const response = await axios.get(
        `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.apiKey}&client_secret=${this.secretKey}`
      );

      if (!response.data || !response.data.access_token) {
        throw new Error('Failed to obtain ERNIE Bot access token');
      }

      this.accessToken = response.data.access_token;
      // Set expiration to 25 hours (token expires in 30 days but we refresh earlier)
      this.tokenExpiration = Date.now() + 25 * 60 * 60 * 1000;

      return this.accessToken;
    } catch (error: any) {
      console.error('ERNIE Bot token error:', error.response?.data || error.message);
      throw new Error(`ERNIE Bot token error: ${error.message}`);
    }
  }

  /**
   * Translate text with cultural context for Asian languages
   * @param text Text to translate
   * @param sourceLanguage Source language code (zh, ja, ko, en)
   * @param targetLanguage Target language code (zh, ja, ko, en)
   * @returns Translated text with cultural context
   */
  static async translateWithCulturalContext(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<{
    translatedText: string;
    culturalContext: string;
    confidence: number;
    pronunciation?: string;
  }> {
    return AgentLogger.measurePerformance(
      'ErnieBotAPI',
      'translateWithCulturalContext',
      async () => {
        if (!this.apiKey || !this.secretKey) {
          // Mock data when no API key
          return this.getMockTranslation();
        }

        try {
          const token = await this.getAccessToken();
          const model = this.getModelForTranslation(sourceLanguage, targetLanguage);
          
          const response = await axios.post(
            `${this.BASE_URL}/wenxin/${model}?access_token=${token}`,
            {
              messages: [
                {
                  role: "user",
                  content: `Translate the following text from ${sourceLanguage} to ${targetLanguage} and provide cultural context:
                  
                  Text: "${text}"
                  
                  Please provide:
                  1. Accurate translation
                  2. Cultural context and nuances
                  3. Confidence score (0-1)
                  4. Pronunciation guide if applicable
                  
                  Format as JSON: {"translatedText": "...", "culturalContext": "...", "confidence": 0.x, "pronunciation": "..."}`
                }
              ],
              temperature: 0.3,
              top_p: 0.8,
              max_output_tokens: 2048
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.result) {
            throw new Error('Invalid response from ERNIE Bot API');
          }

          // Try to parse JSON from response
          try {
            const parsedResult = JSON.parse(response.data.result);
            return {
              translatedText: parsedResult.translatedText || response.data.result,
              culturalContext: parsedResult.culturalContext || 'Cultural context not provided',
              confidence: parsedResult.confidence || 0.9,
              pronunciation: parsedResult.pronunciation
            };
          } catch (parseError) {
            // If JSON parsing fails, return the raw result
            return {
              translatedText: response.data.result,
              culturalContext: 'Cultural context not provided',
              confidence: 0.8
            };
          }
        } catch (error: any) {
          console.error('ERNIE Bot translation error:', error.response?.data || error.message);
          throw new Error(`ERNIE Bot translation error: ${error.message}`);
        }
      },
      { text, sourceLanguage, targetLanguage }
    );
  }

  /**
   * Generate culturally appropriate travel tips for Asian destinations
   * @param destination Travel destination
   * @param interests User interests
   * @param duration Trip duration
   * @returns Cultural tips and recommendations
   */
  static async generateCulturalTravelTips(
    destination: string,
    interests: string[],
    duration: number
  ): Promise<{
    tips: string[];
    recommendations: string[];
    warnings: string[];
    etiquette: string[];
    dining: string[];
  }> {
    return AgentLogger.measurePerformance(
      'ErnieBotAPI',
      'generateCulturalTravelTips',
      async () => {
        if (!this.apiKey || !this.secretKey) {
          // Mock data when no API key
          return this.getMockTravelTips();
        }

        try {
          const token = await this.getAccessToken();
          
          const response = await axios.post(
            `${this.BASE_URL}/wenxin/ernie_bot_8k?access_token=${token}`,
            {
              messages: [
                {
                  role: "user",
                  content: `Generate culturally appropriate travel tips for ${destination} for a ${duration}-day trip with interests in ${interests.join(', ')}. Provide:
                  
                  1. 5 Cultural tips
                  2. 5 Local recommendations
                  3. 3 Important warnings
                  4. 4 Etiquette guidelines
                  5. 3 Dining suggestions
                  
                  Format as JSON: {"tips": [...], "recommendations": [...], "warnings": [...], "etiquette": [...], "dining": [...]}}
                  
                  Focus on cultural sensitivity and local customs.`
                }
              ],
              temperature: 0.5,
              top_p: 0.8,
              max_output_tokens: 2048
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.result) {
            throw new Error('Invalid response from ERNIE Bot API');
          }

          // Try to parse JSON from response
          try {
            const parsedResult = JSON.parse(response.data.result);
            return {
              tips: parsedResult.tips || [],
              recommendations: parsedResult.recommendations || [],
              warnings: parsedResult.warnings || [],
              etiquette: parsedResult.etiquette || [],
              dining: parsedResult.dining || []
            };
          } catch (parseError) {
            // If JSON parsing fails, return mock data
            return this.getMockTravelTips();
          }
        } catch (error: any) {
          console.error('ERNIE Bot travel tips error:', error.response?.data || error.message);
          throw new Error(`ERNIE Bot travel tips error: ${error.message}`);
        }
      },
      { destination, interests, duration }
    );
  }

  /**
   * Process Asian language text for language learning
   * @param text Text to analyze
   * @param language Language code (zh, ja, ko)
   * @returns Language learning insights
   */
  static async analyzeAsianLanguageText(
    text: string,
    language: string
  ): Promise<{
    vocabulary: Array<{ word: string; meaning: string; romaji?: string; level: string }>;
    grammar: Array<{ pattern: string; explanation: string; examples: string[] }>;
    culturalNotes: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }> {
    return AgentLogger.measurePerformance(
      'ErnieBotAPI',
      'analyzeAsianLanguageText',
      async () => {
        if (!this.apiKey || !this.secretKey) {
          // Mock data when no API key
          return this.getMockLanguageAnalysis();
        }

        try {
          const token = await this.getAccessToken();
          const model = this.getModelForLanguage(language);
          
          const response = await axios.post(
            `${this.BASE_URL}/wenxin/${model}?access_token=${token}`,
            {
              messages: [
                {
                  role: "user",
                  content: `Analyze the following ${language} text for language learning purposes:
                  
                  Text: "${text}"
                  
                  Please provide:
                  1. Vocabulary list with meanings and difficulty levels
                  2. Grammar patterns used
                  3. Cultural notes
                  4. Overall difficulty assessment
                  
                  Format as JSON: {"vocabulary": [...], "grammar": [...], "culturalNotes": [...], "difficulty": "..."}
                  
                  Focus on educational value for language learners.`
                }
              ],
              temperature: 0.3,
              top_p: 0.8,
              max_output_tokens: 2048
            },
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.result) {
            throw new Error('Invalid response from ERNIE Bot API');
          }

          // Try to parse JSON from response
          try {
            const parsedResult = JSON.parse(response.data.result);
            return {
              vocabulary: parsedResult.vocabulary || [],
              grammar: parsedResult.grammar || [],
              culturalNotes: parsedResult.culturalNotes || [],
              difficulty: parsedResult.difficulty || 'intermediate'
            };
          } catch (parseError) {
            // If JSON parsing fails, return mock data
            return this.getMockLanguageAnalysis();
          }
        } catch (error: any) {
          console.error('ERNIE Bot language analysis error:', error.response?.data || error.message);
          throw new Error(`ERNIE Bot language analysis error: ${error.message}`);
        }
      },
      { text, language }
    );
  }

  /**
   * Get appropriate model for translation based on languages
   */
  private static getModelForTranslation(sourceLang: string, targetLang: string): string {
    // For Asian language translations, use ERNIE Bot enhanced models
    if (['zh', 'ja', 'ko'].includes(sourceLang) || ['zh', 'ja', 'ko'].includes(targetLang)) {
      return 'ernie_bot_8k';
    }
    return 'ernie_bot';
  }

  /**
   * Get appropriate model for language processing
   */
  private static getModelForLanguage(language: string): string {
    switch (language) {
      case 'zh':
        return 'ernie_bot_8k';
      case 'ja':
        return 'ernie_bot_8k';
      case 'ko':
        return 'ernie_bot_8k';
      default:
        return 'ernie_bot';
    }
  }

  private static getMockTranslation(): any {
    return {
      translatedText: 'Mock translation result',
      culturalContext: 'Mock cultural context for the translation',
      confidence: 0.95,
      pronunciation: 'Mock pronunciation guide'
    };
  }

  private static getMockTravelTips(): any {
    return {
      tips: [
        'Learn basic greetings in the local language',
        'Understand local customs and etiquette',
        'Carry cash as many places do not accept cards',
        'Respect religious sites and practices',
        'Dress modestly when visiting temples or religious sites'
      ],
      recommendations: [
        'Visit local markets for authentic experiences',
        'Try street food from reputable vendors',
        'Use public transportation to explore like a local',
        'Visit during local festivals for cultural immersion',
        'Stay in traditional accommodations when possible'
      ],
      warnings: [
        'Be aware of local laws and regulations',
        'Respect religious and cultural sites',
        'Keep emergency contact information handy',
        'Avoid controversial political topics',
        'Be cautious with photography in sensitive areas'
      ],
      etiquette: [
        'Remove shoes when entering homes or temples',
        'Use both hands when giving or receiving items',
        'Bow slightly when greeting elders',
        'Do not point with your finger or chopsticks'
      ],
      dining: [
        'Try local specialties and regional dishes',
        'Observe how locals eat and follow their lead',
        'Learn basic food-related phrases in the local language'
      ]
    };
  }

  private static getMockLanguageAnalysis(): any {
    return {
      vocabulary: [
        {
          word: '示例',
          meaning: 'Example',
          romaji: 'Rei',
          level: 'beginner'
        }
      ],
      grammar: [
        {
          pattern: '～ています',
          explanation: 'Present continuous tense',
          examples: ['食べています (tabete imasu - eating)', '見ています (mite imasu - watching)']
        }
      ],
      culturalNotes: [
        'This text contains culturally significant references to local customs'
      ],
      difficulty: 'intermediate'
    };
  }
}

export const ernieBotService = new ErnieBotAPI();