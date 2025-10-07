"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, Plus, MessageSquare, X, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Session {
  id: string
  title: string
  timestamp: Date
  lastMessage?: string
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  sessions: Session[]
  onNewChat: () => void
  onSessionClick: (sessionId: string) => void
  activeSessionId?: string
  onDeleteSession: (sessionId: string) => void
}

export default function Sidebar({
  isOpen,
  onClose,
  sessions,
  onNewChat,
  onSessionClick,
  activeSessionId,
  onDeleteSession,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredSessions = sessions.filter((session) => session.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    onDeleteSession(sessionId)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-80 transform bg-card/50 backdrop-blur-xl border-r border-border transition-transform duration-300 ease-in-out lg:relative lg:top-0 lg:h-full lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col p-4">
          {/* Close button for mobile */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>

          {/* New Chat Button */}
          <Button onClick={onNewChat} className="mb-4 w-full justify-start gap-2" variant="default">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "No conversations found" : "No conversations yet"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {searchTerm ? "Try a different search term" : "Start a new chat to begin"}
                  </p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <Card
                    key={session.id}
                    className={cn(
                      "group p-3 cursor-pointer transition-all hover:bg-accent/50 border-border/40",
                      activeSessionId === session.id && "bg-accent/80 border-accent",
                    )}
                    onClick={() => onSessionClick(session.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium truncate">{session.title}</h4>
                        {session.lastMessage && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{session.lastMessage}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(session.timestamp)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => handleDelete(e, session.id)}
                          aria-label="Delete conversation"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              {sessions.length} conversation{sessions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}