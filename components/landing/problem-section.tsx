"use client"

import { motion } from "framer-motion"
import { X, Check } from "lucide-react"

export function ProblemSection() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl"
        >
          <h2 className="font-heading text-center text-4xl font-bold text-foreground md:text-5xl lg:text-6xl tracking-tight">
            Stop Struggling with{" "}
            <span className="bg-gradient-to-r from-destructive to-destructive/60 bg-clip-text text-transparent">
              Manual Notes
            </span>
          </h2>

          <div className="mt-20 grid gap-12 md:grid-cols-2">
            {/* Before - Manual Note Taking */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl border border-destructive/30 bg-destructive/5 p-10 hover:shadow-xl hover:shadow-destructive/10 transition-all duration-300"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/20">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground">Manual Note-Taking</h3>
              </div>

              <ul className="space-y-4">
                {[
                  "Miss important details while writing",
                  "Struggle to keep up with fast lectures",
                  "Spend hours reviewing and organizing",
                  "Incomplete notes hurt your grades",
                  "Stress and anxiety during exams",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="mt-1 h-5 w-5 flex-shrink-0 text-destructive" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* After - With Lecsy */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-2xl border border-accent/30 bg-accent/5 p-10 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                  <Check className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground">With Lecsy</h3>
              </div>

              <ul className="space-y-4">
                {[
                  "Capture every word automatically",
                  "Focus 100% on understanding concepts",
                  "Get organized notes instantly",
                  "Complete transcripts boost performance",
                  "Study with confidence and ease",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="mt-1 h-5 w-5 flex-shrink-0 text-accent" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
