import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { sendPitchMessage, getInitialMessage, stripPitchTags, stripMarkdown, type PitchMessage, type ProjectContext, type ExtractedPitch } from '../../services/pitchAgent';
import { useProjects } from '../../context/ProjectsContext';
import { savePitchAiSession, type PitchChatMessage } from '../../services/pitchService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface PitchChatPanelProps {
  pitchId?: string;
  userId?: string;
  initialMessages?: ChatMessage[];
  onPitchUpdate?: (pitch: ExtractedPitch) => void;
}

export function PitchChatPanel({ pitchId, userId, initialMessages, onPitchUpdate }: PitchChatPanelProps) {
  const { projects } = useProjects();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Convert projects to context format for the agent
  const projectContext: ProjectContext[] = projects.map(p => ({
    id: p.id,
    title: p.title,
    researcher: p.researcher,
    category: p.category,
    phase: p.phase,
    description: p.description
  }));

  // Load initial greeting if no initial messages
  useEffect(() => {
    if (!isInitialized && (!initialMessages || initialMessages.length === 0)) {
      setIsInitialized(true);
      getInitialMessage().then(greeting => {
        setMessages([{
          id: '1',
          role: 'assistant',
          content: greeting
        }]);
      });
    }
  }, [isInitialized, initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save messages to database when pitch is linked
  useEffect(() => {
    if (pitchId && userId && messages.length > 0) {
      const dbMessages: PitchChatMessage[] = messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date()
      }));
      savePitchAiSession(pitchId, userId, dbMessages);
    }
  }, [messages, pitchId, userId]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Convert messages to PitchMessage format (exclude the new user message, it's passed separately)
      const history: PitchMessage[] = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await sendPitchMessage(inputValue, history, projectContext);

      // Notify parent of pitch updates
      if (onPitchUpdate && response.extractedPitch) {
        onPitchUpdate(response.extractedPitch);
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: stripMarkdown(stripPitchTags(response.message))
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Let's try that again - what were you saying?"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border border-card rounded-2xl h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Ezra</h2>
            <p className="text-xs text-gray-500">Pitch Assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`inline-block rounded-2xl p-3 ${
                    msg.role === 'user'
                      ? 'bg-white text-black rounded-tr-sm'
                      : 'bg-gray-800 rounded-tl-sm'
                  }`}
                >
                  <p className={`text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'text-black' : 'text-gray-300'}`}>
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
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
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Tell me about your research idea..."
            disabled={isLoading}
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
