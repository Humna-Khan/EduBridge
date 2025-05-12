"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ProgramsTable } from "@/components/dashboard/programs-table"
import { AddProgramDialog } from "@/components/dashboard/add-program-dialog"

export default function ProgramsPage() {
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Programs</h2>
          <p className="text-muted-foreground">Manage and view all educational bridge programs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            size="sm"
            className="bg-mint-500 hover:bg-mint-600 text-white"
            onClick={() => setIsAddProgramOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Program
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Bridge Programs</CardTitle>
                <CardDescription>View and manage all educational bridge programs</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search programs..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ProgramsTable searchQuery={searchQuery} />
          </CardContent>
        </Card>
      </motion.div>

      <AddProgramDialog open={isAddProgramOpen} onOpenChange={setIsAddProgramOpen} />
    </div>
  )
}
