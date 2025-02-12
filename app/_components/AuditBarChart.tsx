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
      fill: "#6366F1",
      gradient: {
        startColor: "rgba(99, 102, 241, 1)",
        endColor: "rgba(99, 102, 241, 0.7)",
      },
    },
    {
      name: "Updates",
      value: data.updates,
      fill: "#A855F7",
      gradient: {
        startColor: "rgba(168, 85, 247, 1)",
        endColor: "rgba(168, 85, 247, 0.7)",
      },
    },
    {
      name: "Deletes",
      value: data.deletes,
      fill: "#EC4899",
      gradient: {
        startColor: "rgba(236, 72, 153, 1)",
        endColor: "rgba(236, 72, 153, 0.7)",
      },
    },
  ]

  const withdrawalData: ChartData[] = [
    {
      name: "High Value (>$1000)",
      value: 35,
      fill: "#6366F1",
      gradient: {
        startColor: "rgba(99, 102, 241, 1)",
        endColor: "rgba(99, 102, 241, 0.7)",
      },
    },
    {
      name: "Medium Value ($500-$1000)",
      value: 45,
      fill: "#A855F7",
      gradient: {
        startColor: "rgba(168, 85, 247, 1)",
        endColor: "rgba(168, 85, 247, 0.7)",
      },
    },
    {
      name: "Low Value (<$500)",
      value: 20,
      fill: "#EC4899",
      gradient: {
        startColor: "rgba(236, 72, 153, 1)",
        endColor: "rgba(236, 72, 153, 0.7)",
      },
    },
  ]

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border bg-background/95 p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.fill }} />
            <p className="font-medium text-sm">
              {data.name}: <span className="text-muted-foreground font-semibold">{payload[0].value}%</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-5 w-full max-w-5xl mx-auto">
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
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                  ))}
                </Bar>
                <defs>
                  {chartData.map((entry, index) => (
                    <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={entry.gradient.startColor} />
                      <stop offset="100%" stopColor={entry.gradient.endColor} />
                    </linearGradient>
                  ))}
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-md bg-white p-4">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-center">Withdrawal Distribution by Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={withdrawalData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ value }) => `${value}%`}
                  labelLine={false}
                >
                  {withdrawalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#pieGradient-${index})`} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  content={({ payload }) => (
                    <div className="flex justify-center gap-4 text-sm">
                      {payload?.map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full" style={{ background: withdrawalData[index].fill }} />
                          <span className="text-muted-foreground">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                />
                <defs>
                  {withdrawalData.map((entry, index) => (
                    <linearGradient
                      key={`pieGradient-${index}`}
                      id={`pieGradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={entry.gradient.startColor} />
                      <stop offset="100%" stopColor={entry.gradient.endColor} />
                    </linearGradient>
                  ))}
                </defs>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

