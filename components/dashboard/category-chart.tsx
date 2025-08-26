"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { cn } from "@/lib/utils"
import { BarChart3 } from "lucide-react"

interface CategoryData {
  label: 'appointment' | 'receipt' | 'sick_note' | 'info' | 'other'
  value: number
}

interface CategoryChartProps {
  data: CategoryData[]
  className?: string
}

// Design System colors for categories
const CATEGORY_COLORS = {
  appointment: '#2563eb', // Blue
  receipt: '#16a34a',     // Green  
  sick_note: '#ca8a04',   // Yellow
  info: '#7c3aed',        // Purple
  other: '#64748b'        // Gray
}

const CATEGORY_LABELS = {
  appointment: 'Termine',
  receipt: 'Rezepte', 
  sick_note: 'Krankschreibungen',
  info: 'Informationen',
  other: 'Sonstiges'
}

export function CategoryChart({ data, className }: CategoryChartProps) {
  // Format data for chart
  const chartData = data.map(item => ({
    name: CATEGORY_LABELS[item.label],
    value: item.value,
    color: CATEGORY_COLORS[item.label]
  }))

  // Custom tooltip with high contrast
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
          <p className="text-slate-900 font-medium">
            {data.name}
          </p>
          <p className="font-medium" style={{ color: data.color }}>
            {`${data.value} Anrufe`}
          </p>
        </div>
      )
    }
    return null
  }

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-slate-600">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className={cn(
      // Design System: card gradient background
      "bg-gradient-to-b from-white to-slate-50",
      // Design System: border and shadow
      "border-slate-200 shadow-md rounded-2xl",
      className
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-slate-900">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <span>Category Breakdown</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Screen reader accessible summary */}
        <div className="sr-only">
          Chart showing breakdown of calls by category. 
          {data.map(item => `${CATEGORY_LABELS[item.label]}: ${item.value} calls`).join(', ')}.
        </div>
      </CardContent>
    </Card>
  )
} 