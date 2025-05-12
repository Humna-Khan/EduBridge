"use client"

import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Mock data for programs
const programs = [
  {
    id: "PRG-001",
    name: "STEM Preparation",
    students: 45,
    duration: "12 weeks",
    startDate: "Jun 15, 2023",
    status: "Active",
  },
  {
    id: "PRG-002",
    name: "Language Proficiency",
    students: 32,
    duration: "8 weeks",
    startDate: "Jul 1, 2023",
    status: "Active",
  },
  {
    id: "PRG-003",
    name: "Career Transition",
    students: 28,
    duration: "16 weeks",
    startDate: "Aug 5, 2023",
    status: "Upcoming",
  },
  {
    id: "PRG-004",
    name: "Academic Readiness",
    students: 36,
    duration: "10 weeks",
    startDate: "Jun 20, 2023",
    status: "Active",
  },
  {
    id: "PRG-005",
    name: "Technical Skills",
    students: 24,
    duration: "14 weeks",
    startDate: "Jul 10, 2023",
    status: "Upcoming",
  },
]

export function ProgramsOverviewTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Program Name</TableHead>
          <TableHead>Students</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {programs.map((program) => (
          <TableRow key={program.id}>
            <TableCell className="font-medium">{program.id}</TableCell>
            <TableCell>{program.name}</TableCell>
            <TableCell>{program.students}</TableCell>
            <TableCell>{program.duration}</TableCell>
            <TableCell>{program.startDate}</TableCell>
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
                  <DropdownMenuItem>View details</DropdownMenuItem>
                  <DropdownMenuItem>Edit program</DropdownMenuItem>
                  <DropdownMenuItem>View students</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
