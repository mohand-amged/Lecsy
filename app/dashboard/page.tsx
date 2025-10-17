'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { StatsCard } from "./components/StatsCard";
import { UploadAudio } from "./components/UploadAudio";
import { AudioLines, Clock, Upload } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const userName = session?.user?.name;
  const userEmail = session?.user?.email;

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push('/login');
      }
    }
  }, [session, isPending, router]);

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-300 text-lg mt-1">Welcome back, {userName} 🎓</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant='outline'
            className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
          >
            Sign Out
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Audios"
            value="12"
            icon={<AudioLines className="h-6 w-6" />}
          />
          <StatsCard
            title="Total Minutes"
            value="145"
            icon={<Clock className="h-6 w-6" />}
          />
          <StatsCard
            title="Last Uploaded"
            value="2 hours ago"
            icon={<Upload className="h-6 w-6" />}
          />
        </div>

        {/* Upload Section */}
        <div className="w-full">
          <UploadAudio />
        </div>
      </div>
    </div>
  );
}