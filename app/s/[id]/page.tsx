import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PublicSummaryPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Fetch session details
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", params.id)
    .single()

  if (sessionError || !session) {
    notFound()
  }

  // Fetch summary
  const { data: summary, error: summaryError } = await supabase
    .from("summaries")
    .select("*")
    .eq("session_id", params.id)
    .single()

  if (summaryError || !summary) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Round Robin</span>
          </div>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Feedback Summary</h1>
            <p className="mt-2 text-muted-foreground">
              {session.name} - {session.reviewee_name}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.strengths.length > 0 ? (
                  summary.strengths.map((strength, index) => (
                    <div key={`strength-${index}`} className="rounded-md bg-muted p-4">
                      {strength}
                    </div>
                  ))
                ) : (
                  <div className="rounded-md bg-muted p-4 text-muted-foreground">No strengths identified.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Growth Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.growth_areas.length > 0 ? (
                  summary.growth_areas.map((area, index) => (
                    <div key={`growth-${index}`} className="rounded-md bg-muted p-4">
                      {area}
                    </div>
                  ))
                ) : (
                  <div className="rounded-md bg-muted p-4 text-muted-foreground">No growth areas identified.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notable Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.quotes.length > 0 ? (
                  summary.quotes.map((quote, index) => (
                    <div key={`quote-${index}`} className="rounded-md bg-muted p-4 italic">
                      "{quote}"
                    </div>
                  ))
                ) : (
                  <div className="rounded-md bg-muted p-4 text-muted-foreground">No notable quotes.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          Generated with Round Robin - 360° Feedback Tool
        </div>
      </footer>
    </div>
  )
}
