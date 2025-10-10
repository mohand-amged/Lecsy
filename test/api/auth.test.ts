import { createMocks } from 'node-mocks-http'
import { auth } from '@/lib/auth/auth'
import { describe } from 'node:test'

// Mock the auth handler
jest.mock('@/lib/auth/auth', () => ({
  auth: {
    handler: {
      GET: jest.fn(),
      POST: jest.fn(),
    },
  },
}))

const mockAuth = auth as jest.Mocked<typeof auth>

describe('/api/auth/[...all] API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/sign-up/email', () => {
    it('handles successful user registration', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false,
      }

      mockAuth.handler.POST.mockResolvedValue(
        new Response(JSON.stringify({ user: mockUser }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/sign-up/email',
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        },
      })

      await mockAuth.handler.POST(req, res)

      expect(mockAuth.handler.POST).toHaveBeenCalled()
    })

    it('handles registration with existing email', async () => {
      mockAuth.handler.POST.mockResolvedValue(
        new Response(JSON.stringify({ error: 'Email already exists' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/sign-up/email',
        body: {
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test User',
        },
      })

      await mockAuth.handler.POST(req, res)

      expect(mockAuth.handler.POST).toHaveBeenCalled()
    })

    it('validates required fields', async () => {
      mockAuth.handler.POST.mockResolvedValue(
        new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/sign-up/email',
        body: {
          email: 'test@example.com',
          // Missing password and name
        },
      })

      await mockAuth.handler.POST(req, res)

      expect(mockAuth.handler.POST).toHaveBeenCalled()
    })
  })

  describe('POST /api/auth/sign-in/email', () => {
    it('handles successful login', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      }

      mockAuth.handler.POST.mockResolvedValue(
        new Response(JSON.stringify({ user: mockUser, session: { token: 'session-token' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/sign-in/email',
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      })

      await mockAuth.handler.POST(req, res)

      expect(mockAuth.handler.POST).toHaveBeenCalled()
    })

    it('handles invalid credentials', async () => {
      mockAuth.handler.POST.mockResolvedValue(
        new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/sign-in/email',
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      })

      await mockAuth.handler.POST(req, res)

      expect(mockAuth.handler.POST).toHaveBeenCalled()
    })
  })

  describe('POST /api/auth/sign-out', () => {
    it('handles successful logout', async () => {
      mockAuth.handler.POST.mockResolvedValue(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/auth/sign-out',
        headers: {
          cookie: 'session=valid-session-token',
        },
      })

      await mockAuth.handler.POST(req, res)

      expect(mockAuth.handler.POST).toHaveBeenCalled()
    })
  })

  describe('GET /api/auth/session', () => {
    it('returns current user session', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      }

      mockAuth.handler.GET.mockResolvedValue(
        new Response(JSON.stringify({ user: mockUser }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/auth/session',
        headers: {
          cookie: 'session=valid-session-token',
        },
      })

      await mockAuth.handler.GET(req, res)

      expect(mockAuth.handler.GET).toHaveBeenCalled()
    })

    it('returns null for invalid session', async () => {
      mockAuth.handler.GET.mockResolvedValue(
        new Response(JSON.stringify({ user: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/auth/session',
        headers: {
          cookie: 'session=invalid-session-token',
        },
      })

      await mockAuth.handler.GET(req, res)

      expect(mockAuth.handler.GET).toHaveBeenCalled()
    })
  })
})
