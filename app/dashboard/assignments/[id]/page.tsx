import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import Link from "next/link"
import { format } from "date-fns"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getAssignmentById } from "@/lib/actions/assignment-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AssignmentPageProps {
  params: {
    id: string
  }
}

export default async function AssignmentPage({ params }: AssignmentPageProps) {
  const { id } = params
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  const { assignment, error } = await getAssignmentById(id)

  if (error || !assignment) {
    redirect("/dashboard/assignments")
  }

  const isTeacher = session.user.role === "ADMIN" || session.user.role === "STAFF"
  const isCreator = assignment.createdBy.id === session.user.id

  // Find the current user's submission if they're a student
  const userSubmission = assignment.submissions.find((submission) => submission.user.id === session.user.id)

  const isOverdue = new Date(assignment.dueDate) < new Date() && !userSubmission

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{assignment.title}</h1>
          <p className="text-muted-foreground">
            {assignment.program.name} • Due: {format(new Date(assignment.dueDate), "PPP")}
          </p>
        </div>
        <div className="flex gap-2">
          {isTeacher ? (
            <Button asChild>
              <Link href={`/dashboard/programs/${assignment.program.id}/assignments`}>Back to Assignments</Link>
            </Button>
          ) : userSubmission ? (
            <Button asChild>
              <Link href={`/dashboard/assignments/${id}/submit`}>Edit Submission</Link>
            </Button>
          ) : (
            <Button asChild disabled={isOverdue}>
              <Link href={`/dashboard/assignments/${id}/submit`}>Submit Assignment</Link>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>Created by {assignment.createdBy.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none dark:prose-invert">
            <p>{assignment.description}</p>
          </div>
        </CardContent>
      </Card>

      {isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle>Submissions ({assignment.submissions.length})</CardTitle>
            <CardDescription>Review and grade student submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {assignment.submissions.length > 0 ? (
              <div className="space-y-4">
                {assignment.submissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{submission.user.name}</p>
                      <p className="text-sm text-muted-foreground">{submission.user.email}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          Submitted: {format(new Date(submission.submittedAt), "PPP")}
                        </p>
                        {submission.status === "GRADED" ? (
                          <Badge className="bg-green-100 text-green-800">Grade: {submission.grade}/100</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">Not Graded</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline">
                        <Link href={`/dashboard/assignments/${id}/view/${submission.id}`}>View</Link>
                      </Button>
                      {submission.status !== "GRADED" && (
                        <Button asChild>
                          <Link href={`/dashboard/assignments/${id}/grade/${submission.id}`}>Grade</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <h3 className="mb-2 text-lg font-semibold">No Submissions Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Students haven't submitted their work for this assignment yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isTeacher && userSubmission && (
        <Card>
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
            <CardDescription>Submitted on {format(new Date(userSubmission.submittedAt), "PPP")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none dark:prose-invert">
              <p>{userSubmission.content}</p>
            </div>

            {userSubmission.status === "GRADED" && (
              <div className="mt-6 space-y-4 rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Feedback</h3>
                  <Badge className="bg-green-100 text-green-800">Grade: {userSubmission.grade}/100</Badge>
                </div>
                <p>{userSubmission.feedback}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
