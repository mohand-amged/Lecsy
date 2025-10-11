"use client"

import * as React from "react"
import {
  Bell,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Music,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/auth-client"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  name: string
  email: string
  bio?: string
  image?: string
}

interface DashboardNavBarProps {
  user: UserProfile
  theme: "light" | "dark"
  showProfileMenu: boolean
  showNotifications: boolean
  onToggleTheme: () => void
  onToggleProfileMenu: () => void
  onToggleNotifications: () => void
  onOpenProfileDialog: () => void
  getUserInitials: (name: string) => string
}

export function DashboardNavBar({
  user,
  theme,
  showProfileMenu,
  showNotifications,
  onToggleTheme,
  onToggleProfileMenu,
  onToggleNotifications,
  onOpenProfileDialog,
  getUserInitials,
}: DashboardNavBarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      router.push('/auth/signin')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-sm">
            <Music className="h-5 w-5 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">TranscribeApp</h1>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="h-9 w-9"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onToggleNotifications()
              }}
              className="h-9 w-9 relative"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-background"></span>
            </Button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-popover border rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b bg-muted/50">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <button className="w-full px-4 py-3 text-left hover:bg-accent transition-colors">
                    <p className="text-sm font-medium">New transcription complete</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Team Meeting - Q1 Planning</p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-t">
                    <p className="text-sm font-medium">Storage limit warning</p>
                    <p className="text-xs text-muted-foreground mt-0.5">You&apos;re using 80% of your storage</p>
                    <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onToggleProfileMenu()
              }}
              className="h-9 gap-2 pl-2 pr-3"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-6 w-6 rounded-full object-cover ring-2 ring-background"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center text-xs font-semibold ring-2 ring-background">
                  {getUserInitials(user.name)}
                </div>
              )}
              <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">{user.name}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-popover border rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b bg-muted/50">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <button
                    className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-3 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenProfileDialog()
                    }}
                  >
                    <User className="h-4 w-4" />
                    View Profile
                  </button>
                  <button
                    className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-3 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </div>
                <div className="border-t py-1">
                  <button
                    className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-3 text-destructive transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSignOut()
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}