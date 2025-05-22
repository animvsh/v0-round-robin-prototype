"use client"

import { useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"

type Summary = {
  id: string
  session_id: string
  strengths: string[]
  growth_areas: string[]
  quotes: string[]
}

export function SummaryContent({ summary }: { summary: Summary }) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editedSummary, setEditedSummary] = useState(summary)
  const [isSaving, setIsSaving] = useState(false)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("summaries")
        .update({
          strengths: editedSummary.strengths,
          growth_areas: editedSummary.growth_areas,
          quotes: editedSummary.quotes,
        })
        .eq("id", summary.id)

      if (error) throw error

      toast({
        title: "Summary updated",
        description: "Your changes have been saved successfully.",
      })
      setIsEditing(false)
    } catch (error: any) {
      toast({
        title: "Error saving summary",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedSummary(summary)
    setIsEditing(false)
  }

  const updateStrength = (index: number, value: string) => {
    const newStrengths = [...editedSummary.strengths]
    newStrengths[index] = value
    setEditedSummary({ ...editedSummary, strengths: newStrengths })
  }

  const updateGrowthArea = (index: number, value: string) => {
    const newGrowthAreas = [...editedSummary.growth_areas]
    newGrowthAreas[index] = value
    setEditedSummary({ ...editedSummary, growth_areas: newGrowthAreas })
  }

  const updateQuote = (index: number, value: string) => {
    const newQuotes = [...editedSummary.quotes]
    newQuotes[index] = value
    setEditedSummary({ ...editedSummary, quotes: newQuotes })
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Strengths</h3>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              Edit
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {editedSummary.strengths.length > 0 ? (
            editedSummary.strengths.map((strength, index) => (
              <div key={`strength-${index}`}>
                {isEditing ? (
                  <Textarea
                    value={strength}
                    onChange={(e) => updateStrength(index, e.target.value)}
                    className="min-h-[100px]"
                  />
                ) : (
                  <div className="rounded-md bg-muted p-4">{strength}</div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-md bg-muted p-4 text-muted-foreground">No strengths identified yet.</div>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold">Growth Areas</h3>
        <div className="space-y-3">
          {editedSummary.growth_areas.length > 0 ? (
            editedSummary.growth_areas.map((area, index) => (
              <div key={`growth-${index}`}>
                {isEditing ? (
                  <Textarea
                    value={area}
                    onChange={(e) => updateGrowthArea(index, e.target.value)}
                    className="min-h-[100px]"
                  />
                ) : (
                  <div className="rounded-md bg-muted p-4">{area}</div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-md bg-muted p-4 text-muted-foreground">No growth areas identified yet.</div>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold">Notable Quotes</h3>
        <div className="space-y-3">
          {editedSummary.quotes.length > 0 ? (
            editedSummary.quotes.map((quote, index) => (
              <div key={`quote-${index}`}>
                {isEditing ? (
                  <Textarea
                    value={quote}
                    onChange={(e) => updateQuote(index, e.target.value)}
                    className="min-h-[100px]"
                  />
                ) : (
                  <div className="rounded-md bg-muted p-4 italic">"{quote}"</div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-md bg-muted p-4 text-muted-foreground">No notable quotes yet.</div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
