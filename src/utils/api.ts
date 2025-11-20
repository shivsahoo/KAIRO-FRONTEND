import type { Message, Evaluation, ContextInfo } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Get auth token from localStorage or cookie
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
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

export async function startSimulation(role: string): Promise<{
  sessionId: string;
  context: ContextInfo;
  initialMessage: Message;
  tasks: any[];
}> {
  const data = await apiCall('/simulation/start', {
    method: 'POST',
    body: JSON.stringify({ role }),
  });

  // Transform backend response to match frontend format
  return {
    sessionId: data.sessionId,
    context: data.context,
    initialMessage: {
      id: data.initialMessage.id,
      type: 'ai' as const,
      content: data.initialMessage.content,
      timestamp: new Date(data.initialMessage.timestamp),
      sender: data.initialMessage.sender,
    },
    tasks: data.tasks || [],
  };
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

