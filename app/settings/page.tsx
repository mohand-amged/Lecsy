"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Trash2, 
  Download,
  Upload,
  Key,
  CreditCard,
  HelpCircle,
  Save,
  RefreshCw
} from 'lucide-react'

interface UserSettings {
  // Notification preferences
  emailNotifications: boolean
  pushNotifications: boolean
  transcriptionComplete: boolean
  weeklyDigest: boolean
  
  // Privacy settings
  profileVisibility: 'public' | 'private'
  dataSharing: boolean
  analytics: boolean
  
  // App preferences
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  autoSave: boolean
  
  // Transcription settings
  defaultLanguage: string
  autoTranscribe: boolean
  qualityPreference: 'fast' | 'balanced' | 'accurate'
}

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const toast = useToast()
  
  const [settings, setSettings] = useState<UserSettings>({
    // Default values
    emailNotifications: true,
    pushNotifications: false,
    transcriptionComplete: true,
    weeklyDigest: false,
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true,
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    autoSave: true,
    defaultLanguage: 'en',
    autoTranscribe: true,
    qualityPreference: 'balanced'
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
      return
    }

    if (user) {
      loadSettings()
    }
  }, [user, loading, router])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings')
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setHasUnsavedChanges(false)
      toast.addToast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated successfully.',
        variant: 'success',
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.addToast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
  }

  const exportData = async () => {
    try {
      const response = await fetch('/api/export-data')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'lecsy-data-export.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast.addToast({
          title: 'Data Exported',
          description: 'Your data has been exported successfully.',
          variant: 'success',
        })
      }
    } catch (error) {
      toast.addToast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const deleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/delete-account', {
          method: 'DELETE',
        })
        
        if (response.ok) {
          toast.addToast({
            title: 'Account Deleted',
            description: 'Your account has been deleted successfully.',
            variant: 'success',
          })
          router.push('/')
        }
      } catch (error) {
        toast.addToast({
          title: 'Deletion Failed',
          description: 'Failed to delete account. Please contact support.',
          variant: 'destructive',
        })
      }
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-2xl font-bold text-primary-foreground">L</span>
          </div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
            </div>
          </div>
          
          {hasUnsavedChanges && (
            <Button onClick={saveSettings} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="general" className="gap-2">
              <User className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="transcription" className="gap-2">
              <Globe className="h-4 w-4" />
              Transcription
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how Lecsy looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value: any) => updateSetting('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-save</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save your work as you type
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Transcription Complete</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when transcriptions are finished
                    </p>
                  </div>
                  <Switch
                    checked={settings.transcriptionComplete}
                    onCheckedChange={(checked) => updateSetting('transcriptionComplete', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary of your activity
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyDigest}
                    onCheckedChange={(checked) => updateSetting('weeklyDigest', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select 
                    value={settings.profileVisibility} 
                    onValueChange={(value: any) => updateSetting('profileVisibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow anonymized data to be used for improving our services
                    </p>
                  </div>
                  <Switch
                    checked={settings.dataSharing}
                    onCheckedChange={(checked) => updateSetting('dataSharing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help us improve by sharing usage analytics
                    </p>
                  </div>
                  <Switch
                    checked={settings.analytics}
                    onCheckedChange={(checked) => updateSetting('analytics', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transcription Settings */}
          <TabsContent value="transcription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Transcription Preferences
                </CardTitle>
                <CardDescription>
                  Configure how transcriptions are processed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <Select 
                    value={settings.defaultLanguage} 
                    onValueChange={(value) => updateSetting('defaultLanguage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quality Preference</Label>
                  <Select 
                    value={settings.qualityPreference} 
                    onValueChange={(value: any) => updateSetting('qualityPreference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Fast (Lower accuracy)</SelectItem>
                      <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                      <SelectItem value="accurate">Accurate (Slower processing)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-transcribe</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically start transcription when files are uploaded
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoTranscribe}
                    onCheckedChange={(checked) => updateSetting('autoTranscribe', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Account Management
                </CardTitle>
                <CardDescription>
                  Manage your account data and subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Data Export</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download all your data including transcriptions, conversations, and settings.
                    </p>
                    <Button onClick={exportData} variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Export My Data
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2 text-destructive">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button onClick={deleteAccount} variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Support
                </CardTitle>
                <CardDescription>
                  Need help? Get in touch with our support team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Help Center
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Key className="h-4 w-4" />
                    API Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
