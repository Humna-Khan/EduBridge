"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { markAttendance, getAttendanceByProgram } from "@/lib/actions/attendance-actions"

interface AttendanceFormProps {
  programId: string
}

export function AttendanceForm({ programId }: AttendanceFormProps) {
  const { toast } = useToast()
  const [date, setDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null)

  // Fetch attendance data when date changes
  const fetchAttendanceData = async () => {
    setFetchingData(true)
    try {
      const result = await getAttendanceByProgram(programId, date.toISOString())
      if (result.attendanceData) {
        setAttendanceData(result.attendanceData)
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
        description: "Failed to fetch attendance data",
        variant: "destructive",
      })
    } finally {
      setFetchingData(false)
    }
  }

  // Fetch attendance data on initial load and when date changes
  useState(() => {
    fetchAttendanceData()
  })

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      fetchAttendanceData()
    }
  }

  const handleStatusChange = async (userId: string, status: string, notes = "") => {
    setSavingStudentId(userId)
    try {
      const formData = new FormData()
      formData.append("userId", userId)
      formData.append("programId", programId)
      formData.append("date", date.toISOString())
      formData.append("status", status)
      formData.append("notes", notes)

      const result = await markAttendance(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Attendance marked successfully",
        })
        // Update local state
        setAttendanceData((prevData) =>
          prevData.map((item) => (item.userId === userId ? { ...item, status, notes } : item)),
        )
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      })
    } finally {
      setSavingStudentId(null)
    }
  }

  const handleNotesChange = (userId: string, notes: string, status: string) => {
    setAttendanceData((prevData) => prevData.map((item) => (item.userId === userId ? { ...item, notes } : item)))
    handleStatusChange(userId, status, notes)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Attendance Management</CardTitle>
            <CardDescription>Mark and track student attendance</CardDescription>
          </div>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {fetchingData ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : attendanceData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No students enrolled in this program</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData.map((student) => (
                <TableRow key={student.userId}>
                  <TableCell className="font-medium">{student.studentName}</TableCell>
                  <TableCell>{student.studentEmail}</TableCell>
                  <TableCell>
                    <Select
                      value={student.status}
                      onValueChange={(value) => handleStatusChange(student.userId, value, student.notes)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRESENT">Present</SelectItem>
                        <SelectItem value="ABSENT">Absent</SelectItem>
                        <SelectItem value="LATE">Late</SelectItem>
                        <SelectItem value="EXCUSED">Excused</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Textarea
                      placeholder="Add notes (optional)"
                      value={student.notes}
                      onChange={(e) => handleNotesChange(student.userId, e.target.value, student.status)}
                      className="h-10 min-h-0 resize-none"
                    />
                  </TableCell>
                  <TableCell>
                    {savingStudentId === student.userId ? (
                      <Button variant="ghost" size="sm" disabled>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(student.userId, student.status, student.notes)}
                      >
                        <Save className="h-4 w-4" />
                        <span className="sr-only">Save</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
