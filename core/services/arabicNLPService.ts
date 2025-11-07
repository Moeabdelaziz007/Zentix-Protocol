/**
 * Arabic NLP Service
 * Provides specialized natural language processing for Arabic dialects
 * Integrates with CAMeL Tools and other Arabic-specific NLP libraries
 */

import { AgentLogger, LogLevel } from '../utils/agentLogger';

// Types for Arabic NLP processing
interface DialectDetectionResult {
  dialect: 'msa' | 'egyptian' | 'gulf' | 'levantine' | 'maghrebi' | 'other';
  confidence: number;
  alternativeDialects: Array<{dialect: string, confidence: number}>;
}

interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  confidence: number;
  keyPhrases: string[];
  emotions: Array<{emotion: string, intensity: number}>;
}

interface NamedEntity {
  text: string;
  type: 'person' | 'location' | 'organization' | 'product' | 'date' | 'time' | 'money' | 'percentage' | 'other';
  startIndex: number;
  endIndex: number;
}

interface TextAnalysisResult {
  language: 'arabic';
  dialect: string;
  sentiment: SentimentAnalysisResult;
  entities: NamedEntity[];
  keywords: string[];
  summary: string;
}

export class ArabicNLPService {
  private static instance: ArabicNLPService;
  private camelTools: any; // Would be CAMeL Tools integration
  private dialectModels: Map<string, any>;

  private constructor() {
    // Initialize dialect-specific models
    this.dialectModels = new Map([
      ['egyptian', null], // Would integrate with CAMeL Tools Egyptian model
      ['gulf', null],     // Gulf dialect model
      ['levantine', null] // Levantine dialect model
    ]);

    AgentLogger.log(LogLevel.INFO, 'ArabicNLPService', 'Arabic NLP Service initialized');
  }

  public static getInstance(): ArabicNLPService {
    if (!ArabicNLPService.instance) {
      ArabicNLPService.instance = new ArabicNLPService();
    }
    return ArabicNLPService.instance;
  }

  /**
   * Detect Arabic dialect in text
   */
  async detectDialect(text: string): Promise<DialectDetectionResult> {
    return AgentLogger.measurePerformance(
      'ArabicNLPService',
      'detectDialect',
      async () => {
        // In a real implementation, this would use CAMeL Tools or similar
        // For now, we'll mock the detection based on common dialectal keywords
        
        const dialectIndicators = {
          egyptian: ['زيادة', 'بردو', 'معلش', 'عايز', 'خلصان'],
          gulf: ['والله', 'شلونك', 'هاي', 'ين', 'وين'],
          levantine: ['شو', 'كيفك', 'هاي', 'شو بعمل', 'شو اسمك'],
          maghrebi: ['كيفاش', 'واحد', 'fin', 'smiتك', 'شحال']
        };

        let scores: Record<string, number> = {
          egyptian: 0,
          gulf: 0,
          levantine: 0,
          maghrebi: 0,
          msa: 0
        };

        // Count dialect indicators
        Object.entries(dialectIndicators).forEach(([dialect, indicators]) => {
          indicators.forEach(indicator => {
            if (text.includes(indicator)) {
              scores[dialect] += 1;
            }
          });
        });

        // If no dialect indicators found, assume MSA
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        if (totalScore === 0) {
          scores.msa = 1;
        }

        // Find the dialect with the highest score
        const detectedDialect = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
        const confidence = totalScore > 0 ? scores[detectedDialect] / totalScore : 1;

        // Get alternative dialects sorted by confidence
        const alternativeDialects = Object.entries(scores)
          .filter(([dialect, score]) => dialect !== detectedDialect && score > 0)
          .map(([dialect, score]) => ({
            dialect,
            confidence: score / totalScore
          }))
          .sort((a, b) => b.confidence - a.confidence);

        const result: DialectDetectionResult = {
          dialect: detectedDialect as any,
          confidence,
          alternativeDialects
        };

        AgentLogger.log(LogLevel.DEBUG, 'ArabicNLPService', `Dialect detected: ${detectedDialect} with confidence ${confidence}`);
        return result;
      }
    );
  }

