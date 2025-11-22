import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowLeft, Loader2 } from 'lucide-react';

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
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-[8px] p-6 border ${
            submissionResponse.canProceed
              ? 'bg-[#D1FAE5] border-[#059669]'
              : 'bg-[#FEF3C7] border-[#D97706]'
          }`}
        >
          <div className="flex items-start gap-3 mb-4">
            {submissionResponse.canProceed ? (
              <CheckCircle2 className="w-6 h-6 text-[#059669] flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-[#D97706] flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="text-[17px] font-semibold text-[#0D0D0D] mb-2">
                {submissionResponse.canProceed ? 'Task Submitted Successfully!' : 'Task Needs Improvement'}
              </h3>
              <p className="text-[15px] text-[#0D0D0D] mb-4">{submissionResponse.message}</p>

              {submissionResponse.submission && (
                <div className="space-y-3">
                  {submissionResponse.submission.score !== null && (
                    <div className="bg-white rounded-[6px] p-4">
                      <p className="text-[14px] font-medium text-[#0D0D0D] mb-1">Score:</p>
                      <p className="text-[24px] font-bold text-[#0D0D0D]">
                        {submissionResponse.submission.score}/10
                      </p>
                    </div>
                  )}

                  {submissionResponse.submission.feedback && (
                    <div className="bg-white rounded-[6px] p-4">
                      <p className="text-[14px] font-medium text-[#0D0D0D] mb-2">Feedback:</p>
                      <p className="text-[14px] text-[#0D0D0D] whitespace-pre-wrap">
                        {submissionResponse.submission.feedback}
                      </p>
                    </div>
                  )}

                  {submissionResponse.submission.improvements && (
                    <div className="bg-white rounded-[6px] p-4">
                      <p className="text-[14px] font-medium text-[#0D0D0D] mb-2">Improvements:</p>
                      <p className="text-[14px] text-[#0D0D0D] whitespace-pre-wrap">
                        {submissionResponse.submission.improvements}
                      </p>
                    </div>
                  )}

                  {submissionResponse.scoreInfo && (
                    <div className="bg-white rounded-[6px] p-4">
                      <p className="text-[13px] text-[#787878] mb-2">Score Information:</p>
                      <div className="space-y-1">
                        <p className="text-[13px] text-[#0D0D0D]">
                          Current Score: <span className="font-semibold">{submissionResponse.scoreInfo.currentScore}/10</span>
                        </p>
                        <p className="text-[13px] text-[#0D0D0D]">
                          Passing Score: <span className="font-semibold">{submissionResponse.scoreInfo.passingScore}/10</span>
                        </p>
                        <p className="text-[13px] text-[#0D0D0D]">
                          Score Range: {submissionResponse.scoreInfo.min}-{submissionResponse.scoreInfo.max}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {submissionResponse.canProceed && submissionResponse.nextTask && (
                <div className="mt-4 bg-white rounded-[6px] p-4">
                  <p className="text-[13px] font-medium text-[#0D0D0D] mb-1">Next Task:</p>
                  <p className="text-[14px] text-[#0D0D0D] font-semibold">{submissionResponse.nextTask.title}</p>
                  <p className="text-[13px] text-[#787878] mt-1">{submissionResponse.nextTask.description}</p>
                </div>
              )}

              {submissionResponse.completed && (
                <div className="mt-4 bg-white rounded-[6px] p-4">
                  <p className="text-[14px] font-semibold text-[#0D0D0D]">🎉 Congratulations!</p>
                  <p className="text-[13px] text-[#0D0D0D] mt-1">You have completed all tasks in this simulation.</p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => navigate('/simulation')}
                  className="flex-1 px-4 py-3 bg-[#6366F1] text-white rounded-[6px] font-medium text-[15px] hover:bg-[#4F46E5] transition-colors"
                >
                  Return to Simulation
                </button>
                {submissionResponse.canProceed && submissionResponse.nextTask && (
                  <button
                    onClick={() => navigate('/simulation')}
                    className="px-4 py-3 bg-white border border-[#E5E5E5] text-[#0D0D0D] rounded-[6px] font-medium text-[15px] hover:bg-[#FAFAFA] transition-colors"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

