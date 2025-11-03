'use client';

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { NavBar } from "@/app/dashboard/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Shield, Upload, Loader2, FileText, History as HistoryIcon, ChevronRight } from "lucide-react";
import type { Transcription } from '@/db/schema';

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <ProfileContent />;
}

function ProfileContent() {
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
        router.push('/login');
      } else {
        setFormData({
          name: session.user.name || '',
          email: session.user.email || '',
        });
        fetchRecentTranscriptions();
      }
    }
  }, [session, isPending, router]);

  const fetchRecentTranscriptions = useCallback(async () => {
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
  }, []);

  const formatDate = useCallback((dateString: string) => {
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
  }, []);

  const getStatusColor = useCallback((_status: string) => {
    // Monochrome UI: use a single neutral color for all statuses
    void _status;
    return 'text-white/70';
  }, []);

  const userInitials = useMemo(() => {
    const name = session?.user?.name;
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [session?.user?.name]);

  const recentTranscriptionsWithFormatting = useMemo(
    () => recentTranscriptions.map(trans => ({
      ...trans,
      formattedDate: formatDate(trans.createdAt.toString()),
      statusColor: getStatusColor(trans.status)
    })),
    [recentTranscriptions, formatDate, getStatusColor]
  );

  if (isPending) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const handleSave = useCallback(async () => {
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
  }, []);

  const handleCancel = useCallback(() => {
    setFormData({
      name: session?.user?.name || '',
      email: session?.user?.email || '',
    });
    setIsEditing(false);
  }, [session]);

  const formatMemberDate = useCallback((dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-white/60">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 bg-black border-white/10">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl">
                    <AvatarImage 
                      src={session.user.image || ''} 
                      alt={session.user.name || 'User avatar'}
                      className="object-cover" 
                    />
                  <AvatarFallback className="bg-black text-white text-3xl font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-2 right-2 h-5 w-5 bg-white border-4 border-black rounded-full">
                    <div className="absolute inset-0 bg-white rounded-full animate-pulse"></div>
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

                <Badge variant="secondary" className="mt-2 bg-white text-black">
                  Free Plan
                </Badge>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4 border-white/20 hover:bg-white/10 text-white"
                  onClick={() => console.log('Upload image')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change Avatar
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Account Information */}
          <Card className="lg:col-span-2 bg-black border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Account Information</CardTitle>
                  <CardDescription className="text-white/60">
                    Update your personal details
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-black hover:opacity-90"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      className="border-white/20 hover:bg-white/10 text-white"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      className="bg-white text-black hover:opacity-90"
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
                  <User className="h-4 w-4 mr-2 text-white/60" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="bg-black border-white/20 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-white/60" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="bg-black border-white/20 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
                {session.user.emailVerified && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Shield className="h-4 w-4 text-white" />
                    <span className="text-sm text-white">Email verified</span>
                  </div>
                )}
              </div>

              <Separator className="bg-white/10" />

              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Account Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/60 flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-white/60" />
                      Member Since
                    </Label>
                    <p className="text-white font-medium">
                      {formatMemberDate(session.user.createdAt?.toISOString())}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/60 flex items-center text-sm">
                      <Shield className="h-4 w-4 mr-2 text-white/60" />
                      Account Status
                    </Label>
                    <Badge variant="default" className="bg-white text-black">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload History Section */}
        <Card className="mt-6 bg-black border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center">
                  <HistoryIcon className="h-5 w-5 mr-2" />
                  Recent Upload History
                </CardTitle>
                <CardDescription className="text-white/60">
                  Your latest transcriptions
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/history')}
                className="border-white/20 hover:bg-white/10 text-white"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-white/60 animate-spin" />
              </div>
            ) : recentTranscriptions.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex p-3 bg-white/10 rounded-full mb-3">
                  <FileText className="h-8 w-8 text-white/60" />
                </div>
                <p className="text-white/60 text-sm">No transcriptions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTranscriptionsWithFormatting.map((trans) => (
                  <div
                    key={trans.id}
                    onClick={() => router.push(`/chat?transcriptId=${trans.transcriptId}`)}
                    className="flex items-center justify-between p-3 bg-black rounded-lg border border-white/15 hover:border-white hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-white rounded-lg">
                        <FileText className="h-4 w-4 text-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate group-hover:text-white">
                          {trans.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-white/60 mt-0.5">
                          <span>{trans.formattedDate}</span>
                          <span>•</span>
                          <span className={trans.statusColor}>{trans.status}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="mt-6 bg-black border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security
            </CardTitle>
            <CardDescription className="text-white/60">
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="border-white/20 hover:bg-white/10 text-white"
              onClick={() => router.push('/forget-password')}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mt-6 bg-black border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Danger Zone</CardTitle>
            <CardDescription className="text-white/60">
              Irreversible actions for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="bg-white text-black hover:opacity-90"
              onClick={() => console.log('Delete account')}
            >
              Delete Account
            </Button>
            <p className="text-xs text-white/60 mt-2">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
