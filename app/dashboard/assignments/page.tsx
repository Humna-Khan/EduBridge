import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getAssignmentsByStudent } from "@/lib/actions/assignment-actions"
import { getProgramsByTeacher } from "@/lib/actions/program-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"

export default async function AssignmentsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  // Different views for teachers and students
  if (session.user.role === "ADMIN" || session.user.role === "STAFF") {
    // Teacher view - show programs
    const { programs } = await getProgramsByTeacher(session.user.id)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">Select a program to manage assignments</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs && programs.length > 0 ? (
            programs.map((program) => (
              <Card key={program.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="truncate">{program.name}</CardTitle>
                  <CardDescription>
                    {program.status === "ACTIVE" ? (
                      <span className="text-green-600">Active</span>
                    ) : program.status === "UPCOMING" ? (
                      <span className="text-blue-600">Upcoming</span>
                    ) : program.status === "COMPLETED" ? (
                      <span className="text-gray-600">Completed</span>
                    ) : (
                      <span className="text-red-600">Cancelled</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end">
                    <Button asChild>
                      <Link href={`/dashboard/programs/${program.id}/assignments`}>View Assignments</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">No Programs Found</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                You don't have any programs to manage assignments for.
              </p>
              <Button asChild>
                <Link href="/dashboard/programs">View Programs</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  } else {
    // Student view - show assignments
    const { assignments } = await getAssignmentsByStudent(session.user.id)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Assignments</h1>
          <p className="text-muted-foreground">View and submit your assignments</p>
        </div>

        <div className="space-y-4">
          {assignments && assignments.length > 0 ? (
            assignments.map((assignment) => (
              <Card key={assignment.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{assignment.title}</h3>
                        {assignment.status === "GRADED" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Graded</Badge>
                        ) : assignment.status === "SUBMITTED" ? (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Submitted</Badge>
                        ) : assignment.status === "OVERDUE" ? (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{assignment.program.name}</p>
                      <p className="text-sm">Due: {format(new Date(assignment.dueDate), "PPP")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild>
                        <Link href={`/dashboard/assignments/${assignment.id}`}>
                          {assignment.submission ? "View Submission" : "Submit"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">No Assignments Found</h3>
              <p className="text-sm text-muted-foreground">You don't have any assignments at the moment.</p>
            </div>
          )}
        </div>
      </div>
    )
  }
}
