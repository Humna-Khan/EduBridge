"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2, Upload } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { registerUser } from "@/lib/actions/user-actions"
import { getAllPrograms } from "@/lib/actions/program-actions"
import { createEnrollment } from "@/lib/actions/enrollment-actions"

const studentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  program: z.string().min(1, { message: "Please select a program" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

interface AddStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddStudentDialog({ open, onOpenChange }: AddStudentDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    program: "",
    password: "student123", // Default password
  })
  const [document, setDocument] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [programs, setPrograms] = useState<any[]>([])

  // Fetch programs on component mount
  useEffect(() => {
    const fetchPrograms = async () => {
      const result = await getAllPrograms()
      if (result.programs) {
        setPrograms(result.programs)
      }
    }
    fetchPrograms()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, program: value }))
    // Clear error when user selects
    if (errors.program) {
      setErrors((prev) => ({ ...prev, program: "" }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocument(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate form data
      studentSchema.parse(formData)

      // Clear all errors if validation passes
      setErrors({})
      setIsLoading(true)

      // Create form data for user registration
      const userFormData = new FormData()
      userFormData.append("name", formData.name)
      userFormData.append("email", formData.email)
      userFormData.append("phone", formData.phone)
      userFormData.append("password", formData.password)

      // Register user
      const userResult = await registerUser(userFormData)

      if (userResult.error) {
        toast({
          title: "Failed to add student",
          description: userResult.error,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // If user was created successfully, create enrollment
      if (userResult.success && userResult.user) {
        const enrollmentFormData = new FormData()
        enrollmentFormData.append("program", formData.program)
        enrollmentFormData.append("message", "Added by administrator")

        // Create enrollment
        const enrollmentResult = await createEnrollment(enrollmentFormData, userResult.user.id)

        if (enrollmentResult.error) {
          toast({
            title: "Student added but enrollment failed",
            description: enrollmentResult.error,
            variant: "destructive",
          })
          setIsLoading(false)
          onOpenChange(false)
          return
        }

        // Show success toast
        toast({
          title: "Student added successfully",
          description: "The student has been added to the system",
        })

        // Reset form and close dialog
        setFormData({
          name: "",
          email: "",
          phone: "",
          program: "",
          password: "student123",
        })
        setDocument(null)
        onOpenChange(false)
      }
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
          title: "Failed to add student",
          description: "An error occurred. Please try again.",
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>Enter the student details to add them to the system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(123) 456-7890"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="program">Bridge Program</Label>
              <Select value={formData.program} onValueChange={handleSelectChange}>
                <SelectTrigger id="program" className={errors.program ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.program && <p className="text-sm text-red-500">{errors.program}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-red-500" : ""}
              />
              <p className="text-xs text-muted-foreground">Default password will be provided to the student</p>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="document">Supporting Document (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input id="document" type="file" className="hidden" onChange={handleFileChange} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("document")?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {document ? document.name : "Upload document"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Upload any supporting documents (PDF, DOC, JPG, PNG)</p>
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
                "Add Student"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
