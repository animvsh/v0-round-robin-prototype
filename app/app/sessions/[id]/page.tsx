import type React from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BarChart3, Mail } from "lucide-react"
import { ReviewersList } from "@/components/reviewers-list"
import { CopyButton } from "@/components/copy-button"

export default async function SessionPage({
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

  // Fetch reviewers
  const { data: reviewers, error: reviewersError } = await supabase
    .from("reviewers")
    .select("*")
    .eq("session_id", params.id)
    .order("created_at", { ascending: true })

  if (reviewersError) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "live":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return ""
    }
  }

  const getTemplateName = (templateId: string) => {
    const templates: Record<string, string> = {
      leadership: "Leadership Assessment",
      confidence: "Confidence Assessment",
    }
    return templates[templateId] || templateId
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{session.name}</h1>
        <Badge className={getStatusColor(session.status)}>
          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Reviewee:</div>
                <div>{session.reviewee_name}</div>
                <div className="text-muted-foreground">Email:</div>
                <div>{session.reviewee_email}</div>
                <div className="text-muted-foreground">Template:</div>
                <div>{getTemplateName(session.template)}</div>
                <div className="text-muted-foreground">Created:</div>
                <div>
                  {formatDistanceToNow(new Date(session.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              {session.status === "completed" && (
                <div className="mt-6">
                  <Link href={`/app/sessions/${session.id}/summary`}>
                    <Button className="w-full gap-2">
                      <BarChart3 className="h-4 w-4" />
                      View Summary
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reviewers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ReviewersList reviewers={reviewers} />

              <div className="mt-6 space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <h3 className="mb-2 font-medium">Share with Reviewers</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Send this link to reviewers or use the copy button to share.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`mailto:${reviewers.map((r) => r.email).join(",")}`}>
                        <Mail className="h-4 w-4" />
                      </Link>
                    </Button>
                    <div className="relative flex-1">
                      <Input
                        readOnly
                        value={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/review/${reviewers[0]?.token}`}
                        className="pr-10"
                      />
                      <CopyButton
                        value={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/review/${reviewers[0]?.token}`}
                        className="absolute right-1 top-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}
