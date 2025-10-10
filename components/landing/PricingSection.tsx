import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out Lecsy",
    features: ["3 hours of transcription per month", "Store up to 10 recordings", "Basic search", "Export to TXT"],
    cta: "Get started",
    href: "/sign-up",
    variant: "outline" as const,
  },
  {
    name: "Student",
    price: "$5",
    description: "Everything you need to excel",
    features: [
      "20 hours/month transcription",
      "Everything in free plan",
      "Unlimited storage",
      "Advanced AI search",
      "Export to TXT",
    ],
    cta: "Start free trial",
    href: "/sign-up",
    variant: "default" as const,
    popular: true,
  },
  {
    name: "Pro",
    price: "$10",
    description: "For professionals and teams",
    features: [
      "Unlimited transcription",
      "Everything in student plan",
      "Unlimited storage",
      "Advanced AI search",
      "Export to PDF, DOCX, TXT",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/sign-up",
    variant: "default" as const,
    popular: false,
  }
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold">Simple pricing</h2>
          <p className="text-lg text-muted-foreground">Start free, upgrade when you need more</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? "border-2 border-foreground shadow-lg" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-foreground text-background px-4 py-1 rounded-full text-sm font-medium">
                    Most popular
                  </div>
                </div>
              )}
              <CardContent className="p-8 space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} className="block">
                  <Button variant={plan.variant} className="w-full rounded-full" size="lg">
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}