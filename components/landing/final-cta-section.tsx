"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, ArrowRight } from "lucide-react"

export function FinalCTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl"
        >
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-12 text-center">
            {/* Animated background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

            <div className="relative">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary"
              >
                <Sparkles className="h-10 w-10 text-white" />
              </motion.div>

              {/* Headline */}
              <h2 className="font-heading text-4xl font-bold text-foreground md:text-5xl">
                Ready to Transform Your{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Study Game?
                </span>
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
                Join thousands of students who are already acing their classes with Lecsy
              </p>

              {/* Sign-up form */}
              <div className="mx-auto mt-8 max-w-md">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="h-12 border-border/50 bg-background/50 backdrop-blur-sm"
                  />
                  <Button
                    size="lg"
                    className="h-12 bg-gradient-to-r from-primary to-secondary font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Free forever • No credit card required • Cancel anytime
                </p>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <span>Trusted by 5,000+ students</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-secondary" />
                  <span>10,000+ lectures transcribed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>4.9/5 rating</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-border/40 pt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading text-xl font-bold text-foreground">Lecsy</span>
            </div>

            <p className="text-sm text-muted-foreground">© 2025 Lecsy. All rights reserved.</p>

            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="transition-colors hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="transition-colors hover:text-foreground">
                Terms
              </a>
              <a href="#" className="transition-colors hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  )
}
