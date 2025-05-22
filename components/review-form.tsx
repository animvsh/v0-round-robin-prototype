"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Loader2 } from "lucide-react"

type Reviewer = {
  id: string
  session_id: string
  email: string
  token: string
  sessions: {
    id: string
    reviewee_name: string
  }
}

type Question = {
  id: string
  text: string
}

export function ReviewForm({
  reviewer,
  questions,
}: {
  reviewer: Reviewer
  questions: Question[]
}) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = async () => {
    const currentQuestionId = questions[currentQuestion].id

    if (!answers[currentQuestionId]?.trim()) {
      toast({
        title: "Please provide an answer",
        description: "Your feedback is valuable. Please share your thoughts before continuing.",
        variant: "destructive",
      })
      return
    }

    // Save the current answer to the database
    try {
      const { error } = await supabase.from("answers").upsert({
        reviewer_id: reviewer.id,
        session_id: reviewer.session_id,
        question_id: currentQuestionId,
        answer: answers[currentQuestionId],
      })

      if (error) throw error

      // Move to the next question or submit if this was the last one
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
      } else {
        await handleSubmit()
      }
    } catch (error: any) {
      toast({
        title: "Error saving answer",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Mark reviewer as completed
      const { error: reviewerError } = await supabase
        .from("reviewers")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", reviewer.id)

      if (reviewerError) throw reviewerError

      // Check if all reviewers have completed
      const { data: reviewers, error: reviewersError } = await supabase
        .from("reviewers")
        .select("status")
        .eq("session_id", reviewer.session_id)

      if (reviewersError) throw reviewersError

      const allCompleted = reviewers.every((r) => r.status === "completed")

      // If all reviewers have completed, update session status and generate summary
      if (allCompleted) {
        // Update session status
        const { error: sessionError } = await supabase
          .from("sessions")
          .update({ status: "completed" })
          .eq("id", reviewer.session_id)

        if (sessionError) throw sessionError

        // Trigger summary generation (in a real app, this would be a server action or API call)
        // For now, we'll just simulate it by creating an empty summary
        const { error: summaryError } = await supabase.from("summaries").insert({
          session_id: reviewer.session_id,
          strengths: [],
          growth_areas: [],
          quotes: [],
        })

        if (summaryError) throw summaryError
      }

      // Redirect to thank you page
      router.push(`/review/${reviewer.token}/thank-you`)
    } catch (error: any) {
      toast({
        title: "Error submitting feedback",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentQuestionData = questions[currentQuestion]

  return (
    <div className="flex-1">
      <div className="mb-4 flex justify-between text-sm">
        <span>
          Question {currentQuestion + 1} of {questions.length}
        </span>
        <span className="text-muted-foreground">
          {Math.round(((currentQuestion + 1) / questions.length) * 100)}% complete
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{
            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="mb-4 text-lg font-medium">{currentQuestionData.text}</div>
          <Textarea
            placeholder="Share your thoughts here..."
            className="min-h-[150px]"
            value={answers[currentQuestionData.id] || ""}
            onChange={(e) => handleAnswerChange(currentQuestionData.id, e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleNext} disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : currentQuestion < questions.length - 1 ? (
            <>
              Next <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            "Submit Feedback"
          )}
        </Button>
      </div>
    </div>
  )
}
