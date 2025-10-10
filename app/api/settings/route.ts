import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'

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

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return default settings for now (will be replaced with database storage later)
    const defaultSettings: UserSettings = {
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
    }

    return NextResponse.json({ 
      settings: defaultSettings 
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the settings structure
    const validKeys = [
      'emailNotifications', 'pushNotifications', 'transcriptionComplete', 'weeklyDigest',
      'profileVisibility', 'dataSharing', 'analytics',
      'theme', 'language', 'timezone', 'autoSave',
      'defaultLanguage', 'autoTranscribe', 'qualityPreference'
    ]

    const filteredSettings: any = {}
    for (const [key, value] of Object.entries(body)) {
      if (validKeys.includes(key)) {
        filteredSettings[key] = value
      }
    }

    // Validate specific field values
    if (filteredSettings.profileVisibility && !['public', 'private'].includes(filteredSettings.profileVisibility)) {
      return NextResponse.json({ error: 'Invalid profile visibility value' }, { status: 400 })
    }

    if (filteredSettings.theme && !['light', 'dark', 'system'].includes(filteredSettings.theme)) {
      return NextResponse.json({ error: 'Invalid theme value' }, { status: 400 })
    }

    if (filteredSettings.qualityPreference && !['fast', 'balanced', 'accurate'].includes(filteredSettings.qualityPreference)) {
      return NextResponse.json({ error: 'Invalid quality preference value' }, { status: 400 })
    }

    // For now, just return the submitted settings (will be replaced with database storage later)
    // TODO: Replace with actual database storage once Prisma client is regenerated
    
    return NextResponse.json({ 
      settings: filteredSettings,
      message: 'Settings updated successfully' 
    })
  } catch (error) {
    console.error('Settings PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
