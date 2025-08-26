"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, Clock, Phone, BarChart3 } from "lucide-react"

interface KpiGroupProps {
  data: {
    minutesTotal: number
    callsTotal: number
    avgDurationSec: number
    afterHoursPct?: number
    projection?: { minutesTotal: number }
  }
  className?: string
}

export function KpiGroup({ data, className }: KpiGroupProps) {
  const growthRate = data.projection 
    ? ((data.projection.minutesTotal - data.minutesTotal) / data.minutesTotal) * 100
    : 0

  const kpis = [
    {
      title: "Minuten gesamt",
      value: data.minutesTotal,
      unit: "min",
      icon: Clock,
      change: growthRate,
      changeType: growthRate > 0 ? "positive" : growthRate < 0 ? "negative" : "neutral",
      description: "Gesamte verbrauchte Minuten",
      className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
    },
    {
      title: "Anrufe gesamt",
      value: data.callsTotal,
      unit: "",
      icon: Phone,
      change: 0,
      changeType: "neutral" as const,
      description: "Gesamte Anzahl Anrufe",
      className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
    },
    {
      title: "Ø Dauer",
      value: Math.round(data.avgDurationSec / 60 * 10) / 10,
      unit: "min",
      change: 0,
      changeType: "neutral" as const,
      description: "Durchschnittliche Anrufdauer",
      className: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
    },
    {
      title: "Nach Öffnungszeiten",
      value: data.afterHoursPct || 0,
      unit: "%",
      change: 0,
      changeType: "neutral" as const,
      description: "Anteil nach Öffnungszeiten",
      className: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
    }
  ]

  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {/* KPI Cards Grid - Responsive */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Card 
            key={index}
            className={cn(
              "bg-gradient-to-b from-white to-slate-50",
              "border-slate-200 shadow-md rounded-2xl",
              "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
              kpi.className
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  "bg-white/80 border border-white/60"
                )}>
                  <kpi.icon className="h-5 w-5 text-slate-600" />
                </div>
                
                {/* Change indicator */}
                {kpi.change !== 0 && (
                  <div className="flex items-center gap-1">
                    {kpi.changeType === "positive" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : kpi.changeType === "negative" ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <Minus className="h-4 w-4 text-slate-400" />
                    )}
                    <span className={cn(
                      "text-xs font-medium",
                      kpi.changeType === "positive" ? "text-green-600" : 
                      kpi.changeType === "negative" ? "text-red-600" : 
                      "text-slate-500"
                    )}>
                      {kpi.change > 0 ? "+" : ""}{kpi.change.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700">
                  {kpi.title}
                </p>
                <p className="text-xs text-slate-500">
                  {kpi.description}
                </p>
              </div>
              
              <div className="flex items-baseline space-x-1">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {kpi.value.toLocaleString('de-DE')}
                </p>
                {kpi.unit && (
                  <span className="text-sm text-slate-600 font-medium">
                    {kpi.unit}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projection Card - Full width on mobile, half on larger screens */}
      {data.projection && (
        <Card className={cn(
          "bg-gradient-to-b from-white to-slate-50",
          "border-slate-200 shadow-md rounded-2xl",
          "max-w-full sm:max-w-md"
        )}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-slate-900">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="text-base sm:text-lg">Prognose</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Aktueller Monat:</span>
                <span className="font-medium text-slate-900">
                  {data.minutesTotal.toLocaleString('de-DE')} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Prognose:</span>
                <span className="font-medium text-slate-900">
                  {data.projection.minutesTotal.toLocaleString('de-DE')} min
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Wachstum:</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      growthRate > 0 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : growthRate < 0 
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    )}
                  >
                    {growthRate > 0 ? "+" : ""}{growthRate.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 