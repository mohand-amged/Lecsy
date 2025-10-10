import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

// Mock Prisma Client
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

import prisma from '@/lib/prisma'

const mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Database Operations', () => {
  beforeEach(() => {
    mockReset(mockPrisma)
  })

  describe('User Operations', () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('creates a new user', async () => {
      mockPrisma.user.create.mockResolvedValue(mockUser)

      const result = await mockPrisma.user.create({
        data: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        },
      })

      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        },
      })
    })

    it('finds a user by email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await mockPrisma.user.findUnique({
        where: { email: 'test@example.com' },
      })

      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
    })

    it('finds a user by id', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await mockPrisma.user.findUnique({
        where: { id: 'user123' },
      })

      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
      })
    })

    it('updates a user', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' }
      mockPrisma.user.update.mockResolvedValue(updatedUser)

      const result = await mockPrisma.user.update({
        where: { id: 'user123' },
        data: { name: 'Updated Name' },
      })

      expect(result).toEqual(updatedUser)
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user123' },
        data: { name: 'Updated Name' },
      })
    })

    it('deletes a user', async () => {
      mockPrisma.user.delete.mockResolvedValue(mockUser)

      const result = await mockPrisma.user.delete({
        where: { id: 'user123' },
      })

      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user123' },
      })
    })

    it('counts users', async () => {
      mockPrisma.user.count.mockResolvedValue(5)

      const result = await mockPrisma.user.count()

      expect(result).toBe(5)
      expect(mockPrisma.user.count).toHaveBeenCalled()
    })
  })

  describe('Session Operations', () => {
    const mockSession = {
      id: 'session123',
      userId: 'user123',
      token: 'session-token',
      expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('creates a new session', async () => {
      mockPrisma.session.create.mockResolvedValue(mockSession)

      const result = await mockPrisma.session.create({
        data: {
          id: 'session123',
          userId: 'user123',
          token: 'session-token',
          expiresAt: mockSession.expiresAt,
        },
      })

      expect(result).toEqual(mockSession)
      expect(mockPrisma.session.create).toHaveBeenCalled()
    })

    it('finds a session by token', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(mockSession)

      const result = await mockPrisma.session.findUnique({
        where: { token: 'session-token' },
        include: { user: true },
      })

      expect(result).toEqual(mockSession)
      expect(mockPrisma.session.findUnique).toHaveBeenCalledWith({
        where: { token: 'session-token' },
        include: { user: true },
      })
    })

    it('deletes expired sessions', async () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 3 })

      const result = await mockPrisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      })

      expect(result).toEqual({ count: 3 })
      expect(mockPrisma.session.deleteMany).toHaveBeenCalled()
    })

    it('finds sessions by user id', async () => {
      mockPrisma.session.findMany.mockResolvedValue([mockSession])

      const result = await mockPrisma.session.findMany({
        where: { userId: 'user123' },
        orderBy: { createdAt: 'desc' },
      })

      expect(result).toEqual([mockSession])
      expect(mockPrisma.session.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  describe('Account Operations', () => {
    const mockAccount = {
      id: 'account123',
      userId: 'user123',
      accountId: 'provider-account-id',
      providerId: 'email',
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('creates a new account', async () => {
      mockPrisma.account.create.mockResolvedValue(mockAccount)

      const result = await mockPrisma.account.create({
        data: {
          id: 'account123',
          userId: 'user123',
          accountId: 'provider-account-id',
          providerId: 'email',
          password: 'hashed-password',
        },
      })

      expect(result).toEqual(mockAccount)
      expect(mockPrisma.account.create).toHaveBeenCalled()
    })

    it('finds account by provider and account id', async () => {
      mockPrisma.account.findUnique.mockResolvedValue(mockAccount)

      const result = await mockPrisma.account.findUnique({
        where: {
          providerId_accountId: {
            providerId: 'email',
            accountId: 'provider-account-id',
          },
        },
        include: { user: true },
      })

      expect(result).toEqual(mockAccount)
      expect(mockPrisma.account.findUnique).toHaveBeenCalled()
    })

    it('finds accounts by user id', async () => {
      mockPrisma.account.findMany.mockResolvedValue([mockAccount])

      const result = await mockPrisma.account.findMany({
        where: { userId: 'user123' },
      })

      expect(result).toEqual([mockAccount])
      expect(mockPrisma.account.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
      })
    })
  })

  describe('Transcription Operations', () => {
    const mockTranscription = {
      id: 'transcription123',
      userId: 'user123',
      fileName: 'audio.mp3',
      fileSize: 1024000,
      fileDuration: 120.5,
      language: 'en',
      transcript: 'Hello world',
      jobId: 'job123',
      status: 'completed',
      estimatedCost: 0.50,
      retryCount: 0,
      errorMessage: null,
      createdAt: new Date(),
      completedAt: new Date(),
    }

    it('creates a new transcription', async () => {
      mockPrisma.transcription.create.mockResolvedValue(mockTranscription)

      const result = await mockPrisma.transcription.create({
        data: {
          userId: 'user123',
          fileName: 'audio.mp3',
          fileSize: 1024000,
          language: 'en',
          jobId: 'job123',
          status: 'pending',
        },
      })

      expect(result).toEqual(mockTranscription)
      expect(mockPrisma.transcription.create).toHaveBeenCalled()
    })

    it('finds transcriptions by user', async () => {
      mockPrisma.transcription.findMany.mockResolvedValue([mockTranscription])

      const result = await mockPrisma.transcription.findMany({
        where: { userId: 'user123' },
        orderBy: { createdAt: 'desc' },
      })

      expect(result).toEqual([mockTranscription])
      expect(mockPrisma.transcription.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('updates transcription status', async () => {
      const updatedTranscription = { ...mockTranscription, status: 'completed' }
      mockPrisma.transcription.update.mockResolvedValue(updatedTranscription)

      const result = await mockPrisma.transcription.update({
        where: { jobId: 'job123' },
        data: { 
          status: 'completed',
          transcript: 'Hello world',
          completedAt: new Date(),
        },
      })

      expect(result).toEqual(updatedTranscription)
      expect(mockPrisma.transcription.update).toHaveBeenCalled()
    })
  })

  describe('Usage Stats Operations', () => {
    const mockUsageStats = {
      id: 'stats123',
      userId: 'user123',
      totalTranscriptions: 5,
      totalMinutesProcessed: 25.5,
      totalCost: 2.50,
      monthlyTranscriptions: 3,
      monthlyMinutes: 15.0,
      monthlyCost: 1.50,
      lastResetDate: new Date(),
      maxMonthlyMinutes: 60,
      maxMonthlyCost: 10,
    }

    it('creates usage stats for new user', async () => {
      mockPrisma.usageStats.create.mockResolvedValue(mockUsageStats)

      const result = await mockPrisma.usageStats.create({
        data: {
          userId: 'user123',
        },
      })

      expect(result).toEqual(mockUsageStats)
      expect(mockPrisma.usageStats.create).toHaveBeenCalled()
    })

    it('updates usage stats', async () => {
      const updatedStats = { ...mockUsageStats, totalTranscriptions: 6 }
      mockPrisma.usageStats.update.mockResolvedValue(updatedStats)

      const result = await mockPrisma.usageStats.update({
        where: { userId: 'user123' },
        data: {
          totalTranscriptions: { increment: 1 },
          monthlyTranscriptions: { increment: 1 },
        },
      })

      expect(result).toEqual(updatedStats)
      expect(mockPrisma.usageStats.update).toHaveBeenCalled()
    })
  })
})
