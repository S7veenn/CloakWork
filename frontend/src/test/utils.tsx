import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock data for tests
export const mockUser = {
  id: 'user-123',
  role: 'project_owner' as const,
  isAnonymous: false,
  reputation: 100
}

export const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'A test task for unit testing',
  requirements: ['React', 'TypeScript'],
  budget: 1000,
  deadline: '2024-12-31',
  ownerId: 'test-owner',
  status: 'open',
  category: 'Development',
  applicants: []
}

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Frontend Developer Needed',
    description: 'Build a responsive web application',
    requirements: ['React', 'TypeScript', 'Tailwind CSS'],
    budget: 3000,
    deadline: '2024-02-15',
    ownerId: 'owner1',
    status: 'open' as const,
    category: 'Development',
    applicants: ['contributor1']
  },
  {
    id: '2',
    title: 'UI/UX Designer Required',
    description: 'Design user interface for mobile app',
    requirements: ['Figma', 'UI/UX', 'Mobile Design'],
    budget: 1500,
    deadline: '2024-03-01',
    ownerId: 'owner2',
    status: 'open' as const,
    category: 'Design',
    applicants: []
  }
]

export const mockProof = {
  id: 'proof-1',
  contributorId: 'contributor-1',
  type: 'completion',
  description: 'Task completed successfully',
  zkProof: 'mock-zk-proof',
  timestamp: '2024-01-01T00:00:00Z',
  verified: true
}

export const mockProofs = [mockProof]

export const mockMatch = {
  id: 'match-1',
  taskId: 'task-1',
  contributorId: 'contributor-1',
  ownerId: 'owner-1',
  status: 'mutual_consent' as const,
  contributorRevealed: false,
  ownerRevealed: false,
  timestamp: '2024-01-01T00:00:00Z'
}

export const mockMatches = [mockMatch]

// Mock API service
export const mockApiService = {
  getTasks: vi.fn().mockResolvedValue(mockTasks),
  createTask: vi.fn().mockResolvedValue(mockTask),
  applyToTask: vi.fn().mockResolvedValue({ id: 'app-1', status: 'pending' }),
  getProofs: vi.fn().mockResolvedValue([mockProof]),
  submitProof: vi.fn().mockResolvedValue(mockProof),
  getMatches: vi.fn().mockResolvedValue([mockMatch]),
  createMatch: vi.fn().mockResolvedValue(mockMatch),
  authenticateWallet: vi.fn().mockResolvedValue({ token: 'mock-token' }),
  getOwnerTasks: vi.fn().mockResolvedValue(mockTasks),
  getTaskApplications: vi.fn().mockResolvedValue(mockProofs),
  updateProofStatus: vi.fn().mockResolvedValue({})
}

// Helper to mock fetch
export const mockFetch = (data: any, ok = true) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
    status: ok ? 200 : 400
  })
}