import { useState, useEffect } from 'react';
import { X, Mail, Send, Loader2, Paperclip, CheckCircle2, User } from 'lucide-react';
import { getCandidates, getInterviews, sendInterviewEmail } from '../../utils/api';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailModal({ isOpen, onClose }: EmailModalProps) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<string>('');
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('sarah.chen@company.com');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      // Reset state when modal closes
      setSelectedInterview('');
      setTo('');
      setCc('sarah.chen@company.com');
      setSubject('');
      setBody('');
      setEmailSent(false);
      setError(null);
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [candidatesData, interviewsData] = await Promise.all([
        getCandidates(),
        getInterviews(),
      ]);
      setCandidates(candidatesData.candidates);
      setScheduledInterviews(interviewsData.interviews);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterviewSelect = (interviewId: string) => {
    setSelectedInterview(interviewId);
    const interview = scheduledInterviews.find(i => i.id === interviewId);
    if (interview) {
      setTo(interview.candidateEmail);
      setCc('sarah.chen@company.com');
      setSubject(`Interview Invitation - Python Developer Position`);
      setBody(`Dear ${interview.candidateName},

We are pleased to invite you for an interview for the Python Developer position.

Interview Details:
- Date: ${new Date(interview.startTime).toLocaleDateString()}
- Time: ${new Date(interview.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(interview.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
- Type: ${interview.interviewType}
${interview.meetingLink ? `- Meeting Link: ${interview.meetingLink}` : ''}
${interview.location ? `- Location: ${interview.location}` : ''}

Please confirm your attendance.

Best regards,
Sarah Chen
HR Manager`);
    }
  };

  const handleSend = async () => {
    if (!to.trim()) {
      setError('Recipient email is required');
      return;
    }
    if (!cc.trim()) {
      setError('CC email is required');
      return;
    }
    if (!subject.trim()) {
      setError('Subject is required');
      return;
    }
    if (!body.trim()) {
      setError('Email body is required');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      let interview = null;
      let candidateId = '';
      let meetingLink = '';

      if (selectedInterview) {
        interview = scheduledInterviews.find(i => i.id === selectedInterview);
        if (interview) {
          candidateId = interview.candidateId;
          meetingLink = interview.meetingLink || '';
        }
      } else {
        // Find candidate by email
        const candidate = candidates.find(c => c.email === to.trim());
        if (candidate) {
          candidateId = candidate.id;
        }
      }

      const emailData: any = {
        to: to.trim(),
        cc: cc.trim(),
        subject: subject.trim(),
        body: body.trim(),
        attachResume: true,
      };

      if (selectedInterview) {
        emailData.interviewId = selectedInterview;
      }
      if (meetingLink) {
        emailData.meetingLink = meetingLink;
      }
      if (candidateId) {
        emailData.resumeId = candidateId;
      }

      const response = await sendInterviewEmail(emailData);

      setEmailSent(true);
    } catch (err: any) {
      console.error('Send email error:', err);
      setError(err.message || 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[12px] w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-[#6366F1]" />
            <h2 className="text-[20px] font-semibold text-[#0D0D0D]">Compose Email</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#FAFAFA] rounded-[6px] transition-colors"
          >
            <X className="w-5 h-5 text-[#787878]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" />
            </div>
          ) : emailSent ? (
            /* Success View */
            <div className="space-y-4">
              <div className="bg-[#D1FAE5] border border-[#059669] rounded-[8px] p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#059669] mx-auto mb-3" />
                <h3 className="text-[18px] font-semibold text-[#059669] mb-2">Email Sent Successfully!</h3>
                <p className="text-[14px] text-[#0D0D0D]">
                  The email has been sent to {to} with {cc} in CC.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-[#6366F1] text-white rounded-[6px] text-[14px] font-medium hover:bg-[#4F46E5] transition-colors"
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setSelectedInterview('');
                    setTo('');
                    setSubject('');
                    setBody('');
                  }}
                  className="px-4 py-2.5 bg-white border border-[#E5E5E5] text-[#0D0D0D] rounded-[6px] text-[14px] font-medium hover:bg-[#FAFAFA] transition-colors"
                >
                  Send Another
                </button>
              </div>
            </div>
          ) : (
            /* Email Compose Form */
            <div className="space-y-4">
              {error && (
                <div className="bg-[#FEE2E2] border border-[#DC2626] rounded-[8px] p-3">
                  <p className="text-[14px] text-[#DC2626]">{error}</p>
                </div>
              )}

              {/* Select Scheduled Interview (Optional) */}
              {scheduledInterviews.length > 0 && (
                <div>
                  <label className="block text-[14px] font-medium text-[#0D0D0D] mb-2">
                    Select Scheduled Interview (Optional)
                  </label>
                  <select
                    value={selectedInterview}
                    onChange={(e) => handleInterviewSelect(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                  >
                    <option value="">Select interview to auto-fill details...</option>
                    {scheduledInterviews.map((interview) => (
                      <option key={interview.id} value={interview.id}>
                        {interview.candidateName} - {new Date(interview.startTime).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* To */}
              <div>
                <label className="block text-[14px] font-medium text-[#0D0D0D] mb-2">
                  To <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>

              {/* CC */}
              <div>
                <label className="block text-[14px] font-medium text-[#0D0D0D] mb-2">
                  CC <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="email"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="interviewer@company.com"
                  className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[14px] font-medium text-[#0D0D0D] mb-2">
                  Subject <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Interview Invitation - Python Developer Position"
                  className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-[14px] font-medium text-[#0D0D0D] mb-2">
                  Message <span className="text-[#DC2626]">*</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Dear Candidate,

We are pleased to invite you for an interview..."
                  rows={10}
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#6366F1] resize-none"
                />
                <p className="text-[12px] text-[#787878] mt-2">
                  Resume will be attached automatically to the email
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-white border border-[#E5E5E5] text-[#0D0D0D] rounded-[6px] text-[14px] font-medium hover:bg-[#FAFAFA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending || !to.trim() || !cc.trim() || !subject.trim() || !body.trim()}
                  className="flex-1 px-4 py-2.5 bg-[#6366F1] text-white rounded-[6px] text-[14px] font-medium hover:bg-[#4F46E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

