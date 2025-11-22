import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowLeft, Loader2, TrendingUp, Lightbulb, Award } from 'lucide-react';

interface SubmissionResponse {
  submission: {
    id: string;
    taskId: string;
    score: number | null;
    feedback: string | null;
    improvements: string | null;
  };
  canProceed: boolean;
  message: string;
  nextTask: {
    id: string;
    title: string;
    description: string;
    level: string;
    expectedOutput: string;
    status: string;
  } | null;
  nextTaskMessage: any | null;
  completed: boolean;
  scoreInfo: {
    min: number;
    max: number;
    passingScore: number;
    currentScore: number;
  };
}

export default function TaskResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submissionResponse, setSubmissionResponse] = useState<SubmissionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get submission response from localStorage
    const storedResponse = localStorage.getItem('taskSubmissionResponse');
    if (storedResponse) {
      try {
        const response = JSON.parse(storedResponse);
        setSubmissionResponse(response);
        localStorage.removeItem('taskSubmissionResponse');
      } catch (error) {
        console.error('Error parsing submission response:', error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" />
      </div>
    );
  }

  if (!submissionResponse) {
    return (
      <div className="fixed inset-0 bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-lg border border-[#E5E5E5]">
          <h2 className="text-xl font-bold text-[#0D0D0D] mb-2">No Results Found</h2>
          <p className="text-[#787878] mb-4">No evaluation results available.</p>
          <button
            onClick={() => navigate('/simulation')}
            className="px-4 py-2 bg-[#6366F1] text-white rounded hover:bg-[#4F46E5] transition-colors"
          >
            Return to Simulation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#FAFAFA] overflow-y-auto">
      {/* Header */}
      <div className="h-14 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/simulation')}
            className="p-2 hover:bg-[#FAFAFA] rounded-[6px] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#0D0D0D]" />
          </button>
          <div>
            <h1 className="text-[15px] font-semibold text-[#0D0D0D] leading-none">Task Evaluation</h1>
            <p className="text-[11px] text-[#787878] mt-0.5">Interview Results</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Success Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className={`flex items-start gap-4 p-6 rounded-[12px] ${
            submissionResponse.canProceed
              ? 'bg-gradient-to-r from-[#D1FAE5] to-[#ECFDF5] border border-[#10B981]/20'
              : 'bg-gradient-to-r from-[#FEF3C7] to-[#FFFBEB] border border-[#F59E0B]/20'
          }`}>
            <div className={`p-2 rounded-[8px] ${
              submissionResponse.canProceed ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
            }`}>
            {submissionResponse.canProceed ? (
                <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
                <XCircle className="w-6 h-6 text-white" />
            )}
            </div>
            <div className="flex-1">
              <h2 className="text-[20px] font-semibold text-[#0D0D0D] mb-1">
                {submissionResponse.canProceed ? 'Task Submitted Successfully!' : 'Task Needs Improvement'}
              </h2>
              <p className="text-[15px] text-[#0D0D0D]/80">{submissionResponse.message}</p>
            </div>
          </div>
        </motion.div>

              {submissionResponse.submission && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Score Card */}
                  {submissionResponse.submission.score !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[12px] p-6 border border-[#E5E5E5] shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#EEF2FF] rounded-[8px]">
                    <Award className="w-5 h-5 text-[#6366F1]" />
                  </div>
                  <h3 className="text-[14px] font-medium text-[#787878]">Score</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[48px] font-bold text-[#0D0D0D] leading-none">
                    {submissionResponse.submission.score}
                  </span>
                  <span className="text-[20px] font-medium text-[#787878]">/10</span>
                </div>
                {submissionResponse.scoreInfo && (
                  <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                    <div className="space-y-2 text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-[#787878]">Passing Score</span>
                        <span className="font-medium text-[#0D0D0D]">{submissionResponse.scoreInfo.passingScore}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#787878]">Range</span>
                        <span className="font-medium text-[#0D0D0D]">{submissionResponse.scoreInfo.min}-{submissionResponse.scoreInfo.max}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
                  )}

            {/* Feedback Card */}
                  {submissionResponse.submission.feedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 bg-white rounded-[12px] p-6 border border-[#E5E5E5] shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#ECFDF5] rounded-[8px]">
                    <TrendingUp className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#0D0D0D]">Feedback</h3>
                </div>
                <p className="text-[15px] text-[#0D0D0D] leading-relaxed whitespace-pre-wrap">
                        {submissionResponse.submission.feedback}
                      </p>
              </motion.div>
                  )}

            {/* Improvements Card */}
                  {submissionResponse.submission.improvements && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-3 bg-white rounded-[12px] p-6 border border-[#E5E5E5] shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#FEF3C7] rounded-[8px]">
                    <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#0D0D0D]">Improvements</h3>
                </div>
                <p className="text-[15px] text-[#0D0D0D] leading-relaxed whitespace-pre-wrap">
                        {submissionResponse.submission.improvements}
                      </p>
              </motion.div>
                  )}
                </div>
              )}

        {/* Next Task or Completion */}
              {submissionResponse.canProceed && submissionResponse.nextTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[12px] p-6 border border-[#E5E5E5] shadow-sm mb-8"
          >
            <h3 className="text-[16px] font-semibold text-[#0D0D0D] mb-3">Next Task</h3>
            <p className="text-[15px] font-medium text-[#0D0D0D] mb-2">{submissionResponse.nextTask.title}</p>
            <p className="text-[14px] text-[#787878]">{submissionResponse.nextTask.description}</p>
          </motion.div>
              )}

              {submissionResponse.completed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-[#EEF2FF] to-[#F5F7FF] rounded-[12px] p-8 border border-[#6366F1]/20 shadow-sm mb-8 text-center"
          >
            <div className="text-[48px] mb-3">🎉</div>
            <h3 className="text-[20px] font-semibold text-[#0D0D0D] mb-2">Congratulations!</h3>
            <p className="text-[15px] text-[#787878]">You have completed all tasks in this simulation.</p>
          </motion.div>
              )}

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
                <button
                  onClick={() => navigate('/simulation')}
            className="px-8 py-3 bg-[#6366F1] text-white rounded-[8px] font-medium text-[15px] hover:bg-[#4F46E5] transition-all hover:shadow-lg"
                >
                  Return to Simulation
                </button>
        </motion.div>
      </div>
    </div>
  );
}

