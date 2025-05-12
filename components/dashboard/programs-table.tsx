"use client"

import { useState, useEffect } from "react"
import { Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Mock data for programs
const allPrograms = [
  {
    id: "PRG-001",
    name: "STEM Preparation",
    description: "Prepare students for success in Science, Technology, Engineering, and Mathematics fields.",
    duration: "12 weeks",
    startDate: "Jun 15, 2023",
    endDate: "Sep 7, 2023",
    capacity: 50,
    enrolled: 45,
    status: "Active",
  },
  {
    id: "PRG-002",
    name: "Language Proficiency",
    description: "Enhance language skills for academic success and professional development.",
    duration: "8 weeks",
    startDate: "Jul 1, 2023",
    endDate: "Aug 26, 2023",
    capacity: 40,
    enrolled: 32,
    status: "Active",
  },
  {
    id: "PRG-003",
    name: "Career Transition",
    description: "Support students transitioning between different career paths with specialized training.",
    duration: "16 weeks",
    startDate: "Aug 5, 2023",
    endDate: "Nov 25, 2023",
    capacity: 35,
    enrolled: 28,
    status: "Upcoming",
  },
  {
    id: "PRG-004",
    name: "Academic Readiness",
    description: "Prepare students for the academic rigors of higher education.",
    duration: "10 weeks",
    startDate: "Jun 20, 2023",
    endDate: "Aug 29, 2023",
    capacity: 45,
    enrolled: 36,
    status: "Active",
  },
  {
    id: "PRG-005",
    name: "Technical Skills",
    description: "Develop practical technical skills for the modern workplace.",
    duration: "14 weeks",
    startDate: "Jul 10, 2023",
    endDate: "Oct 16, 2023",
    capacity: 30,
    enrolled: 24,
    status: "Upcoming",
  },
  {
    id: "PRG-006",
    name: "Research Methods",
    description: "Learn essential research methodologies and practices.",
    duration: "12 weeks",
    startDate: "Sep 1, 2023",
    endDate: "Nov 24, 2023",
    capacity: 25,
    enrolled: 18,
    status: "Upcoming",
  },
  {
    id: "PRG-007",
    name: "Professional Communication",
    description: "Develop effective communication skills for professional environments.",
    duration: "6 weeks",
    startDate: "Jun 5, 2023",
    endDate: "Jul 17, 2023",
    capacity: 40,
    enrolled: 38,
    status: "Active",
  },
  {
    id: "PRG-008",
    name: "Digital Literacy",
    description: "Build essential digital skills for academic and professional success.",
    duration: "8 weeks",
    startDate: "Jul 15, 2023",
    endDate: "Sep 9, 2023",
    capacity: 35,
    enrolled: 30,
    status: "Active",
  },
]

interface ProgramsTableProps {
  searchQuery: string
}

export function ProgramsTable({ searchQuery }: ProgramsTableProps) {
  const [filteredPrograms, setFilteredPrograms] = useState(allPrograms)

  // Filter programs based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredPrograms(allPrograms)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = allPrograms.filter(
      (program) =>
        program.name.toLowerCase().includes(query) ||
        program.description.toLowerCase().includes(query) ||
        program.id.toLowerCase().includes(query),
    )

    setFilteredPrograms(filtered)
  }, [searchQuery])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Program Name</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>Enrollment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredPrograms.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              No programs found.
            </TableCell>
          </TableRow>
        ) : (
          filteredPrograms.map((program) => (
            <TableRow key={program.id}>
              <TableCell className="font-medium">{program.id}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{program.name}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">{program.description}</div>
                </div>
              </TableCell>
              <TableCell>{program.duration}</TableCell>
              <TableCell>{program.startDate}</TableCell>
              <TableCell>
                {program.enrolled}/{program.capacity}
                <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-mint-500"
                    style={{ width: `${(program.enrolled / program.capacity) * 100}%` }}
                  />
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={program.status === "Active" ? "default" : "outline"}
                  className={
                    program.status === "Active"
                      ? "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800"
                  }
                >
                  {program.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
