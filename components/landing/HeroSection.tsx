"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  onDemoClick: () => void
}

export function HeroSection({ onDemoClick }: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-20 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-8">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-balance">
            Never miss a lecture again
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AI-powered transcription for students. Record lectures, search instantly, study smarter.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/sign-up">
              <Button size="lg" className="text-base px-8 h-12 rounded-full">
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 h-12 rounded-full bg-transparent"
              onClick={onDemoClick}
            >
              Try demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground pt-4">Free for 14 days. No credit card required.</p>
        </div>
      </div>
    </section>
  )
}
