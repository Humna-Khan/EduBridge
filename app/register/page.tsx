"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { GraduationCap, Loader2, Upload } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createEnrollment } from "@/lib/actions/enrollment-actions"
import { getAllPrograms } from "@/lib/actions/program-actions"

const registrationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  program: z.string().min(1, { message: "Please select a program" }),
  message: z.string().optional(),
  document: z.instanceof(File).optional(),
})

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    program: "",
    message: "",
  })
  const [document, setDocument] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [programs, setPrograms] = useState<any[]>([])

  // Fetch programs on component mount
  React.useEffect(() => {
    const fetchPrograms = async () => {
      const result = await getAllPrograms()
      if (result.programs) {
        setPrograms(result.programs)
      }
    }
    fetchPrograms()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      // Clear error when user uploads
      if (errors.document) {
        setErrors((prev) => ({ ...prev, document: "" }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate form data
      registrationSchema.parse({
        ...formData,
        document: document || undefined,
      })

      // Clear all errors if validation passes
      setErrors({})
      setIsLoading(true)

      // Create form data for server action
      const formDataToSubmit = new FormData()
      formDataToSubmit.append("program", formData.program)
      formDataToSubmit.append("message", formData.message)

      // Call server action to create enrollment
      // Note: In a real app, you would first create a user account or use the logged-in user's ID
      // For this example, we'll use a mock user ID
      const mockUserId = "clq1234567890" // This would be the actual user ID in a real app
      const result = await createEnrollment(formDataToSubmit, mockUserId)

      if (result.error) {
        toast({
          title: "Registration failed",
          description: result.error,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Show success toast
      toast({
        title: "Registration successful",
        description: "Your registration has been submitted successfully",
      })

      // Redirect to success page
      router.push("/register/success")
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
          title: "Registration failed",
          description: "An error occurred. Please try again.",
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-mint-50 via-blue-50 to-coral-50 p-4">
      <Link href="/" className="mx-auto mt-8 flex items-center gap-2 text-lg font-bold">
        <GraduationCap className="h-6 w-6 text-mint-500" />
        <span>EduBridge Manager</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-3xl py-12"
      >
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Student Registration</CardTitle>
            <CardDescription className="text-center">
              Register for one of our educational bridge programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Additional Information (Optional)</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us about your educational background or any specific requirements..."
                  value={formData.message}
                  onChange={handleChange}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
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

              <Button type="submit" className="w-full bg-mint-500 hover:bg-mint-600 text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Registration"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Already registered?{" "}
              <Link href="/login" className="text-mint-600 hover:underline">
                Log in to your account
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
