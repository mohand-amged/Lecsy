"use client"

import type React from "react"

import { forwardRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DemoSectionProps {
  FileUploadComponent?: React.ComponentType<any>
}

export const DemoSection = forwardRef<HTMLElement, DemoSectionProps>(({ FileUploadComponent }, ref) => {
  return (
    <section ref={ref} id="try-demo" className="py-24 px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">Try it now</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload a sample lecture recording and see AI transcription in action. No sign-up required.
          </p>
        </div>

        {FileUploadComponent && (
          <FileUploadComponent
            enableTranscription={true}
            maxSize={50 * 1024 * 1024}
            onTranscriptionComplete={(fileId: string, transcript: string, fileName: string) => {
              console.log("[v0] Demo transcription complete:", {
                fileId,
                fileName,
                transcriptLength: transcript.length,
              })
            }}
          />
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-6">Want to save transcripts and access all features?</p>
          <Link href="/sign-up">
            <Button size="lg" className="rounded-full">
              Create free account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
})

DemoSection.displayName = "DemoSection"
