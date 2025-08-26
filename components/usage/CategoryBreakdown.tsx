"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BarChart3 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface CategoryBreakdownProps {
  data: Array<{ key: 'termine' | 'rezepte' | 'krankschreibungen' | 'other', minutes: number }>
  title: string
}

const categoryLabels: Record<string, string> = {
  termine: 'Termine',
  rezepte: 'Rezepte',
  krankschreibungen: 'Krankschreibungen',
  other: 'Sonstiges'
}

const categoryColors: Record<string, string> = {
  termine: '#2563EB',
  rezepte: '#059669',
  krankschreibungen: '#DC2626',
  other: '#7C3AED'
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const total = data.minutes
    const percentage = ((total / payload[0].payload.total) * 100).toFixed(1)
    
    return (
      <div className={cn(
        // Design System: tooltip styling
        "bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg border border-slate-700"
      )}>
        <p className="text-sm font-medium">{categoryLabels[label] || label}</p>
        <p className="text-sm">
          <span className="text-blue-300">Minuten:</span> {total}
        </p>
        <p className="text-sm">
          <span className="text-blue-300">Anteil:</span> {percentage}%
        </p>
      </div>
    )
  }
  return null
}

export function CategoryBreakdown({ data, title }: CategoryBreakdownProps) {
  // Calculate total for percentages
  const totalMinutes = data.reduce((sum, item) => sum + item.minutes, 0)
  
  // Transform data for chart
  const chartData = data.map(item => ({
    ...item,
    name: categoryLabels[item.key] || item.key,
    total: totalMinutes,
    fill: categoryColors[item.key] || '#64748B'
  })).sort((a, b) => b.minutes - a.minutes) // Sort by minutes descending

  return (
    <Card className={cn(
      // Design System: card gradient background
      "bg-gradient-to-b from-white to-slate-50",
      // Design System: border and shadow
      "border-slate-200 shadow-md rounded-2xl"
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 border border-blue-200">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600">
              {totalMinutes.toLocaleString('de-DE')} Minuten gesamt
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Chart */}
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              
              <XAxis 
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748B' }}
              />
              
              <YAxis 
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748B' }}
                width={100}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Bar 
                dataKey="minutes" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with percentages */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
          {chartData.map((item) => {
            const percentage = ((item.minutes / totalMinutes) * 100).toFixed(1)
            
            return (
              <div key={item.key} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: item.fill }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.minutes.toLocaleString('de-DE')} min ({percentage}%)
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-4 text-xs text-slate-500">
          <span className="sr-only">
            Balkendiagramm zeigt Verteilung der Minuten nach Kategorien. 
            {chartData.map(item => `${item.name}: ${item.minutes} Minuten`).join(', ')}.
          </span>
        </div>
      </CardContent>
    </Card>
  )
} 