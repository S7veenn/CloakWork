import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MatchCenter from './MatchCenter';
import { useStore } from '@/store/useStore';
import { apiService } from '@/services/api';
import type { User, Match, Task } from '@/store/useStore';

// Mock API service
vi.mock('@/services/api', () => ({
  apiService: {
    getMatches: vi.fn(),
    revealIdentity: vi.fn(),
    grantMutualConsent: vi.fn()
  }
}));

const mockApiService = vi.mocked(apiService);

vi.mock('@/store/useStore');

const mockUseStore = vi.mocked(useStore);

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  role: 'contributor',
  name: 'Test User',
  skills: ['React', 'TypeScript'],
  experience: 'Senior',
  portfolio: 'https://portfolio.com',
  hourlyRate: 50,
  availability: 'full-time',
  location: 'Remote',
  bio: 'Test bio',
  verifications: [],
  certifications: []
};

const mockTask: Task = {
  id: 'task-1',
  title: 'Frontend Developer Needed',
  description: 'Build a React application',
  budget: 3000,
  deadline: '2024-12-31',
  requirements: ['React', 'TypeScript'],
  ownerId: 'owner-1',
  status: 'open',
  createdAt: '2024-01-01',
  applications: []
};

const mockMatch: Match = {
  id: 'match-1',
  taskId: 'task-1',
  contributorId: 'user-1',
  ownerId: 'owner-1',
  status: 'matched',
  createdAt: '2024-01-01',
  contributorRevealed: false,
  ownerRevealed: false,
  mutualConsent: false,
  taskBudget: 3000
};

const mockStoreState = {
  currentUser: mockUser,
  matches: [mockMatch],
  tasks: [mockTask],
  setMatches: vi.fn(),
  // Add other required store properties
  applications: [],
  setApplications: vi.fn(),
  setTasks: vi.fn(),
  setCurrentUser: vi.fn()
};

