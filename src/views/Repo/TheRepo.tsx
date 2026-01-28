import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Search, FolderOpen, Users, TrendingUp, Plus, MessageSquare, Trash2, BookOpen } from 'lucide-react';
import { useProjects } from '../../context/ProjectsContext';
import { useAuth } from '../../components/System/AuthContext';
import { queryRAG, type RAGResponse, type ConversationMessage } from '../../services/rag';
import { stripMarkdown } from '../../services/pitchAgent';
import {
  loadChatSessions,
  createChatSession,
  updateChatSession,
  deleteChatSession,
  type ChatSession,
  type ChatMessage
} from '../../services/chatHistory';
import { getUserByEmail } from '../../services/pitchService';
import { MessageContent } from '../../components/MessageContent';

interface TheRepoProps {
  onNavigate: (view: string) => void;
  onOpenProject?: (projectId: string) => void;
}

const QUICK_PROMPTS = [
  { icon: Search, label: 'Find projects', prompt: 'What research projects are currently in progress?' },
  { icon: FolderOpen, label: 'Browse categories', prompt: 'What research categories do you have?' },
  { icon: Users, label: 'Find collaborators', prompt: 'Which projects have external partners?' },
  { icon: TrendingUp, label: 'Recent work', prompt: 'What are the most recent completed projects?' },
];

