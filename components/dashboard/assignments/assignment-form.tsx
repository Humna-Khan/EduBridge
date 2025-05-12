"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createAssignment } from "@/lib/actions/assignment-actions"
import { cn } from "@/lib/utils"

const assignmentSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
})

interface AssignmentFormProps {
  programId: string
  userId: string
}

export function AssignmentForm({ programId, userId }: AssignmentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleDueDateChange = (date: Date | undefined) => {
    setDueDate(date)
    // Clear error when user selects
    if (errors.dueDate) {
      setErrors((prev) => ({ ...prev, dueDate: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate form data
      assignmentSchema.parse(formData)

      if (!dueDate) {
        setErrors((prev) => ({ ...prev, dueDate: "Due date is required" }))
        return
      }

      // Clear all errors if validation passes
      setErrors({})
      setIsLoading(true)

      // Create form data for server action
      const formDataToSubmit = new FormData()
      formDataToSubmit.append("title", formData.title)
      formDataToSubmit.append("description", formData.description)
      formDataToSubmit.append("dueDate", dueDate.toISOString())
      formDataToSubmit.append("programId", programId)

      // Call server action to create assignment
      const result = await createAssignment(formDataToSubmit, userId)

      if (result.error) {
        toast({
          title: "Failed to create assignment",
          description: result.error,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Show success toast
      toast({
        title: "Assignment created successfully",
        description: "Students can now view and submit this assignment",
      })

      // Reset form and redirect
      router.push(`/dashboard/programs/${programId}/assignments`)
      router.refresh()
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Set validation errors
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(newErrors)
      } else {
        // Show error toast for other errors
        toast({
          title: "Failed to create assignment",
          description: "An error occurred. Please try again.",
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create New Assignment</CardTitle>
          <CardDescription>Create a new assignment for students in this program</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter assignment title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter assignment description, instructions, and requirements"
              value={formData.description}
              onChange={handleChange}
              className={cn("min-h-[150px]", errors.description ? "border-red-500" : "")}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground",
                    errors.dueDate ? "border-red-500" : "",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={handleDueDateChange}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/programs/${programId}/assignments`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Assignment"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