  /**
   * Perform sentiment analysis on Arabic text
   */
  async analyzeSentiment(text: string, dialect?: string): Promise<SentimentAnalysisResult> {
    return AgentLogger.measurePerformance(
      'ArabicNLPService',
      'analyzeSentiment',
      async () => {
        // In a real implementation, this would use dialect-specific models
        // For now, we'll mock the analysis based on sentiment keywords
        
        // Arabic sentiment keywords (simplified for demonstration)
        const positiveKeywords = [
          // MSA
          'جميل', 'رائع', 'ممتاز', 'جودة', 'سريع', 'مفيد', 'مستحسن', 'مقبول', 'فعال', 'ممتاز',
          // Egyptian
          'حلو', 'زي الفل', 'مبهج', 'ممتاز', 'جدع',
          // Gulf
          'ممتاز', 'راقي', 'حلو', 'مبهج', 'مقبول',
          // Levantine
          'ممتاز', 'حلو', 'مبهج', 'مقبول', 'جبار'
        ];
        
        const negativeKeywords = [
          // MSA
          'سيء', 'رديء', 'متأخر', 'مشكلة', 'باهظ', 'غير مفيد', 'فاشل', 'مخيب', 'ضعيف',
          // Egyptian
          'وحش', 'زفت', 'متأخر', 'مشكلة', 'باهظ', 'زبال',
          // Gulf
          'سيء', 'رديء', 'متأخر', 'مشكلة', 'باهظ', 'خاسئ',
          // Levantine
          'سيء', 'رديء', 'متأخر', 'مشكلة', 'باهظ', 'فاشل'
        ];

        let score = 0;
        let positiveCount = 0;
        let negativeCount = 0;

        // Count positive keywords
        positiveKeywords.forEach(keyword => {
          const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
          positiveCount += matches;
          score += matches * 0.1;
        });

        // Count negative keywords
        negativeKeywords.forEach(keyword => {
          const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
          negativeCount += matches;
          score -= matches * 0.1;
        });

        // Clamp score between -1 and 1
        score = Math.max(-1, Math.min(1, score));

        let sentiment: 'positive' | 'negative' | 'neutral';
        if (score > 0.1) {
          sentiment = 'positive';
        } else if (score < -0.1) {
          sentiment = 'negative';
        } else {
          sentiment = 'neutral';
        }

        // Extract key phrases (simplified)
        const keyPhrases = this.extractKeyPhrases(text);

        const result: SentimentAnalysisResult = {
          sentiment,
          score,
          confidence: Math.abs(score) > 0.5 ? 0.9 : 0.7,
          keyPhrases,
          emotions: this.detectEmotions(text, sentiment)
        };

        AgentLogger.log(LogLevel.DEBUG, 'ArabicNLPService', `Sentiment analyzed: ${sentiment} with score ${score}`);
        return result;
      }
    );
  }

  /**
   * Extract named entities from Arabic text
   */
  async extractEntities(text: string): Promise<NamedEntity[]> {
    return AgentLogger.measurePerformance(
      'ArabicNLPService',
      'extractEntities',
      async () => {
        // In a real implementation, this would use specialized NER models
        // For now, we'll mock entity extraction
        
        const entities: NamedEntity[] = [];
        
        // Simple pattern matching for demonstration
        // In reality, this would use proper NER models
        
        // Extract potential product names (simplified)
        const productPatterns = [
          /[\u0600-\u06FF]+\s*[\u0600-\u06FF]+/g, // Arabic words
        ];
        
        productPatterns.forEach(pattern => {
          const matches = text.match(pattern);
          if (matches) {
            matches.forEach(match => {
              const index = text.indexOf(match);
              if (index !== -1) {
                entities.push({
                  text: match,
                  type: 'product',
                  startIndex: index,
                  endIndex: index + match.length
                });
              }
            });
          }
        });

        AgentLogger.log(LogLevel.DEBUG, 'ArabicNLPService', `Extracted ${entities.length} entities`);
        return entities;
      }
    );
  }

