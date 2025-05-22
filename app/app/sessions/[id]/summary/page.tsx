import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Share2 } from "lucide-react"
import { SummaryContent } from "@/components/summary-content"
import { GenerateSummaryButton } from "@/components/generate-summary-button"

export default async function SummaryPage({
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

  // Fetch all answers for this session
  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("*, reviewers(*)")
    .eq("session_id", params.id)

  if (answersError) {
    notFound()
  }

  const hasSummary =
    summary &&
    ((summary.strengths && summary.strengths.length > 0) || (summary.growth_areas && summary.growth_areas.length > 0))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/app/sessions/${params.id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Feedback Summary</h1>
        </div>
        {hasSummary && (
          <Link href={`/s/${session.id}`}>
            <Button className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {session.name} - {session.reviewee_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasSummary ? (
            <SummaryContent summary={summary} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="mb-2 text-lg font-medium">No summary generated yet</h3>
              <p className="mb-6 max-w-md text-muted-foreground">
                Generate an AI-powered summary of the feedback collected from all reviewers.
              </p>
              <GenerateSummaryButton sessionId={session.id} answers={answers} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
