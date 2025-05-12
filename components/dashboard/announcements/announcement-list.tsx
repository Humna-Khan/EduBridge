"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Loader2, Megaphone, MessageSquare, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getAnnouncementsByProgram } from "@/lib/actions/announcement-actions"

interface AnnouncementListProps {
  programId: string
  isTeacher: boolean
}

export function AnnouncementList({ programId, isTeacher }: AnnouncementListProps) {
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true)
      try {
        const result = await getAnnouncementsByProgram(programId)
        if (result.announcements) {
          setAnnouncements(result.announcements)
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
          description: "Failed to fetch announcements",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [programId, toast])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>View and manage announcements for this program</CardDescription>
          </div>
          {isTeacher && (
            <Button asChild>
              <Link href={`/dashboard/programs/${programId}/announcements/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Announcement
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center gap-4">
            <Megaphone className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No announcements found for this program</p>
            {isTeacher && (
              <Button asChild>
                <Link href={`/dashboard/programs/${programId}/announcements/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Announcement
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Link key={announcement.id} href={`/dashboard/announcements/${announcement.id}`} className="block">
                <Card className="transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{announcement.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(announcement.createdAt), "PPP")}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{announcement.content}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>By: {announcement.createdBy.name}</span>
                      <div className="flex items-center">
                        <MessageSquare className="mr-1 h-4 w-4" />
                        <span>{announcement._count.comments} comments</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
