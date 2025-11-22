import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, FileText, CheckCircle2, XCircle, Loader2, User, Mail, Phone, Briefcase, GraduationCap, Calendar, Clock, Video, MapPin, Send, Plus, Copy, Check } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import { uploadFile, submitTask, getCurrentTask, getCandidates, getAvailableTimeSlots, scheduleInterview, sendInterviewEmail, getInterviews } from '../utils/api';
import MockInterviewPanel from '../components/MockInterview/MockInterviewPanel_Working';

interface Resume {
  id: string;
  candidateName: string;
  email: string;
  phone?: string;
  experience?: number;
  skills?: string[];
  education?: string;
  summary?: string;
  workHistory?: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  resumeText?: string;
}

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const tasks = useSimulationStore((state) => state.tasks);
  const updateTask = useSimulationStore((state) => state.updateTask);
  
  const [task, setTask] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState<any>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResponse, setSubmissionResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  
  // Resume screening state (for hr_t2)
  const [resumeRatings, setResumeRatings] = useState<Record<string, number>>({});
  const [resumeNotes, setResumeNotes] = useState<Record<string, string>>({});
  const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
  const [expandedResume, setExpandedResume] = useState<string | null>(null);

  // Interview scheduling state (for hr_t3)
  const [candidates, setCandidates] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [interviewType, setInterviewType] = useState<'video' | 'in-person' | 'phone'>('video');
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');
  const [interviewTitle, setInterviewTitle] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState<Record<string, boolean>>({});
  const [emailIds, setEmailIds] = useState<Record<string, string[]>>({}); // Store email IDs for each interview
  const [copiedLink, setCopiedLink] = useState<string | null>(null); // Track copied meeting link
  const [showEmailForm, setShowEmailForm] = useState<Record<string, boolean>>({}); // Show email form for each interview
  const [emailSubjects, setEmailSubjects] = useState<Record<string, string>>({}); // Email subjects
  const [emailBodies, setEmailBodies] = useState<Record<string, string>>({}); // Email bodies

  // Mock interview state (for hr_t4)
  const [mockInterviewEvaluation, setMockInterviewEvaluation] = useState<any>(null);

  const isResumeScreening = taskId === 'hr_t2';
  const isInterviewScheduling = taskId === 'hr_t3';
  const isMockInterview = taskId === 'hr_t4';

  useEffect(() => {
    const loadTask = async () => {
      try {
        // Fetch from API to get full task details including job description and resumes
        const data = await getCurrentTask();
        
        // Find the task
        const foundTask = data.tasks.find((t: any) => t.id === taskId) || data.currentTask;
        
        if (foundTask && foundTask.id === taskId) {
          setTask(foundTask);
          
          // If it's hr_t2, load job description and resumes
          if (taskId === 'hr_t2') {
            if (data.jobDescription) {
              setJobDescription(data.jobDescription);
            }
            if (data.resumes && Array.isArray(data.resumes)) {
              setResumes(data.resumes);
            }
          }
          
          // If it's hr_t3, load candidates
          if (taskId === 'hr_t3') {
            if (data.candidates && Array.isArray(data.candidates)) {
              setCandidates(data.candidates);
            } else {
              // Fetch candidates separately
              try {
                const candidatesData = await getCandidates();
                setCandidates(candidatesData.candidates);
              } catch (err) {
                console.error('Error loading candidates:', err);
              }
            }
            
            // Load time slots
            try {
              const slotsData = await getAvailableTimeSlots();
              setTimeSlots(slotsData.slots);
            } catch (err) {
              console.error('Error loading time slots:', err);
            }
            
            // Load existing interviews
            try {
              const interviewsData = await getInterviews();
              setScheduledInterviews(interviewsData.interviews);
            } catch (err) {
              console.error('Error loading interviews:', err);
            }
          }
        } else {
          // Fallback to store
          const storeTask = tasks.find(t => t.id === taskId);
          if (storeTask) {
            setTask(storeTask);
          } else {
            setError('Task not found');
          }
        }
      } catch (err: any) {
        console.error('Error loading task:', err);
        setError(err.message || 'Failed to load task');
      }
    };

    if (taskId) {
      loadTask();
    }
  }, [taskId, tasks]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadedFileUrl(null);
      setError(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadFile(selectedFile);
      setUploadedFileUrl(result.url);
      setError(null);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResumeRating = (resumeId: string, rating: number) => {
    setResumeRatings(prev => ({
      ...prev,
      [resumeId]: rating,
    }));
  };

  const handleResumeNote = (resumeId: string, note: string) => {
    setResumeNotes(prev => ({
      ...prev,
      [resumeId]: note,
    }));
  };

  const toggleResumeSelection = (resumeId: string) => {
    setSelectedResumes(prev => {
      if (prev.includes(resumeId)) {
        return prev.filter(id => id !== resumeId);
      } else {
        if (prev.length >= 3) {
          setError('You can only select up to 3 candidates');
          return prev;
        }
        return [...prev, resumeId];
      }
    });
  };

  const handleCopyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleScheduleInterview = async () => {
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }
    
    if (!selectedTimeSlot) {
      setError('Please select a time slot');
      return;
    }
    
    if (!meetingLink.trim()) {
      setError('Meeting link is required');
      return;
    }
    
    setIsScheduling(true);
    setError(null);
    
    try {
      const slot = timeSlots.find(s => s.startTime === selectedTimeSlot);
      if (!slot) {
        throw new Error('Selected time slot not found');
      }
      
      const candidate = candidates.find(c => c.id === selectedCandidate);
      if (!candidate) {
        throw new Error('Selected candidate not found');
      }
      
      const response = await scheduleInterview({
        candidateId: selectedCandidate,
        resumeId: selectedCandidate, // Use candidate's resume
        startTime: slot.startTime,
        endTime: slot.endTime,
        title: interviewTitle || `Interview - ${candidate.candidateName} - Python Developer Position`,
        description: `Interview with ${candidate.candidateName} for Python Developer position`,
        interviewType,
        location: interviewType === 'in-person' ? location : undefined,
        meetingLink: meetingLink.trim(),
      });
      
      // Refresh interviews list
      const interviewsData = await getInterviews();
      setScheduledInterviews(interviewsData.interviews);
      
      // Show email form for the newly scheduled interview
      setShowEmailForm(prev => ({ ...prev, [response.interview.id]: true }));
      
      // Pre-fill email subject and body
      const defaultSubject = `Interview Invitation - Python Developer Position`;
      const defaultBody = `Dear ${candidate.candidateName},

We are pleased to invite you for an interview for the Python Developer position.

Interview Details:
- Date: ${new Date(slot.startTime).toLocaleDateString()}
- Time: ${new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
- Type: ${interviewType}
${interviewType === 'video' ? `- Meeting Link: ${meetingLink.trim()}` : ''}
${location ? `- Location: ${location}` : ''}

Please confirm your attendance.

Best regards,
Sarah Chen
HR Manager`;
      
      setEmailSubjects(prev => ({ ...prev, [response.interview.id]: defaultSubject }));
      setEmailBodies(prev => ({ ...prev, [response.interview.id]: defaultBody }));
      
      // Reset form (but keep meeting link for potential reuse)
      setSelectedCandidate('');
      setSelectedTimeSlot('');
      setLocation('');
      setInterviewTitle('');
      setShowScheduleForm(false);
      setError(null);
    } catch (err: any) {
      console.error('Schedule interview error:', err);
      setError(err.message || 'Failed to schedule interview');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSendEmail = async (interviewId: string, interview: any) => {
    setIsSendingEmail(prev => ({ ...prev, [interviewId]: true }));
    setError(null);
    
    try {
      const candidate = candidates.find(c => c.id === interview.candidateId);
      if (!candidate) {
        throw new Error('Candidate not found');
      }
      
      const subject = emailSubjects[interviewId] || `Interview Invitation - Python Developer Position`;
      const body = emailBodies[interviewId] || `Dear ${interview.candidateName},

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
HR Manager`;
      
      const response = await sendInterviewEmail({
        interviewId,
        meetingLink: interview.meetingLink,
        resumeId: interview.candidateId, // Use candidate's resume
        candidateEmail: interview.candidateEmail,
        interviewerEmail: 'sarah.chen@company.com',
        subject,
        body,
        attachResume: true,
      });
      
      setShowEmailForm(prev => ({ ...prev, [interviewId]: false }));
      
      // Store email IDs from response (both candidate and interviewer emails)
      const emailIdList = response.emails.map((e: any) => e.id);
      setEmailIds(prev => ({ ...prev, [interviewId]: emailIdList }));
      
      // Refresh interviews list
      const interviewsData = await getInterviews();
      setScheduledInterviews(interviewsData.interviews);
    } catch (err: any) {
      console.error('Send email error:', err);
      setError(err.message || 'Failed to send email');
    } finally {
      setIsSendingEmail(prev => ({ ...prev, [interviewId]: false }));
    }
  };

  const handleSubmit = async () => {
    if (isResumeScreening) {
      // Validate resume screening submission
      if (selectedResumes.length !== 3) {
        setError('Please select exactly 3 candidates');
        return;
      }
      
      if (selectedResumes.some(id => !resumeRatings[id])) {
        setError('Please rate all selected candidates');
        return;
      }
    } else if (isInterviewScheduling) {
      // Validate interview scheduling submission
      if (scheduledInterviews.length < 3) {
        setError('Please schedule at least 3 interviews');
        return;
      }
      
      const interviewsWithoutEmails = scheduledInterviews.filter(i => !i.emailSent);
      if (interviewsWithoutEmails.length > 0) {
        setError(`Please send emails for all scheduled interviews. ${interviewsWithoutEmails.length} interview(s) still need emails.`);
        return;
      }
    } else if (isMockInterview) {
      // Validate mock interview submission
      if (!mockInterviewEvaluation) {
        setError('Please complete the mock interview first');
        return;
      }
    } else {
      // Validate file upload submission
      if (!uploadedFileUrl && !textInput.trim()) {
        setError('Please upload a file or enter text');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let submissionData: any = {
        text: textInput.trim() || undefined,
      };

      if (isResumeScreening) {
        // Prepare resume screening data
        submissionData.selectedResumes = selectedResumes;
        submissionData.resumeRatings = selectedResumes.map(resumeId => ({
          resumeId,
          rating: resumeRatings[resumeId],
          notes: resumeNotes[resumeId] || '',
        }));
      } else if (isInterviewScheduling) {
        // Prepare interview scheduling data
        submissionData.interviewIds = scheduledInterviews.map(i => i.id);
        // Get all email IDs from stored emailIds (both candidate and interviewer emails)
        const allEmailIds: string[] = [];
        scheduledInterviews.forEach(interview => {
          const ids = emailIds[interview.id] || [];
          allEmailIds.push(...ids);
          // Also check if interview has emailId (fallback)
          if (interview.emailId && !ids.includes(interview.emailId)) {
            allEmailIds.push(interview.emailId);
          }
        });
        submissionData.emailIds = allEmailIds;
      } else if (isMockInterview) {
        // Prepare mock interview data
        submissionData.interviewEvaluation = mockInterviewEvaluation;
        submissionData.text = `Mock HR Interview completed. Score: ${mockInterviewEvaluation.score}/10`;
      } else {
        // File upload task
        submissionData.files = uploadedFileUrl ? [uploadedFileUrl] : [];
      }

      const response = await submitTask(submissionData);

      setSubmissionResponse(response);
      
      // Update task status in store
      if (taskId) {
        updateTask(taskId, { 
          status: response.canProceed ? 'completed' : 'in-progress' 
        });
      }

      // Show success message
      if (response.canProceed) {
        setTimeout(() => {
          navigate('/simulation');
        }, 3000);
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to submit task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task && !error) {
    return (
      <div className="fixed inset-0 bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" />
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
            <h1 className="text-[15px] font-semibold text-[#0D0D0D] leading-none">Task Details</h1>
            {task && (
              <p className="text-[11px] text-[#787878] mt-0.5">{task.title}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && !task && (
          <div className="bg-[#FEE2E2] border border-[#DC2626] rounded-[8px] p-4 mb-6">
            <p className="text-[#DC2626] text-[14px]">{error}</p>
          </div>
        )}

        {task && (
          <>
            {/* Task Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[8px] p-6 border border-[#E5E5E5] mb-6"
            >
              <h2 className="text-[20px] font-semibold text-[#0D0D0D] mb-2">{task.title}</h2>
              <p className="text-[15px] text-[#787878] mb-4">{task.description}</p>
              
              <div className="flex items-center gap-2">
                <span className={`text-[13px] font-medium px-2.5 py-1 rounded ${
                  task.status === 'completed' ? 'bg-[#D1FAE5] text-[#059669]' :
                  task.status === 'in-progress' ? 'bg-[#FEF3C7] text-[#D97706]' :
                  'bg-[#F3F4F6] text-[#6B7280]'
                }`}>
                  {task.status}
                </span>
                {task.priority && (
                  <span className={`text-[13px] font-medium px-2.5 py-1 rounded ${
                    task.priority === 'high' ? 'bg-[#FEE2E2] text-[#DC2626]' :
                    task.priority === 'medium' ? 'bg-[#FEF3C7] text-[#D97706]' :
                    'bg-[#D1FAE5] text-[#059669]'
                  }`}>
                    {task.priority}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Job Description (for hr_t2) */}
            {isResumeScreening && jobDescription && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[8px] p-6 border border-[#E5E5E5] mb-6"
              >
                <h3 className="text-[17px] font-semibold text-[#0D0D0D] mb-4">Job Description</h3>
                <div className="bg-[#FAFAFA] rounded-[6px] p-4">
                  <pre className="text-[14px] text-[#0D0D0D] whitespace-pre-wrap font-sans">
                    {jobDescription.text}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* Resume Screening UI (for hr_t2) */}
            {isResumeScreening && resumes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[8px] p-6 border border-[#E5E5E5] mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[17px] font-semibold text-[#0D0D0D]">
                    Candidate Resumes ({resumes.length})
                  </h3>
                  <div className="text-[14px] text-[#787878]">
                    Selected: <span className="font-semibold text-[#6366F1]">{selectedResumes.length}/3</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {resumes.map((resume) => {
                    const isSelected = selectedResumes.includes(resume.id);
                    const rating = resumeRatings[resume.id] || 0;
                    const isExpanded = expandedResume === resume.id;

                    return (
                      <div
                        key={resume.id}
                        className={`border-2 rounded-[8px] p-4 transition-all ${
                          isSelected
                            ? 'border-[#6366F1] bg-[#EEF2FF]'
                            : 'border-[#E5E5E5] bg-white hover:border-[#6366F1]/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <User className="w-5 h-5 text-[#6366F1]" />
                              <h4 className="text-[16px] font-semibold text-[#0D0D0D]">
                                {resume.candidateName}
                              </h4>
                              {isSelected && (
                                <span className="text-[12px] font-medium px-2 py-0.5 bg-[#6366F1] text-white rounded">
                                  Selected
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[13px] text-[#787878] mb-3">
                              {resume.email && (
                                <div className="flex items-center gap-1.5">
                                  <Mail className="w-4 h-4" />
                                  <span>{resume.email}</span>
                                </div>
                              )}
                              {resume.phone && (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-4 h-4" />
                                  <span>{resume.phone}</span>
                                </div>
                              )}
                              {resume.experience !== undefined && (
                                <div className="flex items-center gap-1.5">
                                  <Briefcase className="w-4 h-4" />
                                  <span>{resume.experience} years experience</span>
                                </div>
                              )}
                              {resume.education && (
                                <div className="flex items-center gap-1.5">
                                  <GraduationCap className="w-4 h-4" />
                                  <span>{resume.education}</span>
                                </div>
                              )}
                            </div>

                            {resume.summary && (
                              <p className="text-[14px] text-[#0D0D0D] mb-3 line-clamp-2">
                                {resume.summary}
                              </p>
                            )}

                            {resume.skills && resume.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {resume.skills.slice(0, 6).map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[12px] px-2 py-0.5 bg-[#F3F4F6] text-[#0D0D0D] rounded"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {resume.skills.length > 6 && (
                                  <span className="text-[12px] px-2 py-0.5 text-[#787878]">
                                    +{resume.skills.length - 6} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Rating Section */}
                        <div className="border-t border-[#E5E5E5] pt-3 mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-[14px] font-medium text-[#0D0D0D]">
                              Rating (1-10):
                            </label>
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <button
                                  key={num}
                                  onClick={() => handleResumeRating(resume.id, num)}
                                  className={`w-8 h-8 rounded text-[12px] font-medium transition-colors ${
                                    rating >= num
                                      ? 'bg-[#6366F1] text-white'
                                      : 'bg-[#F3F4F6] text-[#787878] hover:bg-[#E5E5E5]'
                                  }`}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <textarea
                            value={resumeNotes[resume.id] || ''}
                            onChange={(e) => handleResumeNote(resume.id, e.target.value)}
                            placeholder="Add notes about this candidate..."
                            className="w-full min-h-[60px] px-3 py-2 border border-[#E5E5E5] rounded-[6px] text-[13px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent resize-none mb-2"
                          />

                          {/* Full Resume Text Toggle */}
                          {resume.resumeText && (
                            <button
                              onClick={() => setExpandedResume(isExpanded ? null : resume.id)}
                              className="text-[13px] text-[#6366F1] hover:underline"
                            >
                              {isExpanded ? 'Hide' : 'Show'} full resume
                            </button>
                          )}

                          {isExpanded && resume.resumeText && (
                            <div className="mt-2 p-3 bg-[#FAFAFA] rounded-[6px]">
                              <pre className="text-[12px] text-[#0D0D0D] whitespace-pre-wrap font-sans">
                                {resume.resumeText}
                              </pre>
                            </div>
                          )}

                          {/* Select Button */}
                          <button
                            onClick={() => toggleResumeSelection(resume.id)}
                            className={`mt-3 w-full px-4 py-2 rounded-[6px] font-medium text-[14px] transition-colors ${
                              isSelected
                                ? 'bg-[#DC2626] text-white hover:bg-[#B91C1C]'
                                : 'bg-[#6366F1] text-white hover:bg-[#4F46E5]'
                            }`}
                          >
                            {isSelected ? 'Deselect Candidate' : 'Select as Top 3'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Mock Interview UI (for hr_t4) */}
            {isMockInterview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <MockInterviewPanel
                  taskId={taskId || 'hr_t4'}
                  onComplete={(evaluation) => {
                    setMockInterviewEvaluation(evaluation);
                  }}
                />
              </motion.div>
            )}

            {/* Interview Scheduling UI (for hr_t3) */}
            {isInterviewScheduling && (
              <>
                {/* Candidates List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-[8px] p-6 border border-[#E5E5E5] mb-6"
                >
                  <h3 className="text-[17px] font-semibold text-[#0D0D0D] mb-4">Available Candidates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {candidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="p-4 border border-[#E5E5E5] rounded-[6px] hover:border-[#6366F1] transition-colors"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <User className="w-5 h-5 text-[#6366F1] flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-[15px] font-semibold text-[#0D0D0D]">{candidate.candidateName}</h4>
                            <p className="text-[13px] text-[#787878]">{candidate.email}</p>
                          </div>
                        </div>
                        {candidate.experience !== undefined && (
                          <p className="text-[13px] text-[#787878] mb-2">
                            {candidate.experience} years experience
                          </p>
                        )}
                        {candidate.skills && candidate.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 4).map((skill: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2 py-0.5 bg-[#F3F4F6] text-[#0D0D0D] rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Schedule Interview Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-[8px] p-6 border border-[#E5E5E5] mb-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[17px] font-semibold text-[#0D0D0D]">Schedule Interview</h3>
                    <button
                      onClick={() => setShowScheduleForm(!showScheduleForm)}
                      className="px-4 py-2 bg-[#6366F1] text-white rounded-[6px] text-[14px] font-medium hover:bg-[#4F46E5] transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {showScheduleForm ? 'Cancel' : 'New Interview'}
                    </button>
                  </div>

                  {showScheduleForm && (
                    <div className="space-y-4 p-4 bg-[#FAFAFA] rounded-[6px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[14px] font-medium text-[#0D0D0D] mb-2">
                            Candidate <span className="text-[#DC2626]">*</span>
                          </label>
                          <select
                            value={selectedCandidate}
                            onChange={(e) => setSelectedCandidate(e.target.value)}
                            className="w-full px-4 py-2 border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                          >
                            <option value="">Select candidate...</option>
                            {candidates.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.candidateName} ({c.email})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[14px] font-medium text-[#0D0D0D] mb-2">
                            Time Slot <span className="text-[#DC2626]">*</span>
                          </label>
                          <select
                            value={selectedTimeSlot}
                            onChange={(e) => setSelectedTimeSlot(e.target.value)}
                            className="w-full px-4 py-2 border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                          >
                            <option value="">Select time slot...</option>
                            {timeSlots.slice(0, 50).map((slot, idx) => (
                              <option key={idx} value={slot.startTime}>
                                {new Date(slot.startTime).toLocaleDateString()} - {slot.time}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[14px] font-medium text-[#0D0D0D] mb-2">
                            Interview Type <span className="text-[#DC2626]">*</span>
                          </label>
                          <select
                            value={interviewType}
                            onChange={(e) => setInterviewType(e.target.value as any)}
                            className="w-full px-4 py-2 border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                          >
                            <option value="video">Video Call</option>
                            <option value="in-person">In-Person</option>
                            <option value="phone">Phone Call</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[14px] font-medium text-[#0D0D0D] mb-2">
                            Meeting Link <span className="text-[#DC2626]">*</span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={meetingLink}
                              onChange={(e) => setMeetingLink(e.target.value)}
                              placeholder="https://meet.company.com/interview/123456"
                              className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                            />
                            {meetingLink && (
                              <button
                                onClick={() => handleCopyMeetingLink(meetingLink)}
                                className="px-3 py-2 border border-[#E5E5E5] rounded-[6px] hover:bg-[#FAFAFA] transition-colors flex items-center gap-1.5"
                                title="Copy meeting link"
                              >
                                {copiedLink === meetingLink ? (
                                  <>
                                    <Check className="w-4 h-4 text-[#059669]" />
                                    <span className="text-[12px] text-[#059669]">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 text-[#6366F1]" />
                                    <span className="text-[12px] text-[#6366F1]">Copy</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <p className="text-[12px] text-[#787878] mt-1">
                            Enter the meeting link (e.g., Zoom, Google Meet, Teams). This will be included in the calendar invite and email.
                          </p>
                        </div>
                      </div>

                      {interviewType === 'in-person' && (
                        <div>
                          <label className="block text-[14px] font-medium text-[#0D0D0D] mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Office address or room number"
                            className="w-full px-4 py-2 border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[14px] font-medium text-[#0D0D0D] mb-2">
                          Interview Title (Optional)
                        </label>
                        <input
                          type="text"
                          value={interviewTitle}
                          onChange={(e) => setInterviewTitle(e.target.value)}
                          placeholder="e.g., Technical Interview - Python Developer"
                          className="w-full px-4 py-2 border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                        />
                      </div>

                      <button
                        onClick={handleScheduleInterview}
                        disabled={isScheduling || !selectedCandidate || !selectedTimeSlot || !meetingLink.trim()}
                        className="w-full px-4 py-2 bg-[#6366F1] text-white rounded-[6px] font-medium text-[14px] hover:bg-[#4F46E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isScheduling ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Scheduling...
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4" />
                            Schedule Interview
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>

                {/* Scheduled Interviews List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-[8px] p-6 border border-[#E5E5E5] mb-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[17px] font-semibold text-[#0D0D0D]">
                      Scheduled Interviews ({scheduledInterviews.length}/3)
                    </h3>
                  </div>

                  {scheduledInterviews.length === 0 ? (
                    <p className="text-[14px] text-[#787878] text-center py-8">
                      No interviews scheduled yet. Click "New Interview" to schedule one.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {scheduledInterviews.map((interview) => (
                        <div
                          key={interview.id}
                          className={`p-4 border-2 rounded-[6px] ${
                            interview.emailSent
                              ? 'border-[#059669] bg-[#D1FAE5]'
                              : 'border-[#E5E5E5] bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-5 h-5 text-[#6366F1]" />
                                <h4 className="text-[15px] font-semibold text-[#0D0D0D]">
                                  {interview.candidateName}
                                </h4>
                                {interview.emailSent && (
                                  <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                                )}
                              </div>
                              <div className="space-y-1 text-[13px] text-[#787878]">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {new Date(interview.startTime).toLocaleDateString()} at{' '}
                                    {new Date(interview.startTime).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{interview.duration} minutes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {interview.interviewType === 'video' ? (
                                    <Video className="w-4 h-4" />
                                  ) : interview.interviewType === 'in-person' ? (
                                    <MapPin className="w-4 h-4" />
                                  ) : (
                                    <Phone className="w-4 h-4" />
                                  )}
                                  <span className="capitalize">{interview.interviewType}</span>
                                  {interview.location && (
                                    <span className="ml-2">- {interview.location}</span>
                                  )}
                                </div>
                                {interview.meetingLink && (
                                  <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4" />
                                    <span className="text-[#0D0D0D] break-all">{interview.meetingLink}</span>
                                    <button
                                      onClick={() => handleCopyMeetingLink(interview.meetingLink)}
                                      className="p-1 hover:bg-[#F3F4F6] rounded transition-colors flex-shrink-0"
                                      title="Copy meeting link"
                                    >
                                      {copiedLink === interview.meetingLink ? (
                                        <Check className="w-4 h-4 text-[#059669]" />
                                      ) : (
                                        <Copy className="w-4 h-4 text-[#6366F1]" />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              {interview.emailSent ? (
                                <span className="text-[12px] px-2 py-1 bg-[#059669] text-white rounded">
                                  Email Sent
                                </span>
                              ) : (
                                <button
                                  onClick={() => setShowEmailForm(prev => ({ ...prev, [interview.id]: !prev[interview.id] }))}
                                  className="px-3 py-1.5 bg-[#6366F1] text-white rounded-[6px] text-[13px] font-medium hover:bg-[#4F46E5] transition-colors flex items-center gap-1.5"
                                >
                                  <Mail className="w-3 h-3" />
                                  {showEmailForm[interview.id] ? 'Hide Email' : 'Send Email'}
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Email Form - Integrated */}
                          {!interview.emailSent && showEmailForm[interview.id] && (
                            <div className="mt-4 p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-[6px] space-y-3">
                              <h5 className="text-[14px] font-semibold text-[#0D0D0D]">Send Interview Invitation Email</h5>
                              
                              <div>
                                <label className="block text-[13px] font-medium text-[#0D0D0D] mb-1">
                                  Subject
                                </label>
                                <input
                                  type="text"
                                  value={emailSubjects[interview.id] || ''}
                                  onChange={(e) => setEmailSubjects(prev => ({ ...prev, [interview.id]: e.target.value }))}
                                  placeholder="Interview Invitation - Python Developer Position"
                                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-[6px] text-[13px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-[13px] font-medium text-[#0D0D0D] mb-1">
                                  Email Body
                                </label>
                                <textarea
                                  value={emailBodies[interview.id] || ''}
                                  onChange={(e) => setEmailBodies(prev => ({ ...prev, [interview.id]: e.target.value }))}
                                  placeholder="Email content..."
                                  rows={8}
                                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-[6px] text-[13px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#6366F1] resize-none"
                                />
                                <p className="text-[11px] text-[#787878] mt-1">
                                  The email will be sent to both the candidate and interviewer. Resume will be attached to the interviewer email.
                                </p>
                              </div>
                              
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSendEmail(interview.id, interview)}
                                  disabled={isSendingEmail[interview.id]}
                                  className="flex-1 px-4 py-2 bg-[#6366F1] text-white rounded-[6px] text-[13px] font-medium hover:bg-[#4F46E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  {isSendingEmail[interview.id] ? (
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
                                <button
                                  onClick={() => setShowEmailForm(prev => ({ ...prev, [interview.id]: false }))}
                                  className="px-4 py-2 bg-[#F3F4F6] text-[#0D0D0D] rounded-[6px] text-[13px] font-medium hover:bg-[#E5E5E5] transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </>
            )}

            {/* Submission Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isResumeScreening ? 0.3 : isInterviewScheduling ? 0.4 : isMockInterview ? 0.2 : 0.1 }}
              className="bg-white rounded-[8px] p-6 border border-[#E5E5E5] mb-6"
            >
              <h3 className="text-[17px] font-semibold text-[#0D0D0D] mb-4">Submit Your Work</h3>

              {/* Text Input for Justification */}
              {!isMockInterview && (
                <div className="mb-6">
                  <label className="block text-[14px] font-medium text-[#0D0D0D] mb-2">
                    {isResumeScreening ? 'Justification for Selection' : 'Additional Notes'} (Optional)
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={
                      isResumeScreening
                        ? 'Explain your reasoning for selecting these 3 candidates...'
                        : 'Add any additional notes or context about your submission...'
                    }
                    className="w-full min-h-[100px] px-4 py-3 border border-[#E5E5E5] rounded-[6px] text-[14px] text-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent resize-none"
                  />
                </div>
              )}

              {/* File Upload (for non-resume screening and non-mock interview tasks) */}
              {!isResumeScreening && !isMockInterview && (
                <div className="mb-6">
                  <label className="block text-[14px] font-medium text-[#0D0D0D] mb-2">
                    Upload Job Description File
                  </label>
                  <div className="flex gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#E5E5E5] rounded-[6px] hover:border-[#6366F1] transition-colors">
                        <Upload className="w-5 h-5 text-[#787878]" />
                        <span className="text-[14px] text-[#787878]">
                          {selectedFile ? selectedFile.name : 'Choose file (PDF, DOC, DOCX)'}
                        </span>
                      </div>
                    </label>
                    {selectedFile && !uploadedFileUrl && (
                      <button
                        onClick={handleFileUpload}
                        disabled={isUploading}
                        className="px-4 py-3 bg-[#6366F1] text-white rounded-[6px] font-medium text-[14px] hover:bg-[#4F46E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {uploadedFileUrl && (
                    <div className="mt-3 flex items-center gap-2 p-3 bg-[#D1FAE5] rounded-[6px]">
                      <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                      <span className="text-[14px] text-[#059669]">File uploaded successfully</span>
                      <FileText className="w-4 h-4 text-[#059669] ml-auto" />
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-[#FEE2E2] border border-[#DC2626] rounded-[6px] flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-[#DC2626]" />
                  <p className="text-[14px] text-[#DC2626]">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              {isMockInterview && mockInterviewEvaluation && (
                <div className="mb-4 p-4 bg-[#D1FAE5] border border-[#059669] rounded-[6px]">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                    <span className="text-[15px] font-semibold text-[#0D0D0D]">Interview Completed!</span>
                  </div>
                  <p className="text-[14px] text-[#0D0D0D]">
                    Your interview score: <span className="font-bold text-[#6366F1]">{mockInterviewEvaluation.score}/10</span>
                  </p>
                  <p className="text-[13px] text-[#787878] mt-1">
                    Click Submit to proceed to the next task.
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (isResumeScreening
                    ? selectedResumes.length !== 3
                    : isInterviewScheduling
                    ? scheduledInterviews.length < 3 || scheduledInterviews.some(i => !i.emailSent)
                    : isMockInterview
                    ? !mockInterviewEvaluation
                    : !uploadedFileUrl && !textInput.trim())
                }
                className="w-full px-4 py-3 bg-[#6366F1] text-white rounded-[6px] font-medium text-[15px] hover:bg-[#4F46E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Task'
                )}
              </button>
            </motion.div>

            {/* Submission Response */}
            {submissionResponse && (
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
                          <div>
                            <p className="text-[14px] font-medium text-[#0D0D0D] mb-1">Score:</p>
                            <p className="text-[16px] font-semibold text-[#0D0D0D]">
                              {submissionResponse.submission.score}/10
                            </p>
                          </div>
                        )}

                        {submissionResponse.submission.feedback && (
                          <div>
                            <p className="text-[14px] font-medium text-[#0D0D0D] mb-1">Feedback:</p>
                            <p className="text-[14px] text-[#0D0D0D] whitespace-pre-wrap">
                              {submissionResponse.submission.feedback}
                            </p>
                          </div>
                        )}

                        {submissionResponse.submission.improvements && (
                          <div>
                            <p className="text-[14px] font-medium text-[#0D0D0D] mb-1">Improvements:</p>
                            <p className="text-[14px] text-[#0D0D0D] whitespace-pre-wrap">
                              {submissionResponse.submission.improvements}
                            </p>
                          </div>
                        )}

                        {submissionResponse.scoreInfo && (
                          <div className="mt-4 p-3 bg-white rounded-[6px]">
                            <p className="text-[13px] text-[#787878] mb-2">Score Information:</p>
                            <p className="text-[13px] text-[#0D0D0D]">
                              Current Score: {submissionResponse.scoreInfo.currentScore}/10
                            </p>
                            <p className="text-[13px] text-[#0D0D0D]">
                              Passing Score: {submissionResponse.scoreInfo.passingScore}/10
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {submissionResponse.canProceed && submissionResponse.nextTask && (
                      <div className="mt-4 p-3 bg-white rounded-[6px]">
                        <p className="text-[13px] font-medium text-[#0D0D0D] mb-1">Next Task:</p>
                        <p className="text-[14px] text-[#0D0D0D]">{submissionResponse.nextTask.title}</p>
                      </div>
                    )}

                    {submissionResponse.canProceed && (
                      <p className="text-[13px] text-[#059669] mt-4">
                        Redirecting to simulation in 3 seconds...
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
