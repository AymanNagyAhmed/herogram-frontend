import { render, screen, fireEvent, waitFor } from './test-utils'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/page'
import { loginUser, AuthError } from '@/lib/services/auth.service'
import type { LoginResponse, LoginFormData } from '@/lib/types/auth.types'

// Mock the auth service
jest.mock('@/lib/services/auth.service', () => {
  const mockLoginUser = jest.fn<Promise<LoginResponse>, [LoginFormData]>()
  return {
    loginUser: mockLoginUser,
    AuthError: class AuthError extends Error {
      constructor(message: string, public status: number, public path: string) {
        super(message)
        this.name = 'AuthError'
      }
    }
  }
})

// Silence console.error during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterAll(() => {
  jest.restoreAllMocks()
})

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the login page correctly', () => {
    render(<LoginPage />)
    
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByText('Please sign in to your account')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('displays validation errors for invalid input', async () => {
    render(<LoginPage />)

    // Get form elements
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const form = screen.getByRole('form')

    // Fill in invalid values
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: '12345' } })

    // Submit form
    fireEvent.submit(form)

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('handles form submission with valid credentials', async () => {
    const mockLoginResponse: LoginResponse = {
      success: true,
      statusCode: 200,
      message: 'Login successful',
      path: '/api/auth/login',
      timestamp: new Date().toISOString(),
      data: {
        access_token: 'mock-token',
        user: {
          id: 1,
          email: 'user3@test.com',
          fullName: 'Test User',
          dateOfBirth: '1990-01-01',
          preferredLocation: {},
          resumeSummary: '',
          programmingSkills: []
        }
      }
    }

    ;(loginUser as jest.Mock).mockResolvedValueOnce(mockLoginResponse)

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const form = screen.getByRole('form')

    // Fill in valid values
    fireEvent.change(emailInput, { target: { value: 'user3@test.com' } })
    fireEvent.change(passwordInput, { target: { value: '123456789' } })

    // Submit form
    fireEvent.submit(form)

    expect(loginUser).toHaveBeenCalledWith({
      email: 'user3@test.com',
      password: '123456789'
    })

    await waitFor(() => {
      expect(screen.queryByText('Signing in...')).not.toBeInTheDocument()
    })
  })

  it('handles API error responses', async () => {
    const errorMessage = 'Invalid credentials'
    ;(loginUser as jest.Mock).mockRejectedValueOnce(
      new AuthError(errorMessage, 401, '/api/auth/login')
    )

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const form = screen.getByRole('form')

    // Fill in values
    fireEvent.change(emailInput, { target: { value: 'user3@test.com' } })
    fireEvent.change(passwordInput, { target: { value: '123456789' } })

    // Submit form
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('clears field errors when user starts typing', async () => {
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email address/i)
    const form = screen.getByRole('form')

    // Submit form with invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
    })

    // Start typing to clear error
    fireEvent.change(emailInput, { target: { value: 'valid@email.com' } })

    await waitFor(() => {
      expect(screen.queryByText('Invalid email address')).not.toBeInTheDocument()
    })
  })
}) 