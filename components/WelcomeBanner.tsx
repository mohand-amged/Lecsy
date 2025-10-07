"use client"

import * as React from "react"
import { X, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface WelcomeBannerProps {
  userName: string
  onDismiss: () => void
  className?: string
}

export default function WelcomeBanner({ 
  userName, 
  onDismiss, 
  className 
}: WelcomeBannerProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Welcome back, {userName}! 🎉
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ready to transcribe and analyze your lectures? Upload an audio file to get started.
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Decorative gradient blob */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-xl" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/3 rounded-full blur-2xl" />
      </CardContent>
    </Card>
  )
}