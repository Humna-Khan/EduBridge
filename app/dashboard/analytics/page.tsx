"use client"

import { motion } from "framer-motion"

import { DashboardMetrics } from "@/components/dashboard/analytics/dashboard-metrics"
import { EnrollmentTrendsChart } from "@/components/dashboard/analytics/enrollment-trends-chart"
import { ProgramPopularityChart } from "@/components/dashboard/analytics/program-popularity-chart"
import { EnrollmentStatusChart } from "@/components/dashboard/analytics/enrollment-status-chart"
import { CompletionRateChart } from "@/components/dashboard/analytics/completion-rate-chart"
import { UpcomingSessions } from "@/components/dashboard/analytics/upcoming-sessions"
import { RecentActivity } from "@/components/dashboard/analytics/recent-activity"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
            <p className="text-muted-foreground">Comprehensive analytics and insights for your educational programs</p>
          </div>
        </div>
      </motion.div>

      <DashboardMetrics />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <EnrollmentTrendsChart />
        <RecentActivity />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <CompletionRateChart />
        <UpcomingSessions />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
        <ProgramPopularityChart />
        <EnrollmentStatusChart />
      </div>
    </div>
  )
}
