"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Loader2, MessageSquare, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getChatSessions } from "@/lib/actions/chatbot-actions"

interface ChatHistoryProps {
  userId: string
  activeSessionId?: string
}

export function ChatHistory({ userId, activeSessionId }: ChatHistoryProps) {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true)
      try {
        const result = await getChatSessions(userId)
        if (result.sessions) {
          setSessions(result.sessions)
        } else if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch chat sessions",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [userId, toast])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Chat History</CardTitle>
            <CardDescription>Your previous conversations with the AI assistant</CardDescription>
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard/chat">
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center gap-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No chat sessions found</p>
            <Button asChild>
              <Link href="/dashboard/chat">
                <Plus className="mr-2 h-4 w-4" />
                Start New Chat
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <Link key={session.id} href={`/dashboard/chat/${session.id}`} className="block">
                <div
                  className={`rounded-lg p-3 transition-colors hover:bg-muted ${
                    activeSessionId === session.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="line-clamp-1 font-medium">{session.title || "Untitled Chat"}</h3>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(session.updatedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{format(new Date(session.updatedAt), "h:mm a")}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
