import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import Link from "next/link"
import { format } from "date-fns"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getAnnouncementById } from "@/lib/actions/announcement-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AnnouncementPageProps {
  params: {
    id: string
  }
}

export default async function AnnouncementPage({ params }: AnnouncementPageProps) {
  const { id } = params
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  const { announcement, error } = await getAnnouncementById(id)

  if (error || !announcement) {
    redirect("/dashboard/announcements")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{announcement.title}</h1>
          <p className="text-muted-foreground">
            {announcement.program.name} • {format(new Date(announcement.createdAt), "PPP")}
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/programs/${announcement.program.id}/announcements`}>Back to Announcements</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Announcement</CardTitle>
          <CardDescription>Posted by {announcement.createdBy.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none dark:prose-invert">
            <p>{announcement.content}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments ({announcement.comments.length})</CardTitle>
          <CardDescription>Join the discussion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {announcement.comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" alt={comment.user.name} />
                  <AvatarFallback>{getInitials(comment.user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{comment.user.name}</p>
                    <span className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), "PPP")}</span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              </div>
            ))}

            {announcement.comments.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <h3 className="mb-2 text-lg font-semibold">No Comments Yet</h3>
                <p className="text-sm text-muted-foreground">Be the first to comment on this announcement</p>
              </div>
            )}

            <div className="mt-6">
              <form className="space-y-4">
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Add a comment..."
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button type="submit">Post Comment</Button>
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
