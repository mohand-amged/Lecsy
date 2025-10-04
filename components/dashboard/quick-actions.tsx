import { Card, CardContent } from "@/components/ui/card"
import { Zap, Lightbulb, BookOpen } from "lucide-react"

export function QuickActions() {
  return (
    <div>
      <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">Quick Actions</h3>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-1 border-border bg-card/50 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-300"></div>
          <CardContent className="p-6 md:p-8 text-center relative z-10">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-all duration-300 glow-primary">
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="font-bold text-base md:text-lg text-foreground mb-2">Quick Transcribe</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Get instant transcriptions in seconds</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 transform hover:-translate-y-1 border-border bg-card/50 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/10 group-hover:to-accent/5 transition-all duration-300"></div>
          <CardContent className="p-6 md:p-8 text-center relative z-10">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-all duration-300 glow-accent">
              <Lightbulb className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="font-bold text-base md:text-lg text-foreground mb-2">AI Summary</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Get key points and summaries</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-1 border-border bg-card/50 backdrop-blur-sm overflow-hidden relative sm:col-span-2 md:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:to-accent/5 transition-all duration-300"></div>
          <CardContent className="p-6 md:p-8 text-center relative z-10">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-all duration-300">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="font-bold text-base md:text-lg text-foreground mb-2">Study Notes</h3>
            <p className="text-xs md:text-sm text-muted-foreground">Generate organized study materials</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}