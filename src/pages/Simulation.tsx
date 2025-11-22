import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSimulationStore } from '../store/simulationStore';
import { startSimulation as apiStartSimulation } from '../utils/api';
import ChatPanel from '../components/Simulation/ChatPanel';
import TasksSidebar from '../components/Simulation/TasksSidebar';
import ContextPanel from '../components/Simulation/ContextPanel';

export default function Simulation() {
  const navigate = useNavigate();
  const role = useSimulationStore((state) => state.role);
  const setContext = useSimulationStore((state) => state.setContext);
  const addMessage = useSimulationStore((state) => state.addMessage);
  const addTask = useSimulationStore((state) => state.addTask);
  const startSimulation = useSimulationStore((state) => state.startSimulation);
  const reset = useSimulationStore((state) => state.reset);
  const [isInitializing, setIsInitializing] = useState(true);
  const hasInitialized = useRef<string | null>(null);

  useEffect(() => {
    if (!role) {
      navigate('/');
      return;
    }

    // Prevent double initialization for the same role
    if (hasInitialized.current === role) {
      return;
    }

    const initializeSimulation = async () => {
      try {
        hasInitialized.current = role;
        setIsInitializing(true);
        // Always use real API - backend handles auth gracefully
        let data;
        try {
          data = await apiStartSimulation(role);
        } catch (apiError) {
          console.error('API call failed:', apiError);
          alert('Failed to start simulation. Please make sure:\n1. Backend is running on http://localhost:3000\n2. MongoDB is running\n3. OPENAI_API_KEY is set in backend .env file');
          hasInitialized.current = null; // Reset on error so user can retry
          throw apiError;
        }
        
        // Reset store before loading session data (prevents duplicates)
        // Preserve role since it's needed for the session
        const currentRole = role;
        reset();
        // Restore role after reset
        if (currentRole) {
          useSimulationStore.getState().setRole(currentRole);
        }
        setContext(data.context);
        
        // If resuming, load all messages from previous session
        if (data.isResuming && data.messages && data.messages.length > 0) {
          console.log(`📋 Resuming session with ${data.messages.length} messages`);
          // Load all messages from previous session
          data.messages.forEach((message) => addMessage(message));
        } else {
          // New session - add welcome message first (if present), then initial message (if present)
          console.log(data.welcomeMessage ? '👋 First-time user - showing welcome message' : '🆕 Returning user - showing initial message');
          if (data.welcomeMessage) {
            addMessage(data.welcomeMessage);
          }
          // Only add initial message if it exists (returning users will have it, first-time users won't)
          if (data.initialMessage) {
            addMessage(data.initialMessage);
          }
        }
        
        // Clear existing tasks and load tasks from session
        data.tasks.forEach((task) => addTask(task));
        
        // Store session ID for WebSocket connection
        if (data.sessionId) {
          localStorage.setItem('simulationSessionId', data.sessionId);
        }
        
        startSimulation();
      } catch (error) {
        console.error('Failed to initialize simulation:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, navigate]);


  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-[#FAFAFA] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-12 h-12 border-2 border-[#6366F1] border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-[14px] text-[#787878]">Initializing simulation...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#FAFAFA] overflow-hidden">
      {/* Top Header Bar - Figma Style */}
      <div className="h-14 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-[#0D0D0D] leading-none">Kairo Simulation</h1>
            <p className="text-[11px] text-[#787878] mt-0.5">{role}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area - Fullscreen */}
      <div className="h-[calc(100vh-3.5rem)] flex gap-0">
        {/* Left Sidebar - Context Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-96 border-r border-[#E5E5E5] bg-white overflow-hidden flex-shrink-0"
        >
          <ContextPanel />
        </motion.div>

        {/* Center - Chat Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col bg-[#FAFAFA] overflow-hidden"
        >
          <ChatPanel />
        </motion.div>

        {/* Right Sidebar - Tasks Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="w-96 border-l border-[#E5E5E5] bg-white overflow-hidden flex-shrink-0"
        >
          <TasksSidebar />
        </motion.div>
      </div>
    </div>
  );
}

