"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { SidebarEmptyState } from "./sidebar-empty-state"
import { SidebarSearchEmpty } from "./sidebar-search-empty"

interface SidebarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onNewChat: () => void
}

export function Sidebar({ searchQuery, setSearchQuery, onNewChat }: SidebarProps) {
  return (
    <>
      {/* Sidebar Header */}
      <div className="p-3 md:p-4 border-b border-border space-y-3">
        <Button
          onClick={onNewChat}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg glow-primary transition-all duration-300 group h-9 md:h-10"
        >
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          New Chat
        </Button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12 h-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
          />
          <kbd className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs text-muted-foreground bg-muted rounded border border-border">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Chat History - Empty State */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-custom">
        {searchQuery ? <SidebarSearchEmpty /> : <SidebarEmptyState />}
      </div>
    </>
  )
}