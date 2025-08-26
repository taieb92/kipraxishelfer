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
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  
  return {
    kpis: {
      unresolved: 12,
      aiSuccessRatePct: 87,
      todaysCalls: 24,
      minutesUsed: {
        inbound: 156,
        outbound: 23,
        total: 179
      }
    },
    needsAttention: [
      {
        id: "1",
        caller: "Anna Schmidt",
        category: "Termin",
        timeISO: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "action_needed"
      },
      {
        id: "2", 
        caller: "Max Weber",
        category: "Rezept",
        timeISO: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: "action_needed"
      },
      {
        id: "3",
        caller: "Lisa Müller",
        category: "Krankschreibung", 
        timeISO: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: "action_needed"
      }
    ],
    trends: {
      dailyVolume: Array.from({ length: days }, (_, i) => ({
        dateISO: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString(),
        calls: Math.floor(Math.random() * 20) + 10
      })),
      byCategory: [
        { label: 'appointment', value: 45 },
        { label: 'receipt', value: 25 },
        { label: 'sick_note', value: 20 },
        { label: 'info', value: 8 },
        { label: 'other', value: 2 }
      ]
    },
    reschedulesPending: 3
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)

  // Get date range from URL or default to 7 days
  const dateRange = (searchParams.get('range') as DateRange) || '7d'

  // Fetch data when date range changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800))
        const mockData = getMockData(dateRange)
        setData(mockData)
      } catch (err) {
        setError('Fehler beim Laden der Dashboard-Daten')
        console.error('Dashboard data fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  // Update URL when date range changes
  const handleDateRangeChange = (newRange: DateRange) => {
    const params = new URLSearchParams(searchParams)
    params.set('range', newRange)
    router.push(`/dashboard?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
        </div>
        
        {/* KPI Cards Skeleton */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        
        {/* Content Skeleton */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="h-80 bg-slate-200 rounded-xl animate-pulse" />
          <div className="space-y-6">
            <div className="h-40 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-40 bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Fehler beim Laden
                </h3>
                <p className="text-slate-600 mt-1">
                  {error || 'Unbekannter Fehler'}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Erneut versuchen
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const needsAttentionData = data.needsAttention.slice(0, 5)

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Übersicht über Anrufe, Termine und Praxis-Performance
            </p>
          </div>
          
          <DateRangeFilter 
            value={dateRange} 
            onChange={(range) => handleDateRangeChange(range)}
            className="w-full sm:w-auto"
          />
        </div>
      </div>

      {/* KPI Cards - Responsive Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Unbeantwortet"
          value={data.kpis.unresolved.toString()}
          trend={{ deltaPct: 2, up: false }}
          icon={<AlertCircle />}
          href="/calls?status=action-needed"
          className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
        />
        
        <KpiCard
          title="KI-Erfolgsrate"
          value={`${data.kpis.aiSuccessRatePct}%`}
          trend={{ deltaPct: 5, up: true }}
          icon={<TrendingUp />}
          href="/calls?status=completed"
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        
        <KpiCard
          title="Heutige Anrufe"
          value={data.kpis.todaysCalls.toString()}
          trend={{ deltaPct: 3, up: true }}
          icon={<Phone />}
          href="/calls"
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        
        <KpiCard
          title="Minuten verbraucht"
          value={data.kpis.minutesUsed.total.toString()}
          trend={{ deltaPct: 8, up: true }}
          icon={<Clock />}
          href="/usage"
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        />
      </div>

      {/* Main Content Grid - Responsive Layout */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Needs Attention Panel - Full width on mobile, 1/3 on xl */}
        <div className="xl:col-span-1">
          <NeedsAttentionList 
            items={needsAttentionData.map(item => ({
              ...item,
              time: new Date(item.timeISO).toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit'
              })
            }))} 
          />
        </div>

        {/* Trends Section - Full width on mobile, 2/3 on xl */}
        <div className="xl:col-span-2 space-y-6">
          <VolumeChart data={data.trends.dailyVolume} />
          <CategoryChart data={data.trends.byCategory} />
        </div>
      </div>

      {/* Optional Holiday Reschedules Card - Responsive */}
      {data.reschedulesPending > 0 && (
        <Card className={cn(
          "bg-gradient-to-b from-white to-slate-50",
          "border-slate-200 shadow-md rounded-2xl",
          "max-w-full sm:max-w-md"
        )}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-slate-900">
              <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <span className="text-base sm:text-lg">Holiday reschedules pending</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4 text-sm sm:text-base">
              {data.reschedulesPending} appointments need to be rescheduled due to holidays.
            </p>
            <a
              href="/calls?kind=reschedule&status=action-needed"
              className={cn(
                "inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700",
                "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded",
                "transition-colors"
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
