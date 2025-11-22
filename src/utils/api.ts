import type { Message, Evaluation, ContextInfo } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Get auth token from localStorage or cookie
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// Set auth token in localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
}

// Remove auth token from localStorage
export function removeAuthToken(): void {
  localStorage.removeItem('authToken');
}

// Helper function to make authenticated API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };
  
  // Remove undefined values
  Object.keys(headers).forEach(key => {
    if (headers[key] === undefined) {
      delete headers[key];
    }
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

/**
 * Login user
 */
export async function login(email: string, password: string): Promise<{
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    roleSelected?: string;
  };
}> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  
  // Store token in localStorage
  if (data.token) {
    setAuthToken(data.token);
  }

  return data;
}

/**
 * Signup user
 */
export async function signup(email: string, password: string, name: string): Promise<{
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    roleSelected?: string;
  };
}> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Signup failed' }));
    
    // Handle validation errors array format
    if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
      const validationMessages = error.errors.map((err: any) => err.msg || err.message).join(', ');
      throw new Error(validationMessages);
    }
    
    throw new Error(error.message || 'Signup failed');
  }

  const data = await response.json();
  
  // Store token in localStorage
  if (data.token) {
    setAuthToken(data.token);
  }

  return data;
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  name: string;
  roleSelected?: string;
  authProvider?: string;
}> {
  return apiCall('/auth/me');
}

export async function startSimulation(role: string): Promise<{
  sessionId: string;
  context: ContextInfo;
  welcomeMessage?: Message;
  initialMessage?: Message; // Optional - only for returning users
  messages?: Message[]; // All messages when resuming
  tasks: any[];
  isResuming?: boolean;
  isFirstTime?: boolean;
}> {
  const data = await apiCall('/simulation/start', {
    method: 'POST',
    body: JSON.stringify({ role }),
  });

  // Transform backend response to match frontend format
  const response: {
    sessionId: string;
    context: ContextInfo;
    welcomeMessage?: Message;
    initialMessage?: Message;
    messages?: Message[];
    tasks: any[];
    isResuming?: boolean;
    isFirstTime?: boolean;
  } = {
    sessionId: data.sessionId,
    context: data.context,
    tasks: data.tasks || [],
  };

  // Include welcomeMessage if present (for first-time users)
  if (data.welcomeMessage) {
    response.welcomeMessage = {
      id: data.welcomeMessage.id,
      type: 'ai' as const,
      content: data.welcomeMessage.content,
      timestamp: new Date(data.welcomeMessage.timestamp),
      sender: data.welcomeMessage.sender,
    };
  }

  // Include initialMessage if present (for returning users)
  if (data.initialMessage) {
    response.initialMessage = {
      id: data.initialMessage.id,
      type: 'ai' as const,
      content: data.initialMessage.content,
      timestamp: new Date(data.initialMessage.timestamp),
      sender: data.initialMessage.sender,
    };
  }

  // If resuming, include all messages
  if (data.isResuming && data.messages && Array.isArray(data.messages)) {
    response.messages = data.messages.map((msg: any) => ({
      id: msg.id,
      type: msg.type as 'user' | 'ai',
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      sender: msg.sender,
    }));
  }

  // Include flags
  if (data.isResuming !== undefined) {
    response.isResuming = data.isResuming;
  }
  if (data.isFirstTime !== undefined) {
    response.isFirstTime = data.isFirstTime;
  }

  return response;
}

export async function sendMessage(
  message: string,
  conversationHistory: Message[]
): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/simulation/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      history: conversationHistory,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
}

export async function evaluatePerformance(
  messages: Message[],
  tasks: any[]
): Promise<Evaluation> {
  const response = await fetch(`${API_BASE_URL}/simulation/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      tasks,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to evaluate performance');
  }
  
  return response.json();
}

// Mock data for development (remove when backend is ready)
export const mockStartSimulation = async (_role: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    context: {
      role: 'HR Executive',
      department: 'Human Resources',
      currentScenario: 'Candidate Escalation',
      objectives: [
        'Handle candidate complaint professionally',
        'Schedule follow-up interview',
        'Maintain company reputation',
      ],
    },
    initialMessage: {
      id: 'msg-1',
      type: 'ai' as const,
      content: `Good morning! I'm Sarah, your manager. We have an urgent situation - a candidate who was rejected last week has escalated their complaint to the CEO's office. They claim the interview process was unfair and discriminatory. We need to handle this professionally and quickly. How would you like to proceed?`,
      timestamp: new Date(),
      sender: 'Sarah (Manager)',
    },
    tasks: [
      {
        id: 'task-1',
        title: 'Review candidate file',
        description: 'Examine the candidate\'s application and interview notes',
        status: 'pending' as const,
        priority: 'high' as const,
      },
      {
        id: 'task-2',
        title: 'Draft response email',
        description: 'Prepare a professional response addressing the complaint',
        status: 'pending' as const,
        priority: 'high' as const,
      },
    ],
  };
};

export const mockSendMessage = async (_message: string, _history: Message[]) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    id: `msg-${Date.now()}`,
    type: 'ai' as const,
    content: `That's a thoughtful approach. Let me know if you need any additional information or support in handling this situation.`,
    timestamp: new Date(),
    sender: 'Sarah (Manager)',
  };
};

