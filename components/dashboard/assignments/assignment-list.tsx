"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { CalendarIcon, FileText, Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getAssignmentsByProgram } from "@/lib/actions/assignment-actions"

interface AssignmentListProps {
  programId: string
  isTeacher: boolean
}

export function AssignmentList({ programId, isTeacher }: AssignmentListProps) {
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true)
      try {
        const result = await getAssignmentsByProgram(programId)
        if (result.assignments) {
          setAssignments(result.assignments)
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
          description: "Failed to fetch assignments",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [programId, toast])

  const isDueSoon = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 3
  }

  const isOverdue = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    return due < now
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>View and manage assignments for this program</CardDescription>
          </div>
          {isTeacher && (
            <Button asChild>
              <Link href={`/dashboard/programs/${programId}/assignments/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
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
        ) : assignments.length === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center gap-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No assignments found for this program</p>
            {isTeacher && (
              <Button asChild>
                <Link href={`/dashboard/programs/${programId}/assignments/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Assignment
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => (
              <Link key={assignment.id} href={`/dashboard/assignments/${assignment.id}`} className="block">
                <Card className="h-full transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="line-clamp-1 text-lg">{assignment.title}</CardTitle>
                      {isDueSoon(assignment.dueDate) && !isOverdue(assignment.dueDate) ? (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800">
                          Due Soon
                        </Badge>
                      ) : isOverdue(assignment.dueDate) ? (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800">Overdue</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800">
                          Active
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">{assignment.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      Due: {format(new Date(assignment.dueDate), "PPP")}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>By: {assignment.createdBy.name}</span>
                      <span>{assignment._count.submissions} submissions</span>
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
