"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg" aria-label="Lecsy Home">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary" aria-hidden="true">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="font-heading text-2xl font-bold text-foreground">Lecsy</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-8 md:flex">
          <button
            onClick={() => scrollToSection('features')}
            className="relative text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground group focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            aria-label="Navigate to features section"
          >
            Features
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full" aria-hidden="true" />
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="relative text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground group focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            aria-label="Navigate to how it works section"
          >
            How It Works
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full" aria-hidden="true" />
          </button>
          <button
            onClick={() => scrollToSection('testimonials')}
            className="relative text-sm font-medium text-muted-foreground transition-all duration-300 hover:text-foreground group focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            aria-label="Navigate to testimonials section"
          >
            Testimonials
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            className="hidden md:flex bg-gradient-to-r from-primary to-secondary font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50 active:scale-95"
            asChild
          >
            <Link href="/login">Get Started Free</Link>
          </Button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:bg-secondary/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl"
          role="menu"
        >
          <div className="container mx-auto px-4 py-6 space-y-4">
            <button
              onClick={() => handleNavClick('features')}
              className="block w-full text-left px-4 py-3 text-foreground hover:bg-secondary/20 rounded-lg transition-colors text-base font-medium"
              role="menuitem"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="block w-full text-left px-4 py-3 text-foreground hover:bg-secondary/20 rounded-lg transition-colors text-base font-medium"
              role="menuitem"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('testimonials')}
              className="block w-full text-left px-4 py-3 text-foreground hover:bg-secondary/20 rounded-lg transition-colors text-base font-medium"
              role="menuitem"
            >
              Testimonials
            </button>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-secondary font-semibold text-white"
              asChild
            >
              <Link href="/login">Get Started Free</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
