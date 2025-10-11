"use client"

import * as React from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import {
  Upload,
  File,
  CheckCircle,
  AlertCircle,
  X,
  Languages,
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Music,
  Download,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranscription } from "@/hooks/use-transcription"

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
  expanded?: boolean
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

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية (Arabic)" },
  { value: "es", label: "Español (Spanish)" },
  { value: "fr", label: "Français (French)" },
  { value: "de", label: "Deutsch (German)" },
  { value: "zh", label: "中文 (Chinese)" },
  { value: "ja", label: "日本語 (Japanese)" },
  { value: "ko", label: "한국어 (Korean)" },
  { value: "pt", label: "Português (Portuguese)" },
  { value: "ru", label: "Русский (Russian)" },
  { value: "it", label: "Italiano (Italian)" },
  { value: "nl", label: "Nederlands (Dutch)" },
]

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

  const { startTranscription } = useTranscription({
    onTranscriptionComplete: (jobId, transcript, fileName) => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file.name === fileName
            ? {
                ...f,
                status: "success" as const,
                transcript,
                jobId,
              }
            : f,
        ),
      )

      if (onTranscriptionComplete) {
        onTranscriptionComplete(jobId, transcript, fileName)
      }

      addToast({
        title: "✓ Transcription Complete",
        description: `Successfully transcribed ${fileName}`,
      })
    },
  })

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
        error: `Invalid file type. Supported: MP3, WAV, M4A`,
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`,
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

  const uploadFile = React.useCallback(
    (fileId: string, file: File) => {
      const audioUrl = URL.createObjectURL(file)
      setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, audioUrl } : f)))

      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15

        if (progress >= 100) {
          progress = 100
          clearInterval(interval)

          setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: 100 } : f)))

          if (enableTranscription) {
            setUploadedFiles((prev) =>
              prev.map((f) => (f.id === fileId ? { ...f, status: "transcribing" as const } : f)),
            )
            startTranscription(file)
          } else {
            setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "success" as const } : f)))
            addToast({
              title: "✓ Upload Complete",
              description: `${file.name} uploaded successfully`,
            })
          }
        } else {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f)),
          )
        }
      }, 100)
    },
    [addToast, enableTranscription, startTranscription],
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
                  return `"${file.name}" exceeds size limit`
                case "file-invalid-type":
                  return `"${file.name}" is not supported`
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
        const validatedFiles = acceptedFiles.map((file) => ({
          file,
          validation: validateFile(file),
        }))

        const validFiles = validatedFiles.filter((f) => f.validation.valid)
        const invalidFiles = validatedFiles.filter((f) => !f.validation.valid)

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
          expanded: false,
        }))

        setUploadedFiles((prev) => [...prev, ...newFiles])

        newFiles.forEach((uploadFileItem) => {
          uploadFile(uploadFileItem.id, uploadFileItem.file)
        })

        if (onFileUpload) {
          onFileUpload(validFiles.map((f) => f.file))
        }

        addToast({
          title: "✓ Upload Started",
          description: `Uploading ${validFiles.length} file${validFiles.length > 1 ? "s" : ""}`,
        })
      }
    },
    [maxSize, onFileUpload, addToast, uploadFile],
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
        prev.map((f) => (f.id === fileId ? { ...f, status: "uploading" as const, progress: 0, error: undefined } : f)),
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
      audioRefs.current.forEach((otherAudio, otherId) => {
        if (otherId !== fileId) {
          otherAudio.pause()
        }
      })
      audio.play()
      setPlayingAudio(fileId)
    }
  }

  const toggleExpanded = (fileId: string) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, expanded: !f.expanded } : f)),
    )
  }

  const copyTranscript = (transcript: string, fileName: string) => {
    navigator.clipboard.writeText(transcript)
    addToast({
      title: "✓ Copied",
      description: `${fileName} transcript copied to clipboard`,
    })
  }

  const downloadTranscript = (fileName: string, transcript: string) => {
    const content = `${fileName}\n${"=".repeat(fileName.length)}\n\n${transcript}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName.replace(/\.[^/.]+$/, "")}_transcript.txt`
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
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const successCount = uploadedFiles.filter((f) => f.status === "success").length
  const errorCount = uploadedFiles.filter((f) => f.status === "error").length
  const inProgressCount = uploadedFiles.filter((f) => f.status === "uploading" || f.status === "transcribing").length

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          {enableTranscription && (
            <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Languages className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Transcription Language</p>
                  <p className="text-xs text-muted-foreground">Select the language of your audio</p>
                </div>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full" aria-label="Select transcription language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div
            {...getRootProps()}
            role="button"
            aria-label="Upload audio files"
            tabIndex={0}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "hover:scale-[1.01]",
              isDragActive && !isDragReject && "border-primary bg-primary/5 scale-[1.02]",
              isDragReject && "border-destructive bg-destructive/5",
              !isDragActive && "border-border hover:border-primary/50 hover:bg-accent/20",
            )}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center space-y-6">
              <div
                className={cn(
                  "h-24 w-24 rounded-full flex items-center justify-center transition-all duration-300",
                  "shadow-lg",
                  isDragActive && !isDragReject && "bg-primary/20 scale-110 shadow-primary/20",
                  isDragReject && "bg-destructive/20 shadow-destructive/20",
                  !isDragActive && "bg-gradient-to-br from-primary/10 to-primary/5",
                )}
              >
                {isDragActive ? (
                  <Music className="h-12 w-12 text-primary animate-pulse" />
                ) : (
                  <Upload className="h-12 w-12 text-primary" />
                )}
              </div>

              <div className="space-y-3 max-w-md">
                <h3 className="text-2xl font-bold">
                  {isDragActive && !isDragReject && "Drop your files here"}
                  {isDragReject && "Unsupported file type"}
                  {!isDragActive && "Upload Audio Files"}
                </h3>

                <p className="text-muted-foreground">
                  {!isDragActive && "Drag & drop your audio files or click to browse"}
                  {isDragActive && !isDragReject && "Release to upload"}
                  {isDragReject && "Only MP3, WAV, and M4A files are supported"}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background/80 rounded-full border border-border/50">
                  <Music className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium">MP3, WAV, M4A</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background/80 rounded-full border border-border/50">
                  <File className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium">Max {Math.round(maxSize / (1024 * 1024))}MB</span>
                </div>
                {enableTranscription && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/30">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    <span className="font-medium text-green-600 dark:text-green-400">Auto-transcription</span>
                  </div>
                )}
              </div>

              {!isDragActive && (
                <Button type="button" size="lg" className="mt-2 shadow-md hover:shadow-lg transition-shadow">
                  <Upload className="h-4 w-4 mr-2" />
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-lg font-semibold">Files</h4>
                <div className="flex gap-4 mt-1.5 text-sm">
                  {successCount > 0 && (
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">{successCount} completed</span>
                    </div>
                  )}
                  {errorCount > 0 && (
                    <div className="flex items-center gap-1.5 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">{errorCount} failed</span>
                    </div>
                  )}
                  {inProgressCount > 0 && (
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span className="font-medium">{inProgressCount} processing</span>
                    </div>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={clearAll} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              {uploadedFiles.map((uploadFile) => (
                <Card key={uploadFile.id} className="border-border/40 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {/* File Header */}
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className={cn(
                              "h-10 w-10 rounded-lg flex items-center justify-center",
                              uploadFile.status === "uploading" && "bg-blue-500/10",
                              uploadFile.status === "transcribing" && "bg-purple-500/10",
                              uploadFile.status === "success" && "bg-green-500/10",
                              uploadFile.status === "error" && "bg-destructive/10",
                            )}
                          >
                            {uploadFile.status === "uploading" && (
                              <File className="h-5 w-5 text-blue-500 animate-pulse" />
                            )}
                            {uploadFile.status === "transcribing" && (
                              <MessageSquare className="h-5 w-5 text-purple-500 animate-pulse" />
                            )}
                            {uploadFile.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {uploadFile.status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold truncate text-base">{uploadFile.file.name}</h5>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span>{formatFileSize(uploadFile.file.size)}</span>
                                {uploadFile.jobId && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono">ID: {uploadFile.jobId.slice(0, 8)}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {uploadFile.audioUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleAudioPlayback(uploadFile.id, uploadFile.audioUrl!)}
                                  className="h-9 w-9 p-0"
                                  title={playingAudio === uploadFile.id ? "Pause" : "Play"}
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
                                  className="h-9 w-9 p-0"
                                  title="Retry"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(uploadFile.id)}
                                className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                                title="Remove"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <Progress value={uploadFile.progress} className="h-2" />
                            <div className="flex items-center justify-between text-xs">
                              <span
                                className={cn(
                                  "font-medium",
                                  uploadFile.status === "uploading" && "text-blue-600 dark:text-blue-400",
                                  uploadFile.status === "transcribing" && "text-purple-600 dark:text-purple-400",
                                  uploadFile.status === "success" && "text-green-600 dark:text-green-400",
                                  uploadFile.status === "error" && "text-destructive",
                                )}
                              >
                                {uploadFile.status === "uploading" && `Uploading ${Math.round(uploadFile.progress)}%`}
                                {uploadFile.status === "transcribing" && "Transcribing audio..."}
                                {uploadFile.status === "success" && "Complete"}
                                {uploadFile.status === "error" && `Error: ${uploadFile.error || "Failed"}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Transcript Section */}
                      {uploadFile.transcript && (
                        <div className="pt-3 border-t border-border/50">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(uploadFile.id)}
                                className="gap-2 h-8 px-2 -ml-2"
                              >
                                {uploadFile.expanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                                <MessageSquare className="h-4 w-4" />
                                <span className="font-semibold text-sm">Transcript</span>
                                <span className="text-xs text-muted-foreground">
                                  ({uploadFile.transcript.split(" ").length} words)
                                </span>
                              </Button>

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyTranscript(uploadFile.transcript!, uploadFile.file.name)}
                                  className="h-8 gap-1.5"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                  Copy
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadTranscript(uploadFile.file.name, uploadFile.transcript!)}
                                  className="h-8 gap-1.5"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Download
                                </Button>
                              </div>
                            </div>

                            {uploadFile.expanded && (
                              <div className="p-4 bg-muted/30 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {uploadFile.transcript}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}