import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getAssignmentById } from "@/lib/actions/assignment-actions"
import { SubmissionForm } from "@/components/dashboard/assignments/submission-form"

interface SubmitAssignmentPageProps {
  params: {
    id: string
  }
}

export default async function SubmitAssignmentPage({ params }: SubmitAssignmentPageProps) {
  const { id } = params
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  // Only students can submit assignments
  if (session.user.role !== "STUDENT") {
    redirect("/dashboard/assignments")
  }

  const { assignment, error } = await getAssignmentById(id)

  if (error || !assignment) {
    redirect("/dashboard/assignments")
  }

  // Check if assignment is past due date
  if (new Date(assignment.dueDate) < new Date()) {
    redirect(`/dashboard/assignments/${id}`)
  }

  // Find existing submission if any
  const existingSubmission = assignment.submissions.find((submission) => submission.user.id === session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {existingSubmission ? "Edit Submission" : "Submit Assignment"}
        </h1>
        <p className="text-muted-foreground">{assignment.title}</p>
      </div>

      <SubmissionForm assignmentId={id} userId={session.user.id} existingSubmission={existingSubmission} />
    </div>
  )
}
