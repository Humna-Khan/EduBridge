"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { GraduationCap } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Automatically sign in and redirect
    const autoLogin = async () => {
      await signIn("credentials", {
        email: "admin@example.com",
        password: "password",
        redirect: false,
      })
      window.location.href = "/dashboard"
    }
    autoLogin()
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-mint-50 via-blue-50 to-coral-50 p-4">
      <div className="absolute left-8 top-8 flex items-center gap-2 text-lg font-bold">
        <GraduationCap className="h-6 w-6 text-mint-500" />
        <span>EduBridge Manager</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Logging in...</CardTitle>
            <CardDescription className="text-center">
              Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint-500 border-t-transparent"></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
