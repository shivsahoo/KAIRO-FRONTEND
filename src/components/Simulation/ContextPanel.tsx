import { motion } from 'framer-motion';
import { useSimulationStore } from '../../store/simulationStore';

export default function ContextPanel() {
  const context = useSimulationStore((state) => state.context);

  if (!context) {
    return (
      <div className="h-full bg-white p-4 flex items-center justify-center">
        <p className="text-[13px] text-[#787878]">No context available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E5E5E5]">
        <h2 className="text-[15px] font-semibold text-[#0D0D0D]">Context</h2>
        <p className="text-[11px] text-[#787878] mt-0.5">Current simulation details</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Role Info */}
        <div>
          <h3 className="text-[12px] font-semibold text-[#6366F1] uppercase tracking-wide mb-2">Your Role</h3>
          <div className="bg-[#F5F5F5] rounded-[8px] p-3 border border-[#E5E5E5]">
            <p className="text-[14px] font-medium text-[#0D0D0D]">{context.role}</p>
            <p className="text-[12px] text-[#787878] mt-0.5">{context.department}</p>
          </div>
        </div>

        {/* Current Scenario */}
        <div>
          <h3 className="text-[12px] font-semibold text-[#6366F1] uppercase tracking-wide mb-2">Current Scenario</h3>
          <div className="bg-[#F5F5F5] rounded-[8px] p-3 border border-[#E5E5E5]">
            <p className="text-[14px] text-[#0D0D0D] leading-relaxed">{context.currentScenario}</p>
          </div>
        </div>

        {/* Objectives */}
        <div>
          <h3 className="text-[12px] font-semibold text-[#6366F1] uppercase tracking-wide mb-2">Objectives</h3>
          <ul className="space-y-2">
            {context.objectives.map((objective, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-2 bg-[#F5F5F5] rounded-[8px] p-2.5 border border-[#E5E5E5]"
              >
                <span className="text-[#6366F1] mt-0.5 font-bold">•</span>
                <span className="text-[13px] flex-1 text-[#0D0D0D] leading-relaxed">{objective}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

