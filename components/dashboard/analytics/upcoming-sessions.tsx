"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Clock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUpcomingSessions } from "@/lib/actions/analytics-actions"

export function UpcomingSessions() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await getUpcomingSessions()
        if (result.data) {
          setSessions(result.data)
        }
      } catch (err) {
        console.error("Failed to fetch upcoming sessions:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Upcoming Sessions</CardTitle>
        <CardDescription>Sessions scheduled for the next 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-3 w-32 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-center text-muted-foreground">No upcoming sessions</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center">
                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{session.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(session.date), "MMM dd, yyyy")} • {session.enrollments} enrollments
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
