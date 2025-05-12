"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { gradeSubmission } from "@/lib/actions/assignment-actions"

const gradingSchema = z.object({
  grade: z.string().refine(
    (val) => {
      const num = Number.parseInt(val)
      return !isNaN(num) && num >= 0 && num <= 100
    },
    { message: "Grade must be a number between 0 and 100" },
  ),
  feedback: z.string().min(5, { message: "Feedback must be at least 5 characters" }),
})

interface GradingFormProps {
  submission: any
  assignmentId: string
}

export function GradingForm({ submission, assignmentId }: GradingFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    grade: submission.grade?.toString() || "",
    feedback: submission.feedback || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate form data
      gradingSchema.parse(formData)

      // Clear all errors if validation passes
      setErrors({})
      setIsLoading(true)

      // Create form data for server action
      const formDataToSubmit = new FormData()
      formDataToSubmit.append("submissionId", submission.id)
      formDataToSubmit.append("grade", formData.grade)
      formDataToSubmit.append("feedback", formData.feedback)

      // Call server action to grade submission
      const result = await gradeSubmission(formDataToSubmit)

      if (result.error) {
        toast({
          title: "Failed to grade submission",
          description: result.error,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Show success toast
      toast({
        title: "Submission graded successfully",
        description: "The student will be able to see the grade and feedback",
      })

      // Refresh the page
      router.refresh()
      router.push(`/dashboard/assignments/${assignmentId}`)
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
          title: "Failed to grade submission",
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
          <CardTitle>Grade Submission</CardTitle>
          <CardDescription>Provide a grade and feedback for {submission.user.name}'s submission</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="grade">Grade (0-100)</Label>
            <Input
              id="grade"
              name="grade"
              type="number"
              min="0"
              max="100"
              placeholder="Enter grade"
              value={formData.grade}
              onChange={handleChange}
              className={errors.grade ? "border-red-500" : ""}
            />
            {errors.grade && <p className="text-sm text-red-500">{errors.grade}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
              id="feedback"
              name="feedback"
              placeholder="Provide feedback on the submission"
              value={formData.feedback}
              onChange={handleChange}
              className={`min-h-[150px] ${errors.feedback ? "border-red-500" : ""}`}
            />
            {errors.feedback && <p className="text-sm text-red-500">{errors.feedback}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/assignments/${assignmentId}`)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Grade"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
