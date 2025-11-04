'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { Sparkles, TrendingUp, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimeGreeting } from '@/components/onboarding/useTimeGreeting';

interface WelcomeBannerProps {
  className?: string;
}

export function WelcomeBanner({ className = '' }: WelcomeBannerProps) {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const greeting = useTimeGreeting();
  
  const userName = session?.user?.name || 'User';
  const firstName = userName.split(' ')[0];
  
  // Don't render if closed
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className={`relative overflow-hidden bg-gray-900 border border-gray-700 rounded-2xl p-8 mb-8 shadow-2xl ${className}`} data-tour="welcome-banner">
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" style={{ animation: 'shimmer 3s infinite' }} />
      
      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-full transition-all hover:scale-110 z-10"
        onClick={() => setIsVisible(false)}
        aria-label="Close welcome banner"
      >
        <X className="h-4 w-4 text-gray-400 hover:text-white" />
      </Button>
      
      <div className="relative flex items-center justify-between pr-12">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white rounded-xl shadow-lg">
              <Sparkles className="h-7 w-7 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">
                {greeting}, {firstName}! 🎓
              </h1>
              <p className="text-gray-400 text-lg mt-2 font-medium">
                Ready to transform your lectures into interactive content? ✨
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-4 mt-6" data-tour="stats-cards">
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
              <TrendingUp className="h-5 w-5 text-white" />
              <span className="text-gray-300 font-semibold">12 files uploaded</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
              <Clock className="h-5 w-5 text-white" />
              <span className="text-gray-300 font-semibold">145 minutes transcribed</span>
            </div>
          </div>
        </div>
        
        {/* Decorative Element */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="w-36 h-36 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform rotate-6 hover:rotate-12 transition-transform duration-500">
              <div className="text-6xl">📚</div>
            </div>
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
