"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import ProfileDialog from '@/components/ProfileDialog'
import { ArrowLeft, Edit, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  name: string
  email: string
  image?: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
      return
    }

    if (user) {
      fetchProfile()
    }
  }, [user, loading, router])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/profile')
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setProfile(data.user)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.addToast({
        title: 'Error',
        description: 'Failed to load profile information',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileSave = async (updatedData: Partial<UserProfile>) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      const data = await response.json()
      setProfile(data.user)
      
      toast.addToast({
        title: 'Success',
        description: 'Profile updated successfully',
        variant: 'success',
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error // Re-throw to let ProfileDialog handle it
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-2xl font-bold text-primary-foreground">L</span>
          </div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load profile</p>
          <Button onClick={fetchProfile}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold ring-2 ring-border">
                    {getUserInitials(profile.name)}
                  </div>
                )}
                <div>
                  <CardTitle className="text-2xl">{profile.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    {profile.emailVerified ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setIsProfileDialogOpen(true)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your account details and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Member Since</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(profile.createdAt)}</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Last Updated</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(profile.updatedAt)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Account ID</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded">{profile.id}</code>
            </div>
          </CardContent>
        </Card>

        {/* Profile Dialog */}
        {profile && (
          <ProfileDialog
            isOpen={isProfileDialogOpen}
            onClose={() => setIsProfileDialogOpen(false)}
            user={profile}
            onSave={handleProfileSave}
          />
        )}
      </div>
    </div>
  )
}
