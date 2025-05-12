"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Users, Clock, CheckCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardSummaryMetrics } from "@/lib/actions/analytics-actions"

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await getDashboardSummaryMetrics()
        if (result.data) {
          setMetrics(result.data)
        }
      } catch (err) {
        console.error("Failed to fetch dashboard metrics:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const metricCards = [
    {
      title: "Total Students",
      value: metrics?.totalStudents || 0,
      icon: Users,
      color: "text-mint-500",
      bgColor: "bg-mint-100",
      delay: 0,
    },
    {
      title: "Active Programs",
      value: metrics?.activePrograms || 0,
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      delay: 0.1,
    },
    {
      title: "Completion Rate",
      value: `${metrics?.completionRate || 0}%`,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-100",
      delay: 0.2,
    },
    {
      title: "Pending Enrollments",
      value: metrics?.pendingEnrollments || 0,
      icon: Clock,
      color: "text-coral-500",
      bgColor: "bg-coral-100",
      delay: 0.3,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: card.delay }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`${card.bgColor} rounded-full p-2`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : card.value}</div>
              {card.title === "Total Students" && (
                <p className="text-xs text-muted-foreground">{metrics?.totalEnrollments || 0} total enrollments</p>
              )}
              {card.title === "Active Programs" && (
                <p className="text-xs text-muted-foreground">{metrics?.totalPrograms || 0} total programs</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
