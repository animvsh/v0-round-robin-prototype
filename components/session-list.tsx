"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Share2 } from "lucide-react"

type Session = {
  id: string
  name: string
  reviewee_name: string
  reviewee_email: string
  status: "draft" | "live" | "completed"
  created_at: string
  template: string
}

export function SessionList({ sessions }: { sessions: Session[] }) {
  const getStatusColor = (status: Session["status"]) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
      case "live":
        return "bg-green-100 text-green-800 hover:bg-green-100/80"
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80"
      default:
        return ""
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <Card key={session.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="line-clamp-1">{session.name}</CardTitle>
              <Badge className={getStatusColor(session.status)}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </Badge>
            </div>
            <CardDescription>
              For {session.reviewee_name} ({session.reviewee_email})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Template:</span>
                <span>{session.template}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>
                  {formatDistanceToNow(new Date(session.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href={`/app/sessions/${session.id}`}>
              <Button variant="outline" size="sm" className="gap-1">
                <Eye className="h-4 w-4" />
                View
              </Button>
            </Link>
            {session.status === "completed" && (
              <Link href={`/app/sessions/${session.id}/summary`}>
                <Button size="sm" className="gap-1">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
