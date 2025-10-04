"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"

interface UserProfile {
  name: string
  email: string
  bio: string
  avatar: string
}

interface ProfileFormProps {
  userProfile: UserProfile
  onSave: (profile: UserProfile) => Promise<void>
  onCancel: () => void
  getUserInitials: (name: string) => string
}

export function ProfileForm({ userProfile, onSave, onCancel, getUserInitials }: ProfileFormProps) {
  const [editedProfile, setEditedProfile] = useState<UserProfile>(userProfile)
  const [isSaving, setIsSaving] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditedProfile({ ...editedProfile, avatar: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editedProfile)
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-4 md:gap-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src={editedProfile.avatar || "/placeholder.svg"} alt={editedProfile.name} />
          <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white text-2xl font-bold">
            {getUserInitials(editedProfile.name)}
          </AvatarFallback>
        </Avatar>
        <Button
          variant="outline"
          size="sm"
          onClick={() => avatarInputRef.current?.click()}
          className="border-border hover:bg-secondary"
        >
          <Camera className="w-4 h-4 mr-2" />
          Change Avatar
        </Button>
        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">
          Name
        </Label>
        <Input
          id="name"
          value={editedProfile.name}
          onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
          className="bg-secondary border-border text-foreground"
          placeholder="Enter your name"
        />
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={editedProfile.email}
          onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
          className="bg-secondary border-border text-foreground"
          placeholder="Enter your email"
        />
      </div>

      {/* Bio Field */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-foreground">
          Bio
        </Label>
        <Textarea
          id="bio"
          value={editedProfile.bio}
          onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
          className="bg-secondary border-border text-foreground min-h-[100px] resize-none"
          placeholder="Tell us about yourself"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-border hover:bg-secondary bg-transparent"
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}