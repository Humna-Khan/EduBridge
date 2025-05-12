"use client"
import { format } from "date-fns"
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

// Mock data for recent registrations
const recentRegistrations = [
  {
    id: "REG-001",
    name: "John Smith",
    email: "john.smith@example.com",
    program: "STEM Preparation",
    date: new Date(2023, 4, 30),
    status: "Pending",
  },
  {
    id: "REG-002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    program: "Language Proficiency",
    date: new Date(2023, 4, 29),
    status: "Approved",
  },
  {
    id: "REG-003",
    name: "Michael Brown",
    email: "m.brown@example.com",
    program: "Career Transition",
    date: new Date(2023, 4, 28),
    status: "Pending",
  },
  {
    id: "REG-004",
    name: "Emily Davis",
    email: "emily.d@example.com",
    program: "Academic Readiness",
    date: new Date(2023, 4, 27),
    status: "Approved",
  },
  {
    id: "REG-005",
    name: "David Wilson",
    email: "d.wilson@example.com",
    program: "Technical Skills",
    date: new Date(2023, 4, 26),
    status: "Rejected",
  },
]

export function RecentRegistrationsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Program</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentRegistrations.map((registration) => (
          <TableRow key={registration.id}>
            <TableCell className="font-medium">{registration.id}</TableCell>
            <TableCell>{registration.name}</TableCell>
            <TableCell>{registration.program}</TableCell>
            <TableCell>{format(registration.date, "MMM dd, yyyy")}</TableCell>
            <TableCell>
              <Badge
                variant={
                  registration.status === "Approved"
                    ? "default"
                    : registration.status === "Pending"
                      ? "outline"
                      : "destructive"
                }
                className={
                  registration.status === "Approved"
                    ? "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
                    : registration.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800"
                      : ""
                }
              >
                {registration.status}
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
                  <DropdownMenuItem>Approve</DropdownMenuItem>
                  <DropdownMenuItem>Reject</DropdownMenuItem>
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
