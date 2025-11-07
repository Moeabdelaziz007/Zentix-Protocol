import { useState } from 'react';
import {
  BookOpen,
  FileText,
  Link,
  MessageSquare,
  Play,
  Pause,
  Send,
  Phone,
  Monitor,
  Command,
  Brain,
} from 'lucide-react';

interface Source {
  id: string;
  title: string;
  type: 'web' | 'pdf' | 'txt' | 'note' | 'link' | 'app';
  content: string;
  url?: string;
  createdAt: string;
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
  const [activeTab, setActiveTab] = useState<'workspaces' | 'notebook' | 'assistant'>('workspaces');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: 'ws-1',
      name: 'History of AI',
      sources: [
        {
          id: 'src-1',
          title: 'Introduction to Machine Learning',
          type: 'pdf',
          content: 'PDF content about machine learning...',
          createdAt: new Date().toISOString()
        },
        {
          id: 'src-2',
          title: 'Deep Learning Breakthroughs',
          type: 'web',
          content: 'Web article content...',
          url: 'https://example.com/deep-learning',
          createdAt: new Date().toISOString()
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

  const addSource = (type: Source['type'], title: string, content: string, url?: string) => {
    if (!activeWorkspace) return;
    
    const newSource: Source = {
      id: `src-${Date.now()}`,
      title,
      type,
      content,
      url,
      createdAt: new Date().toISOString()
    };
    
    const updatedWorkspace = {
      ...activeWorkspace,
      sources: [...activeWorkspace.sources, newSource]
    };
    
    setActiveWorkspace(updatedWorkspace);
    setWorkspaces(workspaces.map(ws => 
      ws.id === activeWorkspace.id ? updatedWorkspace : ws
    ));
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
      case 'app': return <Share2 className="w-4 h-4" />;
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
      case 'app': return 'bg-pink-500/20 text-pink-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

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
        >
          <Database className="w-4 h-4" />
          Workspaces
        </button>
        <button
          onClick={() => setActiveTab('notebook')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'notebook'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Smart Notebook
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'assistant'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Assistant
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'workspaces' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Research Workspaces</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="New workspace name"
                  className="px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  onClick={createWorkspace}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </button>
              </div>
            </div>

            {activeWorkspace ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold">{activeWorkspace.name}</h4>
                  <button
                    onClick={() => setActiveWorkspace(null)}
                    className="px-3 py-1 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors"
                  >
                    Back to List
                  </button>
                </div>

                {/* Source Input */}
                <div className="bg-background/50 border border-border rounded-lg p-4">
                  <h5 className="font-medium mb-3">Add Sources</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        const query = prompt('Enter search query:');
                        if (query) {
                          addSource('web', `Search: ${query}`, `Search results for "${query}"`, `https://google.com/search?q=${encodeURIComponent(query)}`);
                        }
                      }}
                      className="p-3 border border-border rounded-lg hover:border-primary/50 transition-colors flex flex-col items-center gap-2"
                    >
                      <Globe className="w-5 h-5 text-blue-500" />
                      <span className="text-sm">Web Search</span>
                    </button>
                    <button
                      onClick={() => {
                        const url = prompt('Enter URL:');
                        if (url) {
                          addSource('link', `Link: ${url}`, `Content from ${url}`, url);
                        }
                      }}
                      className="p-3 border border-border rounded-lg hover:border-primary/50 transition-colors flex flex-col items-center gap-2"
                    >
                      <Link className="w-5 h-5 text-purple-500" />
                      <span className="text-sm">Add Link</span>
                    </button>
                    <button
                      onClick={() => {
                        const title = prompt('Enter note title:');
                        if (title) {
                          const content = prompt('Enter note content:');
                          if (content) {
                            addSource('note', title, content);
                          }
                        }
                      }}
                      className="p-3 border border-border rounded-lg hover:border-primary/50 transition-colors flex flex-col items-center gap-2"
                    >
                      <MessageSquare className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm">Add Note</span>
                    </button>
                  </div>
                </div>

                {/* Sources List */}
                <div className="bg-background/50 border border-border rounded-lg p-4">
                  <h5 className="font-medium mb-3">Sources ({activeWorkspace.sources.length})</h5>
                  <div className="space-y-2">
                    {activeWorkspace.sources.map((source) => (
                      <div 
                        key={source.id}
                        className="p-3 bg-background border border-border rounded-lg flex items-start gap-3"
                      >
                        <div className={`p-2 rounded-lg ${getSourceColor(source.type)}`}>
                          {getSourceIcon(source.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{source.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Added {new Date(source.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <button className="p-1 hover:bg-muted rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    onClick={() => setActiveWorkspace(workspace)}
                    className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-5 h-5 text-indigo-500" />
                      <h4 className="font-semibold">{workspace.name}</h4>
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {workspace.sources.length} sources
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(workspace.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notebook' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <h3 className="text-xl font-semibold">Smart Notebook</h3>
            
            {activeWorkspace ? (
              <div className="flex gap-6">
                {/* Sources Panel */}
                <div className="w-1/3 bg-background/50 border border-border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Sources</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {activeWorkspace.sources.map((source) => (
                      <div 
                        key={source.id}
                        className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                          selectedSources.includes(source.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => {
                          if (selectedSources.includes(source.id)) {
                            setSelectedSources(selectedSources.filter(id => id !== source.id));
                          } else {
                            setSelectedSources([...selectedSources, source.id]);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${getSourceColor(source.type)}`}>
                            {getSourceIcon(source.type)}
                          </div>
                          <div className="text-sm truncate">{source.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notebook Panel */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* New Note */}
                  <div className="bg-background/50 border border-border rounded-lg p-4">
                    <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Ask a question or write a note..."
                      className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent mb-3"
                      rows={3}
                    />
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {selectedSources.length} sources selected
                      </div>
                      <button
                        onClick={addNote}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Note
                      </button>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="bg-background/50 border border-border rounded-lg p-4 flex-1">
                    <h4 className="font-medium mb-3">Notes</h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {notes.map((note) => (
                        <div key={note.id} className="p-3 bg-background border border-border rounded-lg">
                          <div className="whitespace-pre-wrap mb-2">{note.content}</div>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <div>
                              {note.sources.length > 0 && (
                                <span>
                                  Sources: {note.sources.length}
                                </span>
                              )}
                            </div>
                            <div>
                              {new Date(note.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">No Active Workspace</h4>
                <p className="text-muted-foreground mb-4">
                  Select a workspace or create a new one to start taking notes.
                </p>
                <button
                  onClick={() => setActiveTab('workspaces')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Go to Workspaces
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assistant' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <h3 className="text-xl font-semibold">AI Research Assistant</h3>
            
            {activeWorkspace ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                  className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (activeWorkspace) {
                      const summary = `Summary of "${activeWorkspace.name}":\n\nThis workspace contains ${activeWorkspace.sources.length} sources about the topic. The sources include web articles, PDF documents, and personal notes that explore various aspects of this subject.`;
                      setNotes([...notes, {
                        id: `note-${Date.now()}`,
                        content: summary,
                        createdAt: new Date().toISOString(),
                        sources: activeWorkspace.sources.map(s => s.id)
                      }]);
                    }
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <h4 className="font-medium mb-1">Generate Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a comprehensive summary of all sources in this workspace.
                  </p>
                </div>
                
                <div 
                  className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    const timeline = `Timeline of "${activeWorkspace.name}":

• 2020: Initial research
• 2021: Key developments
• 2022: Major breakthroughs
• 2023: Current state
• 2024: Future predictions`;
                    setNotes([...notes, {
                      id: `note-${Date.now()}`,
                      content: timeline,
                      createdAt: new Date().toISOString(),
                      sources: []
                    }]);
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-3">
                    <Calendar className="w-5 h-5 text-green-500" />
                  </div>
                  <h4 className="font-medium mb-1">Create Timeline</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate a chronological timeline of events from your sources.
                  </p>
                </div>
                
                <div 
                  className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    const comparison = `Comparison Table:

| Source | Key Points | Strengths | Weaknesses |
|--------|------------|-----------|------------|
| Source 1 | Point A | Strong | Weak |
| Source 2 | Point B | Strong | Weak |`;
                    setNotes([...notes, {
                      id: `note-${Date.now()}`,
                      content: comparison,
                      createdAt: new Date().toISOString(),
                      sources: []
                    }]);
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                    <Table className="w-5 h-5 text-purple-500" />
                  </div>
                  <h4 className="font-medium mb-1">Build Comparison Table</h4>
                  <p className="text-sm text-muted-foreground">
                    Compare multiple sources side-by-side in a structured table.
                  </p>
                </div>
                
                <div 
                  className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    const questions = `Follow-up Questions:

1. What are the implications of this research?
2. How does this compare to previous studies?
3. What are the potential future developments?
4. Are there any conflicting viewpoints?`;
                    setNotes([...notes, {
                      id: `note-${Date.now()}`,
                      content: questions,
                      createdAt: new Date().toISOString(),
                      sources: []
                    }]);
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-3">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                  </div>
                  <h4 className="font-medium mb-1">Suggest Follow-up Questions</h4>
                  <p className="text-sm text-muted-foreground">
                    Get AI-generated questions to deepen your research.
                  </p>
                </div>
                
                <div 
                  className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    const glossary = `Glossary:

• **Term 1**: Definition of term 1
• **Term 2**: Definition of term 2
• **Term 3**: Definition of term 3`;
                    setNotes([...notes, {
                      id: `note-${Date.now()}`,
                      content: glossary,
                      createdAt: new Date().toISOString(),
                      sources: []
                    }]);
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-3">
                    <ListOrdered className="w-5 h-5 text-red-500" />
                  </div>
                  <h4 className="font-medium mb-1">Generate Glossary</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a list of key terms with definitions from your sources.
                  </p>
                </div>
                
                <div 
                  className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    alert('Export to Creator Studio functionality would be implemented here');
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center mb-3">
                    <Share2 className="w-5 h-5 text-pink-500" />
                  </div>
                  <h4 className="font-medium mb-1">Export to Creator Studio</h4>
                  <p className="text-sm text-muted-foreground">
                    Turn your research into a video script for Creator Studio.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">No Active Workspace</h4>
                <p className="text-muted-foreground mb-4">
                  Select a workspace to use the AI Research Assistant.
                </p>
                <button
                  onClick={() => setActiveTab('workspaces')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Go to Workspaces
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}