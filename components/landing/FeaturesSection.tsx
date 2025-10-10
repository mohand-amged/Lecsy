import { Mic, Search, Clock, FileText, Zap, Shield } from "lucide-react"

const features = [
  {
    icon: Mic,
    title: "High-accuracy transcription",
    description:
      "Industry-leading AI converts lectures to text with exceptional accuracy, even with technical terminology.",
  },
  {
    icon: Search,
    title: "Instant search",
    description:
      "Find any concept, keyword, or topic across all your lectures in seconds. Never dig through hours of recordings again.",
  },
  {
    icon: Clock,
    title: "Timestamp navigation",
    description: "Every word is time-stamped. Click to jump directly to any moment in your recording.",
  },
  {
    icon: FileText,
    title: "Export anywhere",
    description:
      "Download transcripts as PDF, DOCX, or TXT. Share notes with classmates or import to your favorite study app.",
  },
  {
    icon: Zap,
    title: "Lightning fast",
    description: "Get transcripts in minutes, not hours. Spend less time on admin and more time actually studying.",
  },
  {
    icon: Shield,
    title: "Secure and private",
    description: "Your lectures are encrypted and private. We never share your data or use it to train AI models.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold">Built for students</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to ace your classes</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="space-y-4">
              <div className="h-12 w-12 bg-foreground text-background rounded-lg flex items-center justify-center">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}