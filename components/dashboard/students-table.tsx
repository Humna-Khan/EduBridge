"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Download } from "lucide-react"
import { EnrollmentStatus } from "@prisma/client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getStudents, deleteStudent } from "@/lib/actions/student-actions"
import { useToast } from "@/hooks/use-toast"
import { convertToCSV, downloadCSV } from "@/lib/utils/csv-export"

interface Student {
  id: string
  name: string
  email: string
  program: string
  registrationDate: string
  status: EnrollmentStatus | "Not Enrolled"
}

interface StudentsTableProps {
  searchQuery: string
}

export function StudentsTable({ searchQuery }: StudentsTableProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const { toast } = useToast()

  // Fetch students data
  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true)
        const result = await getStudents(searchQuery)
        if (result.error) {
          setError(result.error)
        } else if (result.students) {
          setStudents(result.students)
        }
      } catch (err) {
        setError("Failed to fetch students")
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [searchQuery])

  const handleDelete = async () => {
    if (!studentToDelete) return

    try {
      const result = await deleteStudent(studentToDelete.id)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Student deleted successfully",
        })
        // Remove the deleted student from the state
        setStudents(students.filter((s) => s.id !== studentToDelete.id))
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      })
    } finally {
      setStudentToDelete(null)
    }
  }

  const handleExport = () => {
    try {
      const headers = ["ID", "Name", "Email", "Program", "Registration Date", "Status"]
      const csvContent = convertToCSV(students, headers)
      const filename = `students-export-${new Date().toISOString().split("T")[0]}.csv`
      downloadCSV(csvContent, filename)
      
      toast({
        title: "Success",
        description: "Student data exported successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to export student data",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-24 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Registration Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No students found.
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.id}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.program}</TableCell>
                <TableCell>{student.registrationDate}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      student.status === "APPROVED" ? "default" : student.status === "PENDING" ? "outline" : "secondary"
                    }
                    className={
                      student.status === "APPROVED"
                        ? "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
                        : student.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800"
                    }
                  >
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit details</DropdownMenuItem>
                      <DropdownMenuItem>Send message</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setStudentToDelete(student)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student
              {studentToDelete && ` "${studentToDelete.name}"`} and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
