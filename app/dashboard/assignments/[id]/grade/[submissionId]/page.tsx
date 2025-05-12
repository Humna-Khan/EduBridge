import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getAssignmentById } from "@/lib/actions/assignment-actions"
import { GradingForm } from "@/components/dashboard/assignments/grading-form"

interface GradeSubmissionPageProps {
  params: {
    id: string
    submissionId: string
  }
}

export default async function GradeSubmissionPage({ params }: GradeSubmissionPageProps) {
  const { id, submissionId } = params
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  // Only teachers can grade submissions
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    redirect("/dashboard/assignments")
  }

  const { assignment, error } = await getAssignmentById(id)

  if (error || !assignment) {
    redirect("/dashboard/assignments")
  }

  // Find the submission
  const submission = assignment.submissions.find((sub) => sub.id === submissionId)

  if (!submission) {
    redirect(`/dashboard/assignments/${id}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grade Submission</h1>
        <p className="text-muted-foreground">
          {assignment.title} - {submission.user.name}
        </p>
      </div>

      <GradingForm submission={submission} assignmentId={id} />
    </div>
  )
}
