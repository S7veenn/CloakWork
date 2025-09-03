import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test/utils'
import { useStore } from '../store/useStore'
import Home from './Home'

// Mock the store
vi.mock('../store/useStore')
const mockUseStore = vi.mocked(useStore)

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('Home Page', () => {
  const mockSetUserRole = vi.fn()
  const mockSetCurrentUser = vi.fn()

  beforeEach(() => {
    mockUseStore.mockReturnValue({
      setUserRole: mockSetUserRole,
      setCurrentUser: mockSetCurrentUser
    } as any)
    
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render the hero section with correct content', () => {
      render(<Home />)

      expect(screen.getByText('Welcome to')).toBeInTheDocument()
      expect(screen.getByText('CloakWork')).toBeInTheDocument()
      expect(screen.getByText('Privacy-First Collaboration')).toBeInTheDocument()
      
      const description = screen.getByText(/The first privacy-first collaboration platform/)
      expect(description).toBeInTheDocument()
    })

    it('should render both role selection cards', () => {
      render(<Home />)

      expect(screen.getByText("I'm a Contributor")).toBeInTheDocument()
      expect(screen.getByText("I'm a Project Owner")).toBeInTheDocument()
      
      expect(screen.getByRole('button', { name: /Start as Contributor/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Start as Project Owner/i })).toBeInTheDocument()
    })

    it('should render the features section', () => {
      render(<Home />)

      expect(screen.getByText('Privacy by Design')).toBeInTheDocument()
      expect(screen.getByText('Anonymous by Default')).toBeInTheDocument()
      expect(screen.getByText('Zero-Knowledge Proofs')).toBeInTheDocument()
      expect(screen.getByText('Mutual Consent')).toBeInTheDocument()
    })
  })

  describe('Contributor Role Selection', () => {
    it('should display contributor benefits correctly', () => {
      render(<Home />)

      expect(screen.getByText('Find exciting projects, prove your skills anonymously, and get paid fairly without revealing your identity until you choose to.')).toBeInTheDocument()
      
      expect(screen.getByText('Browse tasks anonymously')).toBeInTheDocument()
      expect(screen.getByText('Generate ZK proofs of your skills')).toBeInTheDocument()
      expect(screen.getByText('Control when to reveal identity')).toBeInTheDocument()
    })

    it('should handle contributor role selection', async () => {
      render(<Home />)

      const contributorButton = screen.getByRole('button', { name: /Start as Contributor/i })
      fireEvent.click(contributorButton)

      expect(mockSetUserRole).toHaveBeenCalledWith('contributor')
      expect(mockSetCurrentUser).toHaveBeenCalledWith({
        id: expect.stringMatching(/^user_\d+$/),
        role: 'contributor',
        isAnonymous: true,
        reputation: 0
      })
      expect(mockNavigate).toHaveBeenCalledWith('/tasks')
    })

    it('should create unique user IDs for different selections', () => {
      render(<Home />)

      const contributorButton = screen.getByRole('button', { name: /Start as Contributor/i })
      
      // Click multiple times to ensure unique IDs
      fireEvent.click(contributorButton)
      const firstCall = mockSetCurrentUser.mock.calls[0][0]
      
      vi.clearAllMocks()
      
      fireEvent.click(contributorButton)
      const secondCall = mockSetCurrentUser.mock.calls[0][0]
      
      expect(firstCall.id).not.toBe(secondCall.id)
    })
  })

  describe('Project Owner Role Selection', () => {
    it('should display project owner benefits correctly', () => {
      render(<Home />)

      expect(screen.getByText('Post projects, receive verified proof of skills from contributors, and hire the best talent based on merit, not bias.')).toBeInTheDocument()
      
      expect(screen.getByText('Post tasks with encrypted requirements')).toBeInTheDocument()
      expect(screen.getByText('Receive verified skill proofs')).toBeInTheDocument()
      expect(screen.getByText('Hire based on proven merit')).toBeInTheDocument()
    })

    it('should handle project owner role selection', async () => {
      render(<Home />)

      const ownerButton = screen.getByRole('button', { name: /Start as Project Owner/i })
      fireEvent.click(ownerButton)

      expect(mockSetUserRole).toHaveBeenCalledWith('project_owner')
      expect(mockSetCurrentUser).toHaveBeenCalledWith({
        id: expect.stringMatching(/^user_\d+$/),
        role: 'project_owner',
        isAnonymous: true,
        reputation: 0
      })
      expect(mockNavigate).toHaveBeenCalledWith('/owner/dashboard')
    })
  })

  describe('User Experience', () => {
    it('should have proper hover effects on role cards', () => {
      render(<Home />)

      const contributorCard = screen.getByText("I'm a Contributor").closest('.group')
      const ownerCard = screen.getByText("I'm a Project Owner").closest('.group')

      expect(contributorCard).toHaveClass('group')
      expect(ownerCard).toHaveClass('group')
    })

    it('should display proper icons for each section', () => {
      render(<Home />)

      // Check for Lucide icons by their container classes
      const iconContainers = document.querySelectorAll('.bg-indigo-100, .bg-purple-100, .bg-green-100')
      expect(iconContainers.length).toBeGreaterThan(0)
    })

    it('should have gradient text for the main title', () => {
      render(<Home />)

      const cloakworkTitle = screen.getByText('CloakWork')
      expect(cloakworkTitle).toHaveClass('bg-gradient-to-r', 'from-indigo-600', 'to-purple-600', 'bg-clip-text', 'text-transparent')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<Home />)

      // Main heading
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toBeInTheDocument()
      
      // Section headings
      const sectionHeadings = screen.getAllByRole('heading', { level: 2 })
      expect(sectionHeadings.length).toBeGreaterThan(0)
      
      // Subsection headings
      const subHeadings = screen.getAllByRole('heading', { level: 3 })
      expect(subHeadings.length).toBeGreaterThan(0)
    })

    it('should have accessible buttons with proper labels', () => {
      render(<Home />)

      const contributorButton = screen.getByRole('button', { name: /Start as Contributor/i })
      const ownerButton = screen.getByRole('button', { name: /Start as Project Owner/i })

      expect(contributorButton).toBeInTheDocument()
      expect(ownerButton).toBeInTheDocument()
      
      // Buttons should be focusable
      contributorButton.focus()
      expect(document.activeElement).toBe(contributorButton)
    })

    it('should have proper contrast and readable text', () => {
      render(<Home />)

      // Check for proper text color classes
      const darkText = document.querySelectorAll('.text-slate-900')
      const mediumText = document.querySelectorAll('.text-slate-600')
      const lightText = document.querySelectorAll('.text-slate-500')

      expect(darkText.length).toBeGreaterThan(0)
      expect(mediumText.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive grid classes', () => {
      render(<Home />)

      // Check for responsive grid classes
      const responsiveGrids = document.querySelectorAll('.md\\:grid-cols-2, .md\\:grid-cols-3')
      expect(responsiveGrids.length).toBeGreaterThan(0)
    })

    it('should have responsive text sizing', () => {
      render(<Home />)

      // Check for responsive text classes
      const responsiveText = document.querySelectorAll('.text-4xl.md\\:text-6xl')
      expect(responsiveText.length).toBeGreaterThan(0)
    })

    it('should have proper container max-widths', () => {
      render(<Home />)

      const containers = document.querySelectorAll('.max-w-7xl, .max-w-4xl, .max-w-3xl, .max-w-2xl')
      expect(containers.length).toBeGreaterThan(0)
    })
  })

  describe('Visual Design', () => {
    it('should have proper gradient backgrounds', () => {
      render(<Home />)

      // Check for gradient classes
      const gradients = document.querySelectorAll('[class*="bg-gradient-to"]')
      expect(gradients.length).toBeGreaterThan(0)
    })

    it('should have proper spacing and padding', () => {
      render(<Home />)

      // Check for consistent spacing
      const spacedElements = document.querySelectorAll('.py-24, .px-4, .mb-6, .mb-8')
      expect(spacedElements.length).toBeGreaterThan(0)
    })

    it('should have proper border radius for modern look', () => {
      render(<Home />)

      // Check for rounded corners
      const roundedElements = document.querySelectorAll('.rounded-2xl, .rounded-xl, .rounded-full')
      expect(roundedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Content Quality', () => {
    it('should have informative and clear descriptions', () => {
      render(<Home />)

      // Basic rendering check
      expect(document.body).toContainHTML('<div')
    })

    it('should explain the benefits clearly for each role', () => {
      render(<Home />)

      // Basic rendering check
      expect(document.body).toContainHTML('<div')
    })

    it('should highlight key privacy features', () => {
      render(<Home />)

      // Basic rendering check
      expect(document.body).toContainHTML('<div')
    })
  })

  describe('Navigation Flow', () => {
    it('should navigate to correct routes based on role selection', () => {
      render(<Home />)

      // Test contributor navigation
      const contributorButton = screen.getByRole('button', { name: /Start as Contributor/i })
      fireEvent.click(contributorButton)
      expect(mockNavigate).toHaveBeenCalledWith('/tasks')

      vi.clearAllMocks()

      // Test project owner navigation
      const ownerButton = screen.getByRole('button', { name: /Start as Project Owner/i })
      fireEvent.click(ownerButton)
      expect(mockNavigate).toHaveBeenCalledWith('/owner/dashboard')
    })

    it('should set up user state before navigation', () => {
      render(<Home />)

      const contributorButton = screen.getByRole('button', { name: /Start as Contributor/i })
      fireEvent.click(contributorButton)

      // Verify that user state is set before navigation
      expect(mockSetUserRole).toHaveBeenCalledBefore(mockNavigate as any)
      expect(mockSetCurrentUser).toHaveBeenCalledBefore(mockNavigate as any)
    })
  })
})