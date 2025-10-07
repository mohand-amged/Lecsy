"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, User, Settings, ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface NavBarProps {
  user?: User | null;
}

export default function NavBar({ user }: NavBarProps) {
  const { signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setIsUserMenuOpen(false);

    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">L</span>
              </div>
              <span className="text-xl font-bold text-foreground">Lecsy AI</span>
            </Link>
          </div>

          {/* Desktop Navigation - Only show when user is not signed in */}
          {!user && (
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
            </div>
          )}

          {/* User Menu or Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  disabled={isSigningOut}
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {getUserInitials(user.name)}
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium text-foreground">
                    {user.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right">
                    <Card className="shadow-lg border-border/40">
                      <CardContent className="p-0">
                        <div className="py-2">
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-border">
                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>

                          {/* Menu Items */}
                          <div className="py-1">
                            <Link
                              href="/dashboard"
                              className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <User className="mr-3 h-4 w-4" />
                              Dashboard
                            </Link>
                            <Link
                              href="/settings"
                              className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Settings className="mr-3 h-4 w-4" />
                              Settings
                            </Link>
                          </div>

                          {/* Sign Out */}
                          <div className="border-t border-border pt-1">
                            <button
                              onClick={handleSignOut}
                              disabled={isSigningOut}
                              className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <LogOut className="mr-3 h-4 w-4" />
                              {isSigningOut ? "Signing out..." : "Sign out"}
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button - Only show when user is not signed in */}
            {!user && (
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu - Only show when user is not signed in */}
        {isMobileMenuOpen && !user && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border">
              <Link
                href="/features"
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>

              <div className="pt-4 border-t border-border space-y-2">
                <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}