"use client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, LogOut, Settings, User } from "lucide-react"

interface UserProfile {
  name: string
  email: string
  avatar: string
}

interface UserMenuProps {
  userProfile: UserProfile
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onOpenProfile: () => void
  onLogout: () => void
  getUserInitials: (name: string) => string
}

export function UserMenu({ userProfile, isOpen, setIsOpen, onOpenProfile, onLogout, getUserInitials }: UserMenuProps) {
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-all duration-200 group">
          <Avatar className="w-6 h-6 md:w-7 md:h-7">
            <AvatarImage src={userProfile.avatar || "/placeholder.svg"} alt={userProfile.name} />
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white text-xs font-bold">
              {getUserInitials(userProfile.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm font-medium text-foreground">{userProfile.name}</span>
          <ChevronDown
            className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-foreground">{userProfile.name}</p>
            <p className="text-xs text-muted-foreground">{userProfile.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={onOpenProfile}
          className="cursor-pointer text-foreground hover:bg-secondary focus:bg-secondary"
        >
          <User className="w-4 h-4 mr-2" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer text-foreground hover:bg-secondary focus:bg-secondary">
          <Settings className="w-4 h-4 mr-2" />
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}