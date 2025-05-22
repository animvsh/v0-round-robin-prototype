import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { SessionList } from "@/components/session-list"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  // Fetch sessions from the database
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/app/sessions/new">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Session
          </Button>
        </Link>
      </div>

      {sessions && sessions.length > 0 ? (
        <SessionList sessions={sessions} />
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No sessions yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Create your first feedback session to get started.
            </p>
            <Link href="/app/sessions/new">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                New Session
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
