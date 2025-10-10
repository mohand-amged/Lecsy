import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/lib/auth/AuthContext'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  image: null,
  ...overrides,
})

export const createMockSession = (overrides = {}) => ({
  id: 'test-session-id',
  userId: 'test-user-id',
  token: 'test-session-token',
  expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
  ipAddress: '127.0.0.1',
  userAgent: 'Test User Agent',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockTranscription = (overrides = {}) => ({
  id: 'test-transcription-id',
  userId: 'test-user-id',
  fileName: 'test-audio.mp3',
  fileSize: 1024000,
  fileDuration: 120.5,
  language: 'en',
  transcript: 'This is a test transcription',
  jobId: 'test-job-id',
  status: 'completed',
  estimatedCost: 0.50,
  retryCount: 0,
  errorMessage: null,
  createdAt: new Date(),
  completedAt: new Date(),
  ...overrides,
})

export const mockLocalStorage = () => {
  const store: { [key: string]: string } = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    get store() {
      return { ...store }
    }
  }
}

export const mockFetch = (response: any, ok = true, status = 200) => {
  return jest.fn().mockResolvedValue({
    ok,
    status,
    json: jest.fn().mockResolvedValue(response),
    text: jest.fn().mockResolvedValue(JSON.stringify(response)),
  })
}

export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Mock router utilities
export const createMockRouter = (overrides = {}) => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  ...overrides,
})

// Form testing utilities
export const fillForm = async (user: any, fields: { [key: string]: string }) => {
  for (const [label, value] of Object.entries(fields)) {
    const input = document.querySelector(`[aria-label="${label}"]`) || 
                  document.querySelector(`label[for*="${label.toLowerCase()}"]`)?.nextElementSibling ||
                  document.querySelector(`input[name="${label.toLowerCase()}"]`)
    
    if (input) {
      await user.clear(input)
      await user.type(input, value)
    }
  }
}

// Error boundary for testing
export class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Test Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong: {this.state.error?.message}</div>
    }

    return this.props.children
  }
}

// Custom hooks for testing
export const useTestAuth = () => {
  const [user, setUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)

  return {
    user,
    loading,
    signIn: jest.fn().mockImplementation(async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 100))
      setUser(createMockUser())
      setLoading(false)
      return { success: true }
    }),
    signUp: jest.fn().mockImplementation(async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 100))
      setUser(createMockUser())
      setLoading(false)
      return { success: true }
    }),
    signOut: jest.fn().mockImplementation(async () => {
      setUser(null)
    }),
    checkAuth: jest.fn(),
  }
}

// Accessibility testing helpers
export const checkAccessibility = async (container: HTMLElement) => {
  // Check for basic accessibility requirements
  const buttons = container.querySelectorAll('button')
  const inputs = container.querySelectorAll('input')
  const labels = container.querySelectorAll('label')

  // Check that all buttons have accessible names
  buttons.forEach(button => {
    const hasAccessibleName = 
      button.getAttribute('aria-label') ||
      button.textContent?.trim() ||
      button.querySelector('[aria-hidden="false"]')
    
    if (!hasAccessibleName) {
      console.warn('Button without accessible name found:', button)
    }
  })

  // Check that all inputs have labels
  inputs.forEach(input => {
    const hasLabel = 
      input.getAttribute('aria-label') ||
      input.getAttribute('aria-labelledby') ||
      labels.length > 0

    if (!hasLabel) {
      console.warn('Input without label found:', input)
    }
  })
}

// Performance testing helpers
export const measureRenderTime = (renderFn: () => void) => {
  const start = performance.now()
  renderFn()
  const end = performance.now()
  return end - start
}

export const expectRenderTimeToBeLessThan = (renderFn: () => void, maxTime: number) => {
  const renderTime = measureRenderTime(renderFn)
  expect(renderTime).toBeLessThan(maxTime)
}
