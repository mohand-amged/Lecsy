"use client"

import * as React from "react"
import { useDropzone, FileRejection } from "react-dropzone"
import { Upload, File, CheckCircle, AlertCircle, X, Languages } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UploadedFile {
  file: File
  progress: number
  status: "uploading" | "transcribing" | "success" | "error"
  id: string
  transcript?: string
  jobId?: string
  error?: string
}

interface FileUploadProps {
  onFileUpload?: (files: File[]) => void
  onTranscriptionComplete?: (fileId: string, transcript: string) => void
  maxSize?: number // in bytes
  className?: string
  enableTranscription?: boolean // NEW: Toggle transcription feature
}

const ACCEPTED_AUDIO_TYPES = {
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/mp4': ['.m4a'],
  'audio/x-m4a': ['.m4a'],
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export default function FileUpload({ 
  onFileUpload, 
  onTranscriptionComplete,
  maxSize = MAX_FILE_SIZE,
  className,
  enableTranscription = true // NEW: Enable by default
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([])
  const [language, setLanguage] = React.useState<string>("en") // NEW: Language state
  const { addToast } = useToast()

  // NEW: Transcription function
  const transcribeFile = React.useCallback(async (fileId: string, file: File) => {
    try {
      // Update status to transcribing
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, status: "transcribing" as const }
            : f
        )
      )
  
      const formData = new FormData()
      formData.append('audio', file)
      formData.append('language', language)
  
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed')
      }
  
      // Extract transcript text
      const transcript = data.transcript?.results
        ?.map((result: { alternatives?: { content?: string }[] }) => 
          result.alternatives?.[0]?.content || ''
        )
        .join(' ') || 'No transcript available'
  
      // Update with success
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { 
                ...f, 
                status: "success" as const, 
                transcript,
                jobId: data.jobId 
              }
            : f
        )
      )
  
      addToast({
        title: "Transcription Complete",
        description: `Successfully transcribed ${file.name}`,
        variant: "default"
      })
  
      if (onTranscriptionComplete) {
        onTranscriptionComplete(fileId, transcript)
      }
  
    } catch (error: unknown) {
      let message = "Unknown error occurred"
      if (error instanceof Error) message = error.message
  
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { 
                ...f, 
                status: "error" as const, 
                error: message 
              }
            : f
        )
      )
  
      addToast({
        title: "Transcription Failed",
        description: message,
        variant: "destructive"
      })
    }
  }, [language, addToast, onTranscriptionComplete])
  

  // MODIFIED: Upload simulation now triggers transcription
  const simulateUpload = React.useCallback((fileId: string, file: File) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, progress: 100 }
              : f
          )
        )
        
        // NEW: Start transcription after upload completes
        if (enableTranscription) {
          transcribeFile(fileId, file)
        } else {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, status: "success" as const }
                : f
            )
          )
          
          addToast({
            title: "Upload Complete",
            description: "File uploaded successfully!",
            variant: "default"
          })
        }
      } else {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, progress: Math.min(progress, 100) }
              : f
          )
        )
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [addToast, enableTranscription, transcribeFile])

  const onDrop = React.useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // Handle rejected files
      if (fileRejections.length > 0) {
        fileRejections.forEach((rejection) => {
          const { file, errors } = rejection

          const errorMessage = errors
            .map((error) => {
              switch (error.code) {
                case "file-too-large":
                  return `File "${file.name}" is too large. Maximum size is ${Math.round(
                    maxSize / (1024 * 1024)
                  )}MB.`

                case "file-invalid-type":
                  return `File "${file.name}" is not a supported audio format. Please use MP3, WAV, or M4A files.`

                default:
                  return `Error with file "${file.name}": ${error.message}`
              }
            })
            .join(" ")

          addToast({
            title: "Upload Error",
            description: errorMessage,
            variant: "destructive",
          })
        })
      }

      // Handle accepted files
      if (acceptedFiles.length > 0) {
        const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
          file,
          progress: 0,
          status: "uploading" as const,
          id: Math.random().toString(36).substring(2, 9),
        }))

        setUploadedFiles((prev) => [...prev, ...newFiles])

        // MODIFIED: Pass file to simulateUpload
        newFiles.forEach((uploadFile) => {
          simulateUpload(uploadFile.id, uploadFile.file)
        })

        if (onFileUpload) {
          onFileUpload(acceptedFiles)
        }

        addToast({
          title: "Upload Started",
          description: `Started uploading ${acceptedFiles.length} file${
            acceptedFiles.length > 1 ? "s" : ""
          }.`,
          variant: "default",
        })
      }
    },
    [maxSize, onFileUpload, addToast, simulateUpload]
  )

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  // NEW: Copy transcript to clipboard
  const copyTranscript = (transcript: string) => {
    navigator.clipboard.writeText(transcript)
    addToast({
      title: "Copied",
      description: "Transcript copied to clipboard",
      variant: "default"
    })
  }

  // NEW: Download transcript
  const downloadTranscript = (fileName: string, transcript: string) => {
    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}-transcript.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_AUDIO_TYPES,
    maxSize,
    multiple: true
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardContent className="p-6">
          {/* NEW: Language selector */}
          {enableTranscription && (
            <div className="mb-4 flex items-center space-x-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic (العربية)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
              isDragActive && !isDragReject && "border-primary bg-primary/5",
              isDragReject && "border-destructive bg-destructive/5",
              !isDragActive && "border-border hover:border-primary/50 hover:bg-accent/30"
            )}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4">
              <div className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center transition-colors",
                isDragActive && !isDragReject && "bg-primary/10",
                isDragReject && "bg-destructive/10",
                !isDragActive && "bg-muted"
              )}>
                <Upload className={cn(
                  "h-8 w-8",
                  isDragActive && !isDragReject && "text-primary",
                  isDragReject && "text-destructive",
                  !isDragActive && "text-muted-foreground"
                )} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {isDragActive && !isDragReject && "Drop your audio files here"}
                  {isDragReject && "Some files are not supported"}
                  {!isDragActive && "Upload Audio Files"}
                </h3>
                
                <p className="text-sm text-muted-foreground">
                  {!isDragActive && "Drag & drop your audio files here, or click to browse"}
                  {isDragActive && !isDragReject && "Release to upload your files"}
                  {isDragReject && "Please upload only MP3, WAV, or M4A files"}
                </p>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Supported formats: MP3, WAV, M4A</p>
                <p>Maximum file size: {Math.round(maxSize / (1024 * 1024))}MB</p>
                {enableTranscription && (
                  <p className="text-primary">✓ Auto-transcription enabled</p>
                )}
              </div>
              
              {!isDragActive && (
                <Button type="button" variant="outline">
                  Choose Files
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MODIFIED: Upload Progress with Transcription Status */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">
              {enableTranscription ? "Upload & Transcription Progress" : "Upload Progress"}
            </h4>
            <div className="space-y-4">
              {uploadedFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {uploadFile.status === "uploading" && (
                        <File className="h-4 w-4 text-muted-foreground animate-pulse" />
                      )}
                      {uploadFile.status === "transcribing" && (
                        <File className="h-4 w-4 text-blue-500 animate-pulse" />
                      )}
                      {uploadFile.status === "success" && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {uploadFile.status === "error" && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate font-medium">
                          {uploadFile.file.name}
                        </span>
                        <span className="text-muted-foreground">
                          {formatFileSize(uploadFile.file.size)}
                        </span>
                      </div>
                      
                      <div className="mt-1">
                        <Progress
                          value={uploadFile.progress}
                          className="h-1.5"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>
                          {uploadFile.status === "uploading" && `Uploading: ${Math.round(uploadFile.progress)}%`}
                          {uploadFile.status === "transcribing" && "Transcribing..."}
                          {uploadFile.status === "success" && "Complete"}
                          {uploadFile.status === "error" && `Failed: ${uploadFile.error}`}
                        </span>
                        {uploadFile.jobId && (
                          <span className="text-xs">Job: {uploadFile.jobId}</span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* NEW: Transcript Display */}
                  {uploadFile.transcript && (
                    <div className="ml-7 p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          TRANSCRIPT
                        </span>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyTranscript(uploadFile.transcript!)}
                            className="h-7 text-xs"
                          >
                            Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadTranscript(uploadFile.file.name, uploadFile.transcript!)}
                            className="h-7 text-xs"
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {uploadFile.transcript}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}