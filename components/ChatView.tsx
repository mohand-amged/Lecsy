"use client"

import * as React from "react"
import { Download, FileText, Edit2, Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import jsPDF from "jspdf"

interface ChatViewProps {
  sessionId: string
  title: string
  transcript: string
  timestamp: Date
  onTitleUpdate: (sessionId: string, newTitle: string) => void
  className?: string
}

export default function ChatView({ sessionId, title, transcript, timestamp, onTitleUpdate, className }: ChatViewProps) {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [editedTitle, setEditedTitle] = React.useState(title)
  const { addToast } = useToast()

  const handleTitleEdit = () => {
    setIsEditingTitle(true)
    setEditedTitle(title)
  }

  const handleTitleSave = () => {
    if (editedTitle.trim()) {
      onTitleUpdate(sessionId, editedTitle.trim())
      setIsEditingTitle(false)
      addToast({
        title: "Title Updated",
        description: "Chat title has been updated successfully",
      })
    }
  }

  const handleTitleCancel = () => {
    setEditedTitle(title)
    setIsEditingTitle(false)
  }

  const downloadAsText = () => {
    const content = `${title}\n\nDate: ${timestamp.toLocaleString()}\n\n${transcript}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    addToast({
      title: "Downloaded",
      description: "Transcript downloaded as text file",
    })
  }

  const downloadAsPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const maxWidth = pageWidth - 2 * margin
    let yPosition = margin

    // Title
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    const titleLines = doc.splitTextToSize(title, maxWidth)
    doc.text(titleLines, margin, yPosition)
    yPosition += titleLines.length * 10 + 10

    // Date
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 100, 100)
    doc.text(`Date: ${timestamp.toLocaleString()}`, margin, yPosition)
    yPosition += 15

    // Transcript
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    const transcriptLines = doc.splitTextToSize(transcript, maxWidth)

    transcriptLines.forEach((line: string) => {
      if (yPosition + 10 > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
      }
      doc.text(line, margin, yPosition)
      yPosition += 7
    })

    doc.save(`${title.replace(/[^a-z0-9]/gi, "_")}.pdf`)

    addToast({
      title: "Downloaded",
      description: "Transcript downloaded as PDF file",
    })
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Chat Header */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Title Section */}
            <div className="flex items-center justify-between gap-4">
              {isEditingTitle ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="flex-1"
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
                <div className="flex-1 flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{title}</h1>
                  <Button size="sm" variant="ghost" onClick={handleTitleEdit} className="h-8 w-8 p-0">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Created: {timestamp.toLocaleDateString()}</span>
              <span>•</span>
              <span>{timestamp.toLocaleTimeString()}</span>
            </div>

            {/* Download Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={downloadAsText} variant="outline" size="sm" className="gap-2 bg-transparent">
                <FileText className="h-4 w-4" />
                Download as Text
              </Button>
              <Button onClick={downloadAsPDF} variant="outline" size="sm" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Download as PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript Section */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Transcript</h2>
              <span className="text-xs text-muted-foreground">
                {transcript.split(" ").length} words • {Math.ceil(transcript.split(" ").length / 200)} min read
              </span>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{transcript}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}