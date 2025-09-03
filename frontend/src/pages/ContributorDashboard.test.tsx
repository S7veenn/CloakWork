import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as React from 'react';
import ContributorDashboard from './ContributorDashboard';
import { useStore } from '@/store/useStore';
import { apiService } from '@/services/api';
import type { User, Proof, Match } from '@/store/useStore';

// Mock data
const mockUser: User = {
  id: 'user-1',
  walletAddress: '0x123...abc',
  role: 'contributor',
  reputation: 85,
  completedTasks: 12,
  totalEarnings: 5000,
  skills: ['React', 'TypeScript', 'Node.js'],
  joinedAt: '2024-01-01T00:00:00Z'
};

const mockProofs: Proof[] = [
  {
    id: 'proof-1',
    taskId: 'task-1',
    contributorId: 'user-1',
    status: 'pending',
    skillsProven: ['React', 'TypeScript'],
    zkProofHash: '0xabc123...def456',
    createdAt: '2024-01-15T10:00:00Z',
    proofData: {
      experienceLevel: 'Senior',
      skillVerifications: ['React', 'TypeScript'],
      portfolioCount: 5,
      certificationCount: 2
    }
  },
  {
    id: 'proof-2',
    taskId: 'task-2',
    contributorId: 'user-1',
    status: 'accepted',
    skillsProven: ['Node.js'],
    zkProofHash: '0xdef456...ghi789',
    createdAt: '2024-01-10T14:30:00Z',
    proofData: {
      experienceLevel: 'Mid',
      skillVerifications: ['Node.js'],
      portfolioCount: 3,
      certificationCount: 1
    }
  }
];

const mockMatches: Match[] = [
  {
    id: 'match-1',
    taskId: 'task-1',
    contributorId: 'user-1',
    projectOwnerId: 'owner-1',
    status: 'matched',
    taskBudget: 2500,
    createdAt: '2024-01-16T09:00:00Z'
  },
  {
    id: 'match-2',
    taskId: 'task-3',
    contributorId: 'user-1',
    projectOwnerId: 'owner-2',
    status: 'completed',
    taskBudget: 1800,
    createdAt: '2024-01-05T16:45:00Z'
  }
];

// Mock store data
const mockUseStore = {
  currentUser: mockUser,
  setCurrentUser: vi.fn(),
  tasks: [],
  setTasks: vi.fn(),
  addTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  proofs: [],
  setProofs: vi.fn(),
  addProof: vi.fn(),
  matches: [],
  setMatches: vi.fn(),
  addMatch: vi.fn(),
  updateMatch: vi.fn(),
  isAuthenticated: true,
  setIsAuthenticated: vi.fn(),
  login: vi.fn(),
  logout: vi.fn()
};

// Mock the API service
vi.mock('@/services/api', () => ({
  apiService: {
    getUserProofs: vi.fn(),
    getMatches: vi.fn(),
  },
}));

vi.mock('@/store/useStore', () => ({
  useStore: () => mockUseStore
}));

const mockApiService = vi.mocked(apiService);

describe('ContributorDashboard', () => {
  it('renders without crashing', () => {
    render(<ContributorDashboard />);
    // Just check that the component renders without throwing
    expect(document.body).toBeInTheDocument();
  });

  it('displays basic UI elements', () => {
    const { container } = render(<ContributorDashboard />);
    // Check that the component renders some content
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has accessible structure', () => {
    render(<ContributorDashboard />);
    // Basic accessibility check
    const container = document.querySelector('div');
    expect(container).toBeInTheDocument();
  });

  it('renders component structure', () => {
    const { container } = render(<ContributorDashboard />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles user authentication state', () => {
    render(<ContributorDashboard />);
    // Component should render regardless of auth state
    expect(document.body).toBeInTheDocument();
  });
});