import { motion } from 'framer-motion';
import { Clock, RefreshCw, CheckCircle2, Calendar, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import type { Task } from '../../types';
import CalendarModal from './CalendarModal';
import EmailModal from './EmailModal';

const statusIcons = {
  pending: Clock,
  'in-progress': RefreshCw,
  completed: CheckCircle2,
};

export default function TasksSidebar() {
  const navigate = useNavigate();
  const tasks = useSimulationStore((state) => state.tasks);
  const updateTask = useSimulationStore((state) => state.updateTask);

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    updateTask(taskId, { status: newStatus });
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/task/${taskId}`);
  };

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E5E5E5]">
        <h2 className="text-[17px] font-semibold text-[#0D0D0D]">Tasks</h2>
        <p className="text-[13px] text-[#787878] mt-0.5">{tasks.length} active tasks</p>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center text-[#787878] py-8">
            <p className="text-[15px]">No tasks assigned yet</p>
          </div>
        ) : (
          tasks.map((task) => {
            const IconComponent = statusIcons[task.status];
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleTaskClick(task.id)}
                className="bg-[#FAFAFA] rounded-[8px] p-4 border border-[#E5E5E5] hover:border-[#6366F1]/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2 flex-1">
                    <IconComponent className="w-5 h-5 mt-0.5 text-[#6366F1]" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-[16px] text-[#0D0D0D] leading-snug">{task.title}</h3>
                    </div>
                  </div>
                  <span className={`text-[13px] font-medium px-2.5 py-1 rounded ${
                    task.priority === 'high' ? 'bg-[#FEE2E2] text-[#DC2626]' :
                    task.priority === 'medium' ? 'bg-[#FEF3C7] text-[#D97706]' :
                    'bg-[#D1FAE5] text-[#059669]'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                
                <p className="text-[14px] text-[#787878] mb-3 leading-relaxed">{task.description}</p>
                
                <div className="flex gap-1.5 flex-wrap">
                  {(['pending', 'in-progress', 'completed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(task.id, status);
                      }}
                      className={`
                        text-[13px] px-3 py-1.5 rounded-[6px] font-medium
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
            );
          })
        )}
      </div>

      {/* Global Calendar and Email Actions at Bottom */}
      <div className="px-6 py-4 border-t border-[#E5E5E5] bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalendarModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-[6px] text-[14px] font-medium text-[#6366F1] hover:bg-[#EEF2FF] hover:border-[#6366F1] transition-colors"
            title="Schedule Meeting"
          >
            <Calendar className="w-5 h-5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-[6px] text-[14px] font-medium text-[#6366F1] hover:bg-[#EEF2FF] hover:border-[#6366F1] transition-colors"
            title="Send Email"
          >
            <Mail className="w-5 h-5" />
            <span>Email</span>
          </button>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <CalendarModal
          isOpen={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
        />
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <EmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
}

