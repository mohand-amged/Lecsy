"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell, Check, FileText, Trash2 } from "lucide-react"
import { useState } from "react"

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: "success" | "info" | "warning"
}

interface NotificationMenuProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function NotificationMenu({ isOpen, setIsOpen }: NotificationMenuProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Transcription Complete",
      message: "Your audio file has been transcribed successfully",
      time: "2 min ago",
      read: false,
      type: "success",
    },
    {
      id: "2",
      title: "New Feature Available",
      message: "Check out our new AI summary feature",
      time: "1 hour ago",
      read: false,
      type: "info",
    },
    {
      id: "3",
      title: "Storage Warning",
      message: "You're using 80% of your storage",
      time: "3 hours ago",
      read: true,
      type: "warning",
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-secondary relative h-8 w-8 md:h-9 md:w-9"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-card border-border">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-7 text-xs">
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />

        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="cursor-pointer p-3 focus:bg-secondary hover:bg-secondary flex-col items-start gap-1"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <p
                        className={`text-sm font-medium ${notification.read ? "text-muted-foreground" : "text-foreground"}`}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground/70">{notification.time}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}