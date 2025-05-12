"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, Search, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { StudentsTable } from "@/components/dashboard/students-table"
import { AddStudentDialog } from "@/components/dashboard/add-student-dialog"

export default function StudentsPage() {
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">Manage and view all student registrations</p>
        </div>
        <div className="flex items-center gap-2">
          {/* <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button> */}
          <Button
            size="sm"
            className="bg-mint-500 hover:bg-mint-600 text-white"
            onClick={() => setIsAddStudentOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Student Registrations</CardTitle>
                <CardDescription>View and manage all registered students</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <StudentsTable searchQuery={searchQuery} />
          </CardContent>
        </Card>
      </motion.div>

      <AddStudentDialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen} />
    </div>
  )
}
