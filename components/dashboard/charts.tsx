"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

import { cn } from "@/lib/utils"
import type { CallCategory } from "@/lib/types"
import { Activity, BarChart3, TrendingUp } from "lucide-react"

interface CategoryData {
  category: CallCategory
  count: number
  percentage: number
  color: string
  trend?: number
}

interface DailyVolumeData {
  date: string
  calls: number
  minutes: number
  peak?: boolean
}

const mockCategoryData: CategoryData[] = [
  { 
    category: "appointment", 
    count: 120, 
    percentage: 75, 
    color: "bg-blue-500",
    trend: 12
  },
  { 
    category: "receipt", 
    count: 25, 
    percentage: 15, 
    color: "bg-green-500",
    trend: -3
  },
  { 
    category: "sick_note", 
    count: 8, 
    percentage: 5, 
    color: "bg-yellow-500",
    trend: 5
  },
  { 
    category: "info", 
    count: 5, 
    percentage: 3, 
    color: "bg-purple-500",
    trend: 2
  },
  { 
    category: "other", 
    count: 2, 
    percentage: 2, 
    color: "bg-gray-500",
    trend: 0
  },
]

const mockDailyData: DailyVolumeData[] = [
  { date: "Mo", calls: 12, minutes: 180 },
  { date: "Di", calls: 19, minutes: 285, peak: true },
  { date: "Mi", calls: 15, minutes: 225 },
  { date: "Do", calls: 22, minutes: 330, peak: true },
  { date: "Fr", calls: 18, minutes: 270 },
  { date: "Sa", calls: 8, minutes: 120 },
  { date: "So", calls: 5, minutes: 75 },
]

export function CategoryBreakdownChart() {
  const totalCalls = mockCategoryData.reduce((sum, item) => sum + item.count, 0)
  
  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      appointment: "Termine",
      receipt: "Rezepte", 
      sick_note: "Krankschreibungen",
      info: "Informationen"
    }
    return names[category] || category
  }

  return (
    <Card className="card-elevated card-hover">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Anruf-Kategorien</h3>
              <p className="text-sm text-muted-foreground">Verteilung der letzten 30 Tage</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {totalCalls} Gesamt
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {mockCategoryData.map((item, index) => (
            <div 
              key={item.category} 
              className="group space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("h-3 w-3 rounded-full", item.color)} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {getCategoryName(item.category)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.count} Anrufe
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.trend !== undefined && (
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      item.trend > 0 ? "text-green-600" : item.trend < 0 ? "text-red-600" : "text-muted-foreground"
                    )}>
                      {item.trend > 0 && <TrendingUp className="h-3 w-3" />}
                      {item.trend > 0 ? "+" : ""}{item.trend}%
                    </div>
                  )}
                  <div className="text-right min-w-[3rem]">
                    <div className="text-sm font-medium">{item.percentage}%</div>
                  </div>
                </div>
              </div>
              <Progress 
                value={item.percentage} 
                className="h-2 bg-muted group-hover:bg-muted/70 transition-colors"
              />
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalCalls}</div>
              <div className="text-muted-foreground">Gesamt Anrufe</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">87%</div>
              <div className="text-muted-foreground">Erfolgsrate</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DailyVolumeChart() {
  const maxCalls = Math.max(...mockDailyData.map((d) => d.calls))
  const totalCalls = mockDailyData.reduce((sum, d) => sum + d.calls, 0)
  const totalMinutes = mockDailyData.reduce((sum, d) => sum + d.minutes, 0)
  const avgCallDuration = Math.round(totalMinutes / totalCalls)

  return (
    <Card className="card-elevated card-hover">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Tägliche Aktivität</h3>
              <p className="text-sm text-muted-foreground">Anrufvolumen der letzten 7 Tage</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            7 Tage
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart Area */}
        <div className="relative">
          <div className="flex items-end justify-between gap-3 h-40 px-2">
            {mockDailyData.map((day, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center gap-2 flex-1 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative flex-1 flex items-end w-full">
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all duration-500 ease-out relative",
                      "bg-gradient-to-t from-primary to-primary/80",
                      "hover:from-primary/90 hover:to-primary/60",
                      "group-hover:shadow-lg",
                      day.peak && "ring-2 ring-primary/50"
                    )}
                    style={{ 
                      height: `${(day.calls / maxCalls) * 100}%`,
                      minHeight: '8px'
                    }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <div className="bg-popover text-popover-foreground text-xs rounded-lg px-2 py-1 shadow-lg border">
                        <div className="font-medium">{day.calls} Anrufe</div>
                        <div className="text-muted-foreground">{day.minutes} Min</div>
                      </div>
                    </div>
                    
                    {day.peak && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs font-medium text-muted-foreground mt-2">
                  {day.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{totalCalls}</div>
            <div className="text-xs text-muted-foreground">Gesamt Anrufe</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalMinutes}</div>
            <div className="text-xs text-muted-foreground">Gesamt Minuten</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{avgCallDuration}</div>
            <div className="text-xs text-muted-foreground">⌀ Min/Anruf</div>
          </div>
        </div>

        {/* Peak indicators */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span>Spitzenzeiten</span>
        </div>
      </CardContent>
    </Card>
  )
}
