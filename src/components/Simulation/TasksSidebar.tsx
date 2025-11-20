import { motion } from 'framer-motion';
import { useSimulationStore } from '../../store/simulationStore';
import type { Task } from '../../types';

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
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E5E5E5]">
        <h2 className="text-[15px] font-semibold text-[#0D0D0D]">Tasks</h2>
        <p className="text-[11px] text-[#787878] mt-0.5">{tasks.length} active tasks</p>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center text-[#787878] py-8">
            <p className="text-[13px]">No tasks assigned yet</p>
          </div>
        ) : (
          tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FAFAFA] rounded-[8px] p-4 border border-[#E5E5E5] hover:border-[#6366F1]/30 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <span className="text-base mt-0.5">{statusIcons[task.status]}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[14px] text-[#0D0D0D] leading-snug">{task.title}</h3>
                  </div>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                  task.priority === 'high' ? 'bg-[#FEE2E2] text-[#DC2626]' :
                  task.priority === 'medium' ? 'bg-[#FEF3C7] text-[#D97706]' :
                  'bg-[#D1FAE5] text-[#059669]'
                }`}>
                  {task.priority}
                </span>
              </div>
              
              <p className="text-[12px] text-[#787878] mb-3 leading-relaxed">{task.description}</p>
              
              <div className="flex gap-1.5 flex-wrap">
                {(['pending', 'in-progress', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(task.id, status)}
                    className={`
                      text-[11px] px-2.5 py-1 rounded-[6px] font-medium
                      transition-all
                      ${
                        task.status === status
                          ? 'bg-[#6366F1] text-white'
                          : 'bg-white border border-[#E5E5E5] text-[#787878] hover:bg-[#FAFAFA]'
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

