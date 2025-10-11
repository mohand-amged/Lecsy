"use client"

import * as React from "react"
import {
  Search,
  Filter,
  SortAsc,
  Calendar,
  Clock,
  Trash2,
  Download,
  FileText,
  Music,
  TrendingUp,
  Activity,
  Folder,
  X,
  Plus,
  Star,
  MoreVertical,
  Edit,
  Archive,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { DashboardNavBar } from "@/components/DashboardNavBar"

interface UserProfile {
  id: string
  name: string
  email: string
  bio?: string
  image?: string
}

interface TranscriptSession {
  id: string
  title: string
  transcript: string
  timestamp: Date
  audioUrl?: string
  duration?: number
  wordCount: number
  starred?: boolean
  archived?: boolean
  tags?: string[]
}


// Profile Dialog Component
function ProfileDialog({ 
  isOpen, 
  onClose, 
  user, 
  onSave 
}: { 
  isOpen: boolean
  onClose: () => void
  user: UserProfile
  onSave: (user: Partial<UserProfile>) => Promise<void>
}) {
  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)
  const [bio, setBio] = React.useState(user.bio || "")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (isOpen) {
      setName(user.name)
      setEmail(user.email)
      setBio(user.bio || "")
    }
  }, [isOpen, user])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ name, email, bio })
      onClose()
    } catch (error) {
      console.error("Failed to save profile:", error)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              className="w-full min-h-[100px] px-3 py-2 text-sm border border-input rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="p-6 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [user, setUser] = React.useState<UserProfile | null>(null)
  const [sessions, setSessions] = React.useState<TranscriptSession[]>([])
  const [loading, setLoading] = React.useState(true)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortBy, setSortBy] = React.useState<"date" | "title" | "duration">("date")
  const [filterBy, setFilterBy] = React.useState<"all" | "starred" | "archived">("all")
  const [showMenu, setShowMenu] = React.useState<string | null>(null)
  const [showProfileMenu, setShowProfileMenu] = React.useState(false)
  const [showProfileDialog, setShowProfileDialog] = React.useState(false)
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [theme, setTheme] = React.useState<"light" | "dark">("light")

  // Fetch dashboard data on mount
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setSessions(data.sessions)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleFilterChange = React.useCallback((value: string) => {
    const newValue = value as "all" | "starred" | "archived"
    if (newValue !== filterBy) {
      setFilterBy(newValue)
    }
  }, [filterBy])

  const handleSortChange = React.useCallback((value: string) => {
    const newValue = value as "date" | "title" | "duration"
    if (newValue !== sortBy) {
      setSortBy(newValue)
    }
  }, [sortBy])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowProfileMenu(false)
      setShowNotifications(false)
      setShowMenu(null)
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const stats = React.useMemo(() => {
    if (!sessions) return { total: 0, thisWeek: 0, totalWords: 0, totalHours: 0, averageWords: 0, averageDuration: 0, starred: 0, archived: 0 }

    const total = sessions.length
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const thisWeek = sessions.filter((s) => {
      const sessionDate = typeof s.timestamp === 'string' 
        ? new Date(s.timestamp) 
        : s.timestamp
      return sessionDate >= weekAgo
    }).length
    
    const totalWords = sessions.reduce((acc, s) => {
      const words = s.wordCount || s.transcript.trim().split(/\s+/).filter(Boolean).length
      return acc + words
    }, 0)
    
    const totalCharacters = sessions.reduce((acc, s) => acc + s.transcript.length, 0)
    const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0)
    const totalHours = Math.floor(totalDuration / 3600)
    const totalMinutes = Math.floor(totalDuration / 60)
    
    const averageWords = total > 0 ? Math.round(totalWords / total) : 0
    const averageDuration = total > 0 ? Math.round(totalDuration / total) : 0
    
    const starredCount = sessions.filter(s => s.starred).length
    const archivedCount = sessions.filter(s => s.archived).length
    
    return {
      total,
      thisWeek,
      totalWords,
      totalCharacters,
      totalHours,
      totalMinutes,
      averageWords,
      averageDuration,
      starred: starredCount,
      archived: archivedCount,
    }
  }, [sessions])

  const filteredSessions = React.useMemo(() => {
    if (!sessions) return []

    let filtered = sessions

    if (filterBy === "starred") {
      filtered = filtered.filter((s) => s.starred)
    } else if (filterBy === "archived") {
      filtered = filtered.filter((s) => s.archived)
    } else {
      filtered = filtered.filter((s) => !s.archived)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const aTime = typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : a.timestamp.getTime()
        const bTime = typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : b.timestamp.getTime()
        return bTime - aTime
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title)
      } else {
        return (b.duration || 0) - (a.duration || 0)
      }
    })

    return filtered
  }, [sessions, searchQuery, sortBy, filterBy])

  const toggleStar = async (id: string) => {
    if (!sessions) return

    const session = sessions.find(s => s.id === id)
    if (!session) return

    const newStarredState = !session.starred
    
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, starred: newStarredState } : s))
    )

    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: newStarredState })
      })
      if (!response.ok) throw new Error('Failed to update session')
    } catch (error) {
      console.error('Failed to update session:', error)
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, starred: !newStarredState } : s))
      )
    }
  }

  const toggleArchive = async (id: string) => {
    if (!sessions) return

    const session = sessions.find(s => s.id === id)
    if (!session) return

    const newArchivedState = !session.archived
    
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, archived: newArchivedState } : s))
    )

    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: newArchivedState })
      })
      if (!response.ok) throw new Error('Failed to update session')
    } catch (error) {
      console.error('Failed to update session:', error)
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, archived: !newArchivedState } : s))
      )
    }
  }

  const deleteSession = async (id: string) => {
    if (!sessions) return

    setSessions((prev) => prev.filter((s) => s.id !== id))
    setShowMenu(null)

    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete session')
    } catch (error) {
      console.error("Failed to delete session:", error)
      // Restore the session if deletion failed
      setSessions((prev) => [...prev, sessions.find(s => s.id === id)!])
    }
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0m"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const timestamp = typeof date === 'string' ? new Date(date) : date
    const diff = now.getTime() - timestamp.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    
    return timestamp.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: timestamp.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    })
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSaveProfile = async (updatedUser: Partial<UserProfile>) => {
    if (!user) return

    const newUser: UserProfile = {
      id: user.id,
      name: updatedUser.name ?? user.name,
      email: updatedUser.email ?? user.email,
      bio: updatedUser.bio ?? user.bio ?? '',
      image: updatedUser.image ?? user.image ?? '',
    }

    setUser(newUser)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      if (!response.ok) throw new Error('Failed to update user')
    } catch (error) {
      console.error("Failed to update user:", error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      ) : user ? (
        <>
          <DashboardNavBar
            user={user}
            theme={theme}
            showProfileMenu={showProfileMenu}
            showNotifications={showNotifications}
            onToggleTheme={toggleTheme}
            onToggleProfileMenu={() => setShowProfileMenu(!showProfileMenu)}
            onToggleNotifications={() => setShowNotifications(!showNotifications)}
            onOpenProfileDialog={() => setShowProfileDialog(true)}
            getUserInitials={getUserInitials}
          />

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">
                Manage your transcriptions and audio files
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">Total Sessions</p>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Folder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm">
                    <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-green-600 font-medium">+{stats.thisWeek}</span>
                    <span className="text-muted-foreground">this week</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">Total Words</p>
                      <p className="text-3xl font-bold">{formatNumber(stats.totalWords)}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {stats.averageWords > 0 ? `~${formatNumber(stats.averageWords)} avg per session` : 'Across all transcripts'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">Audio Time</p>
                      <p className="text-3xl font-bold">
                        {stats.totalHours > 0 ? `${stats.totalHours}h` : `${stats.totalMinutes}m`}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                      <Music className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {stats.averageDuration > 0 
                      ? `~${formatDuration(stats.averageDuration)} avg per session`
                      : 'Total recorded time'
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">This Week</p>
                      <p className="text-3xl font-bold">{stats.thisWeek}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    New transcriptions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Search transcriptions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Select value={filterBy} onValueChange={handleFilterChange}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Files</SelectItem>
                        <SelectItem value="starred">Starred</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-[140px]">
                        <SortAsc className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="duration">Duration</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      New Upload
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sessions Grid */}
            {filteredSessions.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">No transcriptions found</h3>
                      <p className="text-muted-foreground max-w-md">
                        {searchQuery
                          ? "Try adjusting your search or filters"
                          : "Upload your first audio file to get started"}
                      </p>
                    </div>
                    <Button size="lg" className="gap-2 mt-4">
                      <Plus className="h-5 w-5" />
                      Upload Audio File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSessions.map((session) => (
                  <Card
                    key={session.id}
                    className="group hover:shadow-lg transition-all cursor-pointer"
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                            {session.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(session.timestamp)}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleStar(session.id)
                            }}
                            className="h-8 w-8"
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                session.starred && "fill-yellow-500 text-yellow-500"
                              )}
                            />
                          </Button>

                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowMenu(showMenu === session.id ? null : session.id)
                              }}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                            
                            {showMenu === session.id && (
                              <div className="absolute right-0 top-10 w-48 bg-popover border rounded-lg shadow-lg z-20 py-1">
                                <button
                                  className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setShowMenu(null)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setShowMenu(null)
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleArchive(session.id)
                                    setShowMenu(null)
                                  }}
                                >
                                  <Archive className="h-4 w-4" />
                                  {session.archived ? "Unarchive" : "Archive"}
                                </button>
                                <div className="border-t my-1"></div>
                                <button
                                  className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2 text-destructive transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteSession(session.id)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {session.transcript}
                      </p>

                      {session.tags && session.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {session.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{session.duration ? formatDuration(session.duration) : "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>{session.wordCount.toLocaleString()} words</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>

          {/* Profile Dialog */}
          <ProfileDialog
            isOpen={showProfileDialog}
            onClose={() => setShowProfileDialog(false)}
            user={user}
            onSave={handleSaveProfile}
          />
        </>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-muted-foreground">Please sign in to access your dashboard.</p>
          </div>
        </div>
      )}
    </div>
  )
}