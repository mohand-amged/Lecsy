"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 animate-gradient" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:6rem_6rem] opacity-40" />
      
      {/* Subtle radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.1)_100%)]" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-5xl text-center">
          {/* Floating badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Badge
              className="animate-float bg-primary/20 px-4 py-2 text-primary backdrop-blur-sm"
              style={{ animationDelay: "0s" }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Powered
            </Badge>
            <Badge
              className="animate-float bg-secondary/20 px-4 py-2 text-secondary backdrop-blur-sm"
              style={{ animationDelay: "0.5s" }}
            >
              <FileText className="mr-2 h-4 w-4" />
              PDF Export
            </Badge>
            <Badge
              className="animate-float bg-accent/20 px-4 py-2 text-accent backdrop-blur-sm"
              style={{ animationDelay: "1s" }}
            >
              <Download className="mr-2 h-4 w-4" />
              Word Export
            </Badge>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-heading text-5xl font-bold leading-[1.1] text-balance text-foreground md:text-7xl lg:text-8xl tracking-tight"
          >
            Never Miss a{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse">
              Lecture Detail
            </span>{" "}
            Again
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-muted-foreground md:text-2xl lg:text-3xl font-light"
          >
            AI-powered transcription that works while you focus on learning
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10"
          >
            <Button
              size="lg"
              className="h-16 bg-gradient-to-r from-primary to-secondary px-12 text-xl font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/50 active:scale-95"
            >
              Start Transcribing Free
              <Sparkles className="ml-2 h-6 w-6" />
            </Button>
            <p className="mt-6 text-base text-muted-foreground font-medium">No credit card required • Free forever</p>
          </motion.div>

          {/* Hero visual mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16"
          >
            <div className="relative mx-auto max-w-5xl">
              <div className="overflow-hidden rounded-3xl border border-border/50 bg-card/80 p-10 shadow-2xl backdrop-blur-sm hover:shadow-3xl transition-all duration-500">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-4 rounded-full bg-destructive animate-pulse" />
                    <div className="h-4 w-4 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.5s" }} />
                    <div className="h-4 w-4 rounded-full bg-secondary animate-pulse" style={{ animationDelay: "1s" }} />
                    <div className="ml-auto text-xs text-muted-foreground font-medium">Live Transcription</div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-5 w-3/4 rounded-lg bg-gradient-to-r from-muted to-muted/50 animate-pulse" />
                    <div className="h-5 w-full rounded-lg bg-gradient-to-r from-muted to-muted/50 animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="h-5 w-5/6 rounded-lg bg-gradient-to-r from-muted to-muted/50 animate-pulse" style={{ animationDelay: "0.4s" }} />
                    <div className="h-5 w-full rounded-lg bg-gradient-to-r from-muted to-muted/50 animate-pulse" style={{ animationDelay: "0.6s" }} />
                    <div className="h-5 w-2/3 rounded-lg bg-gradient-to-r from-muted to-muted/50 animate-pulse" style={{ animationDelay: "0.8s" }} />
                    <div className="h-5 w-4/5 rounded-lg bg-gradient-to-r from-muted to-muted/50 animate-pulse" style={{ animationDelay: "1s" }} />
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div
                className="absolute -right-6 top-1/4 animate-float rounded-2xl border border-border/50 bg-card/90 p-6 shadow-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300"
                style={{ animationDelay: "0.5s" }}
              >
                <FileText className="h-10 w-10 text-primary mb-2" />
                <p className="text-sm font-semibold text-foreground">PDF Ready</p>
                <p className="text-xs text-muted-foreground">Export instantly</p>
              </div>

              <div
                className="absolute -left-6 top-1/2 animate-float rounded-2xl border border-border/50 bg-card/90 p-6 shadow-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300"
                style={{ animationDelay: "1s" }}
              >
                <Download className="h-10 w-10 text-secondary mb-2" />
                <p className="text-sm font-semibold text-foreground">Export Now</p>
                <p className="text-xs text-muted-foreground">Multiple formats</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
