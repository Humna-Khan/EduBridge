"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle, GraduationCap, Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegistrationSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-mint-50 via-blue-50 to-coral-50 p-4">
      <Link href="/" className="absolute left-8 top-8 flex items-center gap-2 text-lg font-bold">
        <GraduationCap className="h-6 w-6 text-mint-500" />
        <span>EduBridge Manager</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Registration Successful!</CardTitle>
            <CardDescription className="text-center">Your registration has been submitted successfully</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              Thank you for registering for one of our educational bridge programs. We have sent a confirmation email
              with further details.
            </p>
            <p className="text-sm text-muted-foreground">
              A member of our team will review your application and contact you within 2-3 business days.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Link href="/" className="w-full">
              <Button className="w-full bg-mint-500 hover:bg-mint-600 text-white">
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </Link>
            <div className="text-center text-sm">
              Have questions?{" "}
              <Link href="/contact" className="text-mint-600 hover:underline">
                Contact us
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
