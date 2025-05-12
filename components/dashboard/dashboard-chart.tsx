"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { name: "May 1", value: 12 },
  { name: "May 5", value: 18 },
  { name: "May 10", value: 24 },
  { name: "May 15", value: 30 },
  { name: "May 20", value: 22 },
  { name: "May 25", value: 28 },
  { name: "May 30", value: 36 },
]

export function DashboardChart() {
  return (
    <ChartContainer
      config={{
        value: {
          label: "Registrations",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="#888888" />
          <YAxis axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="#888888" />
          <Tooltip content={<ChartTooltipContent />} cursor={false} />
          <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
