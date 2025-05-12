"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { UserPlus, BookOpen, CheckCircle, XCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecentActivityMetrics } from "@/lib/actions/analytics-actions"

export function RecentActivity() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await getRecentActivityMetrics()
        if (result.data) {
          setMetrics(result.data)
        }
      } catch (err) {
        console.error("Failed to fetch recent activity metrics:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const activityItems = [
    {
      icon: UserPlus,
      color: "text-mint-500",
      bgColor: "bg-mint-100",
      title: "New Users",
      value: metrics?.newUsers || 0,
    },
    {
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      title: "New Enrollments",
      value: metrics?.newEnrollments || 0,
    },
    {
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-100",
      title: "Approved Enrollments",
      value: metrics?.approvedEnrollments || 0,
    },
    {
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-100",
      title: "Rejected Enrollments",
      value: metrics?.rejectedEnrollments || 0,
    },
  ]

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Activity in the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center"
            >
              <div className={`mr-4 flex h-10 w-10 items-center justify-center rounded-full ${item.bgColor}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.title}</p>
              </div>
              <div className="text-lg font-semibold">{loading ? "..." : item.value}</div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
