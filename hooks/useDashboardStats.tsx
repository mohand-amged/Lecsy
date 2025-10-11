import { useMemo } from 'react'

interface TranscriptSession {
  id: string
  title: string
  transcript: string
  timestamp: Date | string
  audioUrl?: string
  duration?: number
  wordCount?: number
  starred?: boolean
  archived?: boolean
  tags?: string[]
}

interface DashboardStats {
  total: number
  thisWeek: number
  thisMonth: number
  totalWords: number
  totalCharacters: number
  totalHours: number
  totalMinutes: number
  averageWords: number
  averageDuration: number
  starred: number
  archived: number
  recentActivity: Array<{
    date: string
    count: number
  }>
}

/**
 * Hook to calculate real statistics from transcript sessions
 * @param sessions - Array of transcript sessions
 * @returns Calculated statistics
 */
export function useDashboardStats(sessions: TranscriptSession[]): DashboardStats {
  return useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Convert timestamp to Date if needed
    const normalizedSessions = sessions.map(s => ({
      ...s,
      timestamp: typeof s.timestamp === 'string' ? new Date(s.timestamp) : s.timestamp,
      // Calculate word count if not provided
      wordCount: s.wordCount || s.transcript.trim().split(/\s+/).length,
    }))

    // Total sessions
    const total = normalizedSessions.length

    // Sessions this week
    const thisWeek = normalizedSessions.filter(
      s => s.timestamp >= weekAgo
    ).length

    // Sessions this month
    const thisMonth = normalizedSessions.filter(
      s => s.timestamp >= monthAgo
    ).length

    // Total words across all transcripts
    const totalWords = normalizedSessions.reduce(
      (acc, s) => acc + (s.wordCount || 0),
      0
    )

    // Total characters
    const totalCharacters = normalizedSessions.reduce(
      (acc, s) => acc + s.transcript.length,
      0
    )

    // Total duration in seconds
    const totalSeconds = normalizedSessions.reduce(
      (acc, s) => acc + (s.duration || 0),
      0
    )

    const totalHours = Math.floor(totalSeconds / 3600)
    const totalMinutes = Math.floor(totalSeconds / 60)

    // Average words per session
    const averageWords = total > 0 ? Math.round(totalWords / total) : 0

    // Average duration per session (in seconds)
    const averageDuration = total > 0 ? Math.round(totalSeconds / total) : 0

    // Starred count
    const starred = normalizedSessions.filter(s => s.starred).length

    // Archived count
    const archived = normalizedSessions.filter(s => s.archived).length

    // Recent activity (last 7 days)
    const recentActivity: Array<{ date: string; count: number }> = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const count = normalizedSessions.filter(s => {
        const sessionDate = s.timestamp.toISOString().split('T')[0]
        return sessionDate === dateStr
      }).length
      recentActivity.push({ date: dateStr, count })
    }

    return {
      total,
      thisWeek,
      thisMonth,
      totalWords,
      totalCharacters,
      totalHours,
      totalMinutes,
      averageWords,
      averageDuration,
      starred,
      archived,
      recentActivity,
    }
  }, [sessions])
}

/**
 * Calculate word count from transcript text
 */
export function calculateWordCount(transcript: string): number {
  return transcript.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Calculate reading time in minutes (average 200 words per minute)
 */
export function calculateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / 200)
}

/**
 * Format duration from seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * Format large numbers with K, M suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}