"use client"

import { useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/AuthContext"
import { NavBar } from "@/components/NavBar"
import { HeroSection } from "@/components/landing/HeroSection"
import { DemoSection } from "@/components/landing/DemoSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { CTASection } from "@/components/landing/CTA"
import { Footer } from "@/components/landing/footer"
import FileUpload from "@/components/FileUpload"

export default function HomePage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const demoSectionRef = useRef<HTMLElement>(null)

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
          <div className="h-16 w-16 bg-foreground rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-2xl font-bold text-background">L</span>
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
      <NavBar user={user} signOut={signOut} />
      <HeroSection onDemoClick={scrollToDemo} />
      <DemoSection ref={demoSectionRef} FileUploadComponent={FileUpload} />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}
