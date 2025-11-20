import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSimulationStore } from '../store/simulationStore';
import { mockStartSimulation, mockEvaluatePerformance } from '../utils/api';
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

  useEffect(() => {
    if (!role) {
      navigate('/');
      return;
    }

    const initializeSimulation = async () => {
      try {
        setIsInitializing(true);
        const data = await mockStartSimulation(role);
        
        setContext(data.context);
        addMessage(data.initialMessage);
        data.tasks.forEach((task) => addTask(task));
        startSimulation();
      } catch (error) {
        console.error('Failed to initialize simulation:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSimulation();
  }, [role, navigate, setContext, addMessage, addTask, startSimulation]);

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
      <div className="min-h-screen bg-light-bg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 border-4 border-neon-purple border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-light-text-secondary">Initializing simulation...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-glow-purple">Kairo Simulation</h1>
            <p className="text-sm text-light-text-secondary">{role} Role</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEndSimulation}
            className="px-4 py-2 glass-strong rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all"
          >
            End Simulation
          </motion.button>
        </motion.div>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100%-5rem)]">
          {/* Context Panel - Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 md:col-span-3"
          >
            <ContextPanel />
          </motion.div>

          {/* Chat Panel - Center */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 md:col-span-6"
          >
            <ChatPanel />
          </motion.div>

          {/* Tasks Sidebar - Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-12 md:col-span-3"
          >
            <TasksSidebar />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

