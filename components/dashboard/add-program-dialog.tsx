"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createProgram } from "@/lib/actions/program-actions"
import { cn } from "@/lib/utils"

const programSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    description: z.string().min(10, { message: "Description must be at least 10 characters" }),
    duration: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Duration must be a positive number",
    }),
    capacity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Capacity must be a positive number",
    }),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  })
  .refine(
    (data) => {
      // Only validate if both dates are provided
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate
      }
      return true
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  )

interface AddProgramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddProgramDialog({ open, onOpenChange }: AddProgramDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    capacity: "",
  })
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    // Clear error when user selects
    if (errors.startDate) {
      setErrors((prev) => ({ ...prev, startDate: "" }))
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    // Clear error when user selects
    if (errors.endDate) {
      setErrors((prev) => ({ ...prev, endDate: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate form data
      programSchema.parse({
        ...formData,
        startDate,
        endDate,
      })

      // Clear all errors if validation passes
      setErrors({})
      setIsLoading(true)

      // Create form data for server action
      const formDataToSubmit = new FormData()
      formDataToSubmit.append("name", formData.name)
      formDataToSubmit.append("description", formData.description)
      formDataToSubmit.append("duration", formData.duration)
      formDataToSubmit.append("capacity", formData.capacity)

      // Only append dates if they are defined
      if (startDate) {
        formDataToSubmit.append("startDate", startDate.toISOString())
      }

      if (endDate) {
        formDataToSubmit.append("endDate", endDate.toISOString())
      }

      // Get the current user ID from session
      // For now, we'll use a server action that handles this
      const result = await createProgram(formDataToSubmit)

      if (result.error) {
        toast({
          title: "Failed to add program",
          description: result.error,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Show success toast
      toast({
        title: "Program added successfully",
        description: "The program has been added to the system",
      })

      // Reset form and close dialog
      setFormData({
        name: "",
        description: "",
        duration: "",
        capacity: "",
      })
      setStartDate(undefined)
      setEndDate(undefined)
      onOpenChange(false)
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
          title: "Failed to add program",
          description: "An error occurred. Please try again.",
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Program</DialogTitle>
          <DialogDescription>Enter the program details to add a new educational bridge program.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Program Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="STEM Preparation"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the program..."
                value={formData.description}
                onChange={handleChange}
                className={cn("min-h-[100px]", errors.description ? "border-red-500" : "")}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (weeks)</Label>
                <Input
                  id="duration"
                  name="duration"
                  placeholder="12"
                  value={formData.duration}
                  onChange={handleChange}
                  className={errors.duration ? "border-red-500" : ""}
                />
                {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  placeholder="30"
                  value={formData.capacity}
                  onChange={handleChange}
                  className={errors.capacity ? "border-red-500" : ""}
                />
                {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                        errors.startDate ? "border-red-500" : "",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} initialFocus />
                  </PopoverContent>
                </Popover>
                {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
              </div>
              <div className="grid gap-2">
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                        errors.endDate ? "border-red-500" : "",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      initialFocus
                      disabled={(date) => (startDate ? date < startDate : false)}
                    />
                  </PopoverContent>
                </Popover>
                {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-mint-500 hover:bg-mint-600 text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Program"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
