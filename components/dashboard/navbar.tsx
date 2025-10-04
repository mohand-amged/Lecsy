"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Clock, Menu, Sparkles } from "lucide-react"
import { UserMenu } from "./user-menu"
import { NotificationMenu } from "./notification-menu"

interface UserProfile {
  name: string
  email: string
  bio: string
  avatar: string
}

interface NavbarProps {
  userProfile: UserProfile
  todaySessions: number
  isProfileMenuOpen: boolean
  setIsProfileMenuOpen: (open: boolean) => void
  onOpenProfileDialog: () => void
  onLogout: () => void
  getUserInitials: (name: string) => string
  isMobileSidebarOpen: boolean
  setIsMobileSidebarOpen: (open: boolean) => void
  sidebarContent: React.ReactNode
  isNotificationMenuOpen: boolean
  setIsNotificationMenuOpen: (open: boolean) => void
}

export function Navbar({
  userProfile,
  todaySessions,
  isProfileMenuOpen,
  setIsProfileMenuOpen,
  onOpenProfileDialog,
  onLogout,
  getUserInitials,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  sidebarContent,
  isNotificationMenuOpen,
  setIsNotificationMenuOpen,
}: NavbarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 md:h-16 bg-card/50 backdrop-blur-xl border-b border-border z-50 flex items-center justify-between px-3 md:px-6">
      <div className="flex items-center gap-2 md:gap-3">
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 bg-card/95 backdrop-blur-xl">
            <div className="flex flex-col h-full">{sidebarContent}</div>
          </SheetContent>
        </Sheet>

        <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center glow-primary">
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
        </div>
        <h1 className="text-base md:text-lg font-bold text-foreground">Lecsy</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden sm:flex items-center gap-2 px-2 md:px-3 py-1.5 bg-secondary/50 rounded-lg border border-border">
          <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground leading-none">Today</span>
            <span className="text-xs md:text-sm font-bold text-foreground leading-none mt-0.5">{todaySessions}</span>
          </div>
        </div>

        <NotificationMenu isOpen={isNotificationMenuOpen} setIsOpen={setIsNotificationMenuOpen} />

        <UserMenu
          userProfile={userProfile}
          isOpen={isProfileMenuOpen}
          setIsOpen={setIsProfileMenuOpen}
          onOpenProfile={onOpenProfileDialog}
          onLogout={onLogout}
          getUserInitials={getUserInitials}
        />
      </div>
    </div>
  )
}