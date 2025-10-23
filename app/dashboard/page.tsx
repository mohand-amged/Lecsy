'use client';

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { StatsCard } from "./components/StatsCard";
import { UploadAudio } from "./components/UploadAudio";
import { RecentRecordings } from "./components/RecentRecordings";
import { NavBar } from "./components/NavBar";
import { WelcomeBanner } from "./components/WelcomeBanner";
import { useDashboard } from "@/hooks/useDashboard";
import { AudioLines, Clock, Upload } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { stats, loading: statsLoading } = useDashboard();

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push('/login');
      }
    }
  }, [session, isPending, router]);

  if (isPending || !session) {
    return null;
  }

  const formatLastUpload = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Welcome Banner */}
        <WelcomeBanner className="mt-6 animate-in fade-in duration-500" />

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <StatsCard
            title="Total Audios"
            value={statsLoading ? '...' : stats?.totalAudios?.toString() || '0'}
            icon={<AudioLines className="h-6 w-6" />}
          />
          <StatsCard
            title="Total Minutes"
            value={statsLoading ? '...' : stats?.totalMinutes?.toString() || '0'}
            icon={<Clock className="h-6 w-6" />}
          />
          <StatsCard
            title="Last Uploaded"
            value={statsLoading ? '...' : formatLastUpload(stats?.lastUpload)}
            icon={<Upload className="h-6 w-6" />}
          />
        </div>

        {/* Upload Section - Full Width */}
        <div className="animate-in slide-in-from-left duration-700 mb-8">
          <UploadAudio />
        </div>
        
        {/* Recent Recordings Section - Full Width */}
        <div className="animate-in slide-in-from-right duration-700 mb-8">
          <RecentRecordings />
        </div>
      </div>
    </div>
  );
}