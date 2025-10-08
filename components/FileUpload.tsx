"use client"

import * as React from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { Upload, File, CheckCircle, AlertCircle, X, Languages, MessageSquare, Play, Pause, RotateCcw, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TranscriptionResult {
  alternatives: Array<{
    content: string
  }>
}

interface TranscriptionResponse {
  transcript: {
    results: TranscriptionResult[]
  }
  jobId: string
  error?: string
}

interface UploadedFile {
  file: File
  progress: number
  status: "uploading" | "transcribing" | "success" | "error"
  id: string
  transcript?: string
  jobId?: string
  error?: string
  audioUrl?: string
}

interface FileUploadProps {
  onFileUpload?: (files: File[]) => void
  onTranscriptionComplete?: (fileId: string, transcript: string, fileName: string) => void
  maxSize?: number
  className?: string
  enableTranscription?: boolean
  uploadEndpoint?: string
  transcribeEndpoint?: string
}

const ACCEPTED_AUDIO_TYPES = {
  "audio/mpeg": [".mp3"],
  "audio/wav": [".wav"],
  "audio/mp4": [".m4a"],
  "audio/x-m4a": [".m4a"],
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_RETRIES = 3

export default function FileUpload({
  onFileUpload,
  onTranscriptionComplete,
  maxSize = MAX_FILE_SIZE,
  className,
  enableTranscription = true,
  transcribeEndpoint = "/api/transcribe",
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([])
  const [language, setLanguage] = React.useState<string>("en")
  const [playingAudio, setPlayingAudio] = React.useState<string | null>(null)
  const audioRefs = React.useRef<Map<string, HTMLAudioElement>>(new Map())
  const { addToast } = useToast()

  // Cleanup audio URLs on unmount
  React.useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => {
        if (file.audioUrl) {
          URL.revokeObjectURL(file.audioUrl)
        }
      })
      audioRefs.current.forEach((audio) => {
        audio.pause()
        audio.src = ""
      })
    }
  }, [])

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const validTypes = Object.keys(ACCEPTED_AUDIO_TYPES)
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Supported formats: MP3, WAV, M4A`,
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`,
      }
    }

    if (file.size === 0) {
      return {
        valid: false,
        error: "File is empty",
      }
    }

    return { valid: true }
  }

  const transcribeFile = React.useCallback(
    async (fileId: string, file: File, retryCount = 0) => {
      try {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: "transcribing" as const } : f))
        )

        const formData = new FormData()
        formData.append("audio", file)
        formData.append("language", language)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 min timeout

        const response = await fetch(transcribeEndpoint, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: Transcription failed`)
        }

        const data: TranscriptionResponse = await response.json()

        if (!data.transcript?.results) {
          throw new Error("Invalid response format from transcription service")
        }

        const transcript =
          data.transcript.results
            .map((result) => result.alternatives?.[0]?.content || "")
            .filter(Boolean)
            .join(" ")
            .trim() || "No transcript available"

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "success" as const,
                  transcript,
                  jobId: data.jobId,
                }
              : f
          )
        )

        addToast({
          title: "✓ Transcription Complete",
          description: `Transcribed: ${file.name}`,
        })

        if (onTranscriptionComplete) {
          onTranscriptionComplete(fileId, transcript, file.name)
        }
      } catch (error: unknown) {
        let message = "Unknown error occurred"
        
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            message = "Transcription timeout - file may be too large"
          } else {
            message = error.message
          }
        }

        // Retry logic
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying transcription (${retryCount + 1}/${MAX_RETRIES})...`)
          setTimeout(() => {
            transcribeFile(fileId, file, retryCount + 1)
          }, 2000 * (retryCount + 1)) // Exponential backoff
          return
        }

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  status: "error" as const,
                  error: message,
                }
              : f
          )
        )

        addToast({
          title: "Transcription Failed",
          description: message,
          variant: "destructive",
        })
      }
    },
    [language, addToast, onTranscriptionComplete, transcribeEndpoint]
  )

  const uploadFile = React.useCallback(
    (fileId: string, file: File) => {
      // Create audio URL for preview
      const audioUrl = URL.createObjectURL(file)
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, audioUrl } : f))
      )

      // Simulate upload progress (replace with actual upload in production)
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15

        if (progress >= 100) {
          progress = 100
          clearInterval(interval)

          setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: 100 } : f)))

          if (enableTranscription) {
            transcribeFile(fileId, file)
          } else {
            setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "success" as const } : f)))

            addToast({
              title: "Upload Complete",
              description: "File uploaded successfully!",
            })
          }
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f))
          )
        }
      }, 100)
    },
    [addToast, enableTranscription, transcribeFile]
  )

  const onDrop = React.useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        fileRejections.forEach((rejection) => {
          const { file, errors } = rejection

          const errorMessage = errors
            .map((error) => {
              switch (error.code) {
                case "file-too-large":
                  return `"${file.name}" exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`
                case "file-invalid-type":
                  return `"${file.name}" is not a supported format`
                default:
                  return error.message
              }
            })
            .join(". ")

          addToast({
            title: "Upload Error",
            description: errorMessage,
            variant: "destructive",
          })
        })
      }

      if (acceptedFiles.length > 0) {
        // Validate files
        const validatedFiles = acceptedFiles.map((file) => ({
          file,
          validation: validateFile(file),
        }))

        const validFiles = validatedFiles.filter((f) => f.validation.valid)
        const invalidFiles = validatedFiles.filter((f) => !f.validation.valid)

        // Show errors for invalid files
        invalidFiles.forEach(({ file, validation }) => {
          addToast({
            title: "Invalid File",
            description: `${file.name}: ${validation.error}`,
            variant: "destructive",
          })
        })

        if (validFiles.length === 0) return

        const newFiles: UploadedFile[] = validFiles.map(({ file }) => ({
          file,
          progress: 0,
          status: "uploading" as const,
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        }))

        setUploadedFiles((prev) => [...prev, ...newFiles])

        newFiles.forEach((uploadFileItem) => {
          uploadFile(uploadFileItem.id, uploadFileItem.file)
        })

        if (onFileUpload) {
          onFileUpload(validFiles.map((f) => f.file))
        }

        addToast({
          title: "Upload Started",
          description: `Uploading ${validFiles.length} file${validFiles.length > 1 ? "s" : ""}`,
        })
      }
    },
    [maxSize, onFileUpload, addToast, uploadFile]
  )

  const removeFile = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId)
    if (file?.audioUrl) {
      URL.revokeObjectURL(file.audioUrl)
    }
    const audio = audioRefs.current.get(fileId)
    if (audio) {
      audio.pause()
      audio.src = ""
      audioRefs.current.delete(fileId)
    }
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const retryTranscription = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId)
    if (file) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "uploading" as const, progress: 0, error: undefined }
            : f
        )
      )
      uploadFile(fileId, file.file)
    }
  }

  const clearAll = () => {
    uploadedFiles.forEach((file) => {
      if (file.audioUrl) {
        URL.revokeObjectURL(file.audioUrl)
      }
    })
    audioRefs.current.forEach((audio) => {
      audio.pause()
      audio.src = ""
    })
    audioRefs.current.clear()
    setUploadedFiles([])
    setPlayingAudio(null)
  }

  const toggleAudioPlayback = (fileId: string, audioUrl: string) => {
    let audio = audioRefs.current.get(fileId)

    if (!audio) {
      audio = new Audio(audioUrl)
      audioRefs.current.set(fileId, audio)
      
      audio.addEventListener("ended", () => {
        setPlayingAudio(null)
      })
    }

    if (playingAudio === fileId) {
      audio.pause()
      setPlayingAudio(null)
    } else {
      // Pause other audio
      audioRefs.current.forEach((otherAudio, otherId) => {
        if (otherId !== fileId) {
          otherAudio.pause()
        }
      })
      
      audio.play()
      setPlayingAudio(fileId)
    }
  }

  const copyTranscript = (transcript: string) => {
    navigator.clipboard.writeText(transcript)
    addToast({
      title: "Copied",
      description: "Transcript copied to clipboard",
    })
  }

  const downloadTranscript = (fileName: string, transcript: string, format: "txt" | "json" = "txt") => {
    let content: string
    let mimeType: string
    let extension: string

    if (format === "json") {
      content = JSON.stringify(
        {
          fileName,
          transcript,
          timestamp: new Date().toISOString(),
          language,
        },
        null,
        2
      )
      mimeType = "application/json"
      extension = "json"
    } else {
      content = transcript
      mimeType = "text/plain"
      extension = "txt"
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName.replace(/\.[^/.]+$/, "")}-transcript.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_AUDIO_TYPES,
    maxSize,
    multiple: true,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const successCount = uploadedFiles.filter((f) => f.status === "success").length
  const errorCount = uploadedFiles.filter((f) => f.status === "error").length
  const inProgressCount = uploadedFiles.filter((f) => 
    f.status === "uploading" || f.status === "transcribing"
  ).length

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          {enableTranscription && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/50">
              <Languages className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Transcription Language</p>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[200px] h-9" aria-label="Select transcription language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">Arabic (العربية)</SelectItem>
                    <SelectItem value="es">Spanish (Español)</SelectItem>
                    <SelectItem value="fr">French (Français)</SelectItem>
                    <SelectItem value="de">German (Deutsch)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div
            {...getRootProps()}
            role="button"
            aria-label="Upload audio files by dragging and dropping or clicking to browse"
            tabIndex={0}
            className={cn(
              "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isDragActive && !isDragReject && "border-primary bg-primary/5 scale-[1.02]",
              isDragReject && "border-destructive bg-destructive/5",
              !isDragActive && "border-border hover:border-primary/50 hover:bg-accent/30"
            )}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center space-y-5">
              <div
                className={cn(
                  "h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300",
                  isDragActive && !isDragReject && "bg-primary/10 scale-110",
                  isDragReject && "bg-destructive/10",
                  !isDragActive && "bg-muted"
                )}
              >
                <Upload
                  className={cn(
                    "h-10 w-10 transition-colors",
                    isDragActive && !isDragReject && "text-primary",
                    isDragReject && "text-destructive",
                    !isDragActive && "text-muted-foreground"
                  )}
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">
                  {isDragActive && !isDragReject && "Drop your audio files here"}
                  {isDragReject && "Some files are not supported"}
                  {!isDragActive && "Upload Audio Files"}
                </h3>

                <p className="text-sm text-muted-foreground max-w-md">
                  {!isDragActive && "Drag & drop your audio files here, or click to browse"}
                  {isDragActive && !isDragReject && "Release to upload your files"}
                  {isDragReject && "Please upload only MP3, WAV, or M4A files"}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>MP3, WAV, M4A</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Max {Math.round(maxSize / (1024 * 1024))}MB</span>
                </div>
                {enableTranscription && (
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">Auto-transcription enabled</span>
                  </div>
                )}
              </div>

              {!isDragActive && (
                <Button type="button" size="lg" className="mt-2">
                  Choose Files
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-semibold">
                  {enableTranscription ? "Upload & Transcription Progress" : "Upload Progress"}
                </h4>
                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                  {successCount > 0 && <span className="text-green-600">✓ {successCount} completed</span>}
                  {errorCount > 0 && <span className="text-destructive">✗ {errorCount} failed</span>}
                  {inProgressCount > 0 && <span>⋯ {inProgressCount} in progress</span>}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={clearAll} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>
            <div className="space-y-5">
              {uploadedFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {uploadFile.status === "uploading" && <File className="h-5 w-5 text-blue-500 animate-pulse" />}
                      {uploadFile.status === "transcribing" && (
                        <File className="h-5 w-5 text-purple-500 animate-pulse" />
                      )}
                      {uploadFile.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {uploadFile.status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="truncate font-medium">{uploadFile.file.name}</span>
                        <span className="text-muted-foreground ml-2">{formatFileSize(uploadFile.file.size)}</span>
                      </div>

                      <Progress value={uploadFile.progress} className="h-2" />

                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <span className="font-medium">
                          {uploadFile.status === "uploading" && `Uploading: ${Math.round(uploadFile.progress)}%`}
                          {uploadFile.status === "transcribing" && "🎙️ Transcribing audio..."}
                          {uploadFile.status === "success" && "✓ Complete"}
                          {uploadFile.status === "error" && `Failed: ${uploadFile.error}`}
                        </span>
                        {uploadFile.jobId && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">Job: {uploadFile.jobId}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {uploadFile.audioUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAudioPlayback(uploadFile.id, uploadFile.audioUrl!)}
                          className="flex-shrink-0 h-8 w-8 p-0"
                          aria-label={playingAudio === uploadFile.id ? "Pause audio" : "Play audio"}
                        >
                          {playingAudio === uploadFile.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      )}

                      {uploadFile.status === "error" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryTranscription(uploadFile.id)}
                          className="flex-shrink-0 h-8 w-8 p-0"
                          aria-label="Retry transcription"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.id)}
                        className="flex-shrink-0 h-8 w-8 p-0"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {uploadFile.transcript && (
                    <div className="ml-8 p-4 bg-background/80 rounded-lg border border-border/60 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Transcript
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyTranscript(uploadFile.transcript!)}
                            className="h-8 text-xs"
                          >
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadTranscript(uploadFile.file.name, uploadFile.transcript!, "txt")}
                            className="h-8 text-xs"
                          >
                            TXT
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadTranscript(uploadFile.file.name, uploadFile.transcript!, "json")}
                            className="h-8 text-xs"
                          >
                            JSON
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
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