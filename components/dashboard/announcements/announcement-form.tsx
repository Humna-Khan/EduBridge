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
import { createAnnouncement } from "@/lib/actions/announcement-actions"

const announcementSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
})

interface AnnouncementFormProps {
  programId: string
  userId: string
}

export function AnnouncementForm({ programId, userId }: AnnouncementFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
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
      announcementSchema.parse(formData)

      // Clear all errors if validation passes
      setErrors({})
      setIsLoading(true)

      // Create form data for server action
      const formDataToSubmit = new FormData()
      formDataToSubmit.append("title", formData.title)
      formDataToSubmit.append("content", formData.content)
      formDataToSubmit.append("programId", programId)

      // Call server action to create announcement
      const result = await createAnnouncement(formDataToSubmit, userId)

      if (result.error) {
        toast({
          title: "Failed to create announcement",
          description: result.error,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Show success toast
      toast({
        title: "Announcement created successfully",
        description: "Students can now view this announcement",
      })

      // Reset form and redirect
      router.push(`/dashboard/programs/${programId}/announcements`)
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
          title: "Failed to create announcement",
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
          <CardTitle>Create New Announcement</CardTitle>
          <CardDescription>Create a new announcement for students in this program</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Announcement Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter announcement title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Enter announcement content"
              value={formData.content}
              onChange={handleChange}
              className={`min-h-[150px] ${errors.content ? "border-red-500" : ""}`}
            />
            {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/programs/${programId}/announcements`)}
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
              "Create Announcement"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
