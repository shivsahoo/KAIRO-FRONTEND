import { create } from 'zustand';
import type { SimulationState, Role, Message, Task, ContextInfo, Evaluation } from '../types';

interface SimulationStore extends SimulationState {
  setRole: (role: Role) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
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

