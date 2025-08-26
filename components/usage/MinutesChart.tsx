"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface MinutesChartProps {
  data: Array<{ dateISO: string, minutesTotal: number }>
  title: string
  cycleName: string
}

interface ChartSkeletonProps {
  height?: number
}

function ChartSkeleton({ height = 300 }: ChartSkeletonProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 bg-slate-200 animate-pulse rounded" />
        <div className="h-4 w-16 bg-slate-200 animate-pulse rounded" />
      </div>
      <div className={`w-full bg-slate-200 animate-pulse rounded`} style={{ height }} />
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    // Safely handle date formatting
    let dateLabel = label
    try {
      // Try to parse as date if it's a valid date string
      const date = new Date(label)
      if (!isNaN(date.getTime())) {
        dateLabel = format(date, 'dd.MM.yyyy', { locale: de })
      }
    } catch (error) {
      // If parsing fails, use the label as-is
      console.warn('Date parsing failed for label:', label)
    }

    return (
      <div className={cn(
        // Design System: tooltip styling
        "bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg border border-slate-700"
      )}>
        <p className="text-sm font-medium">
          {dateLabel}
        </p>
        <p className="text-sm">
          <span className="text-blue-300">Minuten:</span> {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

export function MinutesChart({ data, title, cycleName }: MinutesChartProps) {
  // Calculate 7-day moving average for trend
  const dataWithTrend = data.map((item, index) => {
    const start = Math.max(0, index - 6)
    const slice = data.slice(start, index + 1)
    const average = slice.reduce((sum, d) => sum + d.minutesTotal, 0) / slice.length
    
    // Safely format date
    let formattedDate = item.dateISO
    try {
      const date = new Date(item.dateISO)
      if (!isNaN(date.getTime())) {
        formattedDate = format(date, 'dd.MM', { locale: de })
      }
    } catch (error) {
      console.warn('Date formatting failed for:', item.dateISO)
      // Fallback: try to extract day/month from ISO string
      if (typeof item.dateISO === 'string' && item.dateISO.includes('-')) {
        const parts = item.dateISO.split('-')
        if (parts.length >= 3) {
          formattedDate = `${parts[2]}.${parts[1]}`
        }
      }
    }
    
    return {
      ...item,
      trend: Math.round(average),
      date: formattedDate
    }
  })

  // Calculate total and growth
  const totalMinutes = data.reduce((sum, item) => sum + item.minutesTotal, 0)
  const firstWeek = data.slice(0, 7).reduce((sum, item) => sum + item.minutesTotal, 0)
  const lastWeek = data.slice(-7).reduce((sum, item) => sum + item.minutesTotal, 0)
  const growth = firstWeek > 0 ? ((lastWeek - firstWeek) / firstWeek) * 100 : 0

  return (
    <Card className={cn(
      // Design System: card gradient background
      "bg-gradient-to-b from-white to-slate-50",
      // Design System: border and shadow
      "border-slate-200 shadow-md rounded-2xl"
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 border border-blue-200">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-600">{cycleName}</p>
              </div>
            </CardTitle>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">
              {totalMinutes.toLocaleString('de-DE')}
            </div>
            <div className={cn(
              "text-sm flex items-center gap-1",
              growth >= 0 ? "text-green-600" : "text-red-600"
            )}>
              <TrendingUp className={cn(
                "h-3 w-3",
                growth < 0 && "rotate-180"
              )} />
              {Math.abs(growth).toFixed(1)}%
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataWithTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="minutesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748B' }}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748B' }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* 7-day trend line */}
              <Area
                type="monotone"
                dataKey="trend"
                stroke="#94A3B8"
                strokeWidth={1}
                strokeDasharray="5 5"
                fill="none"
                dot={false}
              />
              
              {/* Daily minutes area */}
              <Area
                type="monotone"
                dataKey="minutesTotal"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#minutesGradient)"
                dot={{ fill: '#2563EB', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#2563EB', strokeWidth: 2, fill: '#FFF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-xs text-slate-500">
          <span className="sr-only">
            Diagramm zeigt abrechenbare Minuten pro Tag für {cycleName}. 
            Gestrichelte Linie zeigt 7-Tage-Trend. 
            Wachstum von {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% gegenüber Vorwoche.
          </span>
          Gestrichelte Linie: 7-Tage-Trend
        </div>
      </CardContent>
    </Card>
  )
} 