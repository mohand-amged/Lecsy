'use client';

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavBar } from "@/app/dashboard/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Shield, Upload, Loader2, FileText, History as HistoryIcon } from "lucide-react";
import type { Transcription } from '@/db/schema';

function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [recentTranscriptions, setRecentTranscriptions] = useState<Transcription[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push('/auth/signin');
      } else {
        setFormData({
          name: session.user.name || '',
          email: session.user.email || '',
        });
        fetchRecentTranscriptions();
      }
    }
  }, [session, isPending, router]);

  const fetchRecentTranscriptions = async () => {
    try {
      const response = await fetch('/api/transcriptions');
      if (response.ok) {
        const data = await response.json();
        setRecentTranscriptions((data.transcriptions || []).slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch transcriptions:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'processing':
      case 'queued':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement profile update API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: session.user.name || '',
      email: session.user.email || '',
    });
    setIsEditing(false);
  };

  const formatMemberDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 bg-gray-900 border-gray-800">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl">
                    <AvatarImage 
                      src={session.user.image || ''} 
                      alt={session.user.name || 'User avatar'}
                      className="object-cover" 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-black via-gray-800 to-gray-700 text-white text-3xl font-bold">
                      {getUserInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-2 right-2 h-5 w-5 bg-green-500 border-4 border-gray-900 rounded-full">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div className="text-center w-full">
                  <CardTitle className="text-xl font-bold text-white truncate">
                    {session.user.name || 'User'}
                  </CardTitle>
                  <CardDescription className="text-gray-400 truncate mt-1">
                    {session.user.email}
                  </CardDescription>
                </div>

                <Badge variant="secondary" className="mt-2">
                  Free Plan
                </Badge>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4 border-gray-700 hover:bg-gray-800 text-white"
                  onClick={() => console.log('Upload image')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change Avatar
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Account Information */}
          <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Account Information</CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your personal details
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      className="border-gray-700 hover:bg-gray-800 text-white"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      className="bg-white text-black hover:bg-gray-200"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="bg-gray-800 border-gray-700 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="bg-gray-800 border-gray-700 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
                {session.user.emailVerified && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">Email verified</span>
                  </div>
                )}
              </div>

              <Separator className="bg-gray-800" />

              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Account Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-400 flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Member Since
                    </Label>
                    <p className="text-white font-medium">
                      {formatMemberDate(session.user.createdAt?.toISOString())}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400 flex items-center text-sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Account Status
                    </Label>
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload History Section */}
        <Card className="mt-6 bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center">
                  <HistoryIcon className="h-5 w-5 mr-2" />
                  Recent Upload History
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your latest transcriptions
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/history')}
                className="border-gray-700 hover:bg-gray-800 text-white"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : recentTranscriptions.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex p-3 bg-gray-800 rounded-full mb-3">
                  <FileText className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-400 text-sm">No transcriptions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTranscriptions.map((trans) => (
                  <div
                    key={trans.id}
                    onClick={() => router.push(`/chat?transcriptId=${trans.transcriptId}`)}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-white hover:bg-gray-750 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-white rounded-lg">
                        <FileText className="h-4 w-4 text-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{trans.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span>{formatDate(trans.createdAt.toString())}</span>
                          <span>•</span>
                          <span className={getStatusColor(trans.status)}>{trans.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="mt-6 bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="border-gray-700 hover:bg-gray-800 text-white"
              onClick={() => router.push('/forget-password')}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mt-6 bg-gray-900 border-red-900">
          <CardHeader>
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
            <CardDescription className="text-gray-400">
              Irreversible actions for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive"
              onClick={() => console.log('Delete account')}
            >
              Delete Account
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Default export with proper dynamic configuration
export default ProfilePage;

// This tells Next.js to skip prerendering for this page
export const dynamic = 'force-dynamic';

// Alternative: You can also use this to mark as client-only
export const runtime = 'edge';