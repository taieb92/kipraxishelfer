"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { NeedsAttentionList } from "@/components/dashboard/needs-attention-list"
import { VolumeChart } from "@/components/dashboard/volume-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { DateRangeFilter, type DateRange } from "@/components/dashboard/date-range-filter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, TrendingUp, Clock, Phone, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock API response types
interface DashboardData {
  kpis: {
    unresolved: number
    aiSuccessRatePct: number
    todaysCalls: number
    minutesUsed: {
      inbound: number
      outbound: number
      total: number
    }
  }
  needsAttention: Array<{
    id: string
    caller: string
    category: string
    timeISO: string
    status: 'action_needed' | 'booking_made' | 'completed' | 'failed'
  }>
  trends: {
    dailyVolume: Array<{
      dateISO: string
      calls: number
    }>
    byCategory: Array<{
      label: 'appointment' | 'receipt' | 'sick_note' | 'info' | 'other'
      value: number
    }>
  }
  reschedulesPending: number
}

// Mock data for demonstration
const getMockData = (range: DateRange): DashboardData => {
  const baseDate = new Date()
  
  return {
    kpis: {
      unresolved: 3,
      aiSuccessRatePct: 87,
      todaysCalls: 24,
      minutesUsed: {
        inbound: 847,
        outbound: 423,
        total: 1270
      }
    },
    needsAttention: [
      {
        id: "1",
        caller: "Maria Schmidt",
        category: "appointment",
        timeISO: "2024-01-15T10:30:00Z",
        status: "action_needed"
      },
      {
        id: "2", 
        caller: "+49 30 12345678",
        category: "receipt",
        timeISO: "2024-01-15T09:15:00Z",
        status: "action_needed"
      },
      {
        id: "3",
        caller: "Dr. Weber",
        category: "sick_note", 
        timeISO: "2024-01-15T08:45:00Z",
        status: "action_needed"
      }
    ],
    trends: {
      dailyVolume: Array.from({ length: 7 }, (_, i) => ({
        dateISO: new Date(baseDate.getTime() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
        calls: Math.floor(Math.random() * 30) + 15
      })),
      byCategory: [
        { label: 'appointment', value: 120 },
        { label: 'receipt', value: 45 },
        { label: 'sick_note', value: 23 },
        { label: 'info', value: 18 },
        { label: 'other', value: 12 }
      ]
    },
    reschedulesPending: 2
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // URL state management
  const [dateRange, setDateRange] = useState<DateRange>("7d")
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize from URL params
  useEffect(() => {
    const rangeParam = searchParams.get('range') as DateRange || "7d"
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')
    
    setDateRange(rangeParam)
    
    if (rangeParam === "custom" && fromParam && toParam) {
      setCustomRange({
        from: new Date(fromParam),
        to: new Date(toParam)
      })
    }
  }, [searchParams])

  // Update URL when range changes
  const updateURL = (range: DateRange, custom?: { from: Date; to: Date }) => {
    const params = new URLSearchParams()
    params.set('range', range)
    
    if (range === "custom" && custom) {
      params.set('from', custom.from.toISOString().split('T')[0])
      params.set('to', custom.to.toISOString().split('T')[0])
    }
    
    router.push(`/dashboard?${params.toString()}`, { scroll: false })
  }

  // Handle date range changes
  const handleDateRangeChange = (range: DateRange, custom?: { from: Date; to: Date }) => {
    setDateRange(range)
    setCustomRange(custom)
    updateURL(range, custom)
  }

  // Mock API call
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      setData(getMockData(dateRange))
      setLoading(false)
    }
    
    fetchData()
  }, [dateRange, customRange])

  // Format time for display
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Prepare needs attention data with formatted times
  const needsAttentionData = useMemo(() => {
    if (!data) return []
    
    return data.needsAttention.map(item => ({
      ...item,
      time: formatTime(item.timeISO)
    }))
  }, [data])

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Überblick über Ihre KI-Sprachassistent Aktivitäten</p>
          </div>
        </div>
        
        {/* Loading skeletons */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Überblick über Ihre KI-Sprachassistent Aktivitäten</p>
        </div>
        
        <DateRangeFilter
          value={dateRange}
          customRange={customRange}
          onChange={handleDateRangeChange}
        />
      </div>

      {/* KPI Row - Max 4 cards as per spec */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* KPI #1: Unresolved Tasks - PRIMARY emphasis, clickable */}
        <KpiCard
          title="Unresolved Tasks"
          value={data.kpis.unresolved}
          icon={<AlertCircle />}
          href={`/calls?status=action-needed&range=${dateRange}`}
          ariaLabel="View unresolved tasks that need attention"
          className={cn(
            // Primary emphasis with gradient accent as per design system
            "ring-2 ring-red-100 bg-gradient-to-br from-red-50 to-white"
          )}
        />

        {/* KPI #2: AI Success Rate */}
        <KpiCard
          title="AI Success Rate"
          value={`${data.kpis.aiSuccessRatePct}%`}
          icon={<TrendingUp />}
          trend={{ deltaPct: 2.1, up: true }}
        />

        {/* KPI #3: Today's Calls */}
        <KpiCard
          title="Today's Calls"
          value={data.kpis.todaysCalls}
          icon={<Phone />}
          trend={{ deltaPct: 12, up: true }}
        />

        {/* KPI #4: Minutes Used (NO pricing as per spec) */}
        <KpiCard
          title="Minutes Used"
          value={data.kpis.minutesUsed.total}
          icon={<Clock />}
          trend={{ deltaPct: 8.3, up: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Needs Attention Panel - Half width on desktop */}
        <NeedsAttentionList items={needsAttentionData} />

        {/* Trends Section - Adjacent on desktop, stacked on mobile */}
        <div className="space-y-6">
          <VolumeChart data={data.trends.dailyVolume} />
          <CategoryChart data={data.trends.byCategory} />
        </div>
      </div>

      {/* Optional Holiday Reschedules Card */}
      {data.reschedulesPending > 0 && (
        <Card className={cn(
          "bg-gradient-to-b from-white to-slate-50",
          "border-slate-200 shadow-md rounded-2xl",
          "max-w-md"
        )}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-slate-900">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Holiday reschedules pending</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              {data.reschedulesPending} appointments need to be rescheduled due to holidays.
            </p>
            <a
              href="/calls?kind=reschedule&status=action-needed"
              className={cn(
                "inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700",
                "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded"
              )}
            >
              Review reschedules →
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
