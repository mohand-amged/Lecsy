export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">Test Page</h1>
        <p className="text-muted-foreground mt-4">If you can see this, the basic routing works!</p>
        <div className="mt-8 space-y-2">
          <p>✅ Next.js is working</p>
          <p>✅ Tailwind CSS is working</p>
          <p>✅ Page routing is working</p>
        </div>
      </div>
    </div>
  )
}
