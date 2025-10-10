import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthForm from '@/components/AuthForm'
import { useAuth } from '@/lib/auth/AuthContext'

// Mock the AuthContext
jest.mock('@/lib/auth/AuthContext', () => ({
  useAuth: jest.fn(),
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('AuthForm Component', () => {
  const mockSignIn = jest.fn()
  const mockSignUp = jest.fn()

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: jest.fn(),
      checkAuth: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Sign In Mode', () => {
    it('renders sign in form correctly', () => {
      render(<AuthForm mode="signin" />)
      
      expect(screen.getByText('Welcome back')).toBeInTheDocument()
      expect(screen.getByText('Sign in')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('does not show name field in sign in mode', () => {
      render(<AuthForm mode="signin" />)
      
      expect(screen.queryByLabelText('Full Name')).not.toBeInTheDocument()
    })

    it('handles successful sign in', async () => {
      const user = userEvent.setup()
      mockSignIn.mockResolvedValue({ success: true })

      render(<AuthForm mode="signin" />)
      
      await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('displays error message on sign in failure', async () => {
      const user = userEvent.setup()
      mockSignIn.mockResolvedValue({ success: false, error: 'Invalid credentials' })

      render(<AuthForm mode="signin" />)
      
      await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      render(<AuthForm mode="signin" />)
      
      const passwordInput = screen.getByLabelText('Password')
      const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Sign Up Mode', () => {
    it('renders sign up form correctly', () => {
      render(<AuthForm mode="signup" />)
      
      expect(screen.getByText('Create your account')).toBeInTheDocument()
      expect(screen.getByText('Sign up')).toBeInTheDocument()
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('shows password requirements in sign up mode', () => {
      render(<AuthForm mode="signup" />)
      
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument()
    })

    it('handles successful sign up', async () => {
      const user = userEvent.setup()
      mockSignUp.mockResolvedValue({ success: true })

      render(<AuthForm mode="signup" />)
      
      await user.type(screen.getByLabelText('Full Name'), 'John Doe')
      await user.type(screen.getByLabelText('Email Address'), 'john@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password123')
      })
    })

    it('validates required fields', async () => {
      const user = userEvent.setup()
      render(<AuthForm mode="signup" />)
      
      await user.click(screen.getByRole('button', { name: /create account/i }))
      
      // HTML5 validation should prevent form submission
      const nameInput = screen.getByLabelText('Full Name')
      const emailInput = screen.getByLabelText('Email Address')
      const passwordInput = screen.getByLabelText('Password')
      
      expect(nameInput).toBeRequired()
      expect(emailInput).toBeRequired()
      expect(passwordInput).toBeRequired()
    })

    it('enforces minimum password length', () => {
      render(<AuthForm mode="signup" />)
      
      const passwordInput = screen.getByLabelText('Password')
      expect(passwordInput).toHaveAttribute('minLength', '8')
    })
  })

  describe('Loading States', () => {
    it('disables form during submission', async () => {
      const user = userEvent.setup()
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)))

      render(<AuthForm mode="signin" />)
      
      await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      expect(screen.getByText('Signing in...')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Address')).toBeDisabled()
      expect(screen.getByLabelText('Password')).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Navigation Links', () => {
    it('shows correct navigation links for sign in mode', () => {
      render(<AuthForm mode="signin" />)
      
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
      expect(screen.getByText('Create a new account')).toBeInTheDocument()
      expect(screen.getByText('Forgot your password?')).toBeInTheDocument()
    })

    it('shows correct navigation links for sign up mode', () => {
      render(<AuthForm mode="signup" />)
      
      expect(screen.getByText('Already have an account?')).toBeInTheDocument()
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    })
  })
})
