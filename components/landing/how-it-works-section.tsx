"use client"

import { motion } from "framer-motion"
import { Upload, Sparkles, Download } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      title: "Record or Upload",
      description: "Record your lecture live or upload an audio/video file",
      color: "from-primary to-primary/60",
    },
    {
      icon: Sparkles,
      title: "AI Transcribes",
      description: "Our AI automatically transcribes with high accuracy",
      color: "from-secondary to-secondary/60",
    },
    {
      icon: Download,
      title: "Download & Study",
      description: "Get your transcript as PDF or Word in seconds",
      color: "from-accent to-accent/60",
    },
  ]

  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl"
        >
          <h2 className="font-heading text-center text-4xl font-bold text-foreground md:text-5xl lg:text-6xl tracking-tight">How It Works</h2>
          <p className="mx-auto mt-6 max-w-3xl text-center text-xl text-muted-foreground md:text-2xl font-light leading-relaxed">
            Three simple steps to never miss a lecture detail again
          </p>

          <div className="mt-20 grid gap-12 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group relative"
              >
                <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-10 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2">
                  {/* Step number */}
                  <div className="absolute right-4 top-4 font-heading text-6xl font-bold text-muted/20">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} transition-transform group-hover:scale-110`}
                  >
                    <step.icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-heading text-2xl font-bold text-foreground">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{step.description}</p>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden h-0.5 w-8 -translate-y-1/2 translate-x-full bg-gradient-to-r from-primary to-transparent md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
