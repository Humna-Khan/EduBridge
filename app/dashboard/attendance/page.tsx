import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getProgramsByTeacher } from "@/lib/actions/program-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AttendancePage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  // Only teachers can access attendance management
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    redirect("/dashboard")
  }

  const { programs } = await getProgramsByTeacher(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
        <p className="text-muted-foreground">Select a program to manage attendance</p>
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
                    <Link href={`/dashboard/attendance/${program.id}`}>Manage Attendance</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="mb-2 text-lg font-semibold">No Programs Found</h3>
            <p className="mb-6 text-sm text-muted-foreground">You don't have any programs to manage attendance for.</p>
            <Button asChild>
              <Link href="/dashboard/programs">View Programs</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
