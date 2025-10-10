"use client"

import type * as React from "react"
import { Upload, FileText, Settings, History, Download, Share2, Mic, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: "default" | "primary" | "secondary"
  disabled?: boolean
}

interface QuickActionsProps {
  className?: string
}

export default function QuickActions({ className }: QuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      id: "upload",
      title: "Upload Audio",
      description: "Upload lecture recordings to start transcription",
      icon: Upload,
      onClick: () => {
        // Scroll to upload section or trigger upload
        const uploadSection = document.getElementById("file-upload")
        uploadSection?.scrollIntoView({ behavior: "smooth" })
      },
      variant: "primary",
    },
    {
      id: "recent",
      title: "Recent Transcripts",
      description: "View and manage your recent transcriptions",
      icon: FileText,
      onClick: () => {
        // Navigate to transcripts page
        const recentActivitySection = document.getElementById("recent-activity")
        recentActivitySection?.scrollIntoView({ behavior: "smooth" })
      },
    },
    {
      id: "record",
      title: "Live Recording",
      description: "Start a live recording session",
      icon: Mic,
      onClick: () => {
        console.log("Start live recording")
      },
      disabled: true, // Feature coming soon
    },
    {
      id: "library",
      title: "Transcript Library",
      description: "Browse all your transcriptions",
      icon: BookOpen,
      onClick: () => {
        console.log("Open transcript library")
      },
      disabled: true, // Feature coming soon
    },
    {
      id: "settings",
      title: "Preferences",
      description: "Customize your transcription settings",
      icon: Settings,
      onClick: () => {
        console.log("Open settings")
      },
      disabled: true, // Feature coming soon
    },
    {
      id: "export",
      title: "Export Data",
      description: "Download your transcriptions and data",
      icon: Download,
      onClick: () => {
        console.log("Export data")
      },
      disabled: true, // Feature coming soon
    },
    {
      id: "share",
      title: "Share Workspace",
      description: "Collaborate with others on transcriptions",
      icon: Share2,
      onClick: () => {
        console.log("Share workspace")
      },
      disabled: true, // Feature coming soon
      },
  ]

  const getActionCardStyles = (variant?: string, disabled?: boolean) => {
    if (disabled) {
      return "opacity-50 cursor-not-allowed"
    }

    switch (variant) {
      case "primary":
        return "border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30"
      case "secondary":
        return "border-secondary/20 bg-secondary/5 hover:bg-secondary/10 hover:border-secondary/30"
      default:
        return "hover:bg-accent/50 hover:border-accent"
    }
  }

  const getIconStyles = (variant?: string, disabled?: boolean) => {
    if (disabled) {
      return "text-muted-foreground"
    }

    switch (variant) {
      case "primary":
        return "text-primary"
      case "secondary":
        return "text-secondary-foreground"
      default:
        return "text-foreground"
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-2xl font-semibold mb-2">Quick Actions</h2>
        <p className="text-muted-foreground">Common tasks and shortcuts to help you get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const IconComponent = action.icon

          return (
            <Card
              key={action.id}
              className={cn(
                "group cursor-pointer transition-all duration-200 hover:shadow-md",
                getActionCardStyles(action.variant, action.disabled),
              )}
              onClick={action.disabled ? undefined : action.onClick}
            >
              <CardContent className="p-6">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                        action.variant === "primary" ? "bg-primary/10" : "bg-muted",
                      )}
                    >
                      <IconComponent className={cn("h-5 w-5", getIconStyles(action.variant, action.disabled))} />
                    </div>
                    {action.disabled && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Soon</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-medium text-sm group-hover:text-foreground transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
