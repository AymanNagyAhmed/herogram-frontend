import { render, screen, fireEvent, waitFor, waitForRouter } from '../../test-utils'
import { act } from '@testing-library/react'
import RegisterPage from '@/user/register/page'
import { updateUserProfile } from '@/lib/services/user.service'
import { getPreferredLocations, getProgrammingSkills } from '@/lib/services/options.service'
import Cookies from 'js-cookie'

// Create mock functions at module level
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn()
}

// Mock next/navigation before any imports
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/user/register'
}))

// Mock js-cookie with a factory function
jest.mock('js-cookie', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn()
  }
}))

jest.mock('@/lib/services/user.service', () => ({
  updateUserProfile: jest.fn(),
  UserApiError: class UserApiError extends Error {
    constructor(message: string, public status: number, public path: string) {
      super(message)
      this.name = 'UserApiError'
    }
  }
}))

jest.mock('@/lib/services/options.service', () => ({
  getPreferredLocations: jest.fn(),
  getProgrammingSkills: jest.fn()
}))

describe('RegisterPage', () => {
  const mockLocations = [
    { id: 1, locationName: 'Remote' },
    { id: 2, locationName: 'Office' }
  ]

  const mockSkills = [
    { id: 1, name: 'JavaScript' },
    { id: 2, name: 'TypeScript' },
    { id: 3, name: 'React' }
  ]

  const mockUserData = {
    id: 1,
    email: 'test@example.com',
    fullName: '',
    dateOfBirth: '',
    preferredLocation: null,
    resumeSummary: '',
    programmingSkills: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset all mocks
    mockRouter.replace.mockReset()
    mockRouter.push.mockReset()
    
    // Setup mock services
    ;(getPreferredLocations as jest.Mock).mockResolvedValue(mockLocations)
    ;(getProgrammingSkills as jest.Mock).mockResolvedValue(mockSkills)
    
    // Setup default cookie mock
    ;(Cookies.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'access_token') return 'mock-token'
      if (key === 'user_data') return JSON.stringify(mockUserData)
      return null
    })
  })

//   it('redirects to login if no access token', async () => {
//     // Mock cookies to return null before rendering
//     ;(Cookies.get as jest.Mock).mockReturnValue(null)

//     // Render component and wait for redirect
//     render(<RegisterPage />)

//     // Wait for the redirect with a longer timeout and retry interval
//     await waitFor(() => {
//       expect(mockRouter.replace).toHaveBeenCalledWith('/')
//     }, { 
//       timeout: 5000,
//       interval: 100
//     })
//   })

  it('loads and displays form after fetching options', async () => {
    render(<RegisterPage />)

    // Wait for loading to complete and form to be rendered
    await waitFor(() => {
      expect(screen.getByText('Complete Your Profile')).toBeInTheDocument()
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    })

    // Wait for options to be loaded
    await waitFor(() => {
      // Check locations
      expect(screen.getByText('Remote')).toBeInTheDocument()
      expect(screen.getByText('Office')).toBeInTheDocument()

      // Check skills
      mockSkills.forEach(skill => {
        expect(screen.getByText(skill.name)).toBeInTheDocument()
      })
    })
  })

  it('handles form submission with valid data', async () => {
    const mockResponse = {
      success: true,
      statusCode: 200,
      message: 'Profile updated successfully',
      data: {
        ...mockUserData,
        fullName: 'John Doe',
        dateOfBirth: '1990-01-01',
        preferredLocation: mockLocations[0],
        resumeSummary: 'Test summary',
        programmingSkills: [mockSkills[0]]
      }
    }

    ;(updateUserProfile as jest.Mock).mockResolvedValueOnce(mockResponse)

    render(<RegisterPage />)

    // Wait for form and options to load
    await waitFor(() => {
      expect(screen.getByText('Complete Your Profile')).toBeInTheDocument()
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
    })

    // Fill form with valid data
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'John Doe' }
      })
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: '1990-01-01' }
      })
      fireEvent.change(screen.getByLabelText(/preferred location/i), {
        target: { value: '1' }
      })
      fireEvent.change(screen.getByLabelText(/resume summary/i), {
        target: { value: 'Test summary' }
      })
      // Use getByText instead of getByLabelText for checkbox
      const checkbox = screen.getByText('JavaScript').closest('label')!
        .querySelector('input')!
      fireEvent.click(checkbox)
    })

    // Submit form
    await act(async () => {
      fireEvent.submit(screen.getByRole('form'))
    })

    // Verify API call
    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalledWith(1, {
        fullName: 'John Doe',
        dateOfBirth: '1990-01-01',
        preferredLocationId: 1,
        resumeSummary: 'Test summary',
        programmingSkills: [1]
      })
    })
  })

  it('displays validation errors for invalid input', async () => {
    render(<RegisterPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Your Profile')).toBeInTheDocument()
    })

    // Get form elements
    const form = screen.getByRole('form')

    // Submit empty form
    await act(async () => {
      fireEvent.submit(form)
    })

    // Check for validation errors one by one
    await waitFor(() => {
      const errors = [
        'Full name must be at least 2 characters',
        'You must be at least 18 years old',
        'Resume summary must be at least 5 characters',
        'Please select a location',
        'Select at least one skill'
      ]

      errors.forEach(error => {
        expect(screen.getByText(error)).toBeInTheDocument()
      })
    }, { timeout: 3000 })
  })

  it('handles API errors during submission', async () => {
    const errorMessage = 'Failed to update profile'
    ;(updateUserProfile as jest.Mock).mockRejectedValueOnce(
      new Error(errorMessage)
    )

    render(<RegisterPage />)

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    })

    // Fill form with valid data
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'John Doe' }
      })
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: '1990-01-01' }
      })
      fireEvent.change(screen.getByLabelText(/preferred location/i), {
        target: { value: '1' }
      })
      fireEvent.change(screen.getByLabelText(/resume summary/i), {
        target: { value: 'Test summary' }
      })
      fireEvent.click(screen.getByLabelText('JavaScript'))
    })

    // Submit form
    await act(async () => {
      fireEvent.submit(screen.getByRole('form'))
    })

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    })
  })

  it('clears field errors when user starts typing', async () => {
    render(<RegisterPage />)

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    })

    // Submit empty form to trigger validation error
    await act(async () => {
      fireEvent.submit(screen.getByRole('form'))
    })

    await waitFor(() => {
      expect(screen.getByText('Full name must be at least 2 characters')).toBeInTheDocument()
    })

    // Start typing to clear error
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'J' }
      })
    })

    await waitFor(() => {
      expect(screen.queryByText('Full name must be at least 2 characters')).not.toBeInTheDocument()
    })
  })
}) 