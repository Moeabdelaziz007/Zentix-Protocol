import { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Link, 
  MessageSquare, 
  Brain, 
  Globe, 
  Database, 
  Plus, 
  ExternalLink,
  Folder,
  FolderOpen,
  File,
  Edit,
  Trash2,
  Search,
  Sparkles,
  Lightbulb
} from 'lucide-react';

interface Source {
  id: string;
  title: string;
  type: 'web' | 'pdf' | 'txt' | 'note' | 'link';
  content: string;
  url?: string;
  createdAt: string;
  tags: string[];
}

interface Workspace {
  id: string;
  name: string;
  sources: Source[];
  createdAt: string;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
  sources: string[]; // IDs of sources used
}

export function CognitoSphereApp() {
  const [activeTab, setActiveTab] = useState<'workspaces' | 'notebook' | 'insights'>('workspaces');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: 'ws-1',
      name: 'AI Research',
      sources: [
        {
          id: 'src-1',
          title: 'Introduction to Machine Learning',
          type: 'pdf',
          content: 'PDF content about machine learning...',
          createdAt: new Date().toISOString(),
          tags: ['AI', 'ML', 'Research']
        },
        {
          id: 'src-2',
          title: 'Deep Learning Breakthroughs',
          type: 'web',
          content: 'Web article content...',
          url: 'https://example.com/deep-learning',
          createdAt: new Date().toISOString(),
          tags: ['AI', 'Deep Learning', 'Research']
        }
      ],
      createdAt: new Date().toISOString()
    }
  ]);
  
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(workspaces[0]);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 'note-1',
      content: 'Key insights from the sources:\n- Machine learning started in the 1950s\n- Deep learning became popular in 2010s',
      createdAt: new Date().toISOString(),
      sources: ['src-1', 'src-2']
    }
  ]);
  
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const createWorkspace = () => {
    if (!newWorkspaceName.trim()) return;
    
    const newWorkspace: Workspace = {
      id: `ws-${Date.now()}`,
      name: newWorkspaceName,
      sources: [],
      createdAt: new Date().toISOString()
    };
    
    setWorkspaces([...workspaces, newWorkspace]);
    setActiveWorkspace(newWorkspace);
    setNewWorkspaceName('');
  };

  const addNote = () => {
    if (!newNoteContent.trim()) return;
    
    const newNote: Note = {
      id: `note-${Date.now()}`,
      content: newNoteContent,
      createdAt: new Date().toISOString(),
      sources: selectedSources
    };
    
    setNotes([...notes, newNote]);
    setNewNoteContent('');
    setSelectedSources([]);
  };

  const getSourceIcon = (type: Source['type']) => {
    switch (type) {
      case 'web': return <Globe className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'txt': return <File className="w-4 h-4" />;
      case 'note': return <MessageSquare className="w-4 h-4" />;
      case 'link': return <Link className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const getSourceColor = (type: Source['type']) => {
    switch (type) {
      case 'web': return 'bg-blue-500/20 text-blue-500';
      case 'pdf': return 'bg-red-500/20 text-red-500';
      case 'txt': return 'bg-green-500/20 text-green-500';
      case 'note': return 'bg-yellow-500/20 text-yellow-500';
      case 'link': return 'bg-purple-500/20 text-purple-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const toggleSourceSelection = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId) 
        : [...prev, sourceId]
    );
  };

  const filteredSources = activeWorkspace?.sources.filter(source => 
    source.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600/10 to-purple-500/10 border-b border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          CognitoSphere - Research Lab
        </h2>
        <p className="text-muted-foreground">
          Your Second Brain, Reimagined. Go from questions to understanding, instantly.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab('workspaces')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'workspaces'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Workspaces"
        >
          <Folder className="w-4 h-4" />
          Workspaces
        </button>
        <button
          onClick={() => setActiveTab('notebook')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'notebook'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Smart Notebook"
        >
          <BookOpen className="w-4 h-4" />
          Smart Notebook
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'insights'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          aria-label="AI Insights"
        >
          <Lightbulb className="w-4 h-4" />
          AI Insights
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-border/50 bg-muted/30 flex flex-col">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold text-foreground mb-2">Workspaces</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="New workspace"
                className="flex-1 text-sm bg-background border border-border rounded px-2 py-1"
                onKeyDown={(e) => e.key === 'Enter' && createWorkspace()}
                aria-label="New workspace name"
              />
              <button
                onClick={createWorkspace}
                className="p-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                aria-label="Create workspace"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => setActiveWorkspace(workspace)}
                className={`w-full text-left p-2 rounded text-sm flex items-center gap-2 transition-colors ${
                  activeWorkspace?.id === workspace.id
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-muted'
                }`}
                aria-label={`Select workspace ${workspace.name}`}
              >
                <Folder className="w-4 h-4" />
                {workspace.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'workspaces' && (
            <div className="flex-1 overflow-hidden flex flex-col">
              {activeWorkspace ? (
                <>
                  <div className="p-4 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{activeWorkspace.name}</h3>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search sources..."
                          className="pl-8 pr-4 py-1 text-sm bg-background border border-border rounded"
                          aria-label="Search sources"
                        />
                      </div>
                      <button
                        onClick={createWorkspace}
                        className="p-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                        aria-label="Add source"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSources.map((source) => (
                        <div 
                          key={source.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            selectedSources.includes(source.id) 
                              ? 'ring-2 ring-primary border-primary' 
                              : 'border-border'
                          }`}
                          onClick={() => toggleSourceSelection(source.id)}
                          aria-label={`Select source ${source.title}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className={`p-2 rounded ${getSourceColor(source.type)}`}>
                              {getSourceIcon(source.type)}
                            </div>
                            <div className="flex gap-1">
                              {source.tags.map((tag, index) => (
                                <span 
                                  key={index} 
                                  className="text-xs bg-muted px-1.5 py-0.5 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <h4 className="font-medium text-foreground mb-1">{source.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {source.content}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{new Date(source.createdAt).toLocaleDateString()}</span>
                            {source.url && (
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-primary"
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Open source ${source.title}`}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No workspace selected</h3>
                    <p className="text-muted-foreground">Create or select a workspace to get started</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'notebook' && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Smart Notebook</h3>
                <button
                  onClick={addNote}
                  className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 transition-colors"
                >
                  Save Note
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden flex">
                <div className="w-1/2 border-r border-border/50 p-4">
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Start writing your thoughts, ideas, or insights..."
                    className="w-full h-full bg-background border border-border rounded p-3 resize-none"
                    aria-label="Note content"
                  />
                </div>
                
                <div className="w-1/2 overflow-y-auto p-4">
                  <h4 className="font-medium text-foreground mb-3">Your Notes</h4>
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div key={note.id} className="border border-border rounded-lg p-3">
                        <p className="text-sm text-foreground whitespace-pre-wrap mb-2">
                          {note.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                          <div className="flex gap-1">
                            <button 
                              className="p-1 hover:bg-muted rounded"
                              aria-label="Edit note"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button 
                              className="p-1 hover:bg-muted rounded"
                              aria-label="Delete note"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'insights' && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-semibold text-foreground mb-2">AI-Powered Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Discover patterns, connections, and insights from your knowledge base
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h4 className="font-medium text-foreground">Key Themes</h4>
                  </div>
                  <div className="space-y-2">
                    {['AI Ethics', 'Machine Learning', 'Data Privacy', 'Neural Networks'].map((theme, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm">{theme}</span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                          {Math.floor(Math.random() * 10) + 1} sources
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <h4 className="font-medium text-foreground">Suggested Connections</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/30 rounded">
                      <p className="text-sm text-foreground">
                        "Machine Learning" and "Data Privacy" appear together in 7 sources
                      </p>
                      <div className="mt-2 flex gap-1">
                        <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded">AI</span>
                        <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded">Ethics</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-border rounded-lg p-4 md:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-indigo-500" />
                    <h4 className="font-medium text-foreground">Knowledge Graph</h4>
                  </div>
                  <div className="h-64 bg-muted/30 rounded flex items-center justify-center">
                    <p className="text-muted-foreground">Interactive knowledge graph visualization</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}