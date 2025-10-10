// Transcription service that handles file processing and notifications

export interface TranscriptionJob {
  id: string
  fileName: string
  fileSize: number
  fileDuration?: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  transcript?: string
  error?: string
  createdAt: Date
  completedAt?: Date
}

export class TranscriptionService {
  private static instance: TranscriptionService
  private jobs: Map<string, TranscriptionJob> = new Map()
  private listeners: Map<string, (job: TranscriptionJob) => void> = new Map()

  static getInstance(): TranscriptionService {
    if (!TranscriptionService.instance) {
      TranscriptionService.instance = new TranscriptionService()
    }
    return TranscriptionService.instance
  }

  // Start transcription job
  async startTranscription(file: File): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const job: TranscriptionJob = {
      id: jobId,
      fileName: file.name,
      fileSize: file.size,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    }

    this.jobs.set(jobId, job)
    
    // Start processing (simulate async transcription)
    this.processTranscription(jobId, file)
    
    return jobId
  }

  // Get job status
  getJob(jobId: string): TranscriptionJob | undefined {
    return this.jobs.get(jobId)
  }

  // Listen to job updates
  onJobUpdate(jobId: string, callback: (job: TranscriptionJob) => void): () => void {
    this.listeners.set(jobId, callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(jobId)
    }
  }

  // Simulate transcription processing
  private async processTranscription(jobId: string, file: File) {
    const job = this.jobs.get(jobId)
    if (!job) return

    try {
      // Update status to processing
      this.updateJob(jobId, { 
        status: 'processing',
        progress: 10 
      })

      // Simulate file upload and processing time
      await this.simulateProgress(jobId, [20, 40, 60, 80, 95])

      // Simulate transcription result
      const transcript = this.generateMockTranscript(file.name)
      
      // Complete the job
      this.updateJob(jobId, {
        status: 'completed',
        progress: 100,
        transcript,
        completedAt: new Date(),
      })

      // Trigger notification
      await this.notifyTranscriptionComplete(job, transcript)

    } catch (error) {
      // Handle transcription failure
      this.updateJob(jobId, {
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Transcription failed',
        completedAt: new Date(),
      })

      // Trigger failure notification
      await this.notifyTranscriptionFailed(job, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // Update job and notify listeners
  private updateJob(jobId: string, updates: Partial<TranscriptionJob>) {
    const job = this.jobs.get(jobId)
    if (!job) return

    const updatedJob = { ...job, ...updates }
    this.jobs.set(jobId, updatedJob)

    // Notify listener
    const listener = this.listeners.get(jobId)
    if (listener) {
      listener(updatedJob)
    }
  }

  // Simulate processing progress
  private async simulateProgress(jobId: string, progressSteps: number[]) {
    for (const progress of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000)) // 1-3 seconds
      this.updateJob(jobId, { progress })
    }
  }

  // Generate mock transcript
  private generateMockTranscript(fileName: string): string {
    const mockTranscripts = [
      "Welcome to today's lecture on artificial intelligence. In this session, we'll explore the fundamentals of machine learning and its applications in modern technology. AI has revolutionized various industries, from healthcare to finance, and continues to shape our digital future.",
      
      "Good morning, class. Today we're discussing the principles of software engineering. We'll cover design patterns, code architecture, and best practices for building scalable applications. Remember that clean code is not just about functionality, but also about maintainability and readability.",
      
      "Let's begin our exploration of data structures and algorithms. Understanding how to efficiently store and manipulate data is crucial for any programmer. We'll start with arrays and linked lists, then move on to more complex structures like trees and graphs.",
      
      "In today's physics lecture, we'll examine the laws of thermodynamics. These fundamental principles govern energy transfer and transformation in all physical systems. The first law states that energy cannot be created or destroyed, only transformed from one form to another.",
    ]

    return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)]
  }

  // Notify transcription completion
  private async notifyTranscriptionComplete(job: TranscriptionJob, transcript: string) {
    try {
      // Create notification via API
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Transcription Complete! 🎉',
          message: `Your audio file "${job.fileName}" has been successfully transcribed and is ready to view.`,
          type: 'transcription_complete',
          data: {
            transcriptionId: job.id,
            fileName: job.fileName,
            duration: job.fileDuration,
            wordCount: transcript.split(' ').length,
          },
        }),
      })

      console.log(`Transcription completed for ${job.fileName}`)
    } catch (error) {
      console.error('Error sending completion notification:', error)
    }
  }

  // Notify transcription failure
  private async notifyTranscriptionFailed(job: TranscriptionJob, errorMessage: string) {
    try {
      // Create notification via API
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Transcription Failed ❌',
          message: `Failed to transcribe "${job.fileName}": ${errorMessage}`,
          type: 'transcription_failed',
          data: {
            transcriptionId: job.id,
            fileName: job.fileName,
            error: errorMessage,
          },
        }),
      })

      console.log(`Transcription failed for ${job.fileName}: ${errorMessage}`)
    } catch (error) {
      console.error('Error sending failure notification:', error)
    }
  }

  // Get all jobs for debugging
  getAllJobs(): TranscriptionJob[] {
    return Array.from(this.jobs.values())
  }
}

// Export singleton instance
export const transcriptionService = TranscriptionService.getInstance()
