import { create } from 'zustand';
import type { SimulationState, Role, Message, Task, ContextInfo, Evaluation } from '../types';

interface SimulationStore extends SimulationState {
  setRole: (role: Role) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  appendToLastMessage: (content: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  setContext: (context: ContextInfo) => void;
  setEvaluation: (evaluation: Evaluation) => void;
  startSimulation: () => void;
  endSimulation: () => void;
  reset: () => void;
}

const initialState: SimulationState = {
  role: null,
  messages: [],
  tasks: [],
  context: null,
  evaluation: null,
  isActive: false,
};

export const useSimulationStore = create<SimulationStore>((set) => ({
  ...initialState,
  
  setRole: (role) => set({ role }),
  
  addMessage: (message) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...message,
        id: `msg-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      },
    ],
  })),
  
  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg.id === messageId ? { ...msg, ...updates } : msg
    ),
  })),
  
  appendToLastMessage: (content) => set((state) => {
    if (state.messages.length === 0) return state;
    const lastMessage = state.messages[state.messages.length - 1];
    return {
      messages: [
        ...state.messages.slice(0, -1),
        { ...lastMessage, content: (lastMessage.content || '') + content },
      ],
    };
  }),
  
  addTask: (task) => set((state) => ({
    tasks: [
      ...state.tasks,
      {
        ...task,
        id: `task-${Date.now()}-${Math.random()}`,
      },
    ],
  })),
  
  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId ? { ...task, ...updates } : task
    ),
  })),
  
  setContext: (context) => set({ context }),
  
  setEvaluation: (evaluation) => set({ evaluation }),
  
  startSimulation: () => set({ isActive: true }),
  
  endSimulation: () => set({ isActive: false }),
  
  reset: () => set(initialState),
}));

