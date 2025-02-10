"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { motion } from "framer-motion"

interface AuditActionChartProps {
  data: {
    inserts: number
    updates: number
    deletes: number
  }
}

export function AuditActionChart({ data }: AuditActionChartProps) {
  const chartData = [
    {
      name: "Inserts",
      value: data.inserts,
      color: "#22c55e",
    },
    {
      name: "Updates",
      value: data.updates,
      color: "#6366f1",
    },
    {
      name: "Deletes",
      value: data.deletes,
      color: "#ec4899",
    },
  ]

  return (
    <Card className="col-span-4 w-full max-w-3xl mx-auto overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-pink-50 dark:from-green-950 dark:via-background dark:to-pink-950 opacity-40" />
      <CardHeader className="relative pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <div className="h-2 w-2 rounded-full animate-pulse bg-green-400" />
          Audit Actions Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.3} />
                  </linearGradient>
                ))}
              </defs>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 p-2 shadow-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
                          <p className="font-medium text-xs">
                            {payload[0].name}: <span className="text-muted-foreground">{payload[0].value}</span>
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
                startAngle={90}
                endAngle={450}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#pieGradient-${index})`}
                    className="drop-shadow-lg hover:opacity-95 transition-opacity"
                    strokeWidth={2}
                    stroke={entry.color}
                  >
                    <animate attributeName="opacity" values="0;1" dur="1s" begin={`${index * 200}ms`} />
                  </Cell>
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6">
          {chartData.map((entry, index) => (
            <motion.div
              key={`legend-${index}`}
              className="flex items-center gap-1.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs font-medium text-muted-foreground">{entry.name}</span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

