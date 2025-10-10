const steps = [
    {
      number: "1",
      title: "Record or upload",
      description:
        "Capture lectures directly in the app or upload existing recordings. Supports all major audio and video formats.",
    },
    {
      number: "2",
      title: "AI transcribes",
      description:
        "Our AI automatically converts speech to text with high accuracy. Get your transcript in minutes, not hours.",
    },
    {
      number: "3",
      title: "Search and study",
      description:
        "Find any topic instantly across all your lectures. Jump to specific timestamps and never lose important information.",
    },
  ]
  
  export function HowItWorksSection() {
    return (
      <section id="how-it-works" className="py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold">How it works</h2>
            <p className="text-lg text-muted-foreground">Three simple steps to better studying</p>
          </div>
  
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step) => (
              <div key={step.number} className="space-y-6">
                <div className="h-16 w-16 bg-foreground text-background rounded-full flex items-center justify-center text-2xl font-bold">
                  {step.number}
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  