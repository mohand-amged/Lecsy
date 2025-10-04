"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProfileForm } from "./profile-form"

interface UserProfile {
  name: string
  email: string
  bio: string
  avatar: string
}

interface ProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  userProfile: UserProfile
  onSave: (profile: UserProfile) => Promise<void>
  getUserInitials: (name: string) => string
}

export function ProfileDialog({ isOpen, onClose, userProfile, onSave, getUserInitials }: ProfileDialogProps) {
  const handleSave = async (profile: UserProfile) => {
    await onSave(profile)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">Profile Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your profile information and avatar
          </DialogDescription>
        </DialogHeader>
        <ProfileForm
          userProfile={userProfile}
          onSave={handleSave}
          onCancel={onClose}
          getUserInitials={getUserInitials}
        />
      </DialogContent>
    </Dialog>
  )
}