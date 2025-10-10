"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Search,
  Bell,
  Menu,
  UserIcon,
  Settings,
  LogOut,
  Keyboard,
  Check,
  X,
  Trash2,
  BellOff,
  FileText,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Shield,
  CreditCard,
  Zap,
  Archive,
  Filter,
  MoreHorizontal,
  Pencil,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Notification {
  id: string
  title: string
  description: string
  timestamp: Date
  read: boolean
  type: "info" | "success" | "warning" | "error" | "feature" | "system"
  actionUrl?: string
  category?: "security" | "billing" | "activity" | "announcement" | "reminder"
  priority?: "low" | "normal" | "high" | "urgent"
  avatar?: string
  metadata?: {
    user?: string
    project?: string
    amount?: string
    [key: string]: string | undefined
  }
}

interface SearchResult {
  id: string
  title: string
  type: "conversation" | "file" | "message"
  description?: string
  url: string
}

interface DashboardNavBarProps {
  user: {
    id: string
    name: string
    email: string
    image?: string
    bio?: string
    role?: string
    status?: "online" | "away" | "busy" | "offline"
    profileCompletion?: number
    verified?: boolean
    joinedDate?: Date
    lastActive?: Date
  }
  onMenuToggle: () => void
  onProfileEdit: () => void
  onProfileView?: () => void
  onSettingsView?: () => void
  onSignOut: () => void
  notifications?: Notification[]
  onNotificationRead?: (id: string) => void
  onNotificationDelete?: (id: string) => void
  onMarkAllAsRead?: () => void
  onClearAll?: () => void
  onSearch?: (query: string) => Promise<SearchResult[]>
}

