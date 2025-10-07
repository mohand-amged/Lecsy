"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authClient, CallbackContext } from "@/lib/auth/auth-client";

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
      const sessionData = localStorage.getItem(STORAGE_KEY);
      if (sessionData) {
        const userData: User = JSON.parse(sessionData);
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email(
        { email, password },
        {
          onSuccess: () => {
            const userData: User = {
              id: "1",
              name: email.split("@")[0],
              email,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
            setUser(userData);
          },
          onError: (ctx: CallbackContext) => {
            const message = ctx?.error?.message || "Unknown sign-in error";
            throw new Error(message);
          },
        }
      );

      if (result.error) {
        return { success: false, error: result.error.message };
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
      const result = await authClient.signUp.email(
        { name, email, password, callbackURL: "/dashboard" },
        {
          onSuccess: () => {
            const userData: User = { id: "1", name, email };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
            setUser(userData);
          },
          onError: (ctx: CallbackContext) => {
            const message = ctx?.error?.message || "Unknown sign-up error";
            throw new Error(message);
          },
        }
      );

      if (result.error) {
        return { success: false, error: result.error.message };
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
      await authClient.signOut({
        onSuccess: () => {
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
          router.push("/");
        },
        onError: (ctx: CallbackContext) => {
          console.error("Sign out error:", ctx?.error);
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
          router.push("/");
        },
      });
    } catch (error) {
      console.error("Sign out failed:", error);
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
      router.push("/");
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
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
