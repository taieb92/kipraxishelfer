"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { KpiGroup } from "@/components/usage/KpiGroup"
import { CycleSelector } from "@/components/usage/CycleSelector"
import { MinutesChart } from "@/components/usage/MinutesChart"
import { CategoryBreakdown } from "@/components/usage/CategoryBreakdown"
import { DirectionSplit } from "@/components/usage/DirectionSplit"
import { UsageTable } from "@/components/usage/UsageTable"
import { ExportButtons } from "@/components/usage/ExportButtons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"

// Feature flags
const FEATURE_FLAGS = {
  BILLING_ESTIMATE: false,
  BILLING_NUMBERS: false,
  AFTER_HOURS: true,
}

interface UsageData {
  cycle: {
    name: string
    startsISO: string
    endsISO: string
    timezone: string
  }
  totals: {
    minutesInbound: number
    minutesOutbound: number
    minutesTotal: number
    callsTotal: number
    avgDurationSec: number
    afterHoursPct?: number
    projection?: { minutesTotal: number }
  }
  charts: {
    dailyMinutes: Array<{ dateISO: string, minutesTotal: number }>
    directionSplit: { inbound: number, outbound: number }
    byCategory: Array<{ key: 'termine' | 'rezepte' | 'krankschreibungen' | 'other', minutes: number }>
  }
  table: Array<{
    dateISO: string
    calls: number
    minutesInbound: number
    minutesOutbound: number
    minutesTotal: number
    avgDurationSec: number
    afterHoursPct?: number
  }>
  billing?: {
    rounding: 'per_minute' | 'per_second'
    minChargeSec?: number
    planIncludedMinutes?: number
    overageMinutes?: number
  }
}

// Mock API function
const fetchUsageData = async (params: {
  from?: string
  to?: string
  cycle?: 'current' | 'last' | 'custom'
}): Promise<UsageData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  // Generate mock data based on cycle
  const mockData: UsageData = {
    cycle: {
      name: params.cycle === 'last' ? 'Jul 2025' : 'Aug 2025',
      startsISO: new Date(currentYear, currentMonth, 1).toISOString(),
      endsISO: new Date(currentYear, currentMonth + 1, 0).toISOString(),
      timezone: 'Europe/Berlin'
    },
    totals: {
      minutesInbound: 847,
      minutesOutbound: 203,
      minutesTotal: 1050,
      callsTotal: 234,
      avgDurationSec: 269, // ~4.5 min
      afterHoursPct: FEATURE_FLAGS.AFTER_HOURS ? 12.5 : undefined,
      projection: FEATURE_FLAGS.BILLING_ESTIMATE ? { minutesTotal: 1200 } : undefined
    },
    charts: {
      dailyMinutes: Array.from({ length: 30 }, (_, i) => ({
        dateISO: new Date(currentYear, currentMonth, i + 1).toISOString().split('T')[0],
        minutesTotal: Math.floor(Math.random() * 60) + 20
      })),
      directionSplit: { inbound: 847, outbound: 203 },
      byCategory: [
        { key: 'termine', minutes: 425 },
        { key: 'rezepte', minutes: 318 },
        { key: 'krankschreibungen', minutes: 187 },
        { key: 'other', minutes: 120 }
      ]
    },
    table: Array.from({ length: 30 }, (_, i) => ({
      dateISO: new Date(currentYear, currentMonth, i + 1).toISOString().split('T')[0],
      calls: Math.floor(Math.random() * 15) + 3,
      minutesInbound: Math.floor(Math.random() * 40) + 10,
      minutesOutbound: Math.floor(Math.random() * 15) + 2,
      minutesTotal: Math.floor(Math.random() * 50) + 15,
      avgDurationSec: Math.floor(Math.random() * 180) + 120,
      afterHoursPct: FEATURE_FLAGS.AFTER_HOURS ? Math.floor(Math.random() * 25) : undefined
    })),
    billing: {
      rounding: 'per_minute',
      minChargeSec: 60,
      planIncludedMinutes: FEATURE_FLAGS.BILLING_NUMBERS ? 1000 : undefined,
      overageMinutes: FEATURE_FLAGS.BILLING_NUMBERS ? 50 : undefined
    }
  }
  
  return mockData
}

