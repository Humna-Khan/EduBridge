"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentRegistrationsTable } from "@/components/dashboard/recent-registrations-table"
import { ProgramsOverviewTable } from "@/components/dashboard/programs-overview-table"
import { DashboardMetrics } from "@/components/dashboard/analytics/dashboard-metrics"
import { EnrollmentTrendsChart } from "@/components/dashboard/analytics/enrollment-trends-chart"
import { UpcomingSessions } from "@/components/dashboard/analytics/upcoming-sessions"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your educational programs and student registrations</p>
        </div>
      </div>

      <DashboardMetrics />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registrations">Recent Registrations</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Registration Trends</CardTitle>
                <CardDescription>Student registrations over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <EnrollmentTrendsChart />
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>Sessions scheduled for the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingSessions />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>Recent Student Registrations</CardTitle>
              <CardDescription>Overview of the most recent student registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentRegistrationsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
          <Card>
            <CardHeader>
              <CardTitle>Programs Overview</CardTitle>
              <CardDescription>List of all active educational programs</CardDescription>
            </CardHeader>
            <CardContent>
              <ProgramsOverviewTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
