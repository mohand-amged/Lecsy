"use client"

import * as React from "react"
import { Download, FileText, Edit2, Check, X, Copy, Share2, Clock, Calendar, Type } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import jsPDF from "jspdf"
import { AudioPlayer } from "@/components/AudioPlayer"

interface ChatViewProps {
  sessionId: string
  title: string
  transcript: string
  timestamp: Date | string
  audioUrl?: string
  onTitleUpdate: (sessionId: string, newTitle: string) => void
  className?: string
}

export default function ChatView({
  sessionId,
  title,
  transcript,
  timestamp,
  audioUrl,
  onTitleUpdate,
  className,
}: ChatViewProps) {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [editedTitle, setEditedTitle] = React.useState(title)
  const [isExporting, setIsExporting] = React.useState(false)
  const { addToast } = useToast()

  const validTimestamp = React.useMemo(() => {
    if (!timestamp) return new Date()
    if (timestamp instanceof Date) return timestamp
    return new Date(timestamp)
  }, [timestamp])

  const stats = React.useMemo(() => {
    const words = transcript.trim().split(/\s+/).length
    const characters = transcript.length
    const readingTime = Math.ceil(words / 200)
    const sentences = transcript.split(/[.!?]+/).filter(Boolean).length
    
    return { words, characters, readingTime, sentences }
  }, [transcript])

  const handleTitleEdit = () => {
    setIsEditingTitle(true)
    setEditedTitle(title)
  }

  const handleTitleSave = () => {
    if (editedTitle.trim()) {
      onTitleUpdate(sessionId, editedTitle.trim())
      setIsEditingTitle(false)
      addToast({
        title: "✓ Title Updated",
        description: "Your chat title has been saved successfully",
      })
    }
  }

  const handleTitleCancel = () => {
    setEditedTitle(title)
    setIsEditingTitle(false)
  }

  const copyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(transcript)
      addToast({
        title: "✓ Copied to Clipboard",
        description: "Transcript copied successfully",
      })
    } catch (error) {
      addToast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const shareTranscript = async () => {
    const shareData = {
      title: title,
      text: `${title}\n\n${transcript}`,
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        addToast({
          title: "✓ Shared",
          description: "Transcript shared successfully",
        })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyTranscript()
        }
      }
    } else {
      copyTranscript()
    }
  }

  const downloadAsText = async () => {
    setIsExporting(true)
    try {
      const content = `${title}\n${"=".repeat(title.length)}\n\nDate: ${validTimestamp.toLocaleString()}\nWords: ${stats.words}\nCharacters: ${stats.characters}\n\n${transcript}`
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title.replace(/[^a-z0-9]/gi, "_")}_${validTimestamp.getTime()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      addToast({
        title: "✓ Downloaded",
        description: "Transcript saved as text file",
      })
    } catch (error) {
      addToast({
        title: "Download Failed",
        description: "Unable to download transcript",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const downloadAsPDF = async () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const maxWidth = pageWidth - 2 * margin
      let yPosition = margin

      // Title
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      const titleLines = doc.splitTextToSize(title, maxWidth)
      doc.text(titleLines, margin, yPosition)
      yPosition += titleLines.length * 10 + 15

      // Metadata
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(100, 100, 100)
      doc.text(`Date: ${validTimestamp.toLocaleString()}`, margin, yPosition)
      yPosition += 5
      doc.text(`Words: ${stats.words} | Characters: ${stats.characters} | Estimated reading time: ${stats.readingTime} min`, margin, yPosition)
      yPosition += 15

      // Divider
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 15

      // Transcript
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0)
      const transcriptLines = doc.splitTextToSize(transcript, maxWidth)

      transcriptLines.forEach((line: string) => {
        if (yPosition + 10 > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += 6
      })

      doc.save(`${title.replace(/[^a-z0-9]/gi, "_")}_${validTimestamp.getTime()}.pdf`)

      addToast({
        title: "✓ Downloaded",
        description: "Transcript saved as PDF file",
      })
    } catch (error) {
      addToast({
        title: "Download Failed",
        description: "Unable to generate PDF",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={cn("space-y-6 max-w-5xl mx-auto", className)}>
      {/* Header Card */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-5">
            {/* Title Section */}
            <div className="space-y-3">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="flex-1 text-lg font-semibold"
                    placeholder="Enter chat title"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTitleSave()
                      if (e.key === "Escape") handleTitleCancel()
                    }}
                  />
                  <Button size="sm" onClick={handleTitleSave} className="h-9 w-9 p-0">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleTitleCancel} className="h-9 w-9 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl font-bold tracking-tight flex-1">{title}</h1>
                  <Button size="sm" variant="ghost" onClick={handleTitleEdit} className="h-8 w-8 p-0 flex-shrink-0">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{validTimestamp.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{validTimestamp.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{stats.words.toLocaleString()}</span>
                    <span className="text-muted-foreground">words</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{stats.characters.toLocaleString()}</span>
                    <span className="text-muted-foreground">characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{stats.readingTime}</span>
                    <span className="text-muted-foreground">min read</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/50">
              <Button 
                onClick={copyTranscript} 
                variant="outline" 
                size="sm" 
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button 
                onClick={shareTranscript} 
                variant="outline" 
                size="sm" 
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button 
                onClick={downloadAsText} 
                variant="outline" 
                size="sm" 
                className="gap-2"
                disabled={isExporting}
              >
                <FileText className="h-4 w-4" />
                Text
              </Button>
              <Button 
                onClick={downloadAsPDF} 
                variant="outline" 
                size="sm" 
                className="gap-2"
                disabled={isExporting}
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Player Card */}
      {audioUrl && (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Recording
              </h2>
              <AudioPlayer audioUrl={audioUrl} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcript Card */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Transcript</h2>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base">
                {transcript}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}