'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { StatsCard } from "./components/StatsCard";
import { UploadAudio } from "./components/UploadAudio";
import { NavBar } from "./components/NavBar";
import { WelcomeBanner } from "./components/WelcomeBanner";
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
    <div className="min-h-screen bg-black">
      <NavBar />
      <div className="max-w-7xl mx-auto p-4">
        {/* Welcome Banner */}
        <WelcomeBanner className="mt-6" />

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