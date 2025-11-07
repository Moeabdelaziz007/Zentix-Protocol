import { useState, useEffect } from 'react';
import { 
  Grid, 
  Search, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Video, 
  Globe, 
  ShoppingCart, 
  Mail, 
  Music, 
  Zap, 
  ExternalLink,
  Star,
  Tag
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface Applet {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  popularity: number;
  isInstalled: boolean;
  requiresAuth?: string[];
  previewImage?: string;
}

export function AppletMarketplaceApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [installedApplets, setInstalledApplets] = useState<string[]>([]);
  const [appletTemplates, setAppletTemplates] = useState<Applet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch applet templates from the backend
  useEffect(() => {
    const fetchApplets = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would fetch from the backend API
        // const response = await fetch('/api/applets/templates');
        // const templates = await response.json();
        
        // For now, we'll use the mock data but simulate an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockApplets: Applet[] = [
          {
            id: 'social-content-engine',
            name: 'Social Media Content Engine',
            description: 'Get 3 creative post ideas for Twitter and Instagram every morning.',
            category: 'social',
            icon: <Users className="w-6 h-6" />,
            color: 'from-blue-500 to-purple-500',
            popularity: 95,
            isInstalled: installedApplets.includes('social-content-engine'),
            requiresAuth: ['Telegram'],
            previewImage: ''
          },
          {
            id: 'telegram-bot',
            name: 'Telegram Customer Service Bot',
            description: 'Create a 24/7 customer service bot for your Telegram channel.',
            category: 'communication',
            icon: <MessageSquare className="w-6 h-6" />,
            color: 'from-blue-400 to-cyan-500',
            popularity: 88,
            isInstalled: installedApplets.includes('telegram-bot'),
            requiresAuth: ['Telegram'],
            previewImage: ''
          },
          {
            id: 'email-sorter',
            name: 'Email Sorter',
            description: 'Automatically sort incoming emails into "Important", "Promotions", and "Newsletters".',
            category: 'productivity',
            icon: <Mail className="w-6 h-6" />,
            color: 'from-green-500 to-teal-500',
            popularity: 92,
            isInstalled: installedApplets.includes('email-sorter'),
            requiresAuth: ['Gmail'],
            previewImage: ''
          },
          {
            id: 'news-anchor',
            name: 'Personal News Anchor',
            description: 'Get a 5-minute audio summary of the top news in your field every morning.',
            category: 'research',
            icon: <Globe className="w-6 h-6" />,
            color: 'from-purple-500 to-pink-500',
            popularity: 85,
            isInstalled: installedApplets.includes('news-anchor'),
            requiresAuth: [],
            previewImage: ''
          },
          {
            id: 'whatsapp-responder',
            name: 'WhatsApp Auto-Responder',
            description: 'Create a WhatsApp Business bot that answers FAQs for your customers 24/7.',
            category: 'communication',
            icon: <MessageSquare className="w-6 h-6" />,
            color: 'from-green-400 to-emerald-500',
            popularity: 90,
            isInstalled: installedApplets.includes('whatsapp-responder'),
            requiresAuth: ['WhatsApp Business'],
            previewImage: ''
          },
          {
            id: 'youtube-content',
            name: 'YouTube Content Generator',
            description: 'Daily ideas for YouTube videos based on trending topics in your niche.',
            category: 'content',
            icon: <Video className="w-6 h-6" />,
            color: 'from-red-500 to-pink-500',
            popularity: 87,
            isInstalled: installedApplets.includes('youtube-content'),
            requiresAuth: [],
            previewImage: ''
          },
          {
            id: 'amazon-monitor',
            name: 'Amazon Price Monitor',
            description: 'Track product prices on Amazon and get alerts when they drop.',
            category: 'marketing',
            icon: <ShoppingCart className="w-6 h-6" />,
            color: 'from-orange-500 to-red-500',
            popularity: 78,
            isInstalled: installedApplets.includes('amazon-monitor'),
            requiresAuth: [],
            previewImage: ''
          },
          {
            id: 'music-playlist',
            name: 'Personalized Music Playlist',
            description: 'Daily curated playlists based on your mood and preferences.',
            category: 'content',
            icon: <Music className="w-6 h-6" />,
            color: 'from-purple-400 to-indigo-500',
            popularity: 82,
            isInstalled: installedApplets.includes('music-playlist'),
            requiresAuth: ['Spotify'],
            previewImage: ''
          }
        ];
        
        setAppletTemplates(mockApplets);
        setLoading(false);
      } catch (err: unknown) {
        console.error('Error fetching applets:', err);
        setError('Failed to fetch applets');
        setLoading(false);
      }
    };

    fetchApplets();
  }, [installedApplets]);

  const categories = [
    { id: 'all', name: 'All Applets', icon: <Grid className="w-4 h-4" /> },
    { id: 'social', name: 'Social Media', icon: <Users className="w-4 h-4" /> },
    { id: 'content', name: 'Content Creation', icon: <Video className="w-4 h-4" /> },
    { id: 'productivity', name: 'Productivity', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'communication', name: 'Communication', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'marketing', name: 'Marketing', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'research', name: 'Research', icon: <Globe className="w-4 h-4" /> },
  ];

  const filteredApplets = appletTemplates.filter((applet: Applet) => {
    const matchesSearch = applet.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          applet.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || applet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = (appletId: string) => {
    // In a real implementation, this would trigger the OAuth flow and backend setup
    setInstalledApplets(prev => [...prev, appletId]);
    console.log(`Installing applet: ${appletId}`);
    
    // Show installation success message
    alert(`"${appletTemplates.find((a: Applet) => a.id === appletId)?.name}" has been successfully installed and is now running!`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Applet Marketplace
            </h1>
            <p className="text-muted-foreground mt-2">
              Powerful workflows, zero setup. Your life, automated.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4" />
            <span>{appletTemplates.length} Applets Available</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search applets..."
              className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 py-4 border-b border-border/50">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-background/50 border border-border/50 hover:bg-background/70'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Applets Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Loading applets...</h3>
            <p className="text-muted-foreground">Fetching the latest applets from the marketplace</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error loading applets</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredApplets.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No applets found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplets.map((applet: Applet) => (
              <GlassCard 
                key={applet.id} 
                className="overflow-hidden hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${applet.color} flex items-center justify-center text-white shadow-lg`}>
                      {applet.icon}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span>{applet.popularity}%</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">{applet.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{applet.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      <Tag className="w-3 h-3" />
                      {applet.category}
                    </span>
                    {applet.requiresAuth && applet.requiresAuth.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full">
                        <ExternalLink className="w-3 h-3" />
                        {applet.requiresAuth.join(', ')}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleInstall(applet.id)}
                    disabled={applet.isInstalled}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      applet.isInstalled
                        ? 'bg-green-500/20 text-green-500 border border-green-500/30 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary/20 to-purple-500/20 hover:from-primary/30 hover:to-purple-500/30 text-primary border border-primary/30 hover:border-primary/50'
                    }`}
                  >
                    {applet.isInstalled ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Installed
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Install Applet
                      </>
                    )}
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 text-center text-sm text-muted-foreground">
        <p>Zentix Applet Marketplace - Your Life, Automated</p>
      </div>
    </div>
  );
}