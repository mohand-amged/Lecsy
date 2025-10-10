import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-32 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-5xl sm:text-6xl font-bold text-balance">Ready to study smarter?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join thousands of students who never miss important information from their lectures.
        </p>
        <div className="pt-4">
          <Link href="/sign-up">
            <Button size="lg" className="text-lg px-10 h-14 rounded-full">
              Get started free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
