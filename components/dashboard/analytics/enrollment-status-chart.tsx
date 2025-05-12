"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEnrollmentStatusDistribution } from "@/lib/actions/analytics-actions"

const COLORS = {
  PENDING: "hsl(var(--blue-500))",
  APPROVED: "hsl(var(--mint-500))",
  REJECTED: "hsl(var(--coral-500))",
  COMPLETED: "hsl(280, 100%, 60%)",
  WITHDRAWN: "hsl(var(--muted-foreground))",
}

export function EnrollmentStatusChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await getEnrollmentStatusDistribution()
        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          // Filter out statuses with 0 count
          setData(result.data.filter((item) => item.value > 0))
        }
      } catch (err) {
        setError("Failed to fetch enrollment status distribution")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Enrollment Status</CardTitle>
        <CardDescription>Distribution of enrollment statuses</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#8884d8"} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} enrollments`, "Enrollments"]}
                contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
