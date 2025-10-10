"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranscription } from '@/hooks/use-transcription'
import { useNotifications } from '@/lib/notifications/NotificationContext'
import { Bell, Upload, CheckCircle, AlertCircle } from 'lucide-react'

interface NotificationDemoProps {
  onTranscriptionComplete?: (jobId: string, transcript: string, fileName: string) => void
}

export default function NotificationDemo({ onTranscriptionComplete }: NotificationDemoProps) {
  const { startTranscription, activeJobs, isTranscribing } = useTranscription({
    onTranscriptionComplete
  })
  const { 
    notifications, 
    unreadCount, 
    requestNotificationPermission,
    showBrowserNotification 
  } = useNotifications()

  const handleTestUpload = async () => {
    // Create a mock file for testing
    const mockFile = new File(['mock audio content'], 'test-lecture.mp3', {
      type: 'audio/mpeg'
    })

    try {
      await startTranscription(mockFile)
    } catch (error) {
      console.error('Test transcription failed:', error)
    }
  }

  const handleTestBrowserNotification = () => {
    showBrowserNotification(
      'Test Notification 🔔',
      'This is a test browser notification from Lecsy AI!',
      { test: true }
    )
  }

  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission()
    console.log('Notification permission:', permission)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification System Demo
          </CardTitle>
          <CardDescription>
            Test the real-time notification system for transcription completion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleTestUpload}
              disabled={isTranscribing}
              className="gap-2"
              size="lg"
            >
              <Upload className="h-4 w-4" />
              {isTranscribing ? 'Processing...' : '🎙️ Upload & Create Chat'}
            </Button>
            
            <Button 
              onClick={handleTestBrowserNotification}
              variant="outline"
              className="gap-2"
            >
              <Bell className="h-4 w-4" />
              Test Browser Notification
            </Button>
            
            <Button 
              onClick={handleRequestPermission}
              variant="outline"
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Request Permission
            </Button>
          </div>

          {/* Active Jobs Status */}
          {activeJobs.size > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Active Transcription Jobs:</h4>
              {Array.from(activeJobs.values()).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{job.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {job.status} • Progress: {job.progress}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.status === 'processing' && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                    {job.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {job.status === 'failed' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notification Status */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">Notification Status:</p>
            <p className="text-sm text-muted-foreground">
              Total notifications: {notifications.length} • 
              Unread: {unreadCount} • 
              Browser permission: {typeof window !== 'undefined' ? Notification?.permission || 'unknown' : 'unknown'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-lg border ${
                    notification.read ? 'bg-muted/50' : 'bg-primary/5 border-primary/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      {notification.data && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.data.fileName && `File: ${notification.data.fileName}`}
                          {notification.data.wordCount && ` • Words: ${notification.data.wordCount}`}
                        </p>
                      )}
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-primary rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
