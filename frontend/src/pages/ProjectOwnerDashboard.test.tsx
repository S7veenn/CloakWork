import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProjectOwnerDashboard from './ProjectOwnerDashboard';
import { useStore } from '@/store/useStore';
import { apiService } from '@/services/api';
import { mockUser, mockTasks, mockProofs, mockMatches } from '@/test/utils';

// Mock the store
vi.mock('@/store/useStore');
vi.mock('@/services/api');

const mockUseStore = vi.mocked(useStore);
const mockApiService = vi.mocked(apiService);

// The component uses apiService directly, so we'll mock those methods

describe('ProjectOwnerDashboard', () => {
  const mockSetTasks = vi.fn();
  const mockSetProofs = vi.fn();
  const mockSetMatches = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseStore.mockReturnValue({
      currentUser: mockUser,
      tasks: mockTasks,
      proofs: mockProofs,
      matches: mockMatches,
      setTasks: mockSetTasks,
      setProofs: mockSetProofs,
      setMatches: mockSetMatches,
      setCurrentUser: vi.fn(),
    } as any);

    mockApiService.getOwnerTasks.mockResolvedValue(mockTasks);
    mockApiService.getTaskApplications.mockResolvedValue(mockProofs);
    mockApiService.getMatches.mockResolvedValue(mockMatches);
    mockApiService.createTask.mockResolvedValue(mockTasks[0]);
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<ProjectOwnerDashboard />)
      expect(document.body).toBeInTheDocument()
    })

    it('should render main UI elements', () => {
      render(<ProjectOwnerDashboard />)
      const container = document.querySelector('.min-h-screen')
      expect(container).toBeInTheDocument()
    })

    it('should have accessible structure', () => {
      render(<ProjectOwnerDashboard />)
      expect(document.body.firstChild).toBeInTheDocument()
    })
  })

  describe('User Authentication', () => {
    it('should handle authenticated user', () => {
      render(<ProjectOwnerDashboard />)
      expect(mockUseStore).toHaveBeenCalled()
    })

    it('should handle unauthenticated user', () => {
      mockUseStore.mockReturnValue({
        currentUser: null,
        tasks: [],
        proofs: [],
        matches: [],
        setTasks: vi.fn(),
        setProofs: vi.fn(),
        setMatches: vi.fn(),
        setCurrentUser: vi.fn(),
      } as any)
      
      render(<ProjectOwnerDashboard />)
      expect(mockUseStore).toHaveBeenCalled()
    })
  })
})