"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Clock, Phone, BarChart3, Moon } from "lucide-react"

interface KpiGroupProps {
  data: {
    minutesTotal: number
    callsTotal: number
    avgDurationSec: number
    afterHoursPct?: number
    projection?: { minutesTotal: number }
  }
  showProjection?: boolean
  showAfterHours?: boolean
}

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  badge?: string
}

function KpiCard({ title, value, subtitle, icon, badge }: KpiCardProps) {
  return (
    <Card className={cn(
      // Design System: card gradient background
      "bg-gradient-to-b from-white to-slate-50",
      // Design System: border and shadow
      "border-slate-200 shadow-md rounded-2xl"
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 border border-blue-200">
                {icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">{title}</p>
                {badge && (
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200 mt-1"
                  >
                    {badge}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              {subtitle && (
                <p className="text-sm text-slate-500">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to format duration
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Helper function to format large numbers with thin spaces
function formatNumber(num: number): string {
  return num.toLocaleString('de-DE').replace(/\./g, '\u2009') // thin space
}

export function KpiGroup({ data, showProjection = false, showAfterHours = false }: KpiGroupProps) {
  const kpis = [
    {
      title: "Gesamtminuten",
      value: formatNumber(data.minutesTotal),
      subtitle: showProjection && data.projection ? 
        `Hochrechnung: ${formatNumber(data.projection.minutesTotal)}` : 
        undefined,
      icon: <Clock className="h-5 w-5 text-blue-600" />,
      badge: showProjection && data.projection ? "Projected" : undefined
    },
    {
      title: "Gesamtanrufe",
      value: formatNumber(data.callsTotal),
      icon: <Phone className="h-5 w-5 text-blue-600" />
    },
    {
      title: "Ø Anrufdauer",
      value: formatDuration(data.avgDurationSec),
      icon: <BarChart3 className="h-5 w-5 text-blue-600" />
    }
  ]

  // Conditionally add after-hours KPI
  if (showAfterHours && data.afterHoursPct !== undefined) {
    kpis.push({
      title: "Nach Öffnungszeiten",
      value: `${data.afterHoursPct.toFixed(1)}%`,
      icon: <Moon className="h-5 w-5 text-blue-600" />
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <KpiCard
          key={index}
          title={kpi.title}
          value={kpi.value}
          subtitle={kpi.subtitle}
          icon={kpi.icon}
          badge={kpi.badge}
        />
      ))}
    </div>
  )
} 