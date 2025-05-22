import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle, BarChart3, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Round Robin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login?signup=true">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">360° Feedback Made Simple</h1>
              <p className="mb-8 text-xl text-muted-foreground">
                Collect voice-driven feedback from multiple reviewers and get AI-powered summaries to help your clients
                grow.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/login?signup=true">
                  <Button size="lg" className="gap-2">
                    Start for Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t py-16 bg-muted/50">
          <div className="container">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-8 text-center text-3xl font-bold">How It Works</h2>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-medium">Create a Session</h3>
                  <p className="text-muted-foreground">
                    Set up a feedback session for your client and invite 2-5 reviewers to participate.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-medium">Collect Feedback</h3>
                  <p className="text-muted-foreground">
                    Reviewers provide honest feedback through a simple chat interface.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-medium">Get AI Summary</h3>
                  <p className="text-muted-foreground">
                    Receive an AI-generated summary highlighting strengths and growth areas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Round Robin</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Round Robin. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
