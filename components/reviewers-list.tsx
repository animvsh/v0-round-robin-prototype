"use client"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/copy-button"

type Reviewer = {
  id: string
  session_id: string
  email: string
  status: "pending" | "completed"
  token: string
  created_at: string
  completed_at?: string
}

export function ReviewersList({ reviewers }: { reviewers: Reviewer[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-3">
      {reviewers.map((reviewer) => (
        <div key={reviewer.id} className="flex items-center justify-between rounded-md border p-3">
          <div className="flex flex-col">
            <div className="font-medium">{reviewer.email}</div>
            <div className="text-xs text-muted-foreground">
              {reviewer.status === "completed" && reviewer.completed_at
                ? `Completed ${formatDistanceToNow(new Date(reviewer.completed_at), { addSuffix: true })}`
                : "Not completed yet"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(reviewer.status)}>
              {reviewer.status.charAt(0).toUpperCase() + reviewer.status.slice(1)}
            </Badge>
            <CopyButton
              value={`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/review/${reviewer.token}`}
              size="sm"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
