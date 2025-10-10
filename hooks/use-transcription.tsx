"use client"

import { useState, useCallback, useRef } from 'react'
import { transcriptionService, TranscriptionJob } from '@/lib/transcription/transcription-service'
import { useNotifications } from '@/lib/notifications/NotificationContext'
import { useToast } from '@/hooks/use-toast'

export interface TranscriptionHookResult {
  startTranscription: (file: File) => Promise<string>
  getJobStatus: (jobId: string) => TranscriptionJob | undefined
  activeJobs: Map<string, TranscriptionJob>
  isTranscribing: boolean
}

interface UseTranscriptionOptions {
  onTranscriptionComplete?: (jobId: string, transcript: string, fileName: string) => void
}

export function useTranscription(options?: UseTranscriptionOptions): TranscriptionHookResult {
  const [activeJobs, setActiveJobs] = useState<Map<string, TranscriptionJob>>(new Map())
  const [isTranscribing, setIsTranscribing] = useState(false)
  const { addNotification } = useNotifications()
  const toast = useToast()
  const unsubscribeFunctions = useRef<Map<string, () => void>>(new Map())

  const startTranscription = useCallback(async (file: File): Promise<string> => {
    try {
      setIsTranscribing(true)
      
      // Start transcription job
      const jobId = await transcriptionService.startTranscription(file)
      
      // Listen to job updates
      const unsubscribe = transcriptionService.onJobUpdate(jobId, (job) => {
        setActiveJobs(prev => new Map(prev.set(jobId, job)))
        
        // Handle job completion
        if (job.status === 'completed') {
          handleTranscriptionComplete(job)
          cleanup(jobId)
        } else if (job.status === 'failed') {
          handleTranscriptionFailed(job)
          cleanup(jobId)
        }
      })
      
      // Store unsubscribe function
      unsubscribeFunctions.current.set(jobId, unsubscribe)
      
      // Add initial job to active jobs
      const initialJob = transcriptionService.getJob(jobId)
      if (initialJob) {
        setActiveJobs(prev => new Map(prev.set(jobId, initialJob)))
      }
      
      // Show initial toast
      toast.addToast({
        title: 'Transcription Started',
        description: `Processing "${file.name}"...`,
        variant: 'success',
      })
      
      return jobId
    } catch (error) {
      setIsTranscribing(false)
      toast.addToast({
        title: 'Transcription Failed',
        description: error instanceof Error ? error.message : 'Failed to start transcription',
        variant: 'destructive',
      })
      throw error
    }
  }, [addNotification, toast])

  const handleTranscriptionComplete = useCallback(async (job: TranscriptionJob) => {
    // Show success toast
    toast.addToast({
      title: '🎉 Transcription Complete!',
      description: `"${job.fileName}" has been successfully transcribed.`,
      variant: 'success',
    })

    // Add notification to the notification system
    await addNotification({
      title: 'Transcription Complete! 🎉',
      message: `Your audio file "${job.fileName}" has been successfully transcribed and is ready to view.`,
      type: 'transcription_complete',
      data: {
        transcriptionId: job.id,
        fileName: job.fileName,
        duration: job.fileDuration,
        wordCount: job.transcript ? job.transcript.split(' ').length : 0,
      },
    })

    // Trigger external callback if provided (for dashboard integration)
    if (options?.onTranscriptionComplete && job.transcript) {
      options.onTranscriptionComplete(job.id, job.transcript, job.fileName)
    }

    // Check if we should update isTranscribing
    const hasActiveJobs = Array.from(activeJobs.values()).some(j => 
      j.status === 'pending' || j.status === 'processing'
    )
    if (!hasActiveJobs) {
      setIsTranscribing(false)
    }
  }, [addNotification, toast, activeJobs, options])

  const handleTranscriptionFailed = useCallback(async (job: TranscriptionJob) => {
    // Show error toast
    toast.addToast({
      title: 'Transcription Failed',
      description: `Failed to transcribe "${job.fileName}": ${job.error}`,
      variant: 'destructive',
    })

    // Add notification to the notification system
    await addNotification({
      title: 'Transcription Failed ❌',
      message: `Failed to transcribe "${job.fileName}": ${job.error || 'Unknown error'}`,
      type: 'transcription_failed',
      data: {
        transcriptionId: job.id,
        fileName: job.fileName,
        error: job.error,
      },
    })

    // Check if we should update isTranscribing
    const hasActiveJobs = Array.from(activeJobs.values()).some(j => 
      j.status === 'pending' || j.status === 'processing'
    )
    if (!hasActiveJobs) {
      setIsTranscribing(false)
    }
  }, [addNotification, toast, activeJobs])

  const cleanup = useCallback((jobId: string) => {
    // Remove job from active jobs
    setActiveJobs(prev => {
      const newMap = new Map(prev)
      newMap.delete(jobId)
      return newMap
    })
    
    // Unsubscribe from job updates
    const unsubscribe = unsubscribeFunctions.current.get(jobId)
    if (unsubscribe) {
      unsubscribe()
      unsubscribeFunctions.current.delete(jobId)
    }
  }, [])

  const getJobStatus = useCallback((jobId: string): TranscriptionJob | undefined => {
    return transcriptionService.getJob(jobId)
  }, [])

  return {
    startTranscription,
    getJobStatus,
    activeJobs,
    isTranscribing,
  }
}
