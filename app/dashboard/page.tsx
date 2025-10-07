"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import DashboardNavBar from "@/components/DashboardNavBar";
import Sidebar from "@/components/Sidebar";
import WelcomeBanner from "@/components/WelcomeBanner";
import FileUpload from "@/components/FileUpload";
import QuickActions from "@/components/QuickActions";
import ProfileDialog from "@/components/ProfileDialog";
import { ToastProvider } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// Mock data for development
const mockSessions = [
  {
    id: "1",
    title: "Introduction to React Hooks",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    lastMessage: "Discussed useState and useEffect patterns"
  },
  {
    id: "2", 
    title: "Advanced TypeScript Concepts",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    lastMessage: "Covered generics and conditional types"
  },
  {
    id: "3",
    title: "Database Design Principles",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    lastMessage: "Normalization and indexing strategies"
  }
];

const mockNotifications = [
  {
    id: "1",
    title: "Transcription Complete",
    description: "Your latest lecture recording has been processed",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: false,
    type: "success" as const
  },
  {
    id: "2",
    title: "Storage Space Warning",
    description: "You're using 85% of your storage quota",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    type: "warning" as const
  },
  {
    id: "3",
    title: "New Feature Available",
    description: "Try our new AI-powered lecture summarization",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    type: "info" as const
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = React.useState(false);
  const [activeSessionId, setActiveSessionId] = React.useState<string>();
  const [sessions, setSessions] = React.useState(mockSessions);
  const [notifications, setNotifications] = React.useState(mockNotifications);
  const [isWelcomeBannerVisible, setIsWelcomeBannerVisible] = React.useState(true);

  // Redirect to landing page if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Load welcome banner state from localStorage
  React.useEffect(() => {
    const dismissed = localStorage.getItem('welcome-banner-dismissed');
    if (dismissed === 'true') {
      setIsWelcomeBannerVisible(false);
    }
  }, []);

  const handleWelcomeBannerDismiss = () => {
    setIsWelcomeBannerVisible(false);
    localStorage.setItem('welcome-banner-dismissed', 'true');
  };

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    const newSession = {
      id: `new-${Date.now()}`,
      title: "New Conversation",
      timestamp: new Date(),
      lastMessage: ""
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const handleSessionClick = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prevSessions) => prevSessions.filter((session) => session.id !== sessionId))

    // If deleting the active session, switch to another one
    if (activeSessionId === sessionId) {
      const remainingSessions = sessions.filter((session) => session.id !== sessionId)
      if (remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0].id)
      } else {
        setActiveSessionId("")
      }
    }
  };

  const handleProfileEdit = () => {
    setIsProfileDialogOpen(true);
  };

  const handleProfileSave = async (updatedUser: Partial<{ name: string; email: string; image?: string }>) => {
    // Implement profile update logic here
    console.log("Updating profile:", updatedUser);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleNotificationRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleFileUpload = (files: File[]) => {
    console.log("Files uploaded:", files);
    // Implement file upload logic here
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-xl font-bold text-primary-foreground">L</span>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse mx-auto"></div>
            <div className="h-3 w-24 bg-muted/60 rounded animate-pulse mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        {/* Background decorative elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/2 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02]">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
        </div>

        {/* Navigation */}
        <DashboardNavBar
          user={user}
          onMenuToggle={handleMenuToggle}
          onProfileEdit={handleProfileEdit}
          onSignOut={handleSignOut}
          notifications={notifications}
          onNotificationRead={handleNotificationRead}
        />

        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={handleSidebarClose}
            sessions={sessions}
            onNewChat={handleNewChat}
            onSessionClick={handleSessionClick}
            onDeleteSession={handleDeleteSession}
            activeSessionId={activeSessionId}
          />

          {/* Main Content */}
          <main className={cn(
            "flex-1 overflow-y-auto transition-all duration-300",
            isSidebarOpen ? "lg:ml-80" : "lg:ml-0"
          )}>
            <div className="container mx-auto p-6 space-y-8 max-w-7xl">
              {/* Welcome Banner */}
              {isWelcomeBannerVisible && (
                <WelcomeBanner
                  userName={user.name}
                  onDismiss={handleWelcomeBannerDismiss}
                />
              )}

              {/* File Upload Section */}
              <section id="file-upload" className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Upload Audio Files</h2>
                  <p className="text-muted-foreground">
                    Upload your lecture recordings to start transcription and analysis
                  </p>
                </div>
                <FileUpload onFileUpload={handleFileUpload} />
              </section>

              {/* Quick Actions */}
              <QuickActions />

              {/* Recent Activity or Empty State */}
              <section className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Recent Activity</h2>
                  <p className="text-muted-foreground">
                    Your latest transcriptions and conversations
                  </p>
                </div>
                
                {sessions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions.slice(0, 6).map((session) => (
                      <div
                        key={session.id}
                        className="p-4 border border-border rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all cursor-pointer"
                        onClick={() => handleSessionClick(session.id)}
                      >
                        <h3 className="font-medium mb-2 truncate">{session.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {session.lastMessage || "No messages yet"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-lg">📝</span>
                    </div>
                    <h3 className="text-lg font-medium mb-2">No activity yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by uploading an audio file or creating a new conversation
                    </p>
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>

        {/* Profile Dialog */}
        <ProfileDialog
          isOpen={isProfileDialogOpen}
          onClose={() => setIsProfileDialogOpen(false)}
          user={user}
          onSave={handleProfileSave}
        />
      </div>
    </ToastProvider>
  );
}
