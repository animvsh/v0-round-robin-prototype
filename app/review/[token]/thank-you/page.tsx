import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default async function ThankYouPage({
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Thank You!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Your feedback for {reviewer.sessions.reviewee_name} has been submitted successfully. Your insights will help
            them grow and develop.
          </p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