export default function UsagePage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [data, setData] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Extract URL parameters
  const cycle = searchParams.get('cycle') || 'current'
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  // Load usage data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const params: any = { cycle }
        if (cycle === 'custom' && from && to) {
          params.from = from
          params.to = to
        }
        
        const result = await fetchUsageData(params)
        setData(result)
      } catch (err) {
        console.error('Error loading usage data:', err)
        setError('Daten konnten nicht geladen werden.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [cycle, from, to])

  const handleCycleChange = (newCycle: string, newFrom?: string, newTo?: string) => {
    const params = new URLSearchParams()
    params.set('cycle', newCycle)
    
    if (newCycle === 'custom' && newFrom && newTo) {
      params.set('from', newFrom)
      params.set('to', newTo)
    }
    
    router.push(`/usage?${params.toString()}`)
  }

  const handleRetry = () => {
    const params: any = { cycle }
    if (cycle === 'custom' && from && to) {
      params.from = from
      params.to = to
    }
    
    fetchUsageData(params).then(setData).catch(() => {
      setError('Daten konnten nicht geladen werden.')
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-32 bg-slate-200 animate-pulse rounded" />
            <div className="h-4 w-64 bg-slate-200 animate-pulse rounded mt-2" />
          </div>
          <div className="h-10 w-48 bg-slate-200 animate-pulse rounded" />
        </div>
        
        {/* KPI Row */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
        
        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 bg-slate-200 animate-pulse rounded-2xl" />
          <div className="h-80 bg-slate-200 animate-pulse rounded-2xl" />
        </div>
        
        {/* Table */}
        <div className="h-96 bg-slate-200 animate-pulse rounded-2xl" />
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Usage</h1>
            <p className="text-slate-600">Verbrauch und Abrechnungsdaten</p>
          </div>
          <CycleSelector
            currentCycle={cycle}
            from={from}
            to={to}
            onChange={handleCycleChange}
          />
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error || 'Ein unbekannter Fehler ist aufgetreten.'}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Wiederholen
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Empty state
  if (data.totals.callsTotal === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Usage</h1>
            <p className="text-slate-600">Verbrauch und Abrechnungsdaten</p>
          </div>
          <CycleSelector
            currentCycle={cycle}
            from={from}
            to={to}
            onChange={handleCycleChange}
          />
        </div>
        
        <Card className={cn(
          "bg-gradient-to-b from-white to-slate-50",
          "border-slate-200 shadow-md rounded-2xl"
        )}>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">Keine Daten im Zeitraum</h3>
              <p className="text-slate-600">
                Für den ausgewählten Zeitraum liegen keine Verbrauchsdaten vor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Usage</h1>
          <p className="text-slate-600">
            Verbrauch und Abrechnungsdaten für {data.cycle.name}
          </p>
        </div>
        <CycleSelector
          currentCycle={cycle}
          from={from}
          to={to}
          onChange={handleCycleChange}
        />
      </div>

      {/* KPI Row */}
      <KpiGroup 
        data={data.totals}
        showProjection={FEATURE_FLAGS.BILLING_ESTIMATE}
        showAfterHours={FEATURE_FLAGS.AFTER_HOURS}
      />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MinutesChart 
          data={data.charts.dailyMinutes}
          title="Abrechenbare Minuten pro Tag"
          cycleName={data.cycle.name}
        />
        <DirectionSplit 
          data={data.charts.directionSplit}
          title="Eingehend vs. Ausgehend"
        />
      </div>

      {/* Breakdown Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryBreakdown 
          data={data.charts.byCategory}
          title="Verteilung nach Kategorien"
        />
        
        {/* Billing info card */}
        <Card className={cn(
          "bg-gradient-to-b from-white to-slate-50",
          "border-slate-200 shadow-md rounded-2xl"
        )}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Abrechnungshinweis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Berechnung kann auf 60-Sekunden-Takt basieren.
            </p>
            {data.billing && (
              <div className="mt-3 space-y-1 text-xs text-slate-500">
                <div>Rundung: {data.billing.rounding === 'per_minute' ? 'Pro Minute' : 'Pro Sekunde'}</div>
                {data.billing.minChargeSec && (
                  <div>Mindestabrechnung: {data.billing.minChargeSec}s</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Table */}
      <UsageTable 
        data={data.table}
        totals={data.totals}
        showAfterHours={FEATURE_FLAGS.AFTER_HOURS}
      />

      {/* Export Buttons */}
      <ExportButtons 
        cycle={data.cycle}
        from={from}
        to={to}
        showBillingPortal={!!process.env.NEXT_PUBLIC_BILLING_PORTAL_URL}
      />
    </div>
  )
} 