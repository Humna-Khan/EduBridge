import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import Link from "next/link"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getProgramById } from "@/lib/actions/program-actions"
import { Button } from "@/components/ui/button"
import { AssignmentList } from "@/components/dashboard/assignments/assignment-list"

interface ProgramAssignmentsPageProps {
  params: {
    id: string
  }
}

export default async function ProgramAssignmentsPage({ params }: ProgramAssignmentsPageProps) {
  const { id } = params
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  const { program, error } = await getProgramById(id)

  if (error || !program) {
    redirect("/dashboard/programs")
  }

  const isTeacher = session.user.role === "ADMIN" || session.user.role === "STAFF"

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">{program.name}</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/programs/${id}`}>Back to Program</Link>
        </Button>
      </div>

      <AssignmentList programId={id} isTeacher={isTeacher} />
    </div>
  )
}
