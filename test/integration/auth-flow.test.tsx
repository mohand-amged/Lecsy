import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '@/lib/auth/AuthContext'
import AuthForm from '@/components/AuthForm'
import { authClient } from '@/lib/auth/auth-client'

// Mock the auth client
jest.mock('@/lib/auth/auth-client', () => ({
  authClient: {
    signIn: {
      email: jest.fn(),
    },
    signUp: {
      email: jest.fn(),
    },
    signOut: jest.fn(),
  },
}))

const mockAuthClient = authClient as jest.Mocked<typeof authClient>

// Mock router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  const renderWithAuthProvider = (component: React.ReactElement) => {
    return render(
      <AuthProvider>
        {component}
      </AuthProvider>
    )
  }

  describe('Complete Sign Up Flow', () => {
    it('handles successful user registration and login', async () => {
      const user = userEvent.setup()
      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        image: null,
      }

      // Mock successful sign up
      mockAuthClient.signUp.email.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      renderWithAuthProvider(<AuthForm mode="signup" />)

      // Fill out the sign up form
      await user.type(screen.getByLabelText('Full Name'), 'John Doe')
      await user.type(screen.getByLabelText('Email Address'), 'john@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')

      // Submit the form
      await user.click(screen.getByRole('button', { name: /create account/i }))

      // Wait for the sign up to complete
      await waitFor(() => {
        expect(mockAuthClient.signUp.email).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        })
      })

      // Verify user data is stored in localStorage
      await waitFor(() => {
        const storedUser = localStorage.getItem('lecsy-user-session')
        expect(storedUser).toBeTruthy()
        const parsedUser = JSON.parse(storedUser!)
        expect(parsedUser.email).toBe('john@example.com')
        expect(parsedUser.name).toBe('John Doe')
      })

      // Verify navigation to dashboard
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('handles sign up validation errors', async () => {
      const user = userEvent.setup()

      // Mock sign up error
      mockAuthClient.signUp.email.mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' },
      })

      renderWithAuthProvider(<AuthForm mode="signup" />)

      // Fill out the form with existing email
      await user.type(screen.getByLabelText('Full Name'), 'John Doe')
      await user.type(screen.getByLabelText('Email Address'), 'existing@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')

      // Submit the form
      await user.click(screen.getByRole('button', { name: /create account/i }))

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument()
      })

      // Verify no user data is stored
      expect(localStorage.getItem('lecsy-user-session')).toBeNull()
    })
  })

  describe('Complete Sign In Flow', () => {
    it('handles successful user login', async () => {
      const user = userEvent.setup()
      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'avatar.jpg',
      }

      // Mock successful sign in
      mockAuthClient.signIn.email.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      renderWithAuthProvider(<AuthForm mode="signin" />)

      // Fill out the sign in form
      await user.type(screen.getByLabelText('Email Address'), 'john@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')

      // Submit the form
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Wait for the sign in to complete
      await waitFor(() => {
        expect(mockAuthClient.signIn.email).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'password123',
        })
      })

      // Verify user data is stored in localStorage
      await waitFor(() => {
        const storedUser = localStorage.getItem('lecsy-user-session')
        expect(storedUser).toBeTruthy()
        const parsedUser = JSON.parse(storedUser!)
        expect(parsedUser.email).toBe('john@example.com')
        expect(parsedUser.name).toBe('John Doe')
        expect(parsedUser.image).toBe('avatar.jpg')
      })

      // Verify navigation to dashboard
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('handles invalid credentials', async () => {
      const user = userEvent.setup()

      // Mock sign in error
      mockAuthClient.signIn.email.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      })

      renderWithAuthProvider(<AuthForm mode="signin" />)

      // Fill out the form with wrong credentials
      await user.type(screen.getByLabelText('Email Address'), 'john@example.com')
      await user.type(screen.getByLabelText('Password'), 'wrongpassword')

      // Submit the form
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })

      // Verify no user data is stored
      expect(localStorage.getItem('lecsy-user-session')).toBeNull()
    })
  })

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility in both forms', async () => {
      const user = userEvent.setup()

      // Test sign in form
      const { rerender } = renderWithAuthProvider(<AuthForm mode="signin" />)

      const passwordInput = screen.getByLabelText('Password')
      const toggleButtons = screen.getAllByRole('button', { name: '' }) // Eye icon buttons
      const toggleButton = toggleButtons.find(btn => btn.closest('.relative'))

      expect(passwordInput).toHaveAttribute('type', 'password')

      if (toggleButton) {
        await user.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'text')

        await user.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'password')
      }

      // Test sign up form
      rerender(
        <AuthProvider>
          <AuthForm mode="signup" />
        </AuthProvider>
      )

      const signUpPasswordInput = screen.getByLabelText('Password')
      const signUpToggleButtons = screen.getAllByRole('button', { name: '' })
      const signUpToggleButton = signUpToggleButtons.find(btn => btn.closest('.relative'))

      expect(signUpPasswordInput).toHaveAttribute('type', 'password')

      if (signUpToggleButton) {
        await user.click(signUpToggleButton)
        expect(signUpPasswordInput).toHaveAttribute('type', 'text')
      }
    })
  })

  describe('Form Validation', () => {
    it('validates email format', async () => {
      const user = userEvent.setup()

      renderWithAuthProvider(<AuthForm mode="signin" />)

      const emailInput = screen.getByLabelText('Email Address')
      await user.type(emailInput, 'invalid-email')

      // HTML5 validation should prevent form submission
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('validates required fields', () => {
      renderWithAuthProvider(<AuthForm mode="signup" />)

      const nameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')

      expect(nameInput).toBeRequired()
      expect(emailInput).toBeRequired()
      expect(passwordInput).toBeRequired()
    })

    it('validates minimum password length', () => {
      renderWithAuthProvider(<AuthForm mode="signup" />)

      const passwordInput = screen.getByLabelText('Password')
      expect(passwordInput).toHaveAttribute('minLength', '8')
    })
  })

  describe('Loading States', () => {
    it('shows loading state during authentication', async () => {
      const user = userEvent.setup()

      // Mock delayed response
      mockAuthClient.signIn.email.mockImplementation(
        () => new Promise(resolve => 
          setTimeout(() => resolve({ data: { user: { id: '1', name: 'Test', email: 'test@example.com' } }, error: null }), 100)
        )
      )

      renderWithAuthProvider(<AuthForm mode="signin" />)

      await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Check loading state
      expect(screen.getByText('Signing in...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      expect(screen.getByLabelText('Email Address')).toBeDisabled()
      expect(screen.getByLabelText('Password')).toBeDisabled()

      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByText('Signing in...')).not.toBeInTheDocument()
      }, { timeout: 200 })
    })
  })

  describe('Network Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const user = userEvent.setup()

      // Mock network error
      mockAuthClient.signIn.email.mockRejectedValue(new Error('Network error'))

      renderWithAuthProvider(<AuthForm mode="signin" />)

      await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('handles unexpected errors', async () => {
      const user = userEvent.setup()

      // Mock unexpected error
      mockAuthClient.signUp.email.mockRejectedValue('Unexpected error')

      renderWithAuthProvider(<AuthForm mode="signup" />)

      await user.type(screen.getByLabelText('Full Name'), 'Test User')
      await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText('Sign up failed')).toBeInTheDocument()
      })
    })
  })
})
