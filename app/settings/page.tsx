'use client';

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavBar } from "@/app/dashboard/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Globe, 
  Lock,
  FileText,
  Download,
  Palette,
  Volume2,
  Mail,
  Smartphone,
  Loader2,
  Save,
  Moon,
  Sun,
  Monitor
} from "lucide-react";

type ThemeMode = 'light' | 'dark' | 'system';
type Language = 'en' | 'es' | 'fr' | 'de' | 'ar';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // General Settings
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [transcriptionComplete, setTranscriptionComplete] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [promotions, setPromotions] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Transcription Settings
  const [autoDownload, setAutoDownload] = useState(false);
  const [defaultFormat, setDefaultFormat] = useState('txt');
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  const [includePunctuation, setIncludePunctuation] = useState(true);
  const [speakerIdentification, setSpeakerIdentification] = useState(false);

  // Privacy Settings
  const [saveHistory, setSaveHistory] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  if (isPending || !session) {
    return null;
  }

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const settings = {
        language,
        theme,
        notifications: {
          email: emailNotifications,
          transcriptionComplete,
          weeklyReport,
          promotions,
          push: pushNotifications,
        },
        transcription: {
          autoDownload,
          defaultFormat,
          autoDetectLanguage,
          includePunctuation,
          speakerIdentification,
        },
        privacy: {
          saveHistory,
          shareAnalytics,
        },
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <SettingsIcon className="h-8 w-8 mr-3" />
            Settings
          </h1>
          <p className="text-gray-400">Manage your preferences and account settings</p>
        </div>

        {/* Save Button - Sticky */}
        <div className="mb-6">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full sm:w-auto bg-white text-black hover:bg-gray-200"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Saved Successfully!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Configure your basic preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language" className="text-white">
                  Language
                </Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ar">العربية</option>
                </select>
              </div>

              {/* Theme */}
              <div className="space-y-2">
                <Label className="text-white flex items-center">
                  <Palette className="h-4 w-4 mr-2" />
                  Theme
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'light'
                        ? 'border-white bg-gray-800'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <Sun className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">Light</p>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-white bg-gray-800'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <Moon className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">Dark</p>
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'system'
                        ? 'border-white bg-gray-800'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <Monitor className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">System</p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <Label htmlFor="email-notifications" className="text-white font-medium">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-400">
                        Receive notifications via email
                      </p>
                    </div>
                  </div>
                  <Checkbox
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={(checked) => setEmailNotifications(!!checked)}
                  />
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="transcription-complete" className="text-white font-medium">
                      Transcription Complete
                    </Label>
                    <p className="text-sm text-gray-400">
                      Get notified when transcriptions finish
                    </p>
                  </div>
                  <Checkbox
                    id="transcription-complete"
                    checked={transcriptionComplete}
                    onCheckedChange={(checked) => setTranscriptionComplete(!!checked)}
                    disabled={!emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="weekly-report" className="text-white font-medium">
                      Weekly Summary Report
                    </Label>
                    <p className="text-sm text-gray-400">
                      Receive weekly usage statistics
                    </p>
                  </div>
                  <Checkbox
                    id="weekly-report"
                    checked={weeklyReport}
                    onCheckedChange={(checked) => setWeeklyReport(!!checked)}
                    disabled={!emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="promotions" className="text-white font-medium">
                      Promotional Emails
                    </Label>
                    <p className="text-sm text-gray-400">
                      Receive updates about new features and offers
                    </p>
                  </div>
                  <Checkbox
                    id="promotions"
                    checked={promotions}
                    onCheckedChange={(checked) => setPromotions(!!checked)}
                    disabled={!emailNotifications}
                  />
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3">
                    <Smartphone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <Label htmlFor="push-notifications" className="text-white font-medium">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-gray-400">
                        Receive browser push notifications
                      </p>
                    </div>
                  </div>
                  <Checkbox
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={(checked) => setPushNotifications(!!checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transcription Settings */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Volume2 className="h-5 w-5 mr-2" />
                Transcription Preferences
              </CardTitle>
              <CardDescription className="text-gray-400">
                Customize how your transcriptions are processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-download" className="text-white font-medium">
                    Auto-Download Transcriptions
                  </Label>
                  <p className="text-sm text-gray-400">
                    Automatically download when complete
                  </p>
                </div>
                <Checkbox
                  id="auto-download"
                  checked={autoDownload}
                  onCheckedChange={(checked) => setAutoDownload(!!checked)}
                />
              </div>

              <Separator className="bg-gray-800" />

              <div className="space-y-2">
                <Label htmlFor="default-format" className="text-white flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Default Export Format
                </Label>
                <select
                  id="default-format"
                  value={defaultFormat}
                  onChange={(e) => setDefaultFormat(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="txt">Plain Text (.txt)</option>
                  <option value="docx">Word Document (.docx)</option>
                  <option value="pdf">PDF Document (.pdf)</option>
                  <option value="srt">Subtitles (.srt)</option>
                  <option value="json">JSON (.json)</option>
                </select>
              </div>

              <Separator className="bg-gray-800" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-detect" className="text-white font-medium">
                    Auto-Detect Language
                  </Label>
                  <p className="text-sm text-gray-400">
                    Automatically identify the spoken language
                  </p>
                </div>
                <Checkbox
                  id="auto-detect"
                  checked={autoDetectLanguage}
                  onCheckedChange={(checked) => setAutoDetectLanguage(!!checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="punctuation" className="text-white font-medium">
                    Include Punctuation
                  </Label>
                  <p className="text-sm text-gray-400">
                    Add automatic punctuation and capitalization
                  </p>
                </div>
                <Checkbox
                  id="punctuation"
                  checked={includePunctuation}
                  onCheckedChange={(checked) => setIncludePunctuation(!!checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="speaker-id" className="text-white font-medium">
                    Speaker Identification
                  </Label>
                  <p className="text-sm text-gray-400">
                    Identify different speakers (Pro feature)
                  </p>
                </div>
                <Checkbox
                  id="speaker-id"
                  checked={speakerIdentification}
                  onCheckedChange={(checked) => setSpeakerIdentification(!!checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Privacy & Data
              </CardTitle>
              <CardDescription className="text-gray-400">
                Control your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="save-history" className="text-white font-medium">
                    Save Transcription History
                  </Label>
                  <p className="text-sm text-gray-400">
                    Keep a record of all your transcriptions
                  </p>
                </div>
                <Checkbox
                  id="save-history"
                  checked={saveHistory}
                  onCheckedChange={(checked) => setSaveHistory(!!checked)}
                />
              </div>

              <Separator className="bg-gray-800" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="share-analytics" className="text-white font-medium">
                    Share Anonymous Analytics
                  </Label>
                  <p className="text-sm text-gray-400">
                    Help us improve by sharing usage data
                  </p>
                </div>
                <Checkbox
                  id="share-analytics"
                  checked={shareAnalytics}
                  onCheckedChange={(checked) => setShareAnalytics(!!checked)}
                />
              </div>

              <Separator className="bg-gray-800" />

              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Data Management
                </Label>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800 text-white"
                    onClick={() => console.log('Export data')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export My Data
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => console.log('Clear history')}
                  >
                    Clear History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Links</CardTitle>
              <CardDescription className="text-gray-400">
                Access important pages and information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start border-gray-700 hover:bg-gray-800 text-white"
                  onClick={() => router.push('/profile')}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="justify-start border-gray-700 hover:bg-gray-800 text-white"
                  onClick={() => router.push('/subscription')}
                >
                  Manage Subscription
                </Button>
                <Button
                  variant="outline"
                  className="justify-start border-gray-700 hover:bg-gray-800 text-white"
                  onClick={() => router.push('/forget-password')}
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="justify-start border-gray-700 hover:bg-gray-800 text-white"
                  onClick={() => router.push('/help')}
                >
                  Help & Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Save Button */}
        <div className="mt-8 pb-8">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full bg-white text-black hover:bg-gray-200"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : saveSuccess ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                All Changes Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

// Alternative: You can also use this to mark as client-only
export const runtime = 'edge';