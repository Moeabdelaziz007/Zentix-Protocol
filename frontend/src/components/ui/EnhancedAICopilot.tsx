import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, X, Minimize2, Maximize2, Send, Mic, Paperclip, Lightbulb, Code, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  codeSnippet?: string;
}

interface EnhancedAICopilotProps {
  context?: string;
  onAction?: (action: string, params?: any) => void;
}

export function EnhancedAICopilot({ context, onAction }: EnhancedAICopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your enhanced AI assistant with deep system integration. I can help you with tasks, answer questions, generate code, and provide intelligent suggestions. How can I help you today?",
      timestamp: new Date(),
      suggestions: [
        'Optimize my workflow',
        'Generate test code',
        'Analyze system performance',
        'Create a new component',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedInput = useDebounce(input, 300);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const generateAIResponse = useCallback((query: string, ctx?: string): Message => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('code') || lowerQuery.includes('component')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I can help you generate code! Here's a React component example:",
        timestamp: new Date(),
        codeSnippet: `import { useState } from 'react';

export function ExampleComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4">
      <h2>Counter: {count}</h2>
      <button 
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-primary text-white rounded"
      >
        Increment
      </button>
    </div>
  );
}`,
        suggestions: ['Explain this code', 'Add TypeScript types', 'Create tests'],
      };
    }
    
    if (lowerQuery.includes('optimize') || lowerQuery.includes('performance')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I've analyzed your current setup and have some optimization suggestions:\n\n1. Enable lazy loading for routes\n2. Implement virtual scrolling for large lists\n3. Use React.memo for expensive components\n4. Optimize image loading with next-gen formats\n\nWould you like me to implement any of these?",
        timestamp: new Date(),
        suggestions: ['Implement lazy loading', 'Show virtual scroll example', 'Optimize images'],
      };
    }
    
    if (lowerQuery.includes('test')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I can help you write tests! Here's a test example using Vitest:",
        timestamp: new Date(),
        codeSnippet: `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExampleComponent } from './ExampleComponent';

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    render(<ExampleComponent />);
    expect(screen.getByText(/Counter:/i)).toBeInTheDocument();
  });

  it('increments counter on button click', () => {
    render(<ExampleComponent />);
    const button = screen.getByRole('button');
    button.click();
    expect(screen.getByText(/Counter: 1/i)).toBeInTheDocument();
  });
});`,
        suggestions: ['Add more tests', 'Test edge cases', 'Mock API calls'],
      };
    }
    
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I understand you're asking about "${query}". Based on your current context${ctx ? ` in ${ctx}` : ''}, I can help you with:\n\n• Code generation and refactoring\n• Performance optimization\n• Testing strategies\n• Architecture decisions\n• Best practices\n\nWhat would you like to focus on?`,
      timestamp: new Date(),
      suggestions: ['Generate code', 'Optimize performance', 'Write tests', 'Review architecture'],
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiMessage = generateAIResponse(input, context);
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // In a real implementation, this would use the Web Speech API
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setInput('Voice input would appear here');
      }, 2000);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center z-50 animate-pulse-glow"
        aria-label="Open Enhanced AI Copilot"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl transition-all duration-300 z-50',
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]',
        'animate-spring-bounce'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-purple-600/10 to-pink-500/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center relative">
            <Sparkles className="w-4 h-4 text-white" />
            <div className="absolute inset-0 rounded-full bg-purple-500/50 animate-ping" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Enhanced AI Copilot</h3>
            <p className="text-xs text-muted-foreground">
              {isTyping ? 'Thinking...' : 'Ready to assist'}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close Enhanced AI Copilot"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(600px-140px)]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-fade-in-up',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex-1 max-w-[80%]">
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-2',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.codeSnippet && (
                      <div className="mt-3 p-3 bg-background/50 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Code className="w-3 h-3 text-primary" />
                          <span className="text-xs font-semibold text-muted-foreground">
                            Code Example
                          </span>
                        </div>
                        <pre className="text-xs overflow-x-auto">
                          <code>{message.codeSnippet}</code>
                        </pre>
                      </div>
                    )}
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1 text-xs bg-background/50 hover:bg-background border border-border rounded-full transition-colors flex items-center gap-1"
                        >
                          <Lightbulb className="w-3 h-3" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-fade-in-up">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <button
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Attach file"
              >
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 bg-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
              />
              <button
                onClick={handleVoiceInput}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isListening ? 'bg-error text-white' : 'hover:bg-muted'
                )}
                aria-label="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}