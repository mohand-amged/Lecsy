"use client"

import * as React from "react"
import Image from "next/image"
import { Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface UserProfile {
  id: string
  name: string
  email: string
  bio?: string
  image?: string
}

interface ProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  user: UserProfile
  onSave: (updatedUser: Partial<UserProfile>) => Promise<void>
}

export default function ProfileDialog({ 
  isOpen, 
  onClose, 
  user, 
  onSave 
}: ProfileDialogProps) {
  const [formData, setFormData] = React.useState({
    name: user.name,
    email: user.email,
    bio: user.bio || "",
    image: user.image || ""
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const { addToast } = useToast()

  // Reset form when user changes or dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        image: user.image || ""
      })
      setErrors({})
    }
  }, [isOpen, user])

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = "Bio must be 500 characters or less"
    }

    if (formData.image && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.image)) {
      newErrors.image = "Please enter a valid image URL"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      // Only send changed fields
      const changes: Partial<UserProfile> = {}
      if (formData.name !== user.name) changes.name = formData.name.trim()
      if (formData.email !== user.email) changes.email = formData.email.trim()
      if (formData.bio !== (user.bio || "")) changes.bio = formData.bio.trim()
      if (formData.image !== (user.image || "")) changes.image = formData.image.trim()

      await onSave(changes)
      
      addToast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        variant: "success"
      })
      
      onClose()
    } catch (error) {
      addToast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      bio: user.bio || "",
      image: user.image || ""
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {formData.image ? (
                <Image
                  src={formData.image}
                  alt={formData.name}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
                  onError={() => handleInputChange("image", "")}
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold ring-2 ring-border">
                  {getUserInitials(formData.name || "User")}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
                <Camera className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your name"
                className={cn(errors.name && "border-destructive")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
                className={cn(errors.email && "border-destructive")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us a bit about yourself..."
                className={cn(
                  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                  errors.bio && "border-destructive"
                )}
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                {errors.bio && (
                  <p className="text-sm text-destructive">{errors.bio}</p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {formData.bio.length}/500
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Avatar URL (optional)</Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => handleInputChange("image", e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className={cn(errors.image && "border-destructive")}
              />
              {errors.image && (
                <p className="text-sm text-destructive">{errors.image}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter a URL to your profile picture
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}