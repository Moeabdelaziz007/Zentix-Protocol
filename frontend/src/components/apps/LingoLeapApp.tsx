import { useState, useRef } from 'react';
import { 
  Languages, 
  Mic, 
  MicOff, 
  Volume2, 
  Camera, 
  BookOpen, 
  Map, 
  Youtube, 
  Zap, 
  MessageSquare, 
  Target, 
  Trophy,
  RotateCcw,
  Coffee,
  Building,
  MapPin,
  ShoppingBag,
  Briefcase,
  Play,
  Clock,
  Users,
  Award,
  Upload,
  X,
  FileAudio,
  FileVideo,
  Sparkles,
  Globe
} from 'lucide-react';

interface Translation {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: string;
  pronunciation?: string;
}

interface LeapCard {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  etymology?: string;
  context: string;
  examples: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface LearningProgress {
  wordsLearned: number;
  streak: number;
  accuracy: number;
  weeklyGoal: number;
  completedLessons: number;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: React.ReactNode;
}

interface EducationalVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  duration: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  keyPhrases: string[];
}

interface VideoAnalysis {
  transcript: string;
  keyPhrases: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  learningOpportunities: string[];
}

// Add new interfaces for Gemini 2.5 Pro features
interface InteractiveContent {
  leapCards: LeapCard[];
  conversationPrompts: string[];
  culturalNotes: string[];
}

interface AudioAnalysis {
  transcript: string;
  keyPhrases: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  pronunciationTips: string[];
  summary: string;
}

