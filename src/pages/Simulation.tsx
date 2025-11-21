import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSimulationStore } from '../store/simulationStore';
import { startSimulation as apiStartSimulation, mockEvaluatePerformance } from '../utils/api';
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
  const endSimulation = useSimulationStore((state) => state.endSimulation);
  const setEvaluation = useSimulationStore((state) => state.setEvaluation);
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
        
        setContext(data.context);
        addMessage(data.initialMessage);
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

  const handleEndSimulation = async () => {
    try {
      const evaluation = await mockEvaluatePerformance();
      setEvaluation(evaluation);
      endSimulation();
      navigate('/report');
    } catch (error) {
      console.error('Failed to evaluate performance:', error);
    }
  };

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
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEndSimulation}
            className="px-3 py-1.5 text-[13px] font-medium text-[#DC2626] hover:bg-[#FEE2E2] rounded-[6px] transition-colors"
          >
            End Simulation
          </motion.button>
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

