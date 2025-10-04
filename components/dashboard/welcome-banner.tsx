"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface WelcomeBannerProps {
  userName: string
  onDismiss: () => void
}

export function WelcomeBanner({ userName, onDismiss }: WelcomeBannerProps) {
  return (
    <div className="bg-card/30 backdrop-blur-xl border-b border-border px-3 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-2xl font-bold text-foreground mb-1 text-balance">Welcome back, {userName}!</h2>
          <p className="text-muted-foreground text-xs md:text-sm">
            Upload your recordings and get AI-powered transcriptions instantly
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}