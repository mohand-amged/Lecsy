"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthFormProps {
  mode: "signin" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: mode === "signup" ? "" : undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isSignUp = mode === "signup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(form.name || "", form.email, form.password);
      } else {
        result = await signIn(form.email, form.password);
      }

      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4 hover:bg-primary/90 transition-colors">
              <span className="text-2xl font-bold text-primary-foreground">L</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignUp 
              ? "Join Lecsy AI and start learning today" 
              : "Sign in to your Lecsy AI account"
            }
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-lg border-border/40 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">
              {isSignUp ? "Sign up" : "Sign in"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp 
                ? "Enter your details to create your account" 
                : "Enter your credentials to access your account"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field for sign up */}
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={form.name || ""}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="pl-10 h-12"
                      required={isSignUp}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="pl-10 h-12"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pl-10 pr-10 h-12"
                    required
                    minLength={isSignUp ? 8 : undefined}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {isSignUp && (
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters long
                  </p>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  isSignUp ? "Create Account" : "Sign In"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                </span>
              </div>
            </div>

            {/* Switch between sign in/up */}
            <div className="text-center">
              <Link
                href={isSignUp ? "/sign-in" : "/sign-up"}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {isSignUp ? "Sign in to your account" : "Create a new account"}
              </Link>
            </div>

            {/* Forgot password for sign in */}
            {!isSignUp && (
              <div className="text-center">
                <Link
                  href="#" // TODO: Implement forgot password
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            By {isSignUp ? "creating an account" : "signing in"}, you agree to our{" "}
            <Link href="#" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}