export default function DashboardNavBar({
  user,
  onMenuToggle,
  onProfileEdit,
  onProfileView,
  onSettingsView,
  onSignOut,
  notifications = [],
  onNotificationRead,
  onNotificationDelete,
  onMarkAllAsRead,
  onClearAll,
  onSearch,
}: DashboardNavBarProps) {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false)
  const [notificationFilter, setNotificationFilter] = React.useState<"all" | "unread" | "important">("all")
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const unreadNotifications = notifications.filter((n) => !n.read)
  const urgentNotifications = notifications.filter((n) => n.priority === "urgent" || n.priority === "high")

  // Helper functions
  const getNotificationIcon = (type: Notification["type"], category?: string) => {
    if (category === "security") return <Shield className="h-4 w-4" />
    if (category === "billing") return <CreditCard className="h-4 w-4" />

    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "feature":
        return <Zap className="h-4 w-4 text-blue-500" />
      case "system":
        return <Settings className="h-4 w-4 text-gray-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "security":
        return "Security"
      case "billing":
        return "Billing"
      case "activity":
        return "Activity"
      case "announcement":
        return "Announcements"
      case "reminder":
        return "Reminders"
      default:
        return "General"
    }
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  // Filter notifications based on current filter
  const filteredNotifications = React.useMemo(() => {
    switch (notificationFilter) {
      case "unread":
        return notifications.filter((n) => !n.read)
      case "important":
        return notifications.filter((n) => n.priority === "urgent" || n.priority === "high")
      default:
        return notifications
    }
  }, [notifications, notificationFilter])

  // Group notifications by category
  const groupedNotifications = React.useMemo(() => {
    const groups: Record<string, Notification[]> = {}
    filteredNotifications.forEach((notification) => {
      const category = notification.category || "general"
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(notification)
    })
    return groups
  }, [filteredNotifications])

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false)
        setSearchTerm("")
        setSearchResults([])
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Focus search input when dialog opens
  React.useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [isSearchOpen])

  // Debounced search
  React.useEffect(() => {
    if (!searchTerm.trim() || !onSearch) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await onSearch(searchTerm)
        setSearchResults(results)
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, onSearch])

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getSearchIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "file":
        return <FileText className="h-4 w-4" />
      case "message":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && onNotificationRead) {
      onNotificationRead(notification.id)
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchResults.length > 0) {
      window.location.href = searchResults[0].url
      setIsSearchOpen(false)
      setSearchTerm("")
      setSearchResults([])
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 md:h-16 items-center px-3 md:px-6 gap-2 md:gap-4">
          {/* Left side - Menu button and Logo */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={onMenuToggle} className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>

            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 md:h-9 md:w-9 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-base md:text-lg font-bold text-primary-foreground">L</span>
              </div>
              <span className="hidden sm:block text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Lecsy
              </span>
            </Link>
          </div>

          {/* Right side - All actions grouped together */}
          <div className="flex items-center gap-1 md:gap-2 ml-auto">
            {/* Search button - now for all screen sizes */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="h-9 w-9">
                    <Search className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Enhanced Notifications */}
            <DropdownMenu open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative h-9 w-9">
                        <Bell className="h-6 w-6" />
                        {unreadNotifications.length > 0 && (
                          <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center animate-pulse">
                            {unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
                          </span>
                        )}
                        {urgentNotifications.length > 0 && (
                          <span className="absolute -top-0.5 -left-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    Notifications {unreadNotifications.length > 0 && `(${unreadNotifications.length} new)`}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-96 max-h-[85vh] sm:max-h-[600px]">
                {/* Header with filters */}
                <div className="p-3 border-b space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base">Notifications</h3>
                    {notifications.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {unreadNotifications.length > 0 && onMarkAllAsRead && (
                            <DropdownMenuItem onClick={onMarkAllAsRead}>
                              <Check className="h-4 w-4 mr-2" />
                              Mark all as read
                            </DropdownMenuItem>
                          )}
                          {onClearAll && (
                            <DropdownMenuItem onClick={onClearAll} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Clear all
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <div className="flex gap-1">
                    {[
                      {
                        key: "all",
                        label: "All",
                        count: notifications.length,
                      },
                      { key: "unread", label: "Unread", count: unreadNotifications.length },
                      { key: "important", label: "Important", count: urgentNotifications.length },
                    ].map((filter) => (
                      <Button
                        key={filter.key}
                        variant={notificationFilter === filter.key ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setNotificationFilter(filter.key as "all" | "unread" | "important")}
                        className="h-8 text-xs px-3 flex-1"
                      >
                        <span className="truncate">{filter.label}</span>
                        {filter.count > 0 && (
                          <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">
                            {filter.count}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                <ScrollArea className="h-[50vh] sm:h-80">
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                      {notificationFilter === "all" ? (
                        <>
                          <BellOff className="h-12 w-12 text-muted-foreground/50 mb-3" />
                          <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            We&apos;ll notify you when something important happens
                          </p>
                        </>
                      ) : (
                        <>
                          <Filter className="h-12 w-12 text-muted-foreground/50 mb-3" />
                          <p className="text-sm font-medium text-muted-foreground">
                            No {notificationFilter} notifications
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">Try switching to a different filter</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="p-2">
                      {Object.entries(groupedNotifications).map(([category, categoryNotifications]) => (
                        <div key={category} className="mb-4 last:mb-0">
                          {Object.keys(groupedNotifications).length > 1 && (
                            <div className="flex items-center gap-2 px-2 py-1 mb-2">
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {getCategoryLabel(category)}
                              </span>
                              <div className="flex-1 h-px bg-border"></div>
                            </div>
                          )}

                          <div className="space-y-1.5">
                            {categoryNotifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={cn(
                                  "group relative flex gap-2.5 p-3 rounded-lg cursor-pointer transition-all duration-200",
                                  !notification.read
                                    ? "bg-primary/5 border border-primary/10 hover:bg-primary/10"
                                    : "hover:bg-muted/50",
                                  notification.priority === "urgent" && "ring-1 ring-red-200 dark:ring-red-800",
                                )}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                {/* Priority indicator */}
                                {notification.priority === "urgent" && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-lg"></div>
                                )}

                                {/* Avatar or Icon */}
                                <div className="mt-0.5 flex-shrink-0">
                                  {notification.avatar ? (
                                    <Image
                                      src={notification.avatar || "/placeholder.svg"}
                                      alt=""
                                      width={32}
                                      height={32}
                                      className="rounded-full"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                      {getNotificationIcon(notification.type, notification.category)}
                                    </div>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium leading-snug line-clamp-2">
                                      {notification.title}
                                    </p>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      {notification.priority === "urgent" && (
                                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                                          Urgent
                                        </Badge>
                                      )}
                                      {!notification.read && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                                    </div>
                                  </div>

                                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                    {notification.description}
                                  </p>

                                  <div className="flex items-center justify-between pt-1 gap-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                                      <span className="flex items-center gap-1 flex-shrink-0">
                                        <Clock className="h-3 w-3" />
                                        {formatRelativeTime(notification.timestamp)}
                                      </span>
                                      {notification.metadata?.user && (
                                        <span className="flex items-center gap-1 truncate">
                                          <UserIcon className="h-3 w-3 flex-shrink-0" />
                                          <span className="truncate">{notification.metadata.user}</span>
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                      {!notification.read && onNotificationRead && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            onNotificationRead(notification.id)
                                          }}
                                          className="h-7 w-7 p-0"
                                        >
                                          <Check className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                      {onNotificationDelete && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            onNotificationDelete(notification.id)
                                          }}
                                          className="h-7 w-7 p-0"
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 6 && (
                  <div className="border-t p-2">
                    <Button variant="ghost" className="w-full text-sm font-medium text-primary h-8">
                      <Archive className="h-4 w-4 mr-2" />
                      View all notifications
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full p-0 hover:scale-105 transition-transform duration-200"
                >
                  <div className="relative">
                    {user.image ? (
                      <Image
                        src={user.image || "/placeholder.svg"}
                        alt={user.name}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-background shadow-md hover:shadow-lg transition-shadow duration-200"
                      />
                    ) : (
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 ring-2 ring-background",
                          user.role === "admin"
                            ? "bg-gradient-to-br from-red-500 via-orange-500 to-pink-500"
                            : user.role === "moderator"
                              ? "bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400"
                              : "bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-400",
                        )}
                      >
                        {getUserInitials(user.name)}
                      </div>
                    )}

                    {/* Status indicator */}
                    {user.status && (
                      <span
                        className={cn(
                          "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background shadow-sm",
                          user.status === "online" && "bg-green-500",
                          user.status === "away" && "bg-yellow-500",
                          user.status === "busy" && "bg-red-500",
                          user.status === "offline" && "bg-gray-400",
                        )}
                        aria-label={`Status: ${user.status}`}
                      />
                    )}

                    {/* Verified badge */}
                    {user.verified && (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
                        <Check className="h-2 w-2 text-white" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 sm:w-72">
                <DropdownMenuLabel className="p-3">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <Image
                        src={user.image || "/placeholder.svg"}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                        {getUserInitials(user.name)}
                      </div>
                    )}
                    <div className="flex flex-col space-y-0.5 min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      {user.role && (
                        <Badge variant="secondary" className="w-fit text-xs mt-1">
                          {user.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onProfileView && (
                  <DropdownMenuItem onClick={onProfileView} className="cursor-pointer py-2.5">
                    <UserIcon className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onProfileEdit} className="cursor-pointer py-2.5">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>
                {onSettingsView && (
                  <DropdownMenuItem onClick={onSettingsView} className="cursor-pointer py-2.5">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={onSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive py-2.5"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl p-0 gap-0">
          <DialogHeader className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4">
            <DialogTitle className="text-base sm:text-lg">Quick Search</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Search for conversations, files, or messages across your workspace
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSearch} className="space-y-0">
            <div className="relative px-4 sm:px-6">
              <Search className="absolute left-7 sm:left-9 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 h-11 sm:h-12 text-sm sm:text-base border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary"
              />
            </div>

            <ScrollArea className="h-[50vh] sm:h-80 px-1 sm:px-2">
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1 p-2">
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      href={result.url}
                      onClick={() => {
                        setIsSearchOpen(false)
                        setSearchTerm("")
                        setSearchResults([])
                      }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <div className="mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0">
                        {getSearchIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                          {result.title}
                        </p>
                        {result.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs flex-shrink-0 h-fit">
                        {result.type}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No results found</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Try searching with different keywords</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <Keyboard className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">Start typing to search</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Search across all your content</p>
                </div>
              )}
            </ScrollArea>

            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t bg-muted/30 text-xs text-muted-foreground">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden sm:flex items-center gap-1.5">
                  <kbd className="px-2 py-1 text-xs bg-background border rounded shadow-sm">↵</kbd>
                  <span>to select</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <kbd className="px-2 py-1 text-xs bg-background border rounded shadow-sm">↑↓</kbd>
                  <span>to navigate</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 text-xs bg-background border rounded shadow-sm">Esc</kbd>
                <span>to close</span>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}