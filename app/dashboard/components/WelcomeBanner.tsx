'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { Sparkles, TrendingUp, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeBannerProps {
  className?: string;
}

export function WelcomeBanner({ className = '' }: WelcomeBannerProps) {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  
  const userName = session?.user?.name || 'User';
  const firstName = userName.split(' ')[0];
  
  // Don't render if closed
  if (!isVisible) {
    return null;
  }
  
  // Get current time for greeting
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className={`bg-black border border-gray-700 rounded-xl p-8 mb-8 relative ${className}`}>
      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-full transition-colors"
        onClick={() => setIsVisible(false)}
        aria-label="Close welcome banner"
      >
        <X className="h-4 w-4 text-gray-400 hover:text-white" />
      </Button>
      
      <div className="flex items-center justify-between pr-12">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white rounded-lg">
              <Sparkles className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {getGreeting()}, {firstName}! 🎓
              </h1>
              <p className="text-gray-400 text-lg mt-1">
                Ready to transform your lectures into interactive content?
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-gray-400">12 files uploaded</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-gray-400">145 minutes transcribed</span>
            </div>
          </div>
        </div>
        
        {/* Decorative Element */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
              <div className="text-4xl">📚</div>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-black" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}