const TheRepo: React.FC<TheRepoProps> = ({ onNavigate: _onNavigate, onOpenProject }) => {
  const { projects } = useProjects();
  const { user, isAuthenticated } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [userUUID, setUserUUID] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load user UUID and chat sessions from Supabase on mount
  useEffect(() => {
    if (isAuthenticated && user?.username) {
      setIsLoadingSessions(true);
      // First get the user's UUID from their email
      getUserByEmail(user.username)
        .then(dbUser => {
          if (dbUser) {
            setUserUUID(dbUser.id);
            // Then load their chat sessions using the UUID
            return loadChatSessions(dbUser.id);
          }
          return [];
        })
        .then(sessions => {
          setChatSessions(sessions);
        })
        .finally(() => {
          setIsLoadingSessions(false);
        });
    }
  }, [isAuthenticated, user?.username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save current messages to active session (both local state and Supabase)
  const saveMessagesToSession = useCallback(async (sessionId: string, msgs: ChatMessage[]) => {
    // Update local state
    setChatSessions(prev => prev.map(session =>
      session.id === sessionId
        ? { ...session, messages: msgs, updatedAt: new Date() }
        : session
    ));
    // Persist to Supabase
    await updateChatSession(sessionId, msgs);
  }, []);

  useEffect(() => {
    if (activeSessionId && messages.length > 0) {
      saveMessagesToSession(activeSessionId, messages);
    }
  }, [messages, activeSessionId, saveMessagesToSession]);

  const startNewChat = () => {
    setMessages([]);
    setActiveSessionId(null);
    setInputValue('');
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setActiveSessionId(session.id);
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Remove from local state
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      startNewChat();
    }
    // Delete from Supabase
    await deleteChatSession(sessionId);
  };

  const createNewSession = async (firstMessage: string): Promise<string> => {
    if (!userUUID) {
      console.error('Cannot create session: user UUID not loaded');
      return '';
    }

    // Persist to Supabase first to get the UUID
    if (isAuthenticated && userUUID) {
      const createdSession = await createChatSession(userUUID, {
        title: firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if (createdSession) {
        // Add to local state with the UUID from Supabase
        setChatSessions(prev => [createdSession, ...prev]);
        setActiveSessionId(createdSession.id);
        return createdSession.id;
      }
    }

    return '';
  };

  // Fallback for project list queries (doesn't need RAG)
  const handleProjectQuery = (userMessage: string): string | null => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('progress') || lowerMessage.includes('active') || lowerMessage.includes('developmental')) {
      const activeProjects = projects.filter(p => p.phase === 'Developmental');
      if (activeProjects.length > 0) {
        return `There are ${activeProjects.length} projects currently in development:\n\n${activeProjects.map(p => `- **${p.title}** (${p.id}) - ${p.researcher}`).join('\n')}`;
      }
      return 'No projects are currently in the developmental phase.';
    }

    if (lowerMessage.includes('completed') || lowerMessage.includes('finished')) {
      const completedProjects = projects.filter(p => p.phase === 'Completed');
      if (completedProjects.length > 0) {
        return `There are ${completedProjects.length} completed projects:\n\n${completedProjects.map(p => `- **${p.title}** (${p.id})`).join('\n')}`;
      }
      return 'No projects have been completed yet.';
    }

    if (lowerMessage.includes('categories') || lowerMessage.includes('types')) {
      const categories = [...new Set(projects.map(p => p.category))];
      const categoryCounts = categories.map(cat => {
        const count = projects.filter(p => p.category === cat).length;
        return `- **${cat}**: ${count} project${count !== 1 ? 's' : ''}`;
      });
      return `Research is organized into ${categories.length} categories:\n\n${categoryCounts.join('\n')}`;
    }

    if (lowerMessage.includes('how many') || lowerMessage.includes('total')) {
      return `The repository contains **${projects.length} research projects** across ${[...new Set(projects.map(p => p.category))].length} categories.`;
    }

    // Return null to indicate RAG should be used
    return null;
  };

  // Call RAG service for research queries with conversation history
  const queryResearch = async (userMessage: string): Promise<RAGResponse> => {
    // Convert chat messages to conversation history format
    const history: ConversationMessage[] = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    return queryRAG(userMessage, undefined, history);
  };

  const handleSend = async (message?: string) => {
    const text = message || inputValue;
    if (!text.trim()) return;

    // Create new session if none active
    if (!activeSessionId) {
      await createNewSession(text);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // First check if it's a simple project list query
      const simpleResponse = handleProjectQuery(text);

      if (simpleResponse) {
        // Use simple response for project list queries
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: stripMarkdown(simpleResponse),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Use RAG for research queries
        const ragResponse = await queryResearch(text);
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: stripMarkdown(ragResponse.answer),
          timestamp: new Date(),
          sources: ragResponse.sources,
          model: ragResponse.model_used
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: stripMarkdown('Sorry, I encountered an error processing your request. Please try again.'),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="h-[calc(100vh-5rem)] flex overflow-hidden">
      {/* Left Sidebar - Chat History */}
      <div className="w-64 shrink-0 bg-card border-r border-card flex flex-col">
        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {isLoadingSessions ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading history...</p>
            </div>
          ) : chatSessions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => loadSession(session)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group ${
                    activeSessionId === session.id
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-sm truncate">{session.title}</span>
                  <button
                    onClick={(e) => deleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-gray-500" />
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col min-h-0 px-6 py-8">
          <AnimatePresence mode="wait">
            {!hasMessages ? (
              // Empty state - centered welcome
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full"
              >
                <h1 className="text-4xl font-bold text-white mb-3">Repository</h1>
                <p className="text-gray-400 text-center mb-12">
                  Let's explore
                </p>

                {/* Quick prompts */}
                <div className="grid grid-cols-2 gap-3 w-full mb-8">
                  {QUICK_PROMPTS.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        onClick={() => handleQuickPrompt(item.prompt)}
                        className="flex items-center gap-3 p-4 bg-card border border-card rounded-xl text-left hover:border-gray-600 transition-colors group"
                      >
                        <Icon className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                          {item.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Input */}
                <div className="w-full">
                  <div className="flex gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask anything..."
                      className="flex-1 bg-card border border-card text-white placeholder-gray-500 rounded-full px-6 py-4 focus:outline-none focus:border-gray-600 transition-colors"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!inputValue.trim()}
                      className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Chat view
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col min-h-0 max-w-3xl mx-auto w-full"
              >
                {/* Header */}
                <div className="shrink-0 pb-6">
                  <h1 className="text-2xl font-bold text-white">Repository</h1>
                  <p className="text-sm text-gray-500">Research assistant</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-6 pb-6">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                        <div
                          className={`inline-block rounded-2xl px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-white text-black rounded-tr-sm'
                              : 'bg-card border border-card rounded-tl-sm'
                          }`}
                        >
                          <MessageContent
                            content={msg.content}
                            onProjectClick={onOpenProject}
                            className={msg.role === 'user' ? 'text-black' : 'text-gray-300'}
                          />
                        </div>
                        {/* Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-800">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                              <BookOpen className="w-3 h-3" />
                              <span>Sources</span>
                              {msg.model && (
                                <span className="ml-2 px-1.5 py-0.5 bg-gray-800 rounded text-[10px] text-gray-400">
                                  {msg.model}
                                </span>
                              )}
                            </div>
                            {msg.sources.map((source, index) => (
                              <div key={source.id} className="text-xs text-gray-500 mb-1">
                                <span className="text-gray-400 font-medium">[{index + 1}]</span>{' '}
                                <button
                                  onClick={() => onOpenProject?.(source.project_id)}
                                  className="text-blue-400 hover:text-blue-300 underline cursor-pointer transition-colors"
                                >
                                  {source.project_id}
                                </button>{' '}
                                {source.url ? (
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-gray-300 transition-colors"
                                  >
                                    {source.author && `${source.author}. `}{source.title}
                                  </a>
                                ) : (
                                  <span>{source.author && `${source.author}. `}{source.title}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-card border border-card rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="shrink-0 pt-4 border-t border-gray-800">
                  <div className="flex gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask a follow-up question..."
                      className="flex-1 bg-card border border-card text-white placeholder-gray-500 rounded-full px-5 py-3 focus:outline-none focus:border-gray-600 transition-colors"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!inputValue.trim() || isTyping}
                      className="w-11 h-11 flex items-center justify-center bg-white text-black rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TheRepo;
