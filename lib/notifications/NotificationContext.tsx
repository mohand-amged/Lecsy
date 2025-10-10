"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  description?: string
  timestamp?: Date
  type: 'transcription_complete' | 'transcription_failed' | 'system' | 'info' | 'success' | 'warning' | 'error' | 'feature'
  read: boolean
  actionUrl?: string
  category?: 'security' | 'billing' | 'activity' | 'announcement' | 'reminder'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  avatar?: string
  data?: {
    transcriptionId?: string
    fileName?: string
    duration?: number
    fileUrl?: string
    wordCount?: number
    error?: string
  }
  metadata?: {
    user?: string
    project?: string
    amount?: string
    [key: string]: string | undefined
  }
  createdAt: Date
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  addNotification: (notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'read'>) => Promise<void>
  markAsRead: (notificationIds: string[]) => Promise<void>
  markAllAsRead: () => Promise<void>
  fetchNotifications: () => Promise<void>
  showBrowserNotification: (title: string, message: string, data?: any) => void
  requestNotificationPermission: () => Promise<NotificationPermission>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch('/api/notifications')
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Add new notification
  const addNotification = useCallback(async (notificationData: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'read'>) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Add to local state
        setNotifications(prev => [data.notification, ...prev])
        setUnreadCount(prev => prev + 1)

        // Show browser notification if enabled
        if (notificationData.type === 'transcription_complete') {
          showBrowserNotification(
            notificationData.title,
            notificationData.message,
            notificationData.data
          )
        }
      }
    } catch (error) {
      console.error('Error adding notification:', error)
    }
  }, [])

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notificationIds.includes(notif.id) 
              ? { ...notif, read: true }
              : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [])

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      return 'denied'
    }

    // Request permission
    const permission = await Notification.requestPermission()
    return permission
  }, [])

  // Show browser notification
  const showBrowserNotification = useCallback((title: string, message: string, data?: any) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return
    }

    const notification = new Notification(title, {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'lecsy-notification',
      data: data,
      requireInteraction: true, // Keep notification until user interacts
    })

    // Handle notification click
    notification.onclick = () => {
      window.focus()
      
      // Navigate to relevant page based on notification type
      if (data?.transcriptionId) {
        window.location.href = `/dashboard?transcription=${data.transcriptionId}`
      } else {
        window.location.href = '/dashboard'
      }
      
      notification.close()
    }

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close()
    }, 10000)
  }, [])

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications()
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user, fetchNotifications])

  // Request notification permission when component mounts
  useEffect(() => {
    if (user) {
      requestNotificationPermission()
    }
  }, [user, requestNotificationPermission])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    showBrowserNotification,
    requestNotificationPermission,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
