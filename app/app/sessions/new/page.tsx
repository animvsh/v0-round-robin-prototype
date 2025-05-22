"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

const TEMPLATES = [
  {
    id: "leadership",
    name: "Leadership Assessment",
    description: "Evaluate leadership skills and effectiveness",
  },
  {
    id: "confidence",
    name: "Confidence Assessment",
    description: "Assess confidence and self-assurance in various situations",
  },
]

export default function NewSessionPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    reviewee_name: "",
    reviewee_email: "",
    reviewers: "",
    template: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTemplateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, template: value }))
  }

  const nextStep = () => {
    setStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Parse reviewers emails
      const reviewerEmails = formData.reviewers
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email)

      if (reviewerEmails.length < 2 || reviewerEmails.length > 5) {
        throw new Error("Please provide between 2 and 5 reviewer emails")
      }

      // Create session in the database
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .insert({
          name: formData.name,
          reviewee_name: formData.reviewee_name,
          reviewee_email: formData.reviewee_email,
          template: formData.template,
          status: "draft",
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      // Add reviewers to the database
      const reviewersToInsert = reviewerEmails.map((email) => ({
        session_id: session.id,
        email,
        status: "pending",
        token: crypto.randomUUID(),
      }))

      const { error: reviewersError } = await supabase.from("reviewers").insert(reviewersToInsert)

      if (reviewersError) throw reviewersError

      // Update session status to live
      const { error: updateError } = await supabase.from("sessions").update({ status: "live" }).eq("id", session.id)

      if (updateError) throw updateError

      toast({
        title: "Session created",
        description: "Your feedback session has been created successfully.",
      })

      router.push(`/app/sessions/${session.id}`)
    } catch (error: any) {
      toast({
        title: "Error creating session",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>Enter the basic information for this feedback session.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Session Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Q2 Performance Review"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewee_name">Reviewee Name</Label>
                  <Input
                    id="reviewee_name"
                    name="reviewee_name"
                    placeholder="John Doe"
                    value={formData.reviewee_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewee_email">Reviewee Email</Label>
                  <Input
                    id="reviewee_email"
                    name="reviewee_email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.reviewee_email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={nextStep} className="gap-2">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle>Reviewers</CardTitle>
              <CardDescription>Add 2-5 reviewers who will provide feedback.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reviewers">Reviewer Emails (comma-separated)</Label>
                  <Textarea
                    id="reviewers"
                    name="reviewers"
                    placeholder="reviewer1@example.com, reviewer2@example.com, reviewer3@example.com"
                    value={formData.reviewers}
                    onChange={handleChange}
                    rows={5}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter between 2 and 5 email addresses, separated by commas.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={nextStep} className="gap-2">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )
      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle>Template Selection</CardTitle>
              <CardDescription>Choose a question template for the feedback session.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Question Template</Label>
                  <Select value={formData.template} onValueChange={handleTemplateChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATES.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.template && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {TEMPLATES.find((template) => template.id === formData.template)?.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2" onClick={handleSubmit}>
                {isSubmitting ? (
                  "Creating..."
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Create Session
                  </>
                )}
              </Button>
            </CardFooter>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">Create New Session</h1>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              1
            </div>
            <span className={step >= 1 ? "font-medium" : "font-medium text-muted-foreground"}>Session Details</span>
          </div>
          <div className="h-px w-12 bg-muted sm:w-24" />
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              2
            </div>
            <span className={step >= 2 ? "font-medium" : "font-medium text-muted-foreground"}>Reviewers</span>
          </div>
          <div className="h-px w-12 bg-muted sm:w-24" />
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              3
            </div>
            <span className={step >= 3 ? "font-medium" : "font-medium text-muted-foreground"}>Template</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>{renderStepContent()}</Card>
      </form>
    </div>
  )
}
