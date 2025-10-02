import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black relative">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[length:24px_24px]" />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Lecsy
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="text-white/70 hover:text-white hover:bg-white/5">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Link href="/auth/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="inline-block px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium mb-6">
                🚀 Welcome to the Future of Learning
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent leading-tight">
              Transform Your
              <br />
              <span className="relative">
                Learning Journey
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transform scale-x-0 animate-pulse"></div>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/60 mb-10 max-w-3xl mx-auto leading-relaxed">
              Discover a revolutionary platform that makes learning engaging, interactive, and personalized. Join
              thousands of learners already transforming their skills.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105"
                asChild
              >
                <Link href="/auth/login">Start Learning Today</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-2 border-white/10 text-white hover:bg-white/5 transition-all duration-300 bg-transparent"
                asChild
              >
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Why Choose Lecsy?</h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Experience learning like never before with our cutting-edge features designed for modern learners.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card className="group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-2 border border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-500/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-bold text-white">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-white/60">
                  Experience blazing-fast performance with our optimized learning platform. No more waiting, just pure
                  learning.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:-translate-y-2 border border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl font-bold text-white">Smart Learning</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-white/60">
                  AI-powered personalization adapts to your learning style and pace for maximum effectiveness.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 transform hover:-translate-y-2 border border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl font-bold text-white">Community Driven</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-white/60">
                  Connect with fellow learners, share knowledge, and grow together in our vibrant community.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:24px_24px]" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-4 gap-8 text-center text-white">
              <div className="group">
                <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                  10K+
                </div>
                <div className="text-lg opacity-90">Active Learners</div>
              </div>
              <div className="group">
                <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                  500+
                </div>
                <div className="text-lg opacity-90">Courses Available</div>
              </div>
              <div className="group">
                <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                  98%
                </div>
                <div className="text-lg opacity-90">Satisfaction Rate</div>
              </div>
              <div className="group">
                <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                  24/7
                </div>
                <div className="text-lg opacity-90">Support Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Start Your Journey?</h2>
            <p className="text-xl text-white/60 mb-10">
              Join thousands of learners who have already transformed their skills with Lecsy. Your future self will
              thank you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105"
                asChild
              >
                <Link href="/auth/login">Get Started Free</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-2 border-white/10 text-white hover:bg-white/5 bg-transparent"
                asChild
              >
                <Link href="/auth/login">View Demo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black border-t border-white/10 text-white py-12">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Lecsy
              </div>
              <p className="text-white/40 mb-6">Transforming education, one learner at a time.</p>
              <div className="flex justify-center gap-6 text-sm text-white/40">
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10 text-sm text-white/30">
                © 2025 Lecsy. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
