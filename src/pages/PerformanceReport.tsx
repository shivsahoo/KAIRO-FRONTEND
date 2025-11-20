import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSimulationStore } from '../store/simulationStore';

export default function PerformanceReport() {
  const navigate = useNavigate();
  const evaluation = useSimulationStore((state) => state.evaluation);
  const role = useSimulationStore((state) => state.role);
  const reset = useSimulationStore((state) => state.reset);

  useEffect(() => {
    if (!evaluation) {
      navigate('/');
    }
  }, [evaluation, navigate]);

  if (!evaluation) {
    return null;
  }

  const handleStartNew = () => {
    reset();
    navigate('/');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGlow = (score: number) => {
    if (score >= 80) return 'text-glow-cyan';
    if (score >= 60) return 'text-glow-purple';
    return '';
  };

  return (
    <div className="min-h-screen bg-light-bg">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-glow-purple mb-2">Performance Report</h1>
          <p className="text-light-text-secondary">{role} Simulation</p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-2xl p-8 mb-6 text-center border-2 border-neon-purple/30"
        >
          <div className="mb-4">
            <p className="text-light-text-secondary">Overall Score</p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className={`text-7xl font-bold ${getScoreColor(evaluation.score)} ${getScoreGlow(evaluation.score)}`}
            >
              {evaluation.score}/100
            </motion.div>
          </div>
          <div className="w-full bg-light-surface rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${evaluation.score}%` }}
              transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
              className={`h-full ${
                evaluation.score >= 80
                  ? 'bg-gradient-to-r from-neon-cyan to-neon-purple'
                  : evaluation.score >= 60
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                  : 'bg-gradient-to-r from-red-400 to-pink-400'
              }`}
            />
          </div>
        </motion.div>

        {/* Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-strong rounded-xl p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-glow-cyan mb-4">Feedback</h2>
          <p className="text-light-text">{evaluation.feedback}</p>
        </motion.div>

        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-strong rounded-xl p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-green-400 mb-4">Strengths</h2>
          <ul className="space-y-2">
            {evaluation.strengths.map((strength, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-2"
              >
                <span className="text-green-400">✓</span>
                <span className="text-light-text">{strength}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Areas for Improvement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-strong rounded-xl p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">Areas for Improvement</h2>
          <ul className="space-y-2">
            {evaluation.improvements.map((improvement, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-2"
              >
                <span className="text-yellow-400">→</span>
                <span className="text-light-text">{improvement}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Skills Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-strong rounded-xl p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-glow-purple mb-4">Skills Assessment</h2>
          <div className="space-y-4">
            {evaluation.skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-light-text">{skill.name}</span>
                  <span className="text-neon-cyan">{skill.level}/10</span>
                </div>
                <div className="w-full bg-light-surface rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(skill.level / 10) * 100}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartNew}
            className="px-8 py-3 bg-neon-purple rounded-lg font-semibold hover:shadow-glow-purple transition-all"
          >
            Start New Simulation
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

