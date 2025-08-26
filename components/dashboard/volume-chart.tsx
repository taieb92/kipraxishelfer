"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"
import { TrendingUp } from "lucide-react"

interface VolumeData {
  dateISO: string
  calls: number
}

interface VolumeChartProps {
  data: VolumeData[]
  className?: string
}

export function VolumeChart({ data, className }: VolumeChartProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  // Custom tooltip with high contrast
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
          <p className="text-slate-900 font-medium">
            {formatDate(label)}
          </p>
          <p className="text-blue-600 font-medium">
            {`${payload[0].value} Anrufe`}
          </p>
        </div>
      )
    }
    return null
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
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span>7-Day Call Volume</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              {/* Design System: grid lines #E2E8F0 */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e2e8f0" 
                strokeWidth={1}
              />
              
              <XAxis 
                dataKey="dateISO"
                tickFormatter={formatDate}
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fontSize: 12, 
                  fill: '#64748b' // Design System: muted text
                }}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fontSize: 12, 
                  fill: '#64748b' // Design System: muted text
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Design System: primary line #2563EB */}
              <Line 
                type="monotone" 
                dataKey="calls" 
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ 
                  fill: '#2563eb', 
                  strokeWidth: 2, 
                  r: 4 
                }}
                activeDot={{ 
                  r: 6, 
                  fill: '#2563eb',
                  stroke: '#ffffff',
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Screen reader accessible summary */}
        <div className="sr-only">
          Chart showing daily call volume over the last 7 days. 
          Total calls range from {Math.min(...data.map(d => d.calls))} to {Math.max(...data.map(d => d.calls))}.
        </div>
      </CardContent>
    </Card>
  )
} 