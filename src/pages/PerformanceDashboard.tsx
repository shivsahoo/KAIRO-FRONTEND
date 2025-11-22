import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { useSimulationStore } from '../store/simulationStore';
import { Award, TrendingUp, Clock, CheckCircle2, ArrowLeft, FileText, Star } from 'lucide-react';

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

export default function PerformanceDashboard() {
  const navigate = useNavigate();
  const role = useSimulationStore((state) => state.role);
  const tasks = useSimulationStore((state) => state.tasks);
  const context = useSimulationStore((state) => state.context);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);

  useEffect(() => {
    if (!role || tasks.length === 0) {
      navigate('/');
    }
  }, [role, tasks, navigate]);

  if (!role || tasks.length === 0) {
    return null;
  }

  // Calculate metrics
  const completedTasks = tasks.filter((task) => task.status === 'completed');
  const tasksWithScores = completedTasks.filter((task) => task.score !== null && task.score !== undefined);
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
  
  // Calculate overall score
  const overallScore = tasksWithScores.length > 0
    ? Math.round(tasksWithScores.reduce((sum, task) => sum + (task.score || 0), 0) / tasksWithScores.length * 10)
    : 0;

  // Calculate time taken (mock for now)
  const timeTaken = '42 mins';

  // Prepare bar chart data for task status distribution
  const statusData = [
    { name: 'Completed', value: completedTasks.length, color: '#10B981' },
    { name: 'In Progress', value: tasks.filter((t) => t.status === 'in-progress').length, color: '#F59E0B' },
    { name: 'Pending', value: tasks.filter((t) => t.status === 'pending').length, color: '#6B7280' },
  ].filter(item => item.value >= 0);

  // Prepare line chart data for score distribution - show individual task scores
  const scoreDistribution = tasksWithScores.map((task, index) => ({
    task: `Task ${index + 1}`,
    score: (task.score || 0) * 10,
    label: task.title.substring(0, 20) + '...'
  }));

  // Calculate score ranges for better visualization
  const scoreRanges = [
    { range: '0-3', value: tasksWithScores.filter((t) => (t.score || 0) * 10 < 40).length, color: '#EF4444' },
    { range: '4-5', value: tasksWithScores.filter((t) => {
      const score = (t.score || 0) * 10;
      return score >= 40 && score < 60;
    }).length, color: '#F59E0B' },
    { range: '6-7', value: tasksWithScores.filter((t) => {
      const score = (t.score || 0) * 10;
      return score >= 60 && score < 80;
    }).length, color: '#3B82F6' },
    { range: '8-10', value: tasksWithScores.filter((t) => (t.score || 0) * 10 >= 80).length, color: '#10B981' },
  ].filter(item => item.value >= 0);

  const handleViewFeedback = (task: any) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-[#E5E5E5]">
          <p className="text-sm font-semibold text-[#0D0D0D]">{payload[0].payload.name || payload[0].payload.task || payload[0].payload.range}</p>
          <p className="text-sm text-[#6366F1] font-medium">
            {payload[0].payload.score !== undefined ? `Score: ${payload[0].value}%` : `Count: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#3B82F6';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-8 py-6">
        {/* Page Header - Not sticky navbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/simulation')}
              className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#0D0D0D]" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-semibold text-[#0D0D0D]">Performance Dashboard</h1>
              <p className="text-sm text-[#787878] mt-0.5">{role} • Simulation Results</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-[#6366F1] text-white text-sm font-medium rounded-lg hover:bg-[#4F46E5] transition-colors"
          >
            Start New Simulation
          </motion.button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-5 border border-[#E5E5E5]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#6366F1]" />
              </div>
            </div>
            <h3 className="text-xs font-medium text-[#787878] mb-1">Overall Score</h3>
            <p className="text-3xl font-semibold text-[#0D0D0D] mb-1">{overallScore}%</p>
            <p className="text-xs text-[#787878]">
              Based on {tasksWithScores.length} completed task{tasksWithScores.length !== 1 ? 's' : ''}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-5 border border-[#E5E5E5]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              </div>
            </div>
            <h3 className="text-xs font-medium text-[#787878] mb-1">Tasks Completed</h3>
            <p className="text-3xl font-semibold text-[#0D0D0D] mb-1">{completedTasks.length}/{totalTasks}</p>
            <p className="text-xs text-[#787878]">{Math.round(completionRate)}% completion rate</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-5 border border-[#E5E5E5]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#3B82F6]" />
              </div>
            </div>
            <h3 className="text-xs font-medium text-[#787878] mb-1">Time Taken</h3>
            <p className="text-3xl font-semibold text-[#0D0D0D] mb-1">{timeTaken}</p>
            <p className="text-xs text-[#787878]">Total simulation duration</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Task Status Distribution - Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg p-5 border border-[#E5E5E5]"
          >
            <h3 className="text-sm font-semibold text-[#0D0D0D] mb-4">Task Status Distribution</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#787878' }}
                    axisLine={{ stroke: '#E5E5E5' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#787878' }}
                    axisLine={{ stroke: '#E5E5E5' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[240px] text-[#787878] text-sm">
                No task data available
              </div>
            )}
          </motion.div>

          {/* Score Distribution - Line Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg p-5 border border-[#E5E5E5]"
          >
            <h3 className="text-sm font-semibold text-[#0D0D0D] mb-4">Score Distribution</h3>
            {scoreDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="task" 
                    tick={{ fontSize: 12, fill: '#787878' }}
                    axisLine={{ stroke: '#E5E5E5' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: '#787878' }}
                    axisLine={{ stroke: '#E5E5E5' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#6366F1" 
                    strokeWidth={3}
                    dot={{ fill: '#6366F1', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[240px] text-[#787878] text-sm">
                Complete tasks to see score distribution
              </div>
            )}
          </motion.div>
        </div>

        {/* Task Breakdown Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg p-5 border border-[#E5E5E5]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#0D0D0D]">Task Breakdown</h3>
            <TrendingUp className="w-4 h-4 text-[#6366F1]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tasks.map((task, index) => {
              const score = task.score !== null && task.score !== undefined ? task.score * 10 : null;
              const isCompleted = task.status === 'completed';
              const hasScore = score !== null;
              // Always use blue color for completed tasks with scores
              const progressColor = '#6366F1'; // Blue color for all completed tasks

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className={`relative p-4 rounded-lg border transition-all cursor-pointer ${
                    isCompleted && hasScore
                      ? 'border-[#E5E5E5] bg-white hover:border-[#6366F1]'
                      : 'border-[#E5E5E5] bg-[#FAFAFA]'
                  }`}
                  onClick={() => isCompleted && hasScore && handleViewFeedback(task)}
                >
                  {/* Circular Progress */}
                  {isCompleted && hasScore ? (
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Score', value: score, fill: progressColor },
                              { name: 'Remaining', value: 100 - score, fill: '#F3F4F6' }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={28}
                            outerRadius={40}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                          >
                            <Cell fill={progressColor} />
                            <Cell fill="#F3F4F6" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-lg font-semibold text-[#0D0D0D]">{score}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      task.status === 'in-progress' ? 'bg-[#6366F1]/10' : 'bg-[#F3F4F6]'
                    }`}>
                      {task.status === 'in-progress' ? (
                        <div className="w-10 h-10 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FileText className="w-6 h-6 text-[#787878]" />
                      )}
                    </div>
                  )}

                  <h4 className="text-xs font-semibold text-[#0D0D0D] mb-1 text-center line-clamp-2">
                    Task {index + 1}
                  </h4>
                  <p className="text-xs text-[#787878] text-center mb-2 line-clamp-2 leading-tight">{task.title}</p>
                  
                  {isCompleted && hasScore ? (
                    <div className="flex items-center justify-center gap-1 text-xs text-[#6366F1] font-medium">
                      <Star className="w-3 h-3 fill-[#6366F1]" />
                      <span>View Feedback</span>
                    </div>
                  ) : (
                    <div className="text-xs text-center text-[#787878] capitalize">{task.status}</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Task Details Modal */}
        {showTaskDetails && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTaskDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-xl font-semibold text-[#0D0D0D]">{selectedTask.title}</h3>
                <button
                  onClick={() => setShowTaskDetails(false)}
                  className="text-[#787878] hover:text-[#0D0D0D] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Score Display */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-[#787878] mb-1">Task Score</p>
                    <p className="text-3xl font-bold text-[#0D0D0D]">
                      {selectedTask.score ? selectedTask.score * 10 : 'N/A'}%
                    </p>
                  </div>
                  <div className="w-24 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[{ value: selectedTask.score ? selectedTask.score * 10 : 0, name: 'Score' }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={48}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          <Cell fill={selectedTask.score ? getScoreColor(selectedTask.score * 10) : '#E5E7EB'} />
                        </Pie>
                        <Pie
                          data={[{ value: 100 - (selectedTask.score ? selectedTask.score * 10 : 0), name: 'Remaining' }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={48}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          <Cell fill="#F3F4F6" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-[#6366F1] uppercase tracking-wide mb-2">Task Description</h4>
                  <p className="text-[15px] text-[#0D0D0D] leading-relaxed">{selectedTask.description}</p>
                </div>

                {/* Feedback */}
                {selectedTask.feedback && (
                  <div>
                    <h4 className="text-sm font-semibold text-[#6366F1] uppercase tracking-wide mb-2">Feedback</h4>
                    <div className="bg-[#F5F5F5] rounded-lg p-4 border border-[#E5E5E5]">
                      <p className="text-[15px] text-[#0D0D0D] leading-relaxed whitespace-pre-line">{selectedTask.feedback}</p>
                    </div>
                  </div>
                )}

                {/* Improvements */}
                {selectedTask.improvements && (
                  <div>
                    <h4 className="text-sm font-semibold text-[#6366F1] uppercase tracking-wide mb-2">Areas for Improvement</h4>
                    <ul className="space-y-2">
                      {Array.isArray(selectedTask.improvements) ? (
                        selectedTask.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 bg-[#F5F5F5] rounded-lg p-3 border border-[#E5E5E5]">
                            <span className="text-[#F59E0B] mt-0.5 font-bold">•</span>
                            <span className="text-[15px] text-[#0D0D0D] flex-1">{improvement}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-2 bg-[#F5F5F5] rounded-lg p-3 border border-[#E5E5E5]">
                          <span className="text-[#F59E0B] mt-0.5 font-bold">•</span>
                          <span className="text-[15px] text-[#0D0D0D] flex-1">{selectedTask.improvements}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Status & Timestamp */}
                <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
                  <div>
                    <p className="text-xs text-[#787878] mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedTask.status === 'completed'
                        ? 'bg-[#10B981]/10 text-[#059669]'
                        : selectedTask.status === 'in-progress'
                        ? 'bg-[#F59E0B]/10 text-[#D97706]'
                        : 'bg-[#E5E7EB] text-[#787878]'
                    }`}>
                      {selectedTask.status === 'completed' ? '✓ Completed' : selectedTask.status === 'in-progress' ? '→ In Progress' : '○ Pending'}
                    </span>
                  </div>
                  {selectedTask.submittedAt && (
                    <div>
                      <p className="text-xs text-[#787878] mb-1">Submitted At</p>
                      <p className="text-xs font-medium text-[#0D0D0D]">
                        {new Date(selectedTask.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
