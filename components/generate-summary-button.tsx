"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles } from "lucide-react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

type Answer = {
  id: string
  reviewer_id: string
  question_id: string
  answer: string
  reviewers: {
    email: string
  }
}

export function GenerateSummaryButton({
  sessionId,
  answers,
}: {
  sessionId: string
  answers: Answer[]
}) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateSummary = async () => {
    if (answers.length === 0) {
      toast({
        title: "No feedback available",
        description: "There are no answers to generate a summary from.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Format the answers for the AI
      const formattedAnswers = answers.map((answer) => ({
        reviewer: answer.reviewers.email,
        question: answer.question_id,
        answer: answer.answer,
      }))

      // Generate the summary using GPT-4o
      const prompt = `
        You are an expert coach analyzing 360-degree feedback for a client. 
        Below is feedback from multiple reviewers:
        
        ${JSON.stringify(formattedAnswers, null, 2)}
        
        Based on this feedback, identify:
        1. Key strengths (2-4 points)
        2. Growth areas (2-4 points)
        3. Notable quotes from reviewers
        
        Format your response as a JSON object with these keys:
        {
          "strengths": ["strength 1", "strength 2", ...],
          "growth_areas": ["growth area 1", "growth area 2", ...],
          "quotes": ["quote 1", "quote 2", ...]
        }
        
        Each strength and growth area should be a complete, insightful sentence.
        Include 2-4 strengths, 2-4 growth areas, and 2-4 notable quotes.
        Only return the JSON object, nothing else.
      `

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
      })

      // Parse the response
      const summaryData = JSON.parse(text)

      // Save the summary to the database
      const { error } = await supabase.from("summaries").upsert({
        session_id: sessionId,
        strengths: summaryData.strengths || [],
        growth_areas: summaryData.growth_areas || [],
        quotes: summaryData.quotes || [],
      })

      if (error) throw error

      toast({
        title: "Summary generated",
        description: "The feedback summary has been generated successfully.",
      })

      // Refresh the page to show the new summary
      router.refresh()
    } catch (error: any) {
      console.error("Error generating summary:", error)
      toast({
        title: "Error generating summary",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleGenerateSummary} disabled={isGenerating} className="gap-2">
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" /> Generate AI Summary
        </>
      )}
    </Button>
  )
}
