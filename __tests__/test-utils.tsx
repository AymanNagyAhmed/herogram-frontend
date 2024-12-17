import { ReactElement } from 'react'
import { render, RenderOptions, waitFor } from '@testing-library/react'
import { AuthProvider } from '@/context/auth.context'
import { type LoginResponse, type LoginFormData } from '@/lib/types/auth.types'

// Define MockLoginUser type correctly
export type MockLoginUser = jest.MockedFunction<(credentials: LoginFormData) => Promise<LoginResponse>>

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  }),
  usePathname: () => '/'
}))

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Add a simple test to satisfy Jest
describe('test-utils', () => {
  it('renders with providers', () => {
    const TestComponent = () => <div>Test</div>
    const { container } = customRender(<TestComponent />)
    expect(container).toBeTruthy()
  })
})

// Add helper function to wait for router
export const waitForRouter = async (router: any, expectedPath: string) => {
  await waitFor(() => {
    expect(router.replace).toHaveBeenCalledWith(expectedPath)
  }, { timeout: 2000 })
} 