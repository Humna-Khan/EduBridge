"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  GraduationCap,
  Home,
  LogOut,
  Settings,
  Users,
  BarChart,
  Calendar,
  FileText,
  MessageSquare,
  Bot,
} from "lucide-react"

export function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/")
  }

  return (
    <div className="flex h-full flex-col border-r">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-5 w-5 text-mint-500" />
          <span>EduBridge Manager</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-mint-900 ${
              isActive("/dashboard") &&
              !isActive("/dashboard/students") &&
              !isActive("/dashboard/programs") &&
              !isActive("/dashboard/analytics")
                ? "bg-mint-100 text-mint-900"
                : "text-muted-foreground hover:bg-mint-50"
            }`}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/students"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-mint-900 ${
              isActive("/dashboard/students") ? "bg-mint-100 text-mint-900" : "text-muted-foreground hover:bg-mint-50"
            }`}
          >
            <Users className="h-4 w-4" />
            Students
          </Link>
          <Link
            href="/dashboard/programs"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-mint-900 ${
              isActive("/dashboard/programs") ? "bg-mint-100 text-mint-900" : "text-muted-foreground hover:bg-mint-50"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Programs
          </Link>
          <Link
            href="/dashboard/attendance"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-mint-900 ${
              isActive("/dashboard/attendance") ? "bg-mint-100 text-mint-900" : "text-muted-foreground hover:bg-mint-50"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Attendance
          </Link>
          <Link
            href="/dashboard/assignments"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-mint-900 ${
              isActive("/dashboard/assignments")
                ? "bg-mint-100 text-mint-900"
                : "text-muted-foreground hover:bg-mint-50"
            }`}
          >
            <FileText className="h-4 w-4" />
            Assignments
          </Link>
          <Link
            href="/dashboard/messages"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-mint-900 ${
              isActive("/dashboard/messages") ? "bg-mint-100 text-mint-900" : "text-muted-foreground hover:bg-mint-50"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Messages
          </Link>
          <Link
            href="/dashboard/chat"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-mint-900 ${
              isActive("/dashboard/chat") ? "bg-mint-100 text-mint-900" : "text-muted-foreground hover:bg-mint-50"
            }`}
          >
            <Bot className="h-4 w-4" />
            AI Assistant
          </Link>
          <Link
            href="/dashboard/analytics"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-mint-900 ${
              isActive("/dashboard/analytics") ? "bg-mint-100 text-mint-900" : "text-muted-foreground hover:bg-mint-50"
            }`}
          >
            <BarChart className="h-4 w-4" />
            Analytics
          </Link>
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-mint-900 ${
              isActive("/dashboard/settings") ? "bg-mint-100 text-mint-900" : "text-muted-foreground hover:bg-mint-50"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <Link
          href="/logout"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-mint-50 hover:text-mint-900"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Link>
      </div>
    </div>
  )
}
