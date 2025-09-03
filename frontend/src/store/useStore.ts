import { create } from 'zustand';

export type UserRole = 'contributor' | 'project_owner' | null;

export interface Task {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  budget: number;
  deadline: string;
  category: string;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  ownerId: string;
  applicants: string[];
  selectedContributor?: string;
}

export interface Proof {
  id: string;
  taskId: string;
  contributorId: string;
  type: 'experience' | 'skill' | 'completion';
  description: string;
  zkProof: string;
  timestamp: string;
  verified: boolean;
}

export interface Match {
  id: string;
  taskId: string;
  contributorId: string;
  ownerId: string;
  status: 'pending' | 'mutual_interest' | 'identity_revealed' | 'rejected';
  contributorRevealed: boolean;
  ownerRevealed: boolean;
  timestamp: string;
}

export interface User {
  id: string;
  walletAddress?: string;
  role: UserRole;
  isAnonymous: boolean;
  reputation: number;
}

interface AppState {
  // User state
  currentUser: User | null;
  userRole: UserRole;
  
  // Tasks state
  tasks: Task[];
  filteredTasks: Task[];
  taskFilters: {
    category: string;
    budget: [number, number];
    deadline: string;
    search: string;
  };
  
  // Proofs state
  proofs: Proof[];
  
  // Matches state
  matches: Match[];
  
  // UI state
  isProofModalOpen: boolean;
  selectedTask: Task | null;
  
  // Actions
  setUserRole: (role: UserRole) => void;
  setCurrentUser: (user: User | null) => void;
  connectWallet: (address: string) => void;
  
  // Task actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  applyToTask: (taskId: string, contributorId: string) => void;
  setTaskFilters: (filters: Partial<AppState['taskFilters']>) => void;
  filterTasks: () => void;
  
  // Proof actions
  addProof: (proof: Proof) => void;
  setProofs: (proofs: Proof[]) => void;
  
  // Match actions
  addMatch: (match: Match) => void;
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
  setMatches: (matches: Match[]) => void;
  
  // UI actions
  openProofModal: (task: Task) => void;
  closeProofModal: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  currentUser: null,
  userRole: null,
  tasks: [],
  filteredTasks: [],
  taskFilters: {
    category: '',
    budget: [0, 10000],
    deadline: '',
    search: ''
  },
  proofs: [],
  matches: [],
  isProofModalOpen: false,
  selectedTask: null,
  
  // User actions
  setUserRole: (role) => set({ userRole: role }),
  setCurrentUser: (user) => set({ currentUser: user }),
  connectWallet: (address) => set((state) => ({
    currentUser: state.currentUser ? { ...state.currentUser, walletAddress: address } : null
  })),
  
  // Task actions
  setTasks: (tasks) => {
    set({ tasks, filteredTasks: tasks });
    get().filterTasks();
  },
  addTask: (task) => set((state) => {
    const newTasks = [...state.tasks, task];
    return { tasks: newTasks, filteredTasks: newTasks };
  }),
  updateTask: (taskId, updates) => set((state) => {
    const updatedTasks = state.tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
    return { tasks: updatedTasks, filteredTasks: updatedTasks };
  }),
  applyToTask: (taskId, contributorId) => set((state) => {
    const updatedTasks = state.tasks.map(task => 
      task.id === taskId 
        ? { ...task, applicants: [...task.applicants, contributorId] }
        : task
    );
    return { tasks: updatedTasks, filteredTasks: updatedTasks };
  }),
  setTaskFilters: (filters) => set((state) => ({
    taskFilters: { ...state.taskFilters, ...filters }
  })),
  filterTasks: () => set((state) => {
    const { tasks, taskFilters } = state;
    let filtered = tasks;
    
    if (taskFilters.search) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(taskFilters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(taskFilters.search.toLowerCase())
      );
    }
    
    if (taskFilters.category) {
      filtered = filtered.filter(task => task.category === taskFilters.category);
    }
    
    filtered = filtered.filter(task => 
      task.budget >= taskFilters.budget[0] && task.budget <= taskFilters.budget[1]
    );
    
    return { filteredTasks: filtered };
  }),
  
  // Proof actions
  addProof: (proof) => set((state) => ({ proofs: [...state.proofs, proof] })),
  setProofs: (proofs) => set({ proofs }),
  
  // Match actions
  addMatch: (match) => set((state) => ({ matches: [...state.matches, match] })),
  updateMatch: (matchId, updates) => set((state) => ({
    matches: state.matches.map(match => 
      match.id === matchId ? { ...match, ...updates } : match
    )
  })),
  setMatches: (matches) => set({ matches }),
  
  // UI actions
  openProofModal: (task) => set({ isProofModalOpen: true, selectedTask: task }),
  closeProofModal: () => set({ isProofModalOpen: false, selectedTask: null })
}));