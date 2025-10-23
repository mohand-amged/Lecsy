'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  User,
  Settings,
  History,
  Upload,
  LogOut,
  CreditCard,
  HelpCircle
} from 'lucide-react';

export function NavBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Mock user stats - replace with real data from your API
  const userStats = {
    totalUploads: 12,
    totalMinutes: 145,
    subscription: 'Free', // or 'Pro', 'Premium'
    unreadNotifications: 3
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/signin');
  };

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPageName = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/profile') return 'Profile';
    if (pathname === '/history') return 'History';
    if (pathname === '/settings') return 'Settings';
    if (pathname === '/subscription') return 'Subscription';
    if (pathname === '/help') return 'Help';
    if (pathname === '/notifications') return 'Notifications';
    if (pathname?.startsWith('/chat')) return 'Chat';
    return 'Dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 bg-black backdrop-blur-md border-b border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Lecsy Branding */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white hover:text-gray-300 transition-colors duration-200 cursor-pointer"
                  onClick={() => router.push('/dashboard')}>
                Lecsy
              </h1>
            </div>
            
            {/* Breadcrumb indicator */}
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
              <span>/</span>
              <span className="font-medium">{getPageName()}</span>
            </div>
          </div>

          {/* Profile Management - Only show when logged in */}
          {session?.user && (
            <div className="flex items-center space-x-3">
              {/* Quick Upload Button 
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden lg:flex items-center space-x-2 bg-white text-black hover:bg-gray-200 border-white transition-all duration-200 hover:scale-105"
                onClick={() => router.push('/dashboard')}
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Button>
              */}

              {/* Notifications Bell */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 group"
                  onClick={() => router.push('/notifications')}
                  aria-label={`Notifications ${userStats.unreadNotifications > 0 ? `(${userStats.unreadNotifications} unread)` : ''}`}
                >
                  <Bell className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                  {userStats.unreadNotifications > 0 && (
                    <>
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
                      >
                        {userStats.unreadNotifications > 9 ? '9+' : userStats.unreadNotifications}
                      </Badge>
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    </>
                  )}
                </Button>
              </div>

              {/* User Info Card */}
              <div className="hidden lg:flex items-center space-x-3 bg-gray-800 rounded-full px-3 py-2 border border-gray-700">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-white truncate max-w-24">
                    {session.user.name?.split(' ')[0] || 'User'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={userStats.subscription === 'Free' ? 'secondary' : 'default'}
                      className="text-xs px-2 py-0.5"
                    >
                      {userStats.subscription}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {userStats.totalUploads}
                    </span>
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-600"></div>
              </div>
            
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-12 w-12 rounded-full hover:bg-gray-800 ring-2 ring-transparent hover:ring-gray-600 transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                    aria-label="Open user menu"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                      <AvatarImage 
                        src={session.user.image || ''} 
                        alt={session.user.name || 'User avatar'} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-black via-gray-800 to-gray-700 text-white text-sm font-bold">
                        {getUserInitials(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online status indicator with pulse animation */}
                    <div className="absolute bottom-0.5 right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full">
                      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
              
                <DropdownMenuContent 
                  className="w-80 bg-white border border-gray-200 shadow-xl rounded-xl p-0 animate-in slide-in-from-top-2 duration-200" 
                  align="end" 
                  forceMount
                  sideOffset={8}
                >
                  {/* User Info Header */}
                  <DropdownMenuLabel className="font-normal p-0">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-t-xl">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="h-14 w-14 ring-3 ring-white shadow-lg">
                            <AvatarImage 
                              src={session.user.image || ''} 
                              alt={session.user.name || 'User avatar'}
                              className="object-cover" 
                            />
                            <AvatarFallback className="bg-gradient-to-br from-black via-gray-800 to-gray-700 text-white font-bold text-lg">
                              {getUserInitials(session.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-3 border-white rounded-full">
                            <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-black truncate">
                            {session.user.name || 'User'}
                          </h3>
                          <p className="text-sm text-gray-600 truncate font-medium">
                            {session.user.email}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge 
                              variant={userStats.subscription === 'Free' ? 'secondary' : 'default'}
                              className="text-xs font-semibold px-2 py-1"
                            >
                              {userStats.subscription} Plan
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <span className="font-medium">{userStats.totalMinutes}</span>
                              <span>min transcribed</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                
                  <DropdownMenuSeparator className="bg-gray-200 my-0" />
                  
                  {/* Quick Actions */}
                  <div className="p-3">
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-gray-50 text-black rounded-lg p-4 transition-colors duration-200 group"
                      onClick={() => router.push('/profile')}
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-sm">My Profile</span>
                        <p className="text-xs text-gray-500 mt-0.5">Manage your account settings</p>
                      </div>
                    </DropdownMenuItem>
                  
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-gray-50 text-black rounded-lg p-4 transition-colors duration-200 group"
                      onClick={() => router.push('/history')}
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors">
                        <History className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-sm">Upload History</span>
                        <p className="text-xs text-gray-500 mt-0.5">{userStats.totalUploads} files uploaded</p>
                      </div>
                    </DropdownMenuItem>
                  
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-gray-50 text-black rounded-lg p-4 transition-colors duration-200 group"
                      onClick={() => router.push('/dashboard')}
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-black rounded-lg mr-3 group-hover:bg-gray-800 transition-colors">
                        <Upload className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-sm">Upload Audio</span>
                        <p className="text-xs text-gray-500 mt-0.5">Add new recording</p>
                      </div>
                    </DropdownMenuItem>
                  </div>
                
                  <DropdownMenuSeparator className="bg-gray-200 my-0" />
                  
                  {/* Settings & Support */}
                  <div className="p-3">
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-gray-50 text-black rounded-lg p-4 transition-colors duration-200 group"
                      onClick={() => router.push('/subscription')}
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-sm">Subscription</span>
                        <p className="text-xs text-gray-500 mt-0.5">Manage billing & plans</p>
                      </div>
                    </DropdownMenuItem>
                  
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-gray-50 text-black rounded-lg p-4 transition-colors duration-200 group"
                      onClick={() => router.push('/settings')}
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors">
                        <Settings className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-sm">Settings</span>
                        <p className="text-xs text-gray-500 mt-0.5">Preferences & privacy</p>
                      </div>
                    </DropdownMenuItem>
                  
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-gray-50 text-black rounded-lg p-4 transition-colors duration-200 group"
                      onClick={() => router.push('/help')}
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors">
                        <HelpCircle className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-sm">Help & Support</span>
                        <p className="text-xs text-gray-500 mt-0.5">Get help and tutorials</p>
                      </div>
                    </DropdownMenuItem>
                  </div>
                
                  <DropdownMenuSeparator className="bg-gray-200 my-0" />
                  
                  {/* Sign Out */}
                  <div className="p-3">
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-red-50 text-red-600 focus:text-red-600 rounded-lg p-4 transition-colors duration-200 group"
                      onClick={handleSignOut}
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors">
                        <LogOut className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-sm">Sign out</span>
                        <p className="text-xs text-red-400 mt-0.5">End your session</p>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}