import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from './useStore'
import type { Task, Proof, Match, User } from './useStore'

// Mock data
const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'This is a test task',
  requirements: ['React', 'TypeScript'],
  budget: 1000,
  deadline: '2024-12-31',
  category: 'Development',
  status: 'open',
  ownerId: 'owner-1',
  applicants: []
}

const mockUser: User = {
  id: 'user-1',
  walletAddress: '0x123',
  role: 'contributor',
  isAnonymous: false,
  reputation: 100
}

const mockProof: Proof = {
  id: 'proof-1',
  taskId: 'task-1',
  contributorId: 'contributor-1',
  type: 'completion',
  description: 'Task completed successfully',
  zkProof: 'mock-zk-proof',
  timestamp: '2024-01-01T00:00:00Z',
  verified: true
}

const mockMatch: Match = {
  id: 'match-1',
  taskId: 'task-1',
  contributorId: 'contributor-1',
  ownerId: 'owner-1',
  status: 'pending',
  contributorRevealed: false,
  ownerRevealed: false,
  timestamp: '2024-01-01T00:00:00Z'
}

describe('useStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.setState({
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
      selectedTask: null
    })
  })

  describe('User Management', () => {
    it('should set user role', () => {
      const { setUserRole } = useStore.getState()
      setUserRole('contributor')
      
      expect(useStore.getState().userRole).toBe('contributor')
    })

    it('should set current user', () => {
      const { setCurrentUser } = useStore.getState()
      setCurrentUser(mockUser)
      
      expect(useStore.getState().currentUser).toEqual(mockUser)
    })

    it('should connect wallet', () => {
      const { setCurrentUser, connectWallet } = useStore.getState()
      setCurrentUser(mockUser)
      connectWallet('0x456')
      
      expect(useStore.getState().currentUser?.walletAddress).toBe('0x456')
    })

    it('should not connect wallet if no current user', () => {
      const { connectWallet } = useStore.getState()
      connectWallet('0x456')
      
      expect(useStore.getState().currentUser).toBeNull()
    })
  })

  describe('Task Management', () => {
    it('should set tasks', () => {
      const { setTasks } = useStore.getState()
      setTasks([mockTask])
      
      const state = useStore.getState()
      expect(state.tasks).toEqual([mockTask])
      expect(state.filteredTasks).toEqual([mockTask])
    })

    it('should add task', () => {
      const { addTask } = useStore.getState()
      addTask(mockTask)
      
      const state = useStore.getState()
      expect(state.tasks).toContain(mockTask)
      expect(state.filteredTasks).toContain(mockTask)
    })

    it('should update task', () => {
      const { setTasks, updateTask } = useStore.getState()
      setTasks([mockTask])
      
      updateTask('task-1', { status: 'completed' })
      
      const updatedTask = useStore.getState().tasks.find(t => t.id === 'task-1')
      expect(updatedTask?.status).toBe('completed')
    })

    it('should apply to task', () => {
      const { setTasks, applyToTask } = useStore.getState()
      setTasks([mockTask])
      
      applyToTask('task-1', 'contributor-1')
      
      const task = useStore.getState().tasks.find(t => t.id === 'task-1')
      expect(task?.applicants).toContain('contributor-1')
    })

    it('should set task filters', () => {
      const { setTaskFilters } = useStore.getState()
      setTaskFilters({ category: 'Development', search: 'React' })
      
      const filters = useStore.getState().taskFilters
      expect(filters.category).toBe('Development')
      expect(filters.search).toBe('React')
    })

    it('should filter tasks by search', () => {
      const tasks = [
        { ...mockTask, title: 'React Development' },
        { ...mockTask, id: 'task-2', title: 'Vue Development' }
      ]
      const { setTasks, setTaskFilters, filterTasks } = useStore.getState()
      
      setTasks(tasks)
      setTaskFilters({ search: 'React' })
      filterTasks()
      
      const filtered = useStore.getState().filteredTasks
      expect(filtered).toHaveLength(1)
      expect(filtered[0].title).toBe('React Development')
    })

    it('should filter tasks by category', () => {
      const tasks = [
        { ...mockTask, category: 'Development' },
        { ...mockTask, id: 'task-2', category: 'Design' }
      ]
      const { setTasks, setTaskFilters, filterTasks } = useStore.getState()
      
      setTasks(tasks)
      setTaskFilters({ category: 'Design' })
      filterTasks()
      
      const filtered = useStore.getState().filteredTasks
      expect(filtered).toHaveLength(1)
      expect(filtered[0].category).toBe('Design')
    })

    it('should filter tasks by budget range', () => {
      const tasks = [
        { ...mockTask, budget: 500 },
        { ...mockTask, id: 'task-2', budget: 1500 },
        { ...mockTask, id: 'task-3', budget: 2500 }
      ]
      const { setTasks, setTaskFilters, filterTasks } = useStore.getState()
      
      setTasks(tasks)
      setTaskFilters({ budget: [1000, 2000] })
      filterTasks()
      
      const filtered = useStore.getState().filteredTasks
      expect(filtered).toHaveLength(1)
      expect(filtered[0].budget).toBe(1500)
    })
  })

  describe('Proof Management', () => {
    it('should add proof', () => {
      const { addProof } = useStore.getState()
      addProof(mockProof)
      
      expect(useStore.getState().proofs).toContain(mockProof)
    })

    it('should set proofs', () => {
      const { setProofs } = useStore.getState()
      setProofs([mockProof])
      
      expect(useStore.getState().proofs).toEqual([mockProof])
    })
  })

  describe('Match Management', () => {
    it('should add match', () => {
      const { addMatch } = useStore.getState()
      addMatch(mockMatch)
      
      expect(useStore.getState().matches).toContain(mockMatch)
    })

    it('should update match', () => {
      const { setMatches, updateMatch } = useStore.getState()
      setMatches([mockMatch])
      
      updateMatch('match-1', { status: 'mutual_interest' })
      
      const match = useStore.getState().matches.find(m => m.id === 'match-1')
      expect(match?.status).toBe('mutual_interest')
    })

    it('should set matches', () => {
      const { setMatches } = useStore.getState()
      setMatches([mockMatch])
      
      expect(useStore.getState().matches).toEqual([mockMatch])
    })
  })

  describe('UI State Management', () => {
    it('should open proof modal', () => {
      const { openProofModal } = useStore.getState()
      openProofModal(mockTask)
      
      const state = useStore.getState()
      expect(state.isProofModalOpen).toBe(true)
      expect(state.selectedTask).toEqual(mockTask)
    })

    it('should close proof modal', () => {
      const { openProofModal, closeProofModal } = useStore.getState()
      openProofModal(mockTask)
      closeProofModal()
      
      const state = useStore.getState()
      expect(state.isProofModalOpen).toBe(false)
      expect(state.selectedTask).toBeNull()
    })
  })
})