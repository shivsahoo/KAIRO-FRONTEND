import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulationStore } from '../../store/simulationStore';
import { mockSendMessage } from '../../utils/api';
import type { Message } from '../../types';

export default function ChatPanel() {
  const messages = useSimulationStore((state) => state.messages);
  const addMessage = useSimulationStore((state) => state.addMessage);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Omit<Message, 'id' | 'timestamp'> = {
      type: 'user',
      content: input.trim(),
    };

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await mockSendMessage(input, messages);
      addMessage({
        type: 'ai',
        content: aiResponse.content,
        sender: aiResponse.sender,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage({
        type: 'system',
        content: 'Failed to send message. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full glass rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-light-border">
        <h2 className="text-xl font-semibold text-glow-cyan">Simulation Chat</h2>
        <p className="text-sm text-light-text-secondary">Interact with your AI colleagues</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[75%] rounded-lg p-3
                  ${
                    message.type === 'user'
                      ? 'bg-neon-purple/20 border border-neon-purple/30'
                      : message.type === 'system'
                      ? 'bg-yellow-500/10 border border-yellow-500/30'
                      : 'glass border border-light-border'
                  }
                `}
              >
                {message.sender && (
                  <div className="text-xs font-semibold text-neon-cyan mb-1">
                    {message.sender}
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <div className="text-xs text-light-text-secondary">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass border border-light-border rounded-lg p-3">
              <div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 bg-neon-cyan rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-neon-cyan rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-neon-cyan rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-light-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            className="flex-1 glass rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent"
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-neon-purple rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow-purple transition-all"
          >
            Send
          </motion.button>
        </div>
      </div>
    </div>
  );
}

