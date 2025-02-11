"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LabelList,
  PieChart,
  Pie,
  Cell,
  type TooltipProps,
} from "recharts"

interface AuditActionChartProps {
  data: {
    inserts: number
    updates: number
    deletes: number
  }
}

type ChartData = {
  name: string
  value: number
  fill: string
  gradient: {
    startColor: string
    endColor: string
  }
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean
  payload?: Array<{
    value: number
    payload: ChartData
  }>
  label?: string
}


export function AuditActionChart({ data }: AuditActionChartProps) {
  const chartData: ChartData[] = [
    {
      name: "Inserts",
      value: data.inserts,
      fill: "#6366F1", // Indigo
      gradient: {
        startColor: "rgba(99, 102, 241, 0.85)",
        endColor: "rgba(99, 102, 241, 0.35)",
      },
    },
    {
      name: "Updates",
      value: data.updates,
      fill: "#A855F7", // Purple
      gradient: {
        startColor: "rgba(168, 85, 247, 0.85)",
        endColor: "rgba(168, 85, 247, 0.35)",
      },
    },
    {
      name: "Deletes",
      value: data.deletes,
      fill: "#EC4899", // Pink
      gradient: {
        startColor: "rgba(236, 72, 153, 0.85)",
        endColor: "rgba(236, 72, 153, 0.35)",
      },
    },
  ]

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border bg-background/95 p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.fill }} />
            <p className="font-medium text-sm">
              {label}: <span className="text-muted-foreground font-semibold">{payload[0].value}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
      <Card className="rounded-lg shadow-md bg-white p-4">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-center">Audit Actions Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }} barGap={4} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" horizontal vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickMargin={10}
                  fontSize={12}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickMargin={10}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.15 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1200} animationBegin={0}>
                  <LabelList dataKey="value" position="top" className="text-sm font-medium" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-md bg-white p-4">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-center">Audit Actions Pie Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
