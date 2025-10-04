"use client"

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"

import { useSession, signOut } from "@/lib/auth-client"
import { Navbar } from "@/components/dashboard/navbar"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ProfileDialog } from "@/components/dashboard/profile-dialog"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { UploadSection } from "@/components/dashboard/upload-section"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ToastNotification } from "@/components/dashboard/toast-notification"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

interface UserProfile {
  name: string
  email: string
  bio: string
  avatar: string
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession()

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isWelcomeDismissed, setIsWelcomeDismissed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Student",
    email: "student@example.com",
    bio: "",
    avatar: "",
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/auth/profile")
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.user) {
              setUserProfile({
                name: data.user.name || session.user.name || "Student",
                email: data.user.email || session.user.email || "",
                bio: data.user.bio || "",
                avatar: data.user.avatar || "",
              })
            }
          } else {
            setUserProfile({
              name: session.user.name || "Student",
              email: session.user.email || "",
              bio: "",
              avatar: "",
            })
          }
        } catch (error) {
          console.error("[v0] Error fetching profile:", error)
          setUserProfile({
            name: session.user.name || "Student",
            email: session.user.email || "",
            bio: "",
            avatar: "",
          })
        }
      }
    }

    fetchUserProfile()
  }, [session])

  const addToast = (message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  const handleOpenProfileDialog = () => {
    setIsProfileDialogOpen(true)
    setIsProfileMenuOpen(false)
  }

  const handleSaveProfile = async (editedProfile: UserProfile) => {
    try {
      console.log("[v0] Saving profile:", editedProfile)

      const response = await fetch("/api/auth/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedProfile.name,
          email: editedProfile.email,
          bio: editedProfile.bio,
          avatar: editedProfile.avatar,
        }),
      })

      console.log("[v0] Response status:", response.status)

      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to update profile")
      }

      if (data.success) {
        setUserProfile(editedProfile)
        addToast("Profile updated successfully", "success")
      } else {
        throw new Error("Update failed")
      }
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      addToast(error instanceof Error ? error.message : "Failed to update profile", "error")
      throw error
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      addToast("Logged out successfully", "success")
      setIsProfileMenuOpen(false)
    } catch (error) {
      console.error("[v0] Error logging out:", error)
      addToast("Failed to log out", "error")
    }
  }

  const handleNewChat = async () => {
    try {
      addToast("Creating new transcription session...", "info")

      const response = await fetch("/api/transcriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Transcription ${new Date().toLocaleDateString()}`,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create new session")
      }

      const data = await response.json()

      if (data.success) {
        addToast("New transcription session created!", "success")
        // Reset upload state for new session
        setUploadProgress(0)
        setIsUploading(false)
      }
    } catch (error) {
      console.error("[v0] Error creating new chat:", error)
      addToast("Failed to create new session", "error")
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k") {
          e.preventDefault()
          document.getElementById("search-input")?.focus()
        }
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  useEffect(() => {
    const dismissed = localStorage.getItem("welcomeDismissed")
    if (dismissed === "true") {
      setIsWelcomeDismissed(true)
    }
  }, [])

  const handleDismissWelcome = () => {
    setIsWelcomeDismissed(true)
    localStorage.setItem("welcomeDismissed", "true")
    addToast("Welcome message hidden", "info")
  }

  const handleFiles = (files: File[]) => {
    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a"]
    const maxSize = 100 * 1024 * 1024

    const invalidFiles = files.filter((file) => !validTypes.includes(file.type) || file.size > maxSize)

    if (invalidFiles.length > 0) {
      addToast("Some files are invalid. Please upload MP3, WAV, or M4A files under 100MB.", "error")
      return
    }

    addToast(`Uploading ${files.length} file${files.length > 1 ? "s" : ""}...`, "info")
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsUploading(false)
            addToast("Upload complete! Processing transcription...", "success")
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const sidebarContent = <Sidebar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onNewChat={handleNewChat} />

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30"></div>
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl"></div>

      <Navbar
        userProfile={userProfile}
        todaySessions={0}
        isProfileMenuOpen={isProfileMenuOpen}
        setIsProfileMenuOpen={setIsProfileMenuOpen}
        onOpenProfileDialog={handleOpenProfileDialog}
        onLogout={handleLogout}
        getUserInitials={getUserInitials}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        sidebarContent={sidebarContent}
        isNotificationMenuOpen={isNotificationMenuOpen}
        setIsNotificationMenuOpen={setIsNotificationMenuOpen}
      />

      <ProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
        userProfile={userProfile}
        onSave={handleSaveProfile}
        getUserInitials={getUserInitials}
      />

      <div className="flex h-screen relative z-10 pt-14 md:pt-16">
        <div className="hidden md:flex w-64 bg-card/50 backdrop-blur-xl border-r border-border flex-col">
          {sidebarContent}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {!isWelcomeDismissed && <WelcomeBanner userName={userProfile.name} onDismiss={handleDismissWelcome} />}

          <div className="flex-1 overflow-y-auto scrollbar-custom">
            <div className="max-w-5xl mx-auto p-3 md:p-6">
              <UploadSection onUpload={handleFiles} isUploading={isUploading} uploadProgress={uploadProgress} />
              <QuickActions />
            </div>
          </div>
        </div>
      </div>

      <ToastNotification toasts={toasts} />
    </div>
  )
}