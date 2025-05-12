"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Upload } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { submitAssignment } from "@/lib/actions/assignment-actions"

const submissionSchema = z.object({
  content: z.string().min(10, { message: "Submission content must be at least 10 characters" }),
})

interface SubmissionFormProps {
  assignmentId: string
  userId: string
  existingSubmission?: any
}

export function SubmissionForm({ assignmentId, userId, existingSubmission }: SubmissionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState(existingSubmission?.content || "")
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    // Clear error when user types
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: "" }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate form data
      submissionSchema.parse({ content })

      // Clear all errors if validation passes
      setErrors({})
      setIsLoading(true)

      // Create form data for server action
      const formData = new FormData()
      formData.append("assignmentId", assignmentId)
      formData.append("content", content)

      // In a real app, you would upload the file to a storage service
      // and then store the URL in the database
      if (file) {
        formData.append("fileUrl", URL.createObjectURL(file))
      }

      // Call server action to submit assignment
      const result = await submitAssignment(formData, userId)

      if (result.error) {
        toast({
          title: "Failed to submit assignment",
          description: result.error,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Show success toast
      toast({
        title: "Assignment submitted successfully",
        description: existingSubmission ? "Your submission has been updated" : "Your submission has been recorded",
      })

      // Refresh the page
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
          title: "Failed to submit assignment",
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
          <CardTitle>{existingSubmission ? "Edit Submission" : "Submit Assignment"}</CardTitle>
          <CardDescription>
            {existingSubmission ? "Update your submission for this assignment" : "Submit your work for this assignment"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Enter your submission here..."
              value={content}
              onChange={handleContentChange}
              className={`min-h-[200px] ${errors.content ? "border-red-500" : ""}`}
            />
            {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <input id="file" type="file" className="hidden" onChange={handleFileChange} />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {file ? file.name : existingSubmission?.fileUrl ? "Replace file" : "Upload file (optional)"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Upload any supporting documents (PDF, DOC, JPG, PNG)</p>
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
                {existingSubmission ? "Updating..." : "Submitting..."}
              </>
            ) : existingSubmission ? (
              "Update Submission"
            ) : (
              "Submit Assignment"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
