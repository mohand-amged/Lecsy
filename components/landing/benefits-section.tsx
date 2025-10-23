"use client"

import { motion } from "framer-motion"
import { TrendingUp, Coffee, BookOpen } from "lucide-react"

export function BenefitsSection() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Better Grades",
      description: "Complete, accurate notes mean better exam preparation and higher scores",
      stat: "94%",
      statLabel: "report improved grades",
    },
    {
      icon: Coffee,
      title: "More Free Time",
      description: "Spend less time on note-taking and more time on what matters to you",
      stat: "10hrs",
      statLabel: "saved per week",
    },
    {
      icon: BookOpen,
      title: "Comprehensive Notes",
      description: "Never miss important details or struggle to remember key concepts",
      stat: "100%",
      statLabel: "lecture coverage",
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl"
        >
          <h2 className="font-heading text-center text-4xl font-bold text-foreground md:text-5xl">
            Transform Your{" "}
            <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              Academic Success
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-xl text-muted-foreground">
            Join thousands of students who are achieving more with Lecsy
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-8 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
                  {/* Stat badge */}
                  <div className="absolute right-4 top-4 rounded-full bg-primary/20 px-4 py-2 backdrop-blur-sm">
                    <p className="font-heading text-2xl font-bold text-primary">{benefit.stat}</p>
                    <p className="text-xs text-primary/80">{benefit.statLabel}</p>
                  </div>

                  {/* Icon */}
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary transition-transform group-hover:scale-110">
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-heading text-2xl font-bold text-foreground">{benefit.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}