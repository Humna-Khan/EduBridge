import Link from "next/link"
import { GraduationCap } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-mint-50 via-blue-50 to-coral-50 p-4">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <GraduationCap className="h-12 w-12 text-mint-500" />
        </div>
        <h1 className="mb-2 text-4xl font-bold">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mb-8 text-muted-foreground">The page you are looking for doesn't exist or has been moved.</p>
        <Link href="/">
          <Button className="bg-mint-500 hover:bg-mint-600 text-white">Return to Home</Button>
        </Link>
      </div>
    </div>
  )
}
