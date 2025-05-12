import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getProgramById } from "@/lib/actions/program-actions"
import { AttendanceForm } from "@/components/dashboard/attendance/attendance-form"

interface AttendanceProgramPageProps {
  params: {
    programId: string
  }
}

export default async function AttendanceProgramPage({ params }: AttendanceProgramPageProps) {
  const { programId } = params
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  // Only teachers can access attendance management
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    redirect("/dashboard")
  }

  const { program, error } = await getProgramById(programId)

  if (error || !program) {
    redirect("/dashboard/attendance")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance: {program.name}</h1>
        <p className="text-muted-foreground">Mark and track student attendance</p>
      </div>

      <AttendanceForm programId={programId} />
    </div>
  )
}
