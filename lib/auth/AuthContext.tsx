"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const STORAGE_KEY = "lecsy-user-session";

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if we're in the browser (not SSR)
      if (typeof window !== 'undefined') {
        const sessionData = localStorage.getItem(STORAGE_KEY);
        if (sessionData) {
          const userData: User = JSON.parse(sessionData);
          setUser(userData);
        } else {
          setUser(null);
        }
      } else {
        // On server side, just set user to null
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      if (result.data?.user) {
        const userData: User = {
          id: result.data.user.id,
          name: result.data.user.name || "",
          email: result.data.user.email,
          image: result.data.user.image || undefined,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        }
        setUser(userData);
      }

      return { success: true };
    } catch (error: unknown) {
      console.error("Sign in error:", error);
      const errorMessage = error instanceof Error ? error.message : "Sign in failed";
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      if (result.data?.user) {
        const userData: User = {
          id: result.data.user.id,
          name: result.data.user.name || "",
          email: result.data.user.email,
          image: result.data.user.image || undefined,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        }
        setUser(userData);
      }

      return { success: true };
    } catch (error: unknown) {
      console.error("Sign up error:", error);
      const errorMessage = error instanceof Error ? error.message : "Sign up failed";
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      setUser(null);
      router.push("/auth/signin");
    } catch (error) {
      console.error("Sign out failed:", error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      setUser(null);
      router.push("/auth/signin");
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
