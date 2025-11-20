import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { useSimulationStore } from '../../store/simulationStore';
import type { Message } from '../../types';

// Get WebSocket URL from env or construct from API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const WS_URL = import.meta.env.VITE_WS_URL || API_BASE_URL.replace('/api', '');

export default function ChatPanel() {
  const messages = useSimulationStore((state) => state.messages);
  const addMessage = useSimulationStore((state) => state.addMessage);
  const updateMessage = useSimulationStore((state) => state.updateMessage);
  const appendToLastMessage = useSimulationStore((state) => state.appendToLastMessage);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketInitialized = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize WebSocket connection
  useEffect(() => {
    let token = localStorage.getItem('authToken');
    const storedSessionId = sessionId || localStorage.getItem('simulationSessionId');

    // If no token, create a demo token for development
    if (!token) {
      console.warn('⚠️  No auth token found. Creating demo token for development...');
      // Create a simple demo token (this should match backend expectations)
      // For development, we'll use a demo user ID
      const demoToken = btoa(JSON.stringify({ 
        userId: 'demo-user-' + Date.now(),
        demo: true 
      }));
      localStorage.setItem('authToken', demoToken);
      token = demoToken;
      console.log('✅ Demo token created');
    }

    if (!storedSessionId) {
      console.warn('⚠️  No simulation session ID found. Waiting for session to be created...');
      // Check periodically for sessionId
      const checkSessionId = setInterval(() => {
        const newSessionId = localStorage.getItem('simulationSessionId');
        if (newSessionId) {
          clearInterval(checkSessionId);
          console.log('📋 Session ID found, initializing WebSocket...');
          setSessionId(newSessionId);
        }
      }, 500);
      
      // Clear interval after 15 seconds
      setTimeout(() => {
        clearInterval(checkSessionId);
        console.warn('⏱️  Timeout waiting for session ID');
      }, 15000);
      
      return () => clearInterval(checkSessionId);
    }

    // Don't reinitialize if we already initialized for this sessionId
    if (socketInitialized.current === storedSessionId && socketRef.current && socketRef.current.connected) {
      console.log('✅ WebSocket already connected for this session');
      return;
    }

    // Clean up existing socket if sessionId changed
    if (socketRef.current && socketInitialized.current !== storedSessionId) {
      console.log('🔄 Session ID changed, reinitializing WebSocket...');
      socketRef.current.disconnect();
      socketInitialized.current = null;
    }

    console.log('🔌 Initializing WebSocket connection to:', WS_URL);
    console.log('📋 Session ID:', storedSessionId);
    console.log('🔑 Token available:', !!token);
    
    const newSocket = io(WS_URL, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'], // Try both transports
      forceNew: true, // Force a new connection
    });
    
    // Add connection state logging
    newSocket.on('connect', () => {
      console.log('✅ Socket.io connected');
    });
    
    newSocket.io.on('error', (error) => {
      console.error('❌ Socket.io transport error:', error);
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
      setIsConnected(true);
      const sessionToJoin = storedSessionId || sessionId;
      if (sessionToJoin) {
        newSocket.emit('join_simulation', sessionToJoin);
        setSessionId(sessionToJoin);
        socketInitialized.current = sessionToJoin;
        console.log('Joined simulation session:', sessionToJoin);
      } else {
        console.warn('⚠️  Connected but no sessionId available yet');
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server disconnected, need to manually reconnect
        newSocket.connect();
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      if (storedSessionId) {
        newSocket.emit('join_simulation', storedSessionId);
      }
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after all attempts');
      setIsConnected(false);
      addMessage({
        type: 'system',
        content: 'Failed to reconnect to server. Please refresh the page.',
      });
    });

    // Handle connection errors
    newSocket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      setIsLoading(false);
      addMessage({
        type: 'system',
        content: `Connection error: ${error.message || 'Unable to connect to server'}. Please check if the backend is running.`,
      });
    });

    // Handle streaming message start
    newSocket.on('message_start', (data: any) => {
      setIsLoading(true);
      // Create a new message with the temp ID from backend
      const tempMessage: Message = {
        id: data.id, // Use the temp ID from backend
        type: 'ai',
        content: '',
        sender: data.persona === 'Manager' ? 'Sarah (Manager)' : 
                data.persona ? `${data.persona}` : 'AI',
        timestamp: new Date(),
      };
      // Add message directly to store with the temp ID
      useSimulationStore.setState((state) => ({
        messages: [...state.messages, tempMessage],
      }));
      setStreamingMessageId(data.id);
      console.log('📝 Started streaming message with ID:', data.id);
    });

    // Handle streaming message chunks
    newSocket.on('message_chunk', (data: any) => {
      setIsLoading(true);
      console.log('📦 Received chunk for message ID:', data.id, 'chunk length:', data.chunk.length);
      
      const currentMessages = useSimulationStore.getState().messages;
      
      // Find the message by ID (should be the last AI message)
      const targetMessage = currentMessages.find(msg => msg.id === data.id && msg.type === 'ai');
      
      if (targetMessage) {
        // Update the message with the new chunk
        updateMessage(data.id, {
          content: (targetMessage.content || '') + data.chunk,
        });
      } else {
        // If message not found by ID, try the last AI message (fallback)
        const lastMessage = currentMessages[currentMessages.length - 1];
        if (lastMessage && lastMessage.type === 'ai') {
          console.log('⚠️  Message not found by ID, appending to last AI message');
          appendToLastMessage(data.chunk);
        } else {
          console.warn('⚠️  Could not find target message for chunk, ID:', data.id);
        }
      }
    });

    // Handle message complete
    newSocket.on('message_complete', (data: any) => {
      setIsLoading(false);
      // Only clear if this is our streaming message
      if (data.id === streamingMessageId) {
        setStreamingMessageId(null);
      }
    });

    // Handle message saved (with database ID)
    newSocket.on('message_saved', (data: any) => {
      // Update the message ID if we have a streaming message
      if (streamingMessageId) {
        updateMessage(streamingMessageId, {
          id: data.id,
          timestamp: new Date(data.timestamp),
        });
        setStreamingMessageId(null);
      }
    });

    // Fallback: Handle non-streaming messages (for backward compatibility)
    // Only handle user messages here, AI messages come through streaming
    newSocket.on('new_message', (data: any) => {
      // Only process user messages here (AI messages come through streaming)
      if (data.sender === 'user') {
        setIsLoading(false);
        // Check if this message already exists (to prevent duplicates)
        const currentMessages = useSimulationStore.getState().messages;
        const messageExists = currentMessages.some(
          msg => msg.type === 'user' && 
                  msg.content === data.text && 
                  Math.abs(new Date(msg.timestamp).getTime() - new Date(data.timestamp).getTime()) < 2000
        );
        
        if (!messageExists) {
          addMessage({
            type: 'user',
            content: data.text,
            sender: 'You',
          });
        }
      }
      // AI messages are handled by streaming events, so ignore them here
    });

    newSocket.on('persona_typing', (data: any) => {
      setIsLoading(data.isTyping);
    });

    newSocket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      setIsLoading(false);
      if (error.message) {
        addMessage({
          type: 'system',
          content: `Error: ${error.message}`,
        });
      }
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      newSocket.disconnect();
      setIsConnected(false);
      socketRef.current = null;
    };
  }, [addMessage, updateMessage, appendToLastMessage, sessionId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    setInput('');
    setIsLoading(true);
    
    // Don't add user message here - it will be added when received from server via new_message event
    // This prevents duplicates

    try {
      // Check if WebSocket is ready - use ref for immediate access
      const currentSocket = socketRef.current || socket;
      
      if (!currentSocket) {
        console.error('Socket not initialized');
        // Try to get sessionId and reinitialize
        const currentSessionId = localStorage.getItem('simulationSessionId');
        if (currentSessionId && !sessionId) {
          console.log('🔄 Found sessionId in localStorage, setting it...');
          setSessionId(currentSessionId);
          // Wait for socket to initialize with retries
          let retryCount = 0;
          const maxRetries = 5;
          const checkSocket = setInterval(() => {
            retryCount++;
            const retrySocket = socketRef.current || socket;
            if (retrySocket && retrySocket.connected) {
              clearInterval(checkSocket);
              retrySocket.emit('send_message', {
                message: messageText,
                persona: 'Manager',
              });
            } else if (retryCount >= maxRetries) {
              clearInterval(checkSocket);
              addMessage({
                type: 'system',
                content: 'WebSocket connection timeout. Please refresh the page.',
              });
              setIsLoading(false);
            }
          }, 500);
          return;
        }
        addMessage({
          type: 'system',
          content: 'WebSocket not initialized. Please wait a moment for the connection to establish, or refresh the page.',
        });
        setIsLoading(false);
        return;
      }

      if (!currentSocket.connected) {
        console.error('Socket not connected. Current state:', currentSocket.disconnected ? 'disconnected' : 'connecting');
        
        // If connecting, wait a bit and retry
        if (!currentSocket.disconnected) {
          console.log('⏳ Socket is connecting, waiting...');
          let waitCount = 0;
          const maxWait = 10; // 5 seconds total
          const waitForConnection = setInterval(() => {
            waitCount++;
            const checkSocket = socketRef.current || socket;
            if (checkSocket && checkSocket.connected) {
              clearInterval(waitForConnection);
              console.log('✅ Socket connected, sending message...');
              checkSocket.emit('send_message', {
                message: messageText,
                persona: 'Manager',
              });
            } else if (waitCount >= maxWait) {
              clearInterval(waitForConnection);
              addMessage({
                type: 'system',
                content: 'Connection timeout. Please check if the backend server is running and try again.',
              });
              setIsLoading(false);
            }
          }, 500);
          return;
        }
        
        // If disconnected, try to reconnect
        addMessage({
          type: 'system',
          content: 'Not connected to server. Attempting to reconnect...',
        });
        currentSocket.connect();
        setIsLoading(false);
        return;
      }

      if (!sessionId) {
        console.error('Session ID not available');
        const storedSessionId = localStorage.getItem('simulationSessionId');
        if (storedSessionId) {
          setSessionId(storedSessionId);
          currentSocket.emit('join_simulation', storedSessionId);
          // Retry sending after a short delay
          setTimeout(() => {
            currentSocket.emit('send_message', {
              message: messageText,
              persona: 'Manager',
            });
          }, 500);
          return;
        } else {
          addMessage({
            type: 'system',
            content: 'Session not found. Please restart the simulation.',
          });
          setIsLoading(false);
          return;
        }
      }

      // All checks passed - send the message
      console.log('📤 Sending message via WebSocket:', messageText.substring(0, 50) + '...');
      currentSocket.emit('send_message', {
        message: messageText,
        persona: 'Manager',
      });
      // Don't set isLoading to false here - let the streaming events handle it
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage({
        type: 'system',
        content: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
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
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-[#E5E5E5] bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-[#0D0D0D]">Simulation Chat</h2>
            <p className="text-[11px] text-[#787878] mt-0.5">Interact with your AI colleagues</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-[10px] text-[#787878]">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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
                  max-w-[75%] rounded-[8px] p-3
                  ${
                    message.type === 'user'
                      ? 'bg-[#6366F1] text-white ml-auto'
                      : message.type === 'system'
                      ? 'bg-[#FEF3C7] border border-[#FCD34D] text-[#78350F]'
                      : 'bg-white border border-[#E5E5E5] text-[#0D0D0D]'
                  }
                `}
              >
                {message.sender && (
                  <div className={`text-[11px] font-semibold mb-1.5 ${
                    message.type === 'user' ? 'text-white/90' : 'text-[#6366F1]'
                  }`}>
                    {message.sender}
                  </div>
                )}
                <p className={`text-[14px] leading-relaxed whitespace-pre-wrap ${
                  message.type === 'user' ? 'text-white' : 'text-[#0D0D0D]'
                }`}>
                  {message.content}
                </p>
                <div className={`text-[11px] mt-1.5 ${
                  message.type === 'user' ? 'text-white/70' : 'text-[#787878]'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            <div className="bg-white border border-[#E5E5E5] rounded-[8px] p-3">
              <div className="flex gap-1.5">
                <motion.div
                  className="w-2 h-2 bg-[#6366F1] rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-[#6366F1] rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-[#6366F1] rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-[#E5E5E5] bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type your response..." : "Connecting..."}
            className="flex-1 bg-[#FAFAFA] border border-[#E5E5E5] rounded-[8px] px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !isConnected}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !isConnected}
            className="px-5 py-2.5 bg-[#6366F1] text-white rounded-[8px] text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4F46E5] transition-colors"
            title={!isConnected ? "Waiting for connection..." : ""}
          >
            {isConnected ? "Send" : "Connecting..."}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

