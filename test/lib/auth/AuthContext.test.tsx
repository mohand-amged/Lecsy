import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext'
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

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  describe('Initial State', () => {
    it('starts with null user and loading true', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      expect(result.current.user).toBeNull()
      expect(result.current.loading).toBe(true)
    })

    it('loads user from localStorage if available', async () => {
      const userData = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      }
      localStorage.setItem('lecsy-user-session', JSON.stringify(userData))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(userData)
    })

    it('handles invalid localStorage data gracefully', async () => {
      localStorage.setItem('lecsy-user-session', 'invalid-json')

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(localStorage.getItem('lecsy-user-session')).toBeNull()
    })
  })

  describe('Sign In', () => {
    it('handles successful sign in', async () => {
      const mockUser = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'avatar.jpg',
      }

      mockAuthClient.signIn.email.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      let signInResult
      await act(async () => {
        signInResult = await result.current.signIn('john@example.com', 'password123')
      })

      expect(signInResult).toEqual({ success: true })
      expect(result.current.user).toEqual({
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'avatar.jpg',
      })
      expect(localStorage.getItem('lecsy-user-session')).toBeTruthy()
    })

    it('handles sign in with null name gracefully', async () => {
      const mockUser = {
        id: 'user123',
        name: null,
        email: 'john@example.com',
        image: null,
      }

      mockAuthClient.signIn.email.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.signIn('john@example.com', 'password123')
      })

      expect(result.current.user?.name).toBe('')
      expect(result.current.user?.image).toBeUndefined()
    })

    it('handles sign in error', async () => {
      mockAuthClient.signIn.email.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      let signInResult
      await act(async () => {
        signInResult = await result.current.signIn('john@example.com', 'wrongpassword')
      })

      expect(signInResult).toEqual({ success: false, error: 'Invalid credentials' })
      expect(result.current.user).toBeNull()
    })

    it('handles sign in exception', async () => {
      mockAuthClient.signIn.email.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      let signInResult
      await act(async () => {
        signInResult = await result.current.signIn('john@example.com', 'password123')
      })

      expect(signInResult).toEqual({ success: false, error: 'Network error' })
    })
  })

  describe('Sign Up', () => {
    it('handles successful sign up', async () => {
      const mockUser = {
        id: 'user456',
        name: 'Jane Doe',
        email: 'jane@example.com',
        image: null,
      }

      mockAuthClient.signUp.email.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      let signUpResult
      await act(async () => {
        signUpResult = await result.current.signUp('Jane Doe', 'jane@example.com', 'password123')
      })

      expect(signUpResult).toEqual({ success: true })
      expect(result.current.user).toEqual({
        id: 'user456',
        name: 'Jane Doe',
        email: 'jane@example.com',
        image: undefined,
      })
    })

    it('handles sign up error', async () => {
      mockAuthClient.signUp.email.mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      let signUpResult
      await act(async () => {
        signUpResult = await result.current.signUp('Jane Doe', 'jane@example.com', 'password123')
      })

      expect(signUpResult).toEqual({ success: false, error: 'Email already exists' })
      expect(result.current.user).toBeNull()
    })
  })

  describe('Sign Out', () => {
    it('handles successful sign out', async () => {
      // Set up initial user state
      const userData = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      }
      localStorage.setItem('lecsy-user-session', JSON.stringify(userData))

      mockAuthClient.signOut.mockResolvedValue({
        data: null,
        error: null,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.user).toEqual(userData)
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(result.current.user).toBeNull()
      expect(localStorage.getItem('lecsy-user-session')).toBeNull()
      expect(mockPush).toHaveBeenCalledWith('/auth/signin')
    })

    it('handles sign out error gracefully', async () => {
      mockAuthClient.signOut.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.signOut()
      })

      expect(result.current.user).toBeNull()
      expect(localStorage.getItem('lecsy-user-session')).toBeNull()
      expect(mockPush).toHaveBeenCalledWith('/auth/signin')
    })
  })

  describe('Check Auth', () => {
    it('can be called manually to refresh auth state', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.checkAuth()
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('throws error when useAuth is used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')
    })
  })
})
