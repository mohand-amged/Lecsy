"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/AuthContext"
import DashboardNavBar from "@/components/DashboardNavBar"
import Sidebar from "@/components/Sidebar"
import WelcomeBanner from "@/components/WelcomeBanner"
import FileUpload from "@/components/FileUpload"
import QuickActions from "@/components/QuickActions"
import ProfileDialog from "@/components/ProfileDialog"
import ChatView from "@/components/ChatView"

interface Session {
  id: string
  title: string
  timestamp: Date
  lastMessage?: string
  transcript?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = React.useState(false)
  const [activeSessionId, setActiveSessionId] = React.useState<string>()
  const [sessions, setSessions] = React.useState<Session[]>([])
  const [notifications, setNotifications] = React.useState<
    Array<{
      id: string
      title: string
      description: string
      timestamp: Date
      read: boolean
      type: "info" | "success" | "warning" | "error" | "feature" | "system"
      actionUrl?: string
      category?: "security" | "billing" | "activity" | "announcement" | "reminder"
      priority?: "low" | "normal" | "high" | "urgent"
    }>
  >([])
  const [isWelcomeBannerVisible, setIsWelcomeBannerVisible] = React.useState(true)

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/")
    }
  }, [user, loading, router])

  React.useEffect(() => {
    const dismissed = localStorage.getItem("welcome-banner-dismissed")
    if (dismissed === "true") {
      setIsWelcomeBannerVisible(false)
    }
  }, [])

  const handleWelcomeBannerDismiss = () => {
    setIsWelcomeBannerVisible(false)
    localStorage.setItem("welcome-banner-dismissed", "true")
  }

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleSidebarClose = () => {
    setIsSidebarOpen(false)
  }

  const handleNewChat = () => {
    const newSession = {
      id: `new-${Date.now()}`,
      title: "New Conversation",
      timestamp: new Date(),
      lastMessage: "",
    }
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    setIsSidebarOpen(false)
  }

  const handleSessionClick = (sessionId: string) => {
    setActiveSessionId(sessionId)
    setIsSidebarOpen(false)
  }

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prevSessions) => prevSessions.filter((session) => session.id !== sessionId))

    if (activeSessionId === sessionId) {
      const remainingSessions = sessions.filter((session) => session.id !== sessionId)
      if (remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0].id)
      } else {
        setActiveSessionId("")
      }
    }
  }

  const handleProfileEdit = () => {
    setIsProfileDialogOpen(true)
  }

  const handleProfileSave = async (updatedUser: Partial<{ name: string; email: string; image?: string }>) => {
    console.log("Updating profile:", updatedUser)
    // TODO: Call your API endpoint to update user profile
    // await fetch('/api/user/profile', { method: 'PATCH', body: JSON.stringify(updatedUser) })
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )
  }

  const handleNotificationDelete = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  const handleFileUpload = (files: File[]) => {
    console.log("Files uploaded:", files)
  }

  const handleTranscriptionComplete = (fileId: string, transcript: string, fileName: string) => {
    const newSession: Session = {
      id: `transcript-${fileId}`,
      title: fileName.replace(/\.[^/.]+$/, ""),
      timestamp: new Date(),
      lastMessage: transcript.substring(0, 100) + (transcript.length > 100 ? "..." : ""),
      transcript: transcript,
    }

    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    setIsSidebarOpen(true)
  }

  const handleTitleUpdate = (sessionId: string, newTitle: string) => {
    setSessions((prev) => prev.map((session) => (session.id === sessionId ? { ...session, title: newTitle } : session)))
  }

  const activeSession = sessions.find((s) => s.id === activeSessionId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-2xl font-bold text-primary-foreground">L</span>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse mx-auto"></div>
            <div className="h-3 w-24 bg-muted/60 rounded animate-pulse mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500/3 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.015]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
      </div>

      <DashboardNavBar
        user={user}
        onMenuToggle={handleMenuToggle}
        onProfileEdit={handleProfileEdit}
        onSignOut={handleSignOut}
        notifications={notifications}
        onNotificationRead={handleNotificationRead}
        onNotificationDelete={handleNotificationDelete}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
          sessions={sessions}
          onNewChat={handleNewChat}
          onSessionClick={handleSessionClick}
          onDeleteSession={handleDeleteSession}
          activeSessionId={activeSessionId}
        />

        <main className="flex-1 overflow-y-auto transition-all duration-300">
          <div className="container mx-auto p-6 lg:p-8 space-y-10 max-w-7xl">
            {activeSession && activeSession.transcript ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <ChatView
                  sessionId={activeSession.id}
                  title={activeSession.title}
                  transcript={activeSession.transcript}
                  timestamp={activeSession.timestamp}
                  onTitleUpdate={handleTitleUpdate}
                />
              </div>
            ) : (
              <>
                {isWelcomeBannerVisible && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <WelcomeBanner userName={user.name} onDismiss={handleWelcomeBannerDismiss} />
                  </div>
                )}

                <section
                  id="file-upload"
                  className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: "100ms" }}
                >
                  <div>
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Upload Audio Files
                    </h2>
                    <p className="text-muted-foreground text-base">
                      Upload your lecture recordings to start transcription and automatically create a new chat
                    </p>
                  </div>
                  <FileUpload
                    enableTranscription={true}
                    onFileUpload={(files) => {
                      console.log("Files uploaded:", files)
                    }}
                    onTranscriptionComplete={(fileId, transcript, fileName) => {
                      console.log("Transcription complete:", { fileId, transcript, fileName })
                    }}
                  />
                </section>

                <div
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: "200ms" }}
                >
                  <QuickActions />
                </div>

                <section
                  className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: "300ms" }}
                >
                  <div>
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Recent Activity
                    </h2>
                    <p className="text-muted-foreground text-base">Your latest transcriptions and conversations</p>
                  </div>

                  {sessions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {sessions.slice(0, 6).map((session, index) => (
                        <div
                          key={session.id}
                          className="group p-5 border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-2"
                          style={{ animationDelay: `${index * 50}ms` }}
                          onClick={() => handleSessionClick(session.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                              {session.title}
                            </h3>
                            <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary group-hover:scale-125 transition-all" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                            {session.lastMessage || "No messages yet"}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {session.timestamp.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-border/60 rounded-xl bg-muted/20">
                      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-5">
                        <span className="text-2xl">📝</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No activity yet</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Start by uploading an audio file or creating a new conversation
                      </p>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </main>
      </div>

      <ProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={() => setIsProfileDialogOpen(false)}
        user={user}
        onSave={handleProfileSave}
      />
    </div>
  )
}