  /**
   * Extract keywords from Arabic text
   */
  async extractKeywords(text: string, count: number = 10): Promise<string[]> {
    return AgentLogger.measurePerformance(
      'ArabicNLPService',
      'extractKeywords',
      async () => {
        // In a real implementation, this would use TF-IDF or similar algorithms
        // For now, we'll mock keyword extraction
        
        // Simple approach: split by spaces and remove common Arabic stop words
        const stopWords = new Set([
          'ال', 'أن', 'أنه', 'أنها', 'أنهم', 'أنهن', 'أنهما', 'أنهما', 'في', 'على', 'من', 'إلى', 'عن', 'مع', 'بعد', 'قبل', 'أثناء'
        ]);
        
        const words = text.split(/\s+/)
          .map(word => word.replace(/[^\u0600-\u06FF]/g, '')) // Keep only Arabic characters
          .filter(word => word.length > 2 && !stopWords.has(word));
        
        // Count word frequencies
        const wordFreq: Record<string, number> = {};
        words.forEach(word => {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
        
        // Sort by frequency and return top keywords
        const keywords = Object.entries(wordFreq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, count)
          .map(([word]) => word);
        
        return keywords;
      }
    );
  }

  /**
   * Generate text summary
   */
  async summarizeText(text: string, sentences: number = 3): Promise<string> {
    return AgentLogger.measurePerformance(
      'ArabicNLPService',
      'summarizeText',
      async () => {
        // In a real implementation, this would use extractive or abstractive summarization
        // For now, we'll mock summarization by taking the first few sentences
        
        const sentenceEndings = /[.!?؟]/g;
        const sentencesArray = text.split(sentenceEndings)
          .map(s => s.trim())
          .filter(s => s.length > 0);
        
        const summary = sentencesArray.slice(0, sentences).join('. ') + '.';
        return summary;
      }
    );
  }

  /**
   * Complete text analysis
   */
  async analyzeText(text: string): Promise<TextAnalysisResult> {
    return AgentLogger.measurePerformance(
      'ArabicNLPService',
      'analyzeText',
      async () => {
        // Detect dialect
        const dialectResult = await this.detectDialect(text);
        
        // Analyze sentiment
        const sentimentResult = await this.analyzeSentiment(text, dialectResult.dialect);
        
        // Extract entities
        const entities = await this.extractEntities(text);
        
        // Extract keywords
        const keywords = await this.extractKeywords(text);
        
        // Generate summary
        const summary = await this.summarizeText(text);
        
        const result: TextAnalysisResult = {
          language: 'arabic',
          dialect: dialectResult.dialect,
          sentiment: sentimentResult,
          entities,
          keywords,
          summary
        };
        
        return result;
      }
    );
  }

  /**
   * Extract key phrases from text
   */
  private extractKeyPhrases(text: string): string[] {
    // Simplified key phrase extraction
    const phrases = text.split(/[.!?؟]/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .slice(0, 3); // Take first 3 sentences as key phrases
    
    return phrases;
  }

  /**
   * Detect emotions in text
   */
  private detectEmotions(text: string, sentiment: string): Array<{emotion: string, intensity: number}> {
    // Simplified emotion detection based on sentiment
    const emotions: Array<{emotion: string, intensity: number}> = [];
    
    switch (sentiment) {
      case 'positive':
        emotions.push({emotion: 'joy', intensity: 0.8});
        emotions.push({emotion: 'trust', intensity: 0.7});
        emotions.push({emotion: 'anticipation', intensity: 0.6});
        break;
      case 'negative':
        emotions.push({emotion: 'anger', intensity: 0.8});
        emotions.push({emotion: 'sadness', intensity: 0.7});
        emotions.push({emotion: 'disgust', intensity: 0.6});
        break;
      case 'neutral':
        emotions.push({emotion: 'neutral', intensity: 0.9});
        emotions.push({emotion: 'surprise', intensity: 0.3});
        break;
    }
    
    return emotions;
  }
}