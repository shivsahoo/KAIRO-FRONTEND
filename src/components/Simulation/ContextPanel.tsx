import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSimulationStore } from '../../store/simulationStore';

export default function ContextPanel() {
  const navigate = useNavigate();
  const context = useSimulationStore((state) => state.context);
  const tasks = useSimulationStore((state) => state.tasks);

  if (!context) {
    return (
      <div className="h-full bg-white p-4 flex items-center justify-center">
        <p className="text-[15px] text-[#787878]">No context available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E5E5E5]">
        <h2 className="text-[17px] font-semibold text-[#0D0D0D]">Context</h2>
        <p className="text-[13px] text-[#787878] mt-0.5">Current simulation details</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Role Info */}
        <div>
          <h3 className="text-[14px] font-semibold text-[#6366F1] uppercase tracking-wide mb-2">Your Role</h3>
          <div className="bg-[#F5F5F5] rounded-[8px] p-4 border border-[#E5E5E5]">
            <p className="text-[16px] font-medium text-[#0D0D0D]">{context.role}</p>
            <p className="text-[14px] text-[#787878] mt-0.5">{context.department}</p>
          </div>
        </div>

        {/* Current Scenario */}
        <div>
          <h3 className="text-[14px] font-semibold text-[#6366F1] uppercase tracking-wide mb-2">Current Task</h3>
          <div className="bg-[#F5F5F5] rounded-[8px] p-4 border border-[#E5E5E5]">
            <p className="text-[16px] text-[#0D0D0D] leading-relaxed">{context.currentScenario}</p>
          </div>
        </div>

        {/* Objectives */}
        <div>
          <h3 className="text-[14px] font-semibold text-[#6366F1] uppercase tracking-wide mb-2">Objectives</h3>
          <ul className="space-y-2">
            {context.objectives.map((objective, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-2 bg-[#F5F5F5] rounded-[8px] p-3 border border-[#E5E5E5]"
              >
                <span className="text-[#6366F1] mt-0.5 font-bold">•</span>
                <span className="text-[15px] flex-1 text-[#0D0D0D] leading-relaxed">{objective}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* View Performance Result Button */}
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/performance')}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-[14px] font-semibold rounded-[8px] shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              View Performance Result
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