export function LingoLeapApp() {
  const [activeTab, setActiveTab] = useState<'translate' | 'cards' | 'conversation' | 'progress' | 'entertainment'>('translate');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [leapCards, setLeapCards] = useState<LeapCard[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [userInput, setUserInput] = useState('');
  const [progress] = useState<LearningProgress>({
    wordsLearned: 127,
    streak: 8,
    accuracy: 85,
    weeklyGoal: 75,
    completedLessons: 23
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [educationalVideos, setEducationalVideos] = useState<EducationalVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<EducationalVideo | null>(null);
  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysis | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [interactiveContent, setInteractiveContent] = useState<InteractiveContent | null>(null);
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysis | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ar', name: 'Arabic' }
  ];

  const scenarios: Scenario[] = [
    {
      id: 'cafe',
      name: 'Café Order',
      description: 'Ordering food and drinks at a café',
      difficulty: 'beginner',
      icon: <Coffee />
    },
    {
      id: 'hotel',
      name: 'Hotel Check-in',
      description: 'Checking in at a hotel',
      difficulty: 'beginner',
      icon: <Building />
    },
    {
      id: 'directions',
      name: 'Asking Directions',
      description: 'Getting directions from locals',
      difficulty: 'intermediate',
      icon: <MapPin />
    },
    {
      id: 'shopping',
      name: 'Shopping',
      description: 'Buying clothes and items',
      difficulty: 'intermediate',
      icon: <ShoppingBag />
    },
    {
      id: 'business',
      name: 'Business Meeting',
      description: 'Professional conversation',
      difficulty: 'advanced',
      icon: <Briefcase />
    }
  ];

  const handleTranslate = () => {
    if (!sourceText.trim()) return;
    
    // Simulate translation
    const newTranslation: Translation = {
      id: Date.now().toString(),
      originalText: sourceText,
      translatedText: `Translated: ${sourceText}`,
      sourceLanguage,
      targetLanguage,
      timestamp: new Date().toISOString(),
      pronunciation: `[${sourceText.split(' ').map(() => 'pron').join('-')}]`
    };
    
    setTranslations(prev => [newTranslation, ...prev.slice(0, 9)]);
    setTargetText(newTranslation.translatedText);
    
    // Generate sample leap cards
    const words = sourceText.split(' ').slice(0, 3);
    const newCards: LeapCard[] = words.map((word, index) => ({
      id: `card-${Date.now()}-${index}`,
      word,
      translation: `Translation of ${word}`,
      pronunciation: `[${word.toLowerCase()}]`,
      etymology: `From Latin "${word.toLowerCase()}-us" meaning...`,
      context: `Used in: "${sourceText}"`,
      examples: [`Example sentence with ${word}`, `Another example with ${word}`],
      difficulty: index % 3 === 0 ? 'beginner' : index % 3 === 1 ? 'intermediate' : 'advanced'
    }));
    
    setLeapCards(newCards);
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // In a real implementation, this would connect to speech recognition API
    if (!isListening) {
      setSourceText('Hello, how are you today?');
    }
  };

  const handleTextToSpeech = () => {
    setIsSpeaking(!isSpeaking);
    // In a real implementation, this would connect to TTS API
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate OCR translation
      setSourceText('Welcome to our restaurant. Today\'s special is pasta with truffle sauce.');
      setTargetText('مرحبًا بكم في مطعمنا. اليوم الخاص لدينا هو المعكرونة مع صلصة الترفل.');
    }
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    // Add user message
    setConversationMessages(prev => [...prev, { role: 'user', content: userInput }]);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great question! In Spanish we would say...",
        "Perfect pronunciation! Let me show you another way to express that.",
        "Interesting point. Here's how a native speaker might respond...",
        "Good job! Now let's try a more complex sentence.",
        "Excellent! You're making great progress."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setConversationMessages(prev => [...prev, { role: 'ai', content: randomResponse }]);
    }, 1000);
    
    setUserInput('');
  };

  const startScenario = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setConversationMessages([
      { role: 'ai', content: 'Hello! Welcome to our café. What can I get for you today?' }
    ]);
  };

  const resetScenario = () => {
    setSelectedScenario(null);
    setConversationMessages([]);
  };

  const searchEducationalVideos = async (searchTopic: string) => {
    if (!searchTopic.trim()) return;
    
    try {
      setVideoLoading(true);
      
      // In a real implementation, this would call the YouTubeAPI
      // For now, we'll simulate the video search
      const mockVideos: EducationalVideo[] = [
        {
          id: 'vid1',
          title: `Learn ${searchTopic} - Complete Beginner Tutorial`,
          description: `Start learning ${searchTopic} with this comprehensive beginner tutorial...`,
          channelTitle: 'Language Learning Channel',
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          thumbnail: 'https://via.placeholder.com/320x180?text=Video+1',
          viewCount: 125000,
          likeCount: 9800,
          duration: 'PT12M30S',
          difficultyLevel: 'beginner',
          keyPhrases: [searchTopic, 'basics', 'introduction', 'fundamentals']
        },
        {
          id: 'vid2',
          title: `Intermediate ${searchTopic} Techniques`,
          description: `Take your ${searchTopic} skills to the next level with these intermediate techniques...`,
          channelTitle: 'Advanced Learning',
          publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          thumbnail: 'https://via.placeholder.com/320x180?text=Video+2',
          viewCount: 78000,
          likeCount: 6500,
          duration: 'PT18M15S',
          difficultyLevel: 'intermediate',
          keyPhrases: [searchTopic, 'techniques', 'practice', 'skills']
        },
        {
          id: 'vid3',
          title: `Advanced ${searchTopic} Masterclass`,
          description: `Master ${searchTopic} with this advanced masterclass...`,
          channelTitle: 'Expert Tutorials',
          publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          thumbnail: 'https://via.placeholder.com/320x180?text=Video+3',
          viewCount: 45000,
          likeCount: 3200,
          duration: 'PT25M45S',
          difficultyLevel: 'advanced',
          keyPhrases: [searchTopic, 'advanced', 'mastery', 'expert']
        }
      ];
      
      setEducationalVideos(mockVideos);
      setVideoLoading(false);
    } catch (error) {
      console.error('Video search failed:', error);
      setVideoLoading(false);
    }
  };

  // Function is kept for compatibility but not used in new implementation
  const analyzeVideo = async () => {
    // Implementation is now handled by Gemini 2.5 Pro
  };

  const processMediaWithGemini = async (file: File) => {
    if (!file) return;
    
    try {
      setIsProcessing(true);
      setProcessingProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      // In a real implementation, this would call the Gemini25ProAPI
      // For now, we'll simulate the processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      // Mock results based on file type
      if (file.type.startsWith('video/')) {
        // Mock video analysis results
        const mockInteractiveContent: InteractiveContent = {
          leapCards: [
            {
              id: 'card-1',
              word: 'innovative',
              translation: 'مبتكر',
              pronunciation: 'in-no-vuh-tiv',
              etymology: 'From Latin "innovatus" meaning "to renew"',
              context: 'The company showcased innovative solutions at the conference.',
              examples: [
                'Their innovative approach solved the problem.',
                'She is known for her innovative ideas.'
              ],
              difficulty: 'advanced'
            },
            {
              id: 'card-2',
              word: 'technology',
              translation: 'تقنية',
              pronunciation: 'tek-nol-uh-jee',
              etymology: 'From Greek "techne" meaning "art, skill" and "-logy" meaning "study of"',
              context: 'Modern technology has transformed how we communicate.',
              examples: [
                'Advances in technology are rapid.',
                'He works in information technology.'
              ],
              difficulty: 'intermediate'
            }
          ],
          conversationPrompts: [
            'How has technology changed your daily life?',
            'What innovative solutions have you seen recently?',
            'Do you prefer traditional methods or new technology?'
          ],
          culturalNotes: [
            'Different cultures adopt technology at varying rates.',
            'Technology often reflects societal values and priorities.'
          ]
        };
        
        setInteractiveContent(mockInteractiveContent);
      } else if (file.type.startsWith('audio/')) {
        // Mock audio analysis results
        const mockAudioAnalysis: AudioAnalysis = {
          transcript: 'Welcome to our language learning session. Today we will discuss innovative approaches to technology adoption. It\'s important to understand how different cultures interact with new technological solutions.',
          keyPhrases: [
            'language learning',
            'innovative approaches',
            'technology adoption',
            'cultural interaction'
          ],
          difficultyLevel: 'intermediate',
          pronunciationTips: [
            'Focus on the "th" sound in "technology"',
            'Practice the rhythm in "innovative approaches"',
            'Emphasize "cultural" correctly'
          ],
          summary: 'Discussion about technology adoption and cultural interactions in language learning.'
        };
        
        setAudioAnalysis(mockAudioAnalysis);
      }
      
      // Reset progress after a delay
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Media processing failed:', error);
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      processMediaWithGemini(file);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-500';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-500';
      case 'advanced': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 border-b border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Languages className="w-6 h-6 text-primary" />
          LingoLeap - Immersive Language Coach
        </h2>
        <p className="text-muted-foreground">
          Speak like a native, not like a textbook.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab('translate')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'translate'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Languages className="w-4 h-4 inline mr-2" />
          Translate
        </button>
        <button
          onClick={() => setActiveTab('cards')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'cards'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          Leap Cards
        </button>
        <button
          onClick={() => setActiveTab('conversation')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'conversation'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Conversation
        </button>
        <button
          onClick={() => setActiveTab('entertainment')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'entertainment'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Youtube className="w-4 h-4 inline mr-2" />
          Entertainment
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'progress'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Trophy className="w-4 h-4 inline mr-2" />
          Progress
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex border-b border-border/50 mb-6">
            <button
              onClick={() => setActiveTab('translate')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'translate'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Languages className="w-4 h-4 inline mr-2" />
              Translate
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'cards'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Leap Cards
            </button>
            <button
              onClick={() => setActiveTab('conversation')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'conversation'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Conversation
            </button>
            <button
              onClick={() => setActiveTab('entertainment')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'entertainment'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Youtube className="w-4 h-4 inline mr-2" />
              Entertainment
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'progress'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Progress
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'translate' && (
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-background/50 border border-border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Source Text</h3>
                      <div className="flex gap-2">
                        <select
                          value={sourceLanguage}
                          onChange={(e) => setSourceLanguage(e.target.value)}
                          className="px-2 py-1 rounded border border-border bg-background text-sm"
                          aria-label="Source language"
                        >
                          {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleVoiceInput}
                          className={`p-2 rounded-lg transition-colors ${
                            isListening 
                              ? 'bg-red-500 text-white' 
                              : 'bg-background/50 border border-border hover:bg-background/70'
                          }`}
                          aria-label={isListening ? "Stop voice input" : "Start voice input"}
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={handleImageUpload}
                          className="p-2 rounded-lg bg-background/50 border border-border hover:bg-background/70 transition-colors"
                          aria-label="Upload image for translation"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                          aria-label="Upload image file"
                        />
                      </div>
                    </div>
                    <textarea
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                      placeholder="Enter text to translate..."
                      className="w-full h-40 p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="bg-background/50 border border-border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Translation</h3>
                      <div className="flex gap-2">
                        <select
                          value={targetLanguage}
                          onChange={(e) => setTargetLanguage(e.target.value)}
                          className="px-2 py-1 rounded border border-border bg-background text-sm"
                          aria-label="Target language"
                        >
                          {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleTextToSpeech}
                          className={`p-2 rounded-lg transition-colors ${
                            isSpeaking 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-background/50 border border-border hover:bg-background/70'
                          }`}
                          aria-label={isSpeaking ? "Stop text to speech" : "Start text to speech"}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="h-40 p-3 rounded-lg border border-border bg-background overflow-auto">
                      {targetText || (
                        <div className="text-muted-foreground h-full flex items-center justify-center">
                          Translation will appear here
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mb-6">
                  <button
                    onClick={handleTranslate}
                    disabled={!sourceText.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    aria-label="Translate text"
                  >
                    <Zap className="w-4 h-4" />
                    Translate
                  </button>
                </div>
                
                {translations.length > 0 && (
                  <div className="bg-background/50 border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Translations</h3>
                    <div className="space-y-3">
                      {translations.map(translation => (
                        <div key={translation.id} className="p-3 bg-background/50 border border-border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm font-medium">
                              {languages.find(l => l.code === translation.sourceLanguage)?.name} → {languages.find(l => l.code === translation.targetLanguage)?.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(translation.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="text-foreground">{translation.originalText}</div>
                            <div className="text-primary">{translation.translatedText}</div>
                          </div>
                          {translation.pronunciation && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Pronunciation: {translation.pronunciation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cards' && (
              <div>
                <div className="bg-background/50 border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">LeapCards - Interactive Learning</h3>
                  <p className="text-muted-foreground mb-4">
                    Click on any card to explore word details, etymology, and usage examples.
                  </p>
                  
                  {leapCards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {leapCards.map(card => (
                        <div key={card.id} className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg text-foreground">{card.word}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(card.difficulty)}`}>
                              {card.difficulty}
                            </span>
                          </div>
                          <div className="text-primary mb-2">{card.translation}</div>
                          <div className="text-sm text-muted-foreground mb-3">{card.pronunciation}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">{card.context}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p>Translate some text to generate learning cards</p>
                    </div>
                  )}
                </div>
                
                {leapCards.length > 0 && (
                  <div className="bg-background/50 border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Word Etymology</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Origin of "{leapCards[0]?.word}"</h4>
                        <p className="text-muted-foreground text-sm">
                          {leapCards[0]?.etymology || "The word has ancient roots in Latin and evolved through various forms..."}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Usage Examples</h4>
                        <ul className="space-y-2">
                          {leapCards[0]?.examples.map((example, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'conversation' && (
              <div className="max-w-4xl mx-auto">
                {!selectedScenario ? (
                  <div>
                    <div className="bg-background/50 border border-border rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold mb-4">Choose a Scenario</h3>
                      <p className="text-muted-foreground mb-6">
                        Practice real-world conversations in immersive scenarios
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scenarios.map(scenario => (
                          <div 
                            key={scenario.id}
                            onClick={() => startScenario(scenario.id)}
                            className="p-4 bg-background/50 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                {scenario.icon}
                              </div>
                              <h4 className="font-medium text-foreground">{scenario.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                            <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(scenario.difficulty)}`}>
                              {scenario.difficulty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-background/50 border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Free Conversation</h3>
                      <p className="text-muted-foreground mb-4">
                        Start a conversation in any language without a specific scenario
                      </p>
                      <button
                        onClick={() => startScenario('free')}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Start Free Conversation
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-background/50 border border-border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        {scenarios.find(s => s.id === selectedScenario)?.name || 'Conversation Practice'}
                      </h3>
                      <button
                        onClick={resetScenario}
                        className="p-2 rounded-lg bg-background/50 border border-border hover:bg-background/70 transition-colors"
                        aria-label="Reset conversation scenario"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4 mb-4 max-h-96 overflow-y-auto p-4 bg-background/30 rounded-lg">
                      {conversationMessages.map((msg, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg ${
                            msg.role === 'user' 
                              ? 'bg-primary/10 border border-primary/20 ml-8' 
                              : 'bg-background/50 border border-border mr-8'
                          }`}
                        >
                          <div className="font-medium text-sm mb-1">
                            {msg.role === 'user' ? 'You' : 'Native Speaker'}
                          </div>
                          <p className="text-foreground">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your response..."
                        className="flex-1 p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        aria-label="Send message"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'progress' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-background/50 border border-border rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{progress.wordsLearned}</div>
                        <div className="text-sm text-muted-foreground">Words Learned</div>
                      </div>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                  
                  <div className="bg-background/50 border border-border rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-500/20 rounded-lg text-green-500">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{progress.streak}</div>
                        <div className="text-sm text-muted-foreground">Day Streak</div>
                      </div>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }} />
                    </div>
                  </div>
                  
                  <div className="bg-background/50 border border-border rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{progress.accuracy}%</div>
                        <div className="text-sm text-muted-foreground">Accuracy</div>
                      </div>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${progress.accuracy}%` }} />
                    </div>
                  </div>
                  
                  <div className="bg-background/50 border border-border rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg text-purple-500">
                        <Map className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{progress.completedLessons}</div>
                        <div className="text-sm text-muted-foreground">Lessons</div>
                      </div>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
                
                <div className="bg-background/50 border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Learning Map</h3>
                  <div className="relative h-64 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg border border-border">
                    {/* Simplified visual map representation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Map className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground">Interactive Learning Map</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                          Unlock new regions as you learn more words and phrases
                        </p>
                      </div>
                    </div>
                    
                    {/* Sample unlocked areas */}
                    <div className="absolute top-8 left-8 w-16 h-16 bg-green-500/20 rounded-full border-2 border-green-500 flex items-center justify-center">
                      <span className="text-xs text-green-500 font-bold">Basics</span>
                    </div>
                    <div className="absolute top-16 right-12 w-16 h-16 bg-blue-500/20 rounded-full border-2 border-blue-500 flex items-center justify-center">
                      <span className="text-xs text-blue-500 font-bold">Travel</span>
                    </div>
                    <div className="absolute bottom-12 left-16 w-16 h-16 bg-yellow-500/20 rounded-full border-2 border-yellow-500 flex items-center justify-center">
                      <span className="text-xs text-yellow-500 font-bold">Food</span>
                    </div>
                    <div className="absolute bottom-8 right-8 w-16 h-16 bg-gray-500/20 rounded-full border-2 border-gray-500 flex items-center justify-center">
                      <span className="text-xs text-gray-500 font-bold">Locked</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background/50 border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Weekly Goal Progress</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#333"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="8"
                          strokeDasharray={`${progress.weeklyGoal} 100`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-foreground">{progress.weeklyGoal}%</span>
                        <span className="text-xs text-muted-foreground">Goal</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-foreground">This Week</span>
                        <span className="text-sm text-muted-foreground">75% of goal</span>
                      </div>
                      <div className="w-full bg-background/50 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full" style={{ width: '75%' }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Keep going! You're 25% away from your weekly goal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'entertainment' && (
              <div className="space-y-6">
                <div className="bg-background/50 border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-500" />
                    Educational Video Learning
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Discover educational videos to enhance your language learning experience
                  </p>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <input
                      type="text"
                      placeholder="Search for educational videos (e.g., cooking, travel, technology)"
                      className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          searchEducationalVideos(target.value);
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input');
                        if (input) {
                          searchEducationalVideos(input.value);
                        }
                      }}
                      disabled={videoLoading}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {videoLoading ? 'Searching...' : 'Search Videos'}
                    </button>
                  </div>
                </div>
                
                {educationalVideos.length > 0 && (
                  <div className="bg-background/50 border border-border rounded-xl p-6">
                    <h4 className="font-semibold mb-4">Search Results</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {educationalVideos.map((video) => (
                        <div 
                          key={video.id}
                          className="bg-background border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedVideo(video);
                            analyzeVideo();
                          }}
                        >
                          <div className="relative">
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              className="w-full h-40 object-cover"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {video.duration}
                            </div>
                          </div>
                          <div className="p-3">
                            <h5 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h5>
                            <p className="text-xs text-muted-foreground mb-2">{video.channelTitle}</p>
                            <div className="flex justify-between items-center">
                              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(video.difficultyLevel)}`}>
                                {video.difficultyLevel}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="w-3 h-3" />
                                {video.viewCount >= 1000 ? `${(video.viewCount/1000).toFixed(1)}K` : video.viewCount}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedVideo && videoAnalysis && (
                  <div className="bg-background/50 border border-border rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold">Video Analysis: {selectedVideo.title}</h4>
                      <button 
                        onClick={() => {
                          setSelectedVideo(null);
                          setVideoAnalysis(null);
                        }}
                        className="p-1 rounded hover:bg-muted"
                        aria-label="Close video analysis"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium mb-2">Key Learning Phrases</h5>
                        <div className="flex flex-wrap gap-2">
                          {videoAnalysis.keyPhrases.map((phrase, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-primary/20 text-primary text-sm rounded-full"
                            >
                              {phrase}
                            </span>
                          ))}
                        </div>
                        
                        <h5 className="font-medium mt-4 mb-2">Learning Opportunities</h5>
                        <ul className="space-y-1">
                          {videoAnalysis.learningOpportunities.map((opportunity, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Award className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{opportunity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Video Transcript</h5>
                        <div className="bg-background/50 border border-border rounded-lg p-3 max-h-40 overflow-y-auto">
                          <p className="text-sm">{videoAnalysis.transcript}</p>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-sm ${getDifficultyColor(videoAnalysis.difficultyLevel)}`}>
                            {videoAnalysis.difficultyLevel.charAt(0).toUpperCase() + videoAnalysis.difficultyLevel.slice(1)} Level
                          </span>
                          <button className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1">
                            <Play className="w-4 h-4" />
                            Watch Video
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Gemini 2.5 Pro Media Analysis Section */}
                <div className="bg-background/50 border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    AI-Powered Media Learning with Gemini 2.5 Pro
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Upload videos or audio files for advanced language learning analysis
                  </p>
                  
                  {/* Media Upload */}
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="video/*,audio/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                      id="media-upload"
                    />
                    <label 
                      htmlFor="media-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {mediaFile ? (
                          mediaFile.type.startsWith('video/') ? (
                            <FileVideo className="w-6 h-6 text-primary" />
                          ) : (
                            <FileAudio className="w-6 h-6 text-primary" />
                          )
                        ) : (
                          <Upload className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {mediaFile ? mediaFile.name : 'Upload Video or Audio File'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {mediaFile ? 'Click to change file' : 'Supported formats: MP4, MOV, WAV, MP3'}
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  {/* Processing Indicator */}
                  {isProcessing && (
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Processing media with Gemini 2.5 Pro...</span>
                            <span>{processingProgress}%</span>
                          </div>
                          <div className="w-full bg-background/50 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${processingProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Interactive Content Results */}
                {interactiveContent && (
                  <div className="bg-background/50 border border-border rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Interactive Learning Content
                      </h4>
                      <button 
                        onClick={() => setInteractiveContent(null)}
                        className="p-1 rounded hover:bg-muted"
                        aria-label="Close interactive content"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Leap Cards */}
                    <div className="mb-6">
                      <h5 className="font-medium mb-3">Vocabulary Leap Cards</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {interactiveContent.leapCards.map((card) => (
                          <div key={card.id} className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <h6 className="font-semibold">{card.word}</h6>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                card.difficulty === 'beginner' ? 'bg-green-500/20 text-green-500' :
                                card.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-500' :
                                'bg-red-500/20 text-red-500'
                              }`}>
                                {card.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{card.translation}</p>
                            <p className="text-xs mb-3">/{card.pronunciation}/</p>
                            <p className="text-sm mb-3 italic">"{card.context}"</p>
                            <div className="space-y-1">
                              {card.examples.map((example, idx) => (
                                <p key={idx} className="text-xs">• {example}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Conversation Prompts */}
                    <div className="mb-6">
                      <h5 className="font-medium mb-3">Conversation Prompts</h5>
                      <div className="space-y-3">
                        {interactiveContent.conversationPrompts.map((prompt, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border">
                            <MessageSquare className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{prompt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Cultural Notes */}
                    <div>
                      <h5 className="font-medium mb-3">Cultural Notes</h5>
                      <div className="space-y-3">
                        {interactiveContent.culturalNotes.map((note, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border">
                            <Globe className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Audio Analysis Results */}
                {audioAnalysis && (
                  <div className="bg-background/50 border border-border rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Mic className="w-5 h-5" />
                        Audio Analysis Results
                      </h4>
                      <button 
                        onClick={() => setAudioAnalysis(null)}
                        className="p-1 rounded hover:bg-muted"
                        aria-label="Close audio analysis"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Transcript */}
                    <div className="mb-6">
                      <h5 className="font-medium mb-2">Transcript</h5>
                      <div className="bg-background/50 border border-border rounded-lg p-4">
                        <p className="text-sm">{audioAnalysis.transcript}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Key Phrases */}
                      <div>
                        <h5 className="font-medium mb-3">Key Learning Phrases</h5>
                        <div className="flex flex-wrap gap-2">
                          {audioAnalysis.keyPhrases.map((phrase, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full"
                            >
                              {phrase}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Pronunciation Tips */}
                      <div>
                        <h5 className="font-medium mb-3">Pronunciation Tips</h5>
                        <ul className="space-y-2">
                          {audioAnalysis.pronunciationTips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Volume2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Summary */}
                    <div className="mt-6">
                      <h5 className="font-medium mb-2">Summary</h5>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-sm">{audioAnalysis.summary}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
