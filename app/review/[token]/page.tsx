import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { ReviewForm } from "@/components/review-form"

export default async function ReviewPage({
  params,
}: {
  params: { token: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Fetch reviewer by token
  const { data: reviewer, error: reviewerError } = await supabase
    .from("reviewers")
    .select("*, sessions(*)")
    .eq("token", params.token)
    .single()

  if (reviewerError || !reviewer) {
    notFound()
  }

  // If reviewer has already completed the review, redirect to thank you page
  if (reviewer.status === "completed") {
    redirect(`/review/${params.token}/thank-you`)
  }

  // Fetch questions based on the session template
  const templateQuestions = getTemplateQuestions(reviewer.sessions.template)

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col p-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Feedback for {reviewer.sessions.reviewee_name}</h1>
        <p className="mt-2 text-muted-foreground">
          Your feedback will help {reviewer.sessions.reviewee_name} grow. All responses are confidential.
        </p>
      </header>

      <ReviewForm reviewer={reviewer} questions={templateQuestions} />
    </div>
  )
}

function getTemplateQuestions(templateId: string): { id: string; text: string }[] {
  const templates: Record<string, { id: string; text: string }[]> = {
    leadership: [
      { id: "vision", text: "How effectively does this person communicate a clear vision?" },
      { id: "decisions", text: "How would you rate their decision-making abilities?" },
      { id: "delegation", text: "How well do they delegate tasks and empower others?" },
      { id: "feedback", text: "How effectively do they provide feedback and guidance?" },
      { id: "challenges", text: "How do they handle challenges and setbacks?" },
    ],
    confidence: [
      { id: "speaking", text: "How confidently does this person speak in group settings?" },
      { id: "decisions", text: "How decisive are they when facing important choices?" },
      { id: "challenges", text: "How do they respond to challenges or criticism?" },
      { id: "opinions", text: "How comfortable are they expressing their opinions?" },
      { id: "presence", text: "How would you describe their overall presence in a room?" },
    ],
  }

  return templates[templateId] || []
}
