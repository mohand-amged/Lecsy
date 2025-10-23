"use client"

import { motion } from "framer-motion"
import { Sparkles, FileText, FileType, GraduationCap, Clock, Zap } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Transcription",
      description: "State-of-the-art AI delivers accurate transcriptions in minutes",
      color: "from-primary to-primary/60",
    },
    {
      icon: FileText,
      title: "PDF Export",
      description: "One-click download to beautifully formatted PDF documents",
      color: "from-secondary to-secondary/60",
    },
    {
      icon: FileType,
      title: "Word Export",
      description: "Get editable Word documents for easy customization",
      color: "from-accent to-accent/60",
    },
    {
      icon: GraduationCap,
      title: "Student-Optimized",
      description: "Designed specifically for academic lectures and terminology",
      color: "from-chart-4 to-chart-4/60",
    },
    {
      icon: Clock,
      title: "Time-Saving",
      description: "Spend less time on notes, more time understanding concepts",
      color: "from-chart-5 to-chart-5/60",
    },
    {
      icon: Zap,
      title: "Easy to Use",
      description: "Simple, intuitive interface that anyone can master instantly",
      color: "from-primary to-secondary",
    },
  ]

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl"
        >
          <h2 className="font-heading text-center text-4xl font-bold text-foreground md:text-5xl lg:text-6xl tracking-tight">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Excel</span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-center text-xl text-muted-foreground md:text-2xl font-light leading-relaxed">
            Powerful features designed to make your academic life easier
          </p>

          <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full overflow-hidden rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2">
                  <div
                    className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="font-heading text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="leading-relaxed text-muted-foreground text-base">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
