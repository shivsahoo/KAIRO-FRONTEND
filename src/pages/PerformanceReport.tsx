import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSimulationStore } from '../store/simulationStore';
import { Button } from '@/components/ui/button';
import { CheckCircle2, TrendingUp, Target, AlertCircle, Award } from 'lucide-react';

export default function PerformanceReport() {
  const navigate = useNavigate();
  const evaluation = useSimulationStore((state) => state.evaluation);
  const role = useSimulationStore((state) => state.role);
  const tasks = useSimulationStore((state) => state.tasks);

  useEffect(() => {
    if (!evaluation) {
      navigate('/');
    }
  }, [evaluation, navigate]);

  if (!evaluation) {
    return null;
  }

  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#0D0D0D] mb-2">Performance Report</h1>
              <p className="text-lg text-[#787878]">{role}</p>
            </div>
            <Button
              onClick={() => navigate('/')}
              className="bg-[#3e67a8] hover:bg-[#355892] text-white"
            >
              Start New Simulation
            </Button>
          </div>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-8 mb-6 border border-[#E5E5E5] shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#0D0D0D] mb-1">Overall Score</h2>
                <p className="text-sm text-[#787878]">Based on your performance during the simulation</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-[#3e67a8] mb-1">{evaluation.score}/100</div>
              <div className="text-sm text-[#787878]">
                {evaluation.score >= 80 ? 'Excellent' : evaluation.score >= 60 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-[#E5E5E5] shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-[#0D0D0D]">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {evaluation.strengths.map((strength, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-2 text-[#787878]"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Areas for Improvement */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-[#E5E5E5] shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <h3 className="text-xl font-semibold text-[#0D0D0D]">Areas for Improvement</h3>
            </div>
            <ul className="space-y-2">
              {evaluation.improvements.map((improvement, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-2 text-[#787878]"
                >
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{improvement}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Skills Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 mb-6 border border-[#E5E5E5] shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-[#3e67a8]" />
            <h3 className="text-xl font-semibold text-[#0D0D0D]">Skills Assessment</h3>
          </div>
          <div className="space-y-4">
            {evaluation.skills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#0D0D0D] font-medium">{skill.name}</span>
                  <span className="text-[#787878] text-sm">{skill.level}/100</span>
                </div>
                <div className="w-full bg-[#E5E5E5] rounded-full h-2.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                    className="h-2.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 mb-6 border border-[#E5E5E5] shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-[#3e67a8]" />
            <h3 className="text-xl font-semibold text-[#0D0D0D]">Detailed Feedback</h3>
          </div>
          <p className="text-[#787878] leading-relaxed whitespace-pre-line">{evaluation.feedback}</p>
        </motion.div>

        {/* Task Completion Summary */}
        {totalTasks > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl p-6 border border-[#E5E5E5] shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6 text-[#3e67a8]" />
              <h3 className="text-xl font-semibold text-[#0D0D0D]">Task Completion</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#787878]">
                Completed {completedTasks} out of {totalTasks} tasks
              </span>
              <span className="text-lg font-semibold text-[#3e67a8]">{Math.round(completionRate)}%</span>
            </div>
            <div className="mt-4 w-full bg-[#E5E5E5] rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="h-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4 justify-center mt-8"
        >
          <Button
            onClick={() => navigate('/')}
            className="bg-[#3e67a8] hover:bg-[#355892] text-white px-8"
          >
            Try Another Role
          </Button>
          <Button
            onClick={() => navigate('/simulation')}
            variant="outline"
            className="border-[#E5E5E5] text-[#0D0D0D] hover:bg-[#FAFAFA] px-8"
          >
            Review Simulation
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

