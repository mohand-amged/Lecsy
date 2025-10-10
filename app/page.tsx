"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LogOut,
  User,
  Settings,
  ChevronDown,
  Menu,
  X,
  Mic,
  Search,
  Zap,
  Clock,
  ArrowRight,
  Play,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/AuthContext"
import FileUpload from "@/components/FileUpload" // Assuming FileUpload component is imported from this path

interface NavBarUser {
  id: string
  name: string
  email: string
  image?: string
}

// NavBar Component
function NavBar({ user }: { user?: NavBarUser | null }) {
  const { signOut } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setIsUserMenuOpen(false)
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out failed:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">L</span>
              </div>
              <span className="text-xl font-bold text-foreground">Lecsy AI</span>
            </Link>
          </div>

          {!user && (
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </a>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  disabled={isSigningOut}
                >
                  {user.image ? (
                    <Image
                      src={user.image || "/placeholder.svg"}
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
                  <span className="hidden md:block text-sm font-medium text-foreground">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right">
                    <Card className="shadow-lg border-border/40">
                      <CardContent className="p-0">
                        <div className="py-2">
                          <div className="px-4 py-3 border-b border-border">
                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
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
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            {!user && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {isMobileMenuOpen && !user && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border">
              <a
                href="#features"
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
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
  )
}

// Main Landing Page Component
export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const demoSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  const scrollToDemo = () => {
    demoSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-2xl font-bold text-primary-foreground">L</span>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse mx-auto"></div>
            <div className="h-3 w-24 bg-muted/60 rounded animate-pulse mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} />

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-40 -right-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              AI-Powered Transcription
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Transform Lectures into
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Searchable Knowledge
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Record, transcribe, and search through your lectures with AI precision. Never miss important information
              again.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/sign-up">
                <Button size="lg" className="text-lg px-8 py-6 group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 group bg-transparent"
                onClick={scrollToDemo}
              >
                <Play className="mr-2 h-5 w-5" />
                Try Demo
              </Button>
            </div>

            <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Free 14-day trial
              </div>
            </div>
          </div>

          {/* Hero Image/Mockup */}
          <div className="mt-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-3xl" />
              <Card className="relative border-2 shadow-2xl">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-4 p-8">
                      <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                        <Mic className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground">Dashboard Preview</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Try Demo Section */}
      <section id="try-demo" ref={demoSectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Play className="h-4 w-4" />
              Try It Now
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Experience AI Transcription</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Upload a sample audio file (2-5 minutes) and see our AI transcription in action. No sign-up required.
            </p>
          </div>

          <FileUpload
            enableTranscription={true}
            maxSize={50 * 1024 * 1024}
            onTranscriptionComplete={(fileId, transcript, fileName) => {
              console.log("[v0] Demo transcription complete:", {
                fileId,
                fileName,
                transcriptLength: transcript.length,
              })
            }}
          />

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Want to save your transcripts and access advanced features?
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="group">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/4 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary via-primary to-primary/50 -z-10" />

            <div className="relative">
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-8 space-y-4 text-center">
                  <div className="relative">
                    <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <span className="text-2xl font-bold text-primary-foreground">1</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">Upload Recording</h3>
                  <p className="text-muted-foreground">
                    Simply drag and drop your audio or video file, or record directly in the app. We support MP3, WAV,
                    MP4, and more.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-8 space-y-4 text-center">
                  <div className="relative">
                    <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <span className="text-2xl font-bold text-primary-foreground">2</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">AI Transcription</h3>
                  <p className="text-muted-foreground">
                    Our advanced AI automatically transcribes your recording to text with high accuracy in minutes. No
                    manual work required.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-8 space-y-4 text-center">
                  <div className="relative">
                    <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <span className="text-2xl font-bold text-primary-foreground">3</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">Search & Study</h3>
                  <p className="text-muted-foreground">
                    Search through your transcripts, jump to specific timestamps, highlight key points, and never miss
                    important information.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="group bg-transparent">
                Try It Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Everything you need to excel</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for students and professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">AI Transcription</h3>
                <p className="text-muted-foreground">
                  Advanced AI converts speech to text with industry-leading accuracy, supporting multiple languages and
                  accents.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Smart Search</h3>
                <p className="text-muted-foreground">
                  Find any topic, keyword, or concept instantly across all your transcripts with intelligent semantic
                  search.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Time Stamped</h3>
                <p className="text-muted-foreground">
                  Every word is precisely time-stamped, making it easy to jump to specific moments in your recordings.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Free</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Up to 3 hours of transcription per month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Basic search functionality</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Store up to 10 recordings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Standard support</span>
                  </li>
                </ul>

                <Link href="/sign-up" className="block">
                  <Button variant="outline" className="w-full bg-transparent" size="lg">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan - Featured */}
            <Card className="border-2 border-primary shadow-xl relative scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              </div>
              <CardContent className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Pro</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$5</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Unlimited transcription hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Advanced AI search with semantic understanding</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Unlimited recordings storage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Export to PDF, DOCX, TXT</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Team collaboration tools</span>
                  </li>
                </ul>

                <Link href="/sign-up" className="block">
                  <Button className="w-full" size="lg">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include a 14-day free trial. No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">Ready to transform your learning?</h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of students and professionals who never miss important information.
              </p>
              <div className="pt-4">
                <Link href="/sign-up">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">L</span>
              </div>
              <span className="text-xl font-bold">Lecsy AI</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 Lecsy AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}