"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Play, Star, Users, Zap, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to dashboard if user is authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI-Powered Transcription",
      description: "Advanced AI algorithms ensure high accuracy in converting your audio to text."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Multi-Speaker Recognition",
      description: "Automatically identifies and separates different speakers in your recordings."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Your audio files are processed securely and never stored permanently."
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "University Professor",
      content: "Lecsy has revolutionized how I create lecture notes. The accuracy is incredible!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Student",
      content: "Perfect for converting recorded lectures to text. Saves me hours every week.",
      rating: 5
    },
    {
      name: "Prof. Robert Miller",
      role: "Education Director",
      content: "The multi-speaker recognition is a game-changer for our discussion-based classes.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Transform Your{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Audio to Text
              </span>{" "}
              with AI
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Lecsy AI-Powered Transcript makes it easy to convert your lecture recordings, 
              meetings, and conversations into accurate, searchable text with advanced AI technology.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 px-8">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Choose Lecsy AI?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed to make transcription effortless and accurate.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="border-border/40 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Trusted by Educators & Students
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See what our users are saying about Lecsy AI.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-sm leading-6 text-muted-foreground">
                    &ldquo;{testimonial.content}&rdquo;
                  </blockquote>
                  <div className="mt-6">
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to Transform Your Audio?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of users who trust Lecsy AI for their transcription needs.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="ghost" size="lg" className="h-12 px-8">
                  Already have an account? Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">L</span>
              </div>
              <span className="text-xl font-bold text-foreground">Lecsy AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Lecsy AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