export const mockEvaluatePerformance = async () => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    score: 85,
    feedback: 'You demonstrated strong communication skills and professional judgment. Your approach to handling the escalation was measured and appropriate.',
    strengths: [
      'Clear communication',
      'Professional tone',
      'Problem-solving mindset',
    ],
    improvements: [
      'Could be more proactive in documentation',
      'Consider involving legal team earlier for sensitive cases',
    ],
    skills: [
      { name: 'Communication', level: 8 },
      { name: 'Problem Solving', level: 7 },
      { name: 'Professionalism', level: 9 },
      { name: 'Documentation', level: 6 },
    ],
  };
};

/**
 * Upload file
 */
export async function uploadFile(file: File): Promise<{
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload/file`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Upload failed');
  }

  const data = await response.json();
  
  // If URL is relative (starts with /uploads/), prepend backend base URL
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
  const fullUrl = data.url.startsWith('http') ? data.url : `${backendBaseUrl}${data.url}`;
  
  return {
    ...data,
    url: fullUrl,
  };
}

/**
 * Submit task
 */
export async function submitTask(data: {
  text?: string;
  files?: string[];
  audioUrl?: string;
  selectedResumes?: string[];
  resumeRatings?: any[];
}): Promise<{
  submission: {
    id: string;
    taskId: string;
    score: number | null;
    feedback: string | null;
    improvements: string | null;
  };
  canProceed: boolean;
  message: string;
  nextTask: any | null;
  nextTaskMessage: any | null;
  completed: boolean;
  scoreInfo: {
    min: number;
    max: number;
    passingScore: number;
    currentScore: number;
  };
}> {
  return apiCall('/tasks/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get current task details
 */
export async function getCurrentTask(): Promise<{
  tasks: any[];
  currentTask: any | null;
  taskIndex: number;
  allTasksCompleted: boolean;
  jobDescription?: any;
  resumes?: any[];
  candidates?: any[];
}> {
  return apiCall('/tasks/current');
}

/**
 * Get candidates for interview scheduling (hr_t3)
 */
export async function getCandidates(): Promise<{
  candidates: any[];
  count: number;
}> {
  return apiCall('/interview/candidates');
}

/**
 * Get available time slots for scheduling
 */
export async function getAvailableTimeSlots(date?: string): Promise<{
  slots: Array<{
    startTime: string;
    endTime: string;
    date: string;
    time: string;
    available: boolean;
  }>;
  count: number;
}> {
  const params = date ? `?date=${date}` : '';
  return apiCall(`/interview/time-slots${params}`);
}

/**
 * Create interview schedule
 */
export async function scheduleInterview(data: {
  candidateId: string;
  resumeId?: string;
  startTime: string;
  endTime: string;
  title?: string;
  description?: string;
  interviewType: 'video' | 'in-person' | 'phone';
  location?: string;
  meetingLink: string; // REQUIRED
}): Promise<{
  interview: {
    id: string;
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    title: string;
    startTime: string;
    endTime: string;
    duration: number;
    interviewType: string;
    location?: string;
    meetingLink: string;
    status: string;
  };
  message: string;
}> {
  return apiCall('/interview/schedule', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Send interview email to candidate and interviewer
 */
export async function sendInterviewEmail(data: {
  interviewId: string;
  meetingLink: string; // REQUIRED
  resumeId: string; // REQUIRED for evaluation
  candidateEmail: string; // REQUIRED
  interviewerEmail: string | { name: string; email: string }; // REQUIRED
  subject?: string;
  body?: string;
  attachResume?: boolean;
}): Promise<{
  emails: Array<{
    id: string;
    type: 'candidate' | 'interviewer';
    subject: string;
    body: string;
    to: Array<{ name: string; email: string }>;
    sentAt: string;
    attachments: any[];
    meetingLink: string;
  }>;
  interview: {
    id: string;
    emailSent: boolean;
    meetingLink: string;
  };
  message: string;
}> {
  return apiCall('/interview/send-email', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get all scheduled interviews
 */
export async function getInterviews(): Promise<{
  interviews: Array<{
    id: string;
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    title: string;
    startTime: string;
    endTime: string;
    duration: number;
    interviewType: string;
    location?: string;
    meetingLink: string;
    status: string;
    emailSent: boolean;
  }>;
  count: number;
}> {
  return apiCall('/interview/interviews');
}

/**
 * Get inbox emails
 */
export async function getInbox(folder: string = 'inbox', taskId?: string): Promise<{
  emails: any[];
  count: number;
}> {
  const params = new URLSearchParams();
  if (folder) params.append('folder', folder);
  if (taskId) params.append('taskId', taskId);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiCall(`/interview/inbox${query}`);
}

