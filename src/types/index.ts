export type Role = 'HR Executive' | 'Business Analyst';

export type MessageType = 'ai' | 'user' | 'system';

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  sender?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface ContextInfo {
  role: string;
  department: string;
  currentScenario: string;
  objectives: string[];
}

export interface Evaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  skills: {
    name: string;
    level: number;
  }[];
}

export interface SimulationState {
  role: Role | null;
  messages: Message[];
  tasks: Task[];
  context: ContextInfo | null;
  evaluation: Evaluation | null;
  isActive: boolean;
}

