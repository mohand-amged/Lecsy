"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, Mic } from "lucide-react"

interface UploadSectionProps {
  onUpload: (files: File[]) => void
  isUploading: boolean
  uploadProgress: number
}

export function UploadSection({ onUpload, isUploading, uploadProgress }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    onUpload(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      onUpload(files)
    }
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-xl mb-6 md:mb-8 overflow-hidden group hover:border-primary/30 transition-all duration-300">
      <CardHeader className="text-center pb-3 md:pb-4 px-4 md:px-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center glow-primary">
            <Upload className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-xl md:text-3xl font-bold text-foreground mb-2 text-balance">
          Upload Your Recording
        </CardTitle>
        <p className="text-muted-foreground text-sm md:text-base">Drag and drop your audio files or click to browse</p>
        <p className="hidden md:block text-sm text-muted-foreground mt-2">
          Press <kbd className="px-2 py-1 text-xs bg-secondary rounded border border-border">⌘U</kbd> to upload
        </p>
      </CardHeader>

      <CardContent className="p-4 md:p-8">
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 md:p-16 text-center transition-all duration-300 ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-secondary/30"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <div
              className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDragging ? "bg-primary scale-110 rotate-6" : "bg-gradient-to-br from-primary to-accent"
              }`}
            >
              <Upload
                className={`w-8 h-8 md:w-12 md:h-12 text-white transition-transform duration-300 ${isDragging ? "scale-125" : ""}`}
              />
            </div>

            <div>
              <h3 className="text-lg md:text-2xl font-bold text-foreground mb-2">
                {isDragging ? "Drop your files here!" : "Upload Audio Recording"}
              </h3>
              <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-lg">
                Support for MP3, WAV, M4A files up to 100MB
              </p>

              {isUploading && (
                <div className="mb-4 md:mb-6">
                  <div className="w-full bg-secondary rounded-full h-2 md:h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Uploading... {uploadProgress}%</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 md:px-10 py-5 md:py-6 text-base md:text-lg glow-primary transition-all duration-300 group w-full sm:w-auto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:-translate-y-1 transition-transform" />
                  Choose Files
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-border bg-secondary text-foreground hover:bg-secondary/80 hover:border-primary/50 px-8 md:px-10 py-5 md:py-6 text-base md:text-lg group w-full sm:w-auto"
                >
                  <Mic className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Record Live
                </Button>
              </div>
            </div>
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileSelect}
          />
        </div>
      </CardContent>
    </Card>
  )
}