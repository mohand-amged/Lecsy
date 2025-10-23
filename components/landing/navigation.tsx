"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Link from "next/link"

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId.replace('#', ''))
  if (element) {
    const offset = 80 // Account for fixed navbar height
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="font-heading text-2xl font-bold text-foreground">Lecsy</span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <button
            onClick={() => scrollToSection('features')}
            className="relative text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground group"
          >
            Features
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full" />
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="relative text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground group"
          >
            How It Works
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full" />
          </button>
          <button
            onClick={() => scrollToSection('testimonials')}
            className="relative text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground group"
          >
            Testimonials
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full" />
          </button>
        </div>

        <Button className="bg-gradient-to-r from-primary to-secondary font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50 active:scale-95">
          <Link href="/login">Get Started Free</Link>
        </Button>
      </div>
    </nav>
  )
}
