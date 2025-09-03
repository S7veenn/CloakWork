import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { apiService } from './api'
import type { Task, Proof, Match, User } from './api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

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

const mockUser: User = {
  id: 'user-1',
  walletAddress: '0x123',
  role: 'contributor',
  isAnonymous: false,
  reputation: 100
}

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Task Endpoints', () => {
    describe('getTasks', () => {
      it('should fetch tasks successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([mockTask])
        })

        const result = await apiService.getTasks()
        
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/tasks',
          expect.objectContaining({
            headers: { 'Content-Type': 'application/json' }
          })
        )
        expect(result).toEqual([mockTask])
      })

      it('should return mock data when API fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        const result = await apiService.getTasks()
        
        expect(result).toBeInstanceOf(Array)
        expect(result.length).toBeGreaterThan(0)
      })
    })

    describe('getTask', () => {
      it('should fetch single task successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTask)
        })

        const result = await apiService.getTask('task-1')
        
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/tasks/task-1',
          expect.objectContaining({
            headers: { 'Content-Type': 'application/json' }
          })
        )
        expect(result).toEqual(mockTask)
      })

      it('should return null when task not found', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Not found'))

        const result = await apiService.getTask('nonexistent')
        
        expect(result).toBeNull()
      })
    })

    describe('createTask', () => {
      it('should create task successfully', async () => {
        const newTask = { ...mockTask }
        delete (newTask as any).id
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTask)
        })

        const result = await apiService.createTask(newTask)
        
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/tasks',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
          })
        )
        expect(result).toEqual(mockTask)
      })

      it('should create task with mock data when API fails', async () => {
        const newTask = { ...mockTask }
        delete (newTask as any).id
        
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        const result = await apiService.createTask(newTask)
        
        expect(result).toMatchObject(newTask)
        expect(result.id).toBeDefined()
      })
    })

    describe('applyToTask', () => {
      it('should apply to task successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({})
        })

        await apiService.applyToTask('task-1', 'contributor-1')
        
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/tasks/task-1/apply',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contributorId: 'contributor-1' })
          })
        )
      })

      it('should handle API failure gracefully', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        await expect(apiService.applyToTask('task-1', 'contributor-1')).resolves.toBeUndefined()
      })
    })
  })

  describe('Proof Endpoints', () => {
    describe('getProofs', () => {
      it('should fetch all proofs', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([mockProof])
        })

        const result = await apiService.getProofs()
        
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/proofs',
          expect.objectContaining({
            headers: { 'Content-Type': 'application/json' }
          })
        )
        expect(result).toEqual([mockProof])
      })

      it('should fetch proofs by contributor', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([mockProof])
        })

        const result = await apiService.getProofs('contributor-1')
        
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/proofs?contributorId=contributor-1',
          expect.objectContaining({
            headers: { 'Content-Type': 'application/json' }
          })
        )
        expect(result).toEqual([mockProof])
      })

      it('should return empty array when API fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        const result = await apiService.getProofs()
        
        expect(result).toEqual([])
      })
    })

    describe('submitProof', () => {
      it('should submit proof successfully', async () => {
        const newProof = { ...mockProof }
        delete (newProof as any).id
        delete (newProof as any).timestamp
        delete (newProof as any).verified
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProof)
        })

        const result = await apiService.submitProof(newProof)
        
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/proofs',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProof)
          })
        )
        expect(result).toEqual(mockProof)
      })

      it('should generate proof with mock data when API fails', async () => {
        const newProof = { ...mockProof }
        delete (newProof as any).id
        delete (newProof as any).timestamp
        delete (newProof as any).verified
        
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        const result = await apiService.submitProof(newProof)
        
        expect(result).toMatchObject(newProof)
        expect(result.id).toBeDefined()
        expect(result.timestamp).toBeDefined()
        expect(result.verified).toBe(false)
      })
    })

    describe('verifyProof', () => {
      it('should verify proof successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ verified: true })
        })

        const result = await apiService.verifyProof('proof-1')
        
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/proofs/proof-1/verify',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
        )
        expect(result).toBe(true)
      })

      it('should return verification result when API fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        const result = await apiService.verifyProof('proof-1')
        
        expect(typeof result).toBe('boolean')
      })
    })
  })

  describe('Match Endpoints', () => {
    describe('getMatches', () => {
      it('should fetch matches for user', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([mockMatch])
        })

        const result = await apiService.getMatches('user-1')
        
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/matches?userId=user-1',
          expect.objectContaining({
            headers: { 'Content-Type': 'application/json' }
          })
        )
        expect(result).toEqual([mockMatch])
      })

      it('should return empty array when API fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        const result = await apiService.getMatches('user-1')
        
        expect(result).toEqual([])
      })
    })

    describe('createMatch', () => {
      it('should create match successfully', async () => {
        const newMatch = { ...mockMatch }
        delete (newMatch as any).id
        delete (newMatch as any).timestamp
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMatch)
        })

        const result = await apiService.createMatch(newMatch)
        
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/matches',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMatch)
          })
        )
        expect(result).toEqual(mockMatch)
      })
    })

    describe('updateMatch', () => {
      it('should update match successfully', async () => {
        const updates = { status: 'mutual_interest' as const }
        const updatedMatch = { ...mockMatch, ...updates }
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(updatedMatch)
        })

        const result = await apiService.updateMatch('match-1', updates)
        
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/matches/match-1',
          expect.objectContaining({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          })
        )
        expect(result).toEqual(updatedMatch)
      })
    })
  })

  describe('User/Wallet Endpoints', () => {
    describe('connectWallet', () => {
      it('should connect wallet successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })

        const result = await apiService.connectWallet('0x123')
        
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/auth/wallet',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: '0x123' })
          })
        )
        expect(result).toEqual(mockUser)
      })

      it('should create mock user when API fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        const result = await apiService.connectWallet('0x123')
        
        expect(result.walletAddress).toBe('0x123')
        expect(result.id).toBeDefined()
      })
    })

    describe('updateUserRole', () => {
      it('should update user role successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUser)
        })

        const result = await apiService.updateUserRole('user-1', 'contributor')
        
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3002/api/users/user-1/role',
          expect.objectContaining({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'contributor' })
          })
        )
        expect(result).toEqual(mockUser)
      })
    })
  })

  describe('Error Handling', () => {
    it('should fallback to mock data on HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      // Should fallback to mock data instead of throwing
      const result = await apiService.getTasks()
      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      // Should fallback to mock data instead of throwing
      const result = await apiService.getTasks()
      expect(result).toBeInstanceOf(Array)
    })
  })
})