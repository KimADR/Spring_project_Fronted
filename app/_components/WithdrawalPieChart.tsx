"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = {
  today: "hsl(var(--primary))",
  thisWeek: "hsl(var(--secondary))",
  thisMonth: "hsl(var(--accent))",
  older: "hsl(var(--muted))",
}

interface WithdrawalData {
  today: number
  thisWeek: number
  thisMonth: number
  older: number
}

interface WithdrawalPieChartProps {
  data: WithdrawalData
}

export function WithdrawalPieChart({ data }: WithdrawalPieChartProps) {
  const chartData = [
    { name: "Today", value: data.today },
    { name: "This Week", value: data.thisWeek },
    { name: "This Month", value: data.thisMonth },
    { name: "Older", value: data.older },
  ]

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={({ name, value }) => `${name}: ${((value / total) * 100).toFixed(1)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} withdrawals`, ""]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

