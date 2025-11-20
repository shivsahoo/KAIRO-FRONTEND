import { motion } from 'framer-motion';
import { useSimulationStore } from '../../store/simulationStore';
import type { Task } from '../../types';

const priorityColors = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

const statusIcons = {
  pending: '⏳',
  'in-progress': '🔄',
  completed: '✅',
};

export default function TasksSidebar() {
  const tasks = useSimulationStore((state) => state.tasks);
  const updateTask = useSimulationStore((state) => state.updateTask);

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    updateTask(taskId, { status: newStatus });
  };

  return (
    <div className="h-full glass rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-light-border">
        <h2 className="text-xl font-semibold text-glow-purple">Tasks</h2>
        <p className="text-sm text-light-text-secondary">{tasks.length} active tasks</p>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center text-light-text-secondary">
            <p>No tasks assigned yet</p>
          </div>
        ) : (
          tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-strong rounded-lg p-4 border border-light-border hover:border-neon-purple/50 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{statusIcons[task.status]}</span>
                  <h3 className="font-semibold text-sm">{task.title}</h3>
                </div>
                <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
              
              <p className="text-xs text-light-text-secondary">{task.description}</p>
              
              <div className="flex gap-2">
                {(['pending', 'in-progress', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(task.id, status)}
                    className={`
                      text-xs px-2 py-1 rounded
                      transition-all
                      ${
                        task.status === status
                          ? 'bg-neon-purple/30 text-neon-purple border border-neon-purple/50'
                          : 'glass text-light-text-secondary'
                      }
                    `}
                  >
                    {status.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

