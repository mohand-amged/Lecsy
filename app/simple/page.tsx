export default function SimplePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold tracking-tight">
            Lecsy AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered lecture transcription for students. Never miss important information again.
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/auth/signup" 
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
            </a>
            <a 
              href="/auth/signin" 
              className="border border-border px-6 py-3 rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
