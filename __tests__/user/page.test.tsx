import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth.context'
import UserProfilePage from '@/user/page'
import Cookies from 'js-cookie'
import userEvent from '@testing-library/user-event'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/context/auth.context', () => ({
  useAuth: jest.fn(),
}))

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}))
// Silence console.error during tests
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })
describe('UserProfilePage', () => {
  // Setup mock data
  const mockRouter = {
    replace: jest.fn(),
  }

  const mockAuthContext = {
    user: null,
    logout: jest.fn(),
  }

  const mockUserProfile = {
    id: 1,
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    dateOfBirth: '1990-01-01',
    preferredLocation: {
      id: 1,
      locationName: 'Remote',
    },
    resumeSummary: 'Experienced software developer',
    programmingSkills: [
      { id: 1, name: 'JavaScript' },
      { id: 2, name: 'TypeScript' },
    ],
  }

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useAuth as jest.Mock).mockReturnValue(mockAuthContext)
  })

  describe('Authentication & Authorization', () => {
    it('should redirect to home if access token is missing', async () => {
      ;(Cookies.get as jest.Mock).mockReturnValue(null)

      render(<UserProfilePage />)

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/')
      })
    })

    it('should redirect to home if user is not registered', async () => {
      ;(Cookies.get as jest.Mock).mockImplementation((key) => {
        if (key === 'access_token') return 'token'
        return null
      })

      render(<UserProfilePage />)

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading state before profile data is loaded', async () => {
      // Mock cookies to trigger loading state
      ;(Cookies.get as jest.Mock).mockImplementation((key) => {
        if (key === 'access_token') return 'token'
        if (key === 'userRegistered') return 'true'
        return null
      })

      render(<UserProfilePage />)

      // Check for loading state
      const loadingContainer = await screen.findByTestId('loading-container')
      expect(loadingContainer).toBeInTheDocument()
      
      const spinner = await screen.findByTestId('loading-spinner')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveAttribute('role', 'status')
      expect(spinner).toHaveAttribute('aria-label', 'Loading')
      
      const loadingText = await screen.findByTestId('loading-text')
      expect(loadingText).toHaveTextContent('Loading profile...')
    })

    it('should transition from loading to loaded state', async () => {
      // Mock initial state
      const mockCookies = new Map([
        ['access_token', 'token'],
        ['userRegistered', 'true'],
        ['user_data', undefined],
      ])

      ;(Cookies.get as jest.Mock).mockImplementation((key) => mockCookies.get(key))

      const { rerender } = render(<UserProfilePage />)

      // Verify initial loading state
      await screen.findByTestId('loading-spinner')

      // Update cookies with user data
      mockCookies.set('user_data', JSON.stringify(mockUserProfile))
      
      // Trigger re-render with new props
      rerender(<UserProfilePage key="force-update" />)

      // Wait for profile content to appear and loading spinner to disappear
      await waitFor(
        () => {
          expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
          expect(screen.getByText(mockUserProfile.fullName)).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Profile Display', () => {
    beforeEach(() => {
      ;(Cookies.get as jest.Mock).mockImplementation((key) => {
        if (key === 'access_token') return 'token'
        if (key === 'userRegistered') return 'true'
        if (key === 'user_data') return JSON.stringify(mockUserProfile)
        return null
      })
    })

    it('should render user profile information correctly', async () => {
      render(<UserProfilePage />)

      await waitFor(() => {
        expect(screen.getByText(mockUserProfile.fullName)).toBeInTheDocument()
        expect(screen.getByText(mockUserProfile.email)).toBeInTheDocument()
        expect(screen.getByText(mockUserProfile.resumeSummary)).toBeInTheDocument()
        expect(screen.getByText(mockUserProfile.preferredLocation.locationName)).toBeInTheDocument()
        expect(screen.getByText('January 1, 1990')).toBeInTheDocument()
        
        mockUserProfile.programmingSkills.forEach(skill => {
          expect(screen.getByText(skill.name)).toBeInTheDocument()
        })
      })
    })

    it('should render profile avatar with correct initial', async () => {
      render(<UserProfilePage />)

      await waitFor(() => {
        const avatar = screen.getByText('J')
        expect(avatar).toBeInTheDocument()
        expect(avatar).toHaveClass('text-3xl', 'text-white')
      })
    })
  })

  describe('User Interactions', () => {
    beforeEach(() => {
      ;(Cookies.get as jest.Mock).mockImplementation((key) => {
        if (key === 'access_token') return 'token'
        if (key === 'userRegistered') return 'true'
        if (key === 'user_data') return JSON.stringify(mockUserProfile)
        return null
      })
    })

    it('should handle logout when logout button is clicked', async () => {
      const user = userEvent.setup()
      render(<UserProfilePage />)

      const logoutButton = await screen.findByRole('button', { name: /logout/i })
      await user.click(logoutButton)
      
      expect(mockAuthContext.logout).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid JSON in user_data cookie', async () => {
      console.error = jest.fn() // Suppress console.error for this test
      
      ;(Cookies.get as jest.Mock).mockImplementation((key) => {
        if (key === 'access_token') return 'token'
        if (key === 'userRegistered') return 'true'
        if (key === 'user_data') return 'invalid-json'
        return null
      })

      render(<UserProfilePage />)

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/')
        expect(console.error).toHaveBeenCalled()
      })
    })

    it('should show loading state when profile data is not available', async () => {
      ;(Cookies.get as jest.Mock).mockImplementation((key) => {
        if (key === 'access_token') return 'token'
        if (key === 'userRegistered') return 'true'
        return null
      })

      render(<UserProfilePage />)

      // Should show loading state initially
      await screen.findByTestId('loading-spinner')
      
      // Wait for loading to finish
      await waitFor(
        () => {
          expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
        },
        { timeout: 2000 }
      )
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      ;(Cookies.get as jest.Mock).mockImplementation((key) => {
        if (key === 'access_token') return 'token'
        if (key === 'userRegistered') return 'true'
        if (key === 'user_data') return JSON.stringify(mockUserProfile)
        return null
      })
    })

    it('should have proper ARIA labels and roles', async () => {
      render(<UserProfilePage />)

      const logoutButton = await screen.findByRole('button', { name: /logout/i })
      expect(logoutButton).toHaveAttribute('aria-label', 'Logout')

      const labels = ['Date of Birth', 'Preferred Location', 'Resume Summary', 'Programming Skills']
      labels.forEach(async (label) => {
        const element = await screen.findByText(label)
        expect(element).toHaveClass('text-sm', 'font-medium', 'text-gray-500')
      })
    })

    it('should maintain proper heading hierarchy', async () => {
      render(<UserProfilePage />)

      const heading = await screen.findByRole('heading', { name: mockUserProfile.fullName })
      expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-white')
    })
  })
}) 