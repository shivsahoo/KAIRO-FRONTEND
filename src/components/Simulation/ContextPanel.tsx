import { motion } from 'framer-motion';
import { useSimulationStore } from '../../store/simulationStore';

export default function ContextPanel() {
  const context = useSimulationStore((state) => state.context);

  if (!context) {
    return (
      <div className="h-full glass rounded-xl p-4 flex items-center justify-center">
        <p className="text-light-text-secondary">No context available</p>
      </div>
    );
  }

  return (
    <div className="h-full glass rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-light-border">
        <h2 className="text-xl font-semibold text-glow-cyan">Context</h2>
        <p className="text-sm text-light-text-secondary">Current simulation details</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Role Info */}
        <div>
          <h3 className="text-sm font-semibold text-neon-purple mb-2">Your Role</h3>
          <div className="glass-strong rounded-lg p-3">
            <p className="text-sm font-medium">{context.role}</p>
            <p className="text-xs text-light-text-secondary">{context.department}</p>
          </div>
        </div>

        {/* Current Scenario */}
        <div>
          <h3 className="text-sm font-semibold text-neon-cyan mb-2">Current Scenario</h3>
          <div className="glass-strong rounded-lg p-3">
            <p className="text-sm">{context.currentScenario}</p>
          </div>
        </div>

        {/* Objectives */}
        <div>
          <h3 className="text-sm font-semibold text-neon-pink mb-2">Objectives</h3>
          <ul className="space-y-2">
            {context.objectives.map((objective, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 glass-strong rounded-lg p-2"
              >
                <span className="text-neon-cyan mt-0.5">•</span>
                <span className="text-xs flex-1">{objective}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

