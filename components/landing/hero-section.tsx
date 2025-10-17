"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

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
            className="font-heading text-5xl font-bold leading-tight text-balance text-foreground md:text-7xl"
          >
            Never Miss a{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Lecture Detail
            </span>{" "}
            Again
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl"
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
              className="animate-pulse-glow h-14 bg-gradient-to-r from-primary to-secondary px-8 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/50"
            >
              Start Transcribing Free
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required • Free forever</p>
          </motion.div>

          {/* Hero visual mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16"
          >
            <div className="relative mx-auto max-w-4xl">
              <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 shadow-2xl backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-destructive" />
                    <div className="h-3 w-3 rounded-full bg-accent" />
                    <div className="h-3 w-3 rounded-full bg-secondary" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-full rounded bg-muted animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="h-4 w-5/6 rounded bg-muted animate-pulse" style={{ animationDelay: "0.4s" }} />
                    <div className="h-4 w-full rounded bg-muted animate-pulse" style={{ animationDelay: "0.6s" }} />
                    <div className="h-4 w-2/3 rounded bg-muted animate-pulse" style={{ animationDelay: "0.8s" }} />
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div
                className="absolute -right-4 top-1/4 animate-float rounded-xl border border-border/50 bg-card/80 p-4 shadow-xl backdrop-blur-sm"
                style={{ animationDelay: "0.5s" }}
              >
                <FileText className="h-8 w-8 text-primary" />
                <p className="mt-2 text-xs font-semibold text-foreground">PDF Ready</p>
              </div>

              <div
                className="absolute -left-4 top-1/2 animate-float rounded-xl border border-border/50 bg-card/80 p-4 shadow-xl backdrop-blur-sm"
                style={{ animationDelay: "1s" }}
              >
                <Download className="h-8 w-8 text-secondary" />
                <p className="mt-2 text-xs font-semibold text-foreground">Export Now</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
