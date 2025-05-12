import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getProgramById } from "@/lib/actions/program-actions"
import { AssignmentForm } from "@/components/dashboard/assignments/assignment-form"

interface NewAssignmentPageProps {
  params: {
    id: string
  }
}

export default async function NewAssignmentPage({ params }: NewAssignmentPageProps) {
  const { id } = params
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  // Only teachers can create assignments
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    redirect("/dashboard/programs")
  }

  const { program, error } = await getProgramById(id)

  if (error || !program) {
    redirect("/dashboard/programs")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Assignment</h1>
        <p className="text-muted-foreground">{program.name}</p>
      </div>

      <AssignmentForm programId={id} userId={session.user.id} />
    </div>
  )
}
