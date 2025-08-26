"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowUpDown } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface DirectionSplitProps {
  data: {
    inbound: number
    outbound: number
  }
  title: string
}

const COLORS = {
  inbound: '#2563EB',  // Blue
  outbound: '#059669'  // Green
}

const LABELS = {
  inbound: 'Eingehend',
  outbound: 'Ausgehend'
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0]
    const percentage = ((data.value / (payload[0].payload.total)) * 100).toFixed(1)
    
    return (
      <div className={cn(
        // Design System: tooltip styling
        "bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg border border-slate-700"
      )}>
        <p className="text-sm font-medium">{LABELS[data.name as keyof typeof LABELS]}</p>
        <p className="text-sm">
          <span className="text-blue-300">Minuten:</span> {data.value.toLocaleString('de-DE')}
        </p>
        <p className="text-sm">
          <span className="text-blue-300">Anteil:</span> {percentage}%
        </p>
      </div>
    )
  }
  return null
}

function CustomLegend({ payload }: any) {
  return (
    <div className="flex justify-center gap-6 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-slate-600">
            {LABELS[entry.value as keyof typeof LABELS]}
          </span>
        </div>
      ))}
    </div>
  )
}

export function DirectionSplit({ data, title }: DirectionSplitProps) {
  const total = data.inbound + data.outbound
  
  // Transform data for chart
  const chartData = [
    {
      name: 'inbound',
      value: data.inbound,
      total: total
    },
    {
      name: 'outbound',
      value: data.outbound,
      total: total
    }
  ].filter(item => item.value > 0) // Only show non-zero values

  const inboundPercentage = total > 0 ? ((data.inbound / total) * 100).toFixed(1) : '0'
  const outboundPercentage = total > 0 ? ((data.outbound / total) * 100).toFixed(1) : '0'

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
            <ArrowUpDown className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600">
              {total.toLocaleString('de-DE')} Minuten gesamt
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {total > 0 ? (
          <>
            {/* Chart */}
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.name as keyof typeof COLORS]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.inbound }}
                  />
                  <span className="text-sm font-medium text-slate-900">
                    {LABELS.inbound}
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {data.inbound.toLocaleString('de-DE')}
                </div>
                <div className="text-sm text-slate-500">
                  {inboundPercentage}% der Gesamtzeit
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.outbound }}
                  />
                  <span className="text-sm font-medium text-slate-900">
                    {LABELS.outbound}
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {data.outbound.toLocaleString('de-DE')}
                </div>
                <div className="text-sm text-slate-500">
                  {outboundPercentage}% der Gesamtzeit
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-slate-500">
              <span className="sr-only">
                Kreisdiagramm zeigt Verteilung zwischen eingehenden ({data.inbound} Minuten, {inboundPercentage}%) 
                und ausgehenden ({data.outbound} Minuten, {outboundPercentage}%) Anrufen.
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="text-slate-400">
                <ArrowUpDown className="h-12 w-12 mx-auto mb-2" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Keine Daten</h3>
              <p className="text-slate-600">
                Für den ausgewählten Zeitraum liegen keine Anrufdaten vor.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 