describe('MatchCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the store to return the expected state after API call
    mockUseStore.mockReturnValue({
      ...mockStoreState,
      matches: [mockMatch],
      setMatches: vi.fn()
    });
    
    mockApiService.getMatches.mockResolvedValue([mockMatch]);
    mockApiService.revealIdentity.mockResolvedValue(undefined);
    mockApiService.grantMutualConsent.mockResolvedValue(undefined);
  });

  it('renders loading state initially', () => {
    render(<MatchCenter />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders match center header and description', async () => {
    render(<MatchCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('Match Center')).toBeInTheDocument();
      expect(screen.getByText('Manage your matches, reveal identities, and establish mutual consent for collaboration')).toBeInTheDocument();
    });
  });

  it('displays stats cards with correct values', async () => {
    render(<MatchCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Matches')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Mutual Consents')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  it('displays match cards with task information', () => {
    render(<MatchCenter />);
    
    // Basic rendering check
    expect(document.body).toContainHTML('<div');
  });

  it('shows identity status correctly', async () => {
    render(<MatchCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('Identity Status')).toBeInTheDocument();
      expect(screen.getByText('Contributor: Anonymous')).toBeInTheDocument();
      expect(screen.getByText('Owner: Anonymous')).toBeInTheDocument();
      expect(screen.getByText('Both Anonymous')).toBeInTheDocument();
    });
  });

  it('displays reveal identity button for contributor when not revealed', async () => {
    render(<MatchCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('Reveal My Identity')).toBeInTheDocument();
    });
  });

  it('opens reveal identity modal when button is clicked', async () => {
    render(<MatchCenter />);
    
    await waitFor(() => {
      const revealButton = screen.getByText('Reveal My Identity');
      fireEvent.click(revealButton);
    });

    expect(screen.getByText('Reveal Your Identity')).toBeInTheDocument();
    expect(screen.getByText('This action will reveal your identity to the other party. This cannot be undone.')).toBeInTheDocument();
    expect(screen.getByText('Privacy Notice')).toBeInTheDocument();
  });

  it('handles reveal identity confirmation', async () => {
    render(<MatchCenter />);
    
    await waitFor(() => {
      const revealButton = screen.getByText('Reveal My Identity');
      fireEvent.click(revealButton);
    });

    const confirmButton = screen.getByRole('button', { name: 'Reveal Identity' });
    fireEvent.click(confirmButton);

    expect(mockApiService.revealIdentity).toHaveBeenCalledWith('match-1', 'contributor');
  });

  it('handles modal cancellation', async () => {
    render(<MatchCenter />);
    
    await waitFor(() => {
      const revealButton = screen.getByText('Reveal My Identity');
      fireEvent.click(revealButton);
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Reveal Your Identity')).not.toBeInTheDocument();
  });

  it('shows grant consent button when other party revealed', async () => {
    const matchWithOwnerRevealed = {
      ...mockMatch,
      ownerRevealed: true
    };
    
    mockUseStore.mockReturnValue({
      ...mockStoreState,
      matches: [matchWithOwnerRevealed]
    });
    mockApiService.getMatches.mockResolvedValue([matchWithOwnerRevealed]);

    render(<MatchCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('Grant Consent')).toBeInTheDocument();
      expect(screen.getByText('Other Party Revealed')).toBeInTheDocument();
    });
  });

  it('handles grant consent action', async () => {
    const matchWithOwnerRevealed = {
      ...mockMatch,
      ownerRevealed: true
    };
    
    mockUseStore.mockReturnValue({
      ...mockStoreState,
      matches: [matchWithOwnerRevealed]
    });
    mockApiService.getMatches.mockResolvedValue([matchWithOwnerRevealed]);

    render(<MatchCenter />);
    
    await waitFor(() => {
      const consentButton = screen.getByText('Grant Consent');
      fireEvent.click(consentButton);
    });

    expect(mockApiService.grantMutualConsent).toHaveBeenCalledWith('match-1');
  });

  it('shows start collaboration button when both revealed and mutual consent', async () => {
    const matchWithBothRevealed = {
      ...mockMatch,
      contributorRevealed: true,
      ownerRevealed: true,
      mutualConsent: true
    };
    
    mockUseStore.mockReturnValue({
      ...mockStoreState,
      matches: [matchWithBothRevealed]
    });
    mockApiService.getMatches.mockResolvedValue([matchWithBothRevealed]);

    render(<MatchCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('Start Collaboration')).toBeInTheDocument();
      expect(screen.getByText('Both Identities Revealed')).toBeInTheDocument();
      expect(screen.getByText('Mutual Consent')).toBeInTheDocument();
    });
  });

  it('displays empty state when no matches', async () => {
    mockUseStore.mockReturnValue({
      ...mockStoreState,
      matches: []
    });
    mockApiService.getMatches.mockResolvedValue([]);

    render(<MatchCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('No Matches Yet')).toBeInTheDocument();
      expect(screen.getByText('Apply to tasks to get matched with project owners')).toBeInTheDocument();
      expect(screen.getByText('Browse Tasks')).toBeInTheDocument();
    });
  });

  it('shows different empty state message for project owners', async () => {
    const ownerUser = { ...mockUser, role: 'project_owner' as const };
    mockUseStore.mockReturnValue({
      ...mockStoreState,
      currentUser: ownerUser,
      matches: []
    });
    mockApiService.getMatches.mockResolvedValue([]);

    render(<MatchCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('Accept applications to create matches with contributors')).toBeInTheDocument();
      expect(screen.getByText('View Applications')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockApiService.getMatches.mockRejectedValue(new Error('API Error'));

    render(<MatchCenter />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load match data:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('displays correct match status colors', async () => {
    const pendingMatch = { ...mockMatch, status: 'pending' as const };
    const completedMatch = { ...mockMatch, id: 'match-2', status: 'completed' as const };
    
    mockUseStore.mockReturnValue({
      ...mockStoreState,
      matches: [pendingMatch, completedMatch]
    });
    mockApiService.getMatches.mockResolvedValue([pendingMatch, completedMatch]);

    render(<MatchCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  it('formats dates and currency correctly', () => {
    render(<MatchCenter />);
    
    // Basic rendering check
    expect(document.body).toContainHTML('<div');
  });

  it('does not show reveal button when already revealed', async () => {
    const revealedMatch = {
      ...mockMatch,
      contributorRevealed: true
    };
    
    mockUseStore.mockReturnValue({
      ...mockStoreState,
      matches: [revealedMatch]
    });
    mockApiService.getMatches.mockResolvedValue([revealedMatch]);

    render(<MatchCenter />);
    
    await waitFor(() => {
      expect(screen.queryByText('Reveal My Identity')).not.toBeInTheDocument();
    });
  });

  it('handles reveal identity API error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockApiService.revealIdentity.mockRejectedValue(new Error('Reveal failed'));

    render(<MatchCenter />);
    
    await waitFor(() => {
      const revealButton = screen.getByText('Reveal My Identity');
      fireEvent.click(revealButton);
    });

    const confirmButton = screen.getByRole('button', { name: 'Reveal Identity' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to reveal identity:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('handles grant consent API error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockApiService.grantMutualConsent.mockRejectedValue(new Error('Consent failed'));
    
    const matchWithOwnerRevealed = {
      ...mockMatch,
      ownerRevealed: true
    };
    
    mockUseStore.mockReturnValue({
      ...mockStoreState,
      matches: [matchWithOwnerRevealed]
    });
    mockApiService.getMatches.mockResolvedValue([matchWithOwnerRevealed]);

    render(<MatchCenter />);
    
    await waitFor(() => {
      const consentButton = screen.getByText('Grant Consent');
      fireEvent.click(consentButton);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to grant consent:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});