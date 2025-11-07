import { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Video, 
  Mic, 
  Search, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Download,
  Edit3,
  Eye,
  Wand2,
  Film,
  Palette
} from 'lucide-react';
import { ProgressIndicator } from '../ui/ProgressIndicator';

interface SubAgent {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  icon: React.ReactNode;
  color: string;
}

interface Workflow {
  id: string;
  topic: string;
  enhancedTopic?: string;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  steps: {
    name: string;
    status: 'pending' | 'in_progress' | 'completed';
    progress: number;
  }[];
}

interface CompetitorVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  duration: string;
  relevanceScore: number;
}

interface ContentSuggestion {
  titleIdeas: string[];
  descriptionOutline: string;
  keyPoints: string[];
  suggestedTags: string[];
  estimatedDuration: string;
}

export function CreatorStudioApp() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatorStatus, setCreatorStatus] = useState('');
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [workflowInterval, setWorkflowInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoStyle, setVideoStyle] = useState<'cinematic' | 'documentary' | 'vlog' | 'professional'>('cinematic');
  const [competitorVideos, setCompetitorVideos] = useState<CompetitorVideo[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  
  const subAgents: SubAgent[] = [
    {
      id: 'prompt-enhancer',
      name: 'Prompt Enhancer',
      description: 'Amrikyy-powered prompt optimization',
      status: 'idle',
      progress: 0,
      icon: <Sparkles className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'content-generator',
      name: 'Content Generator',
      description: 'Gemini-powered content creation',
      status: 'idle',
      progress: 0,
      icon: <Edit3 className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'image-searcher',
      name: 'Image Searcher',
      description: 'Pexels-powered image search',
      status: 'idle',
      progress: 0,
      icon: <Search className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'audio-generator',
      name: 'Audio Generator',
      description: 'Text-to-speech audio creation',
      status: 'idle',
      progress: 0,
      icon: <Mic className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'video-composer',
      name: 'Video Composer',
      description: 'FFmpeg-powered video composition',
      status: 'idle',
      progress: 0,
      icon: <Video className="w-5 h-5" />,
      color: 'from-red-500 to-pink-500'
    }
  ];

  const generateVideo = async () => {
    if (!topic.trim()) return;
    
    try {
      setLoading(true);
      setCreatorStatus('🔄 Initializing video creation...');
      
      // In a real implementation, this would call the backend API
      // For now, we'll simulate the process
      simulateVideoCreation();
    } catch (err) {
      setCreatorStatus('❌ Generation failed: ' + (err as Error).message);
      setLoading(false);
    }
  };

  const simulateVideoCreation = () => {
    // Create a new workflow
    const workflow: Workflow = {
      id: 'workflow-' + Date.now(),
      topic,
      status: 'processing',
      progress: 0,
      createdAt: new Date().toISOString(),
      steps: [
        { name: 'prompt_enhancement', status: 'pending', progress: 0 },
        { name: 'content_generation', status: 'pending', progress: 0 },
        { name: 'image_search', status: 'pending', progress: 0 },
        { name: 'audio_generation', status: 'pending', progress: 0 },
        { name: 'video_composition', status: 'pending', progress: 0 }
      ]
    };
    
    setCurrentWorkflow(workflow);
    startWorkflowSimulation(workflow);
  };

  const startWorkflowSimulation = (workflow: Workflow) => {
    // Clear any existing interval
    if (workflowInterval) {
      clearInterval(workflowInterval);
    }
    
    let progress = 0;
    let stepIndex = 0;
    
    // Set up new interval
    const interval = setInterval(() => {
      progress += 5;
      if (progress > 100) progress = 100;
      
      // Update steps
      const steps = [...workflow.steps];
      if (stepIndex < steps.length) {
        steps[stepIndex].status = 'in_progress';
        steps[stepIndex].progress = Math.min(progress, 100);
        
        if (progress >= 100) {
          steps[stepIndex].status = 'completed';
          stepIndex++;
          progress = 0;
          
          if (stepIndex < steps.length) {
            steps[stepIndex].status = 'pending';
          }
        }
      }
      
      const updatedWorkflow = {
        ...workflow,
        progress: Math.min(Math.floor((stepIndex / steps.length) * 100 + (progress / steps.length)), 100),
        steps
      };
      
      setCurrentWorkflow(updatedWorkflow);
      
      // Update status message
      if (updatedWorkflow.steps[0]?.status === 'completed' && updatedWorkflow.enhancedTopic) {
        setCreatorStatus(`✨ Great idea! Creating video: "${updatedWorkflow.enhancedTopic}"\n🔄 Progress: ${updatedWorkflow.progress}%`);
      } else {
        setCreatorStatus(`🔄 Processing: ${updatedWorkflow.progress}% complete`);
      }
      
      // If workflow is completed, stop polling
      if (stepIndex >= steps.length) {
        clearInterval(interval);
        setWorkflowInterval(null);
        setLoading(false);
        setCreatorStatus(`✅ Video "${topic}" created successfully!`);
        setGeneratedVideoUrl('https://example.com/generated-video.mp4');
        
        // Clear status message after 5 seconds
        setTimeout(() => setCreatorStatus(''), 5000);
      }
    }, 300);
    
    setWorkflowInterval(interval);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (workflowInterval) {
        clearInterval(workflowInterval);
      }
    };
  }, [workflowInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'running': 
      case 'in_progress': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running': 
      case 'in_progress': return <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const analyzeCompetitors = async () => {
    if (!topic.trim()) return;
    
    try {
      setAnalysisLoading(true);
      
      // In a real implementation, this would call the YouTubeAPI
      // For now, we'll simulate the competitor analysis
      const mockCompetitorVideos: CompetitorVideo[] = [
        {
          id: 'comp1',
          title: `How to Master ${topic} - Complete Guide`,
          description: `Learn everything about ${topic} in this comprehensive tutorial...`,
          channelTitle: 'Tech Education Channel',
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          thumbnail: 'https://via.placeholder.com/320x180?text=Competitor+1',
          viewCount: 150000,
          likeCount: 12000,
          duration: 'PT15M30S',
          relevanceScore: 0.95
        },
        {
          id: 'comp2',
          title: `${topic} Tutorial for Beginners`,
          description: `Start learning ${topic} with this beginner-friendly guide...`,
          channelTitle: 'Beginner Tutorials',
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          thumbnail: 'https://via.placeholder.com/320x180?text=Competitor+2',
          viewCount: 89000,
          likeCount: 7500,
          duration: 'PT12M15S',
          relevanceScore: 0.87
        },
        {
          id: 'comp3',
          title: `Advanced ${topic} Techniques`,
          description: `Take your ${topic} skills to the next level with these advanced techniques...`,
          channelTitle: 'Advanced Learning',
          publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          thumbnail: 'https://via.placeholder.com/320x180?text=Competitor+3',
          viewCount: 65000,
          likeCount: 5200,
          duration: 'PT18M45S',
          relevanceScore: 0.82
        }
      ];
      
      setCompetitorVideos(mockCompetitorVideos);
      
      // Simulate content suggestions
      const mockSuggestions: ContentSuggestion = {
        titleIdeas: [
          `The Ultimate ${topic} Masterclass`,
          `${topic}: From Zero to Hero`,
          `Secrets of ${topic} That Experts Don't Want You to Know`
        ],
        descriptionOutline: `Join us in this comprehensive ${topic} course where you'll learn everything from basics to advanced techniques...`,
        keyPoints: [
          'Fundamentals of the topic',
          'Common mistakes and how to avoid them',
          'Advanced strategies and tips',
          'Real-world applications',
          'Practice exercises and projects'
        ],
        suggestedTags: [topic.toLowerCase(), 'tutorial', 'course', 'education', 'skills'],
        estimatedDuration: 'PT15M'
      };
      
      setContentSuggestions(mockSuggestions);
      setAnalysisLoading(false);
    } catch (error) {
      console.error('Competitor analysis failed:', error);
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-600/10 to-pink-500/10 border-b border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Video className="w-6 h-6 text-primary" />
          Creator Studio
        </h2>
        <p className="text-muted-foreground">
          AI-powered video creation with specialized sub-agents
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Videos Created</span>
                <Video className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">24</div>
              <div className="text-xs text-green-500 mt-1">+12% this week</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Views</span>
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">12.4K</div>
              <div className="text-xs text-green-500 mt-1">+28% this week</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg. Quality</span>
                <Sparkles className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold">94%</div>
              <div className="text-xs text-green-500 mt-1">Excellent</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Time Saved</span>
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl font-bold">48h</div>
              <div className="text-xs text-muted-foreground mt-1">vs manual editing</div>
            </div>
          </div>

          {/* Topic Input and Analysis Section */}
          <div className="bg-background/50 border border-border rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">Create New Video</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter your video topic (e.g., Artificial Intelligence, Web Development)"
                className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="Video topic"
              />
              <button
                onClick={generateVideo}
                disabled={loading || !topic.trim()}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create Video
                  </>
                )}
              </button>
              <button
                onClick={analyzeCompetitors}
                disabled={analysisLoading || !topic.trim()}
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {analysisLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Analyze Competitors
                  </>
                )}
              </button>
            </div>
            
            {creatorStatus && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">{creatorStatus}</pre>
              </div>
            )}
          </div>
          
          {/* Competitor Analysis Results */}
          {competitorVideos.length > 0 && (
            <div className="bg-background/50 border border-border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Competitor Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {competitorVideos.map((video) => (
                  <div key={video.id} className="bg-background border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
                    <div className="relative">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{video.channelTitle}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{video.viewCount.toLocaleString()} views</span>
                        <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <div className="w-full bg-background/50 rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${video.relevanceScore * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {(video.relevanceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Content Suggestions */}
          {contentSuggestions && (
            <div className="bg-background/50 border border-border rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Content Suggestions
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Title Ideas</h4>
                  <ul className="space-y-2">
                    {contentSuggestions.titleIdeas.map((title, index) => (
                      <li key={index} className="p-2 bg-background/50 rounded border border-border text-sm">
                        {title}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Key Points</h4>
                  <ul className="space-y-2">
                    {contentSuggestions.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-primary">{index + 1}</span>
                        </div>
                        <span className="text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="font-medium mb-1">Suggested Description Outline</h4>
                <p className="text-sm">{contentSuggestions.descriptionOutline}</p>
              </div>
            </div>
          )}
          
          {/* Video Creation Panel */}
          <div className="bg-background/50 border border-border rounded-lg p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Create New Video</h3>
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">AI-Powered Creation</span>
              </div>
            </div>
            
            <div className="max-w-2xl space-y-4">
              {/* Video Style Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Video Style</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['cinematic', 'documentary', 'vlog', 'professional'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setVideoStyle(style)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        videoStyle === style
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {style === 'cinematic' && <Film className="w-5 h-5" />}
                        {style === 'documentary' && <Video className="w-5 h-5" />}
                        {style === 'vlog' && <Mic className="w-5 h-5" />}
                        {style === 'professional' && <Palette className="w-5 h-5" />}
                        <span className="text-xs font-medium capitalize">{style}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Video Topic</label>
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., 'The future of AI in healthcare'"
                    className="w-full p-3 pr-12 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Enhance with AI"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Tip: Be specific for better results. AI will enhance your prompt automatically.
                </p>
              </div>
              
              <button
                onClick={generateVideo}
                disabled={loading || !topic.trim()}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Creating Video...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Create Video
                  </>
                )}
              </button>
              
              {creatorStatus && (
                <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-center">
                  {creatorStatus}
                </div>
              )}
            </div>
          </div>

          {/* Sub-Agent Dashboard */}
          <div className="bg-background/50 border border-border rounded-lg p-6 animate-fade-in">
            <h3 className="text-xl font-semibold mb-4">Sub-Agent Dashboard</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subAgents.map(agent => (
                <div 
                  key={agent.id}
                  className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center text-white`}>
                        {agent.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{agent.name}</h4>
                        <p className="text-xs text-muted-foreground">{agent.description}</p>
                      </div>
                    </div>
                    <div className={getStatusColor(agent.status)}>
                      {getStatusIcon(agent.status)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{agent.progress}%</span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${agent.color}`}
                        style={{ width: `${agent.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Progress */}
          {currentWorkflow && (
            <div className="bg-background/50 border border-border rounded-lg p-6 animate-slide-in-up">
              <h3 className="text-xl font-semibold mb-4">Workflow Progress</h3>
              
              <ProgressIndicator
                value={currentWorkflow.progress}
                label="Overall Progress"
                variant="default"
                size="lg"
                className="mb-6"
              />
              
              <div className="space-y-3">
                {currentWorkflow.steps.map((step, index) => (
                  <div key={index} className="flex items-center p-3 bg-background/50 rounded-lg border border-border">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      step.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                      step.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : step.status === 'in_progress' ? (
                        <Zap className="w-4 h-4 animate-pulse" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground capitalize">
                        {step.name.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {step.status === 'completed' ? 'Completed' :
                         step.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </div>
                    </div>
                    <div className="w-24 bg-background/50 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          step.status === 'completed' ? 'bg-green-500' :
                          step.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Panel */}
          {generatedVideoUrl && (
            <div className="bg-background/50 border border-border rounded-lg p-6 animate-spring-bounce">
              <h3 className="text-xl font-semibold mb-4">Video Preview</h3>
              
              <div className="bg-black/90 rounded-lg p-4">
                <video
                  key={generatedVideoUrl}
                  controls
                  className="w-full aspect-video rounded-lg bg-black"
                >
                  <source src={generatedVideoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                <div className="mt-4 flex justify-center gap-3">
                  <a
                    href={generatedVideoUrl}
                    download={`Zentix_Video_${topic.replace(/\s/g, '_')}.mp4`}
                    className="px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                  <button className="px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}