"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export function SocialProofSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science, MIT",
      content:
        "Lecsy completely changed how I study. I can actually focus on understanding the material instead of frantically writing notes!",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Business, Stanford",
      content:
        "The PDF export feature is a game-changer. My notes are organized and professional-looking. My grades have never been better.",
      rating: 5,
    },
    {
      name: "Emma Rodriguez",
      role: "Biology, UCLA",
      content:
        "I used to stress about missing important details. Now I have complete transcripts of every lecture. Worth every penny!",
      rating: 5,
    },
  ]

  const stats = [
    { value: "10,000+", label: "Lectures Transcribed" },
    { value: "5,000+", label: "Happy Students" },
    { value: "50+", label: "Universities" },
    { value: "4.9/5", label: "Average Rating" },
  ]

  return (
    <section id="testimonials" className="py-24 bg-muted/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl"
        >
          <h2 className="font-heading text-center text-4xl font-bold text-foreground md:text-5xl lg:text-6xl tracking-tight">
            Loved by Students{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Everywhere</span>
          </h2>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <p className="font-heading text-4xl font-bold text-primary md:text-5xl">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group"
              >
                <div className="h-full overflow-hidden rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                  {/* Rating */}
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="leading-relaxed text-foreground">{testimonial.content}</p>

                  {/* Author */}
                  <div className="mt-6 flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
