"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CallsTable } from "@/components/calls/calls-table"
import { CallsFilters, type CallFilters } from "@/components/calls/calls-filters"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { CallItem, CallStatus, CallCategory } from "@/lib/types"
import { AlertCircle, RefreshCw, Phone } from "lucide-react"

// Mock API response interface matching the specification
interface ApiResponse {
  items: Array<{
    id: string
    callerName?: string
    callerNumber?: string
    direction: 'inbound' | 'outbound'
    dateISO: string
    category: 'appointment' | 'receipt' | 'sick_note' | 'info' | 'other' | 'unknown'
    status: 'booking_made' | 'action_needed' | 'completed' | 'failed'
    durationSec: number
    tags: string[]
  }>
  total: number
}

// Convert API response to CallItem format
function convertApiCall(apiCall: ApiResponse['items'][0]): CallItem {
  return {
    id: apiCall.id,
    practiceId: "practice-1",
    startedAt: apiCall.dateISO,
    durationSec: apiCall.durationSec,
    direction: apiCall.direction,
    fromNumber: apiCall.callerNumber || "+49 30 12345678",
    callerName: apiCall.callerName,
    language: "de",
    category: apiCall.category,
    status: apiCall.status,
    tags: apiCall.tags,
    summary: `Call summary for ${apiCall.callerName || 'unknown caller'}`,
    recordingUrl: `/audio/call-${apiCall.id}.mp3`,
    transcriptUrl: `/transcripts/call-${apiCall.id}.txt`,
    redactionApplied: true,
    appointment: apiCall.category === 'appointment' ? {
      source: "doctolib" as const,
      doctolibId: `apt-${apiCall.id}`,
      doctolibLink: `https://doctolib.de/appointment/${apiCall.id}`,
    } : null,
  }
}

// Enhanced mock data with more variety
const mockApiCalls: ApiResponse['items'] = [
  {
    id: "1",
    callerName: "Maria Schmidt",
    callerNumber: "+49 30 12345678",
    direction: "inbound",
    dateISO: "2024-01-15T09:30:00Z",
    category: "appointment",
    status: "action_needed",
    durationSec: 180,
    tags: ["Termin", "Hausarzt", "Dringend"]
  },
  {
    id: "2",
    callerName: "Hans Müller",
    callerNumber: "+49 30 87654321", 
    direction: "inbound",
    dateISO: "2024-01-15T10:15:00Z",
    category: "receipt",
    status: "action_needed",
    durationSec: 95,
    tags: ["Rezept", "Blutdruck"]
  },
  {
    id: "3",
    callerName: "Anna Weber",
    callerNumber: "+49 30 11223344",
    direction: "outbound",
    dateISO: "2024-01-15T14:22:00Z",
    category: "appointment",
    status: "completed",
    durationSec: 45,
    tags: ["Umplanung", "Feiertag"]
  },
  {
    id: "4",
    callerName: "Dr. Thomas Fischer",
    callerNumber: "+49 30 55566677",
    direction: "inbound",
    dateISO: "2024-01-15T11:45:00Z",
    category: "sick_note",
    status: "action_needed",
    durationSec: 120,
    tags: ["Krankschreibung", "Rücken"]
  },
  {
    id: "5",
    callerName: "Lisa Klein",
    callerNumber: "+49 30 99887766",
    direction: "inbound",
    dateISO: "2024-01-15T13:20:00Z",
    category: "info",
    status: "completed",
    durationSec: 75,
    tags: ["Information", "Öffnungszeiten"]
  },
  {
    id: "6",
    callerName: "Peter Schulz",
    callerNumber: "+49 30 33445566",
    direction: "inbound",
    dateISO: "2024-01-15T15:10:00Z",
    category: "other",
    status: "failed",
    durationSec: 30,
    tags: ["Falsch verbunden"]
  }
]

// Mock API function
const fetchCalls = async (filters: CallFilters): Promise<ApiResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  let filteredCalls = [...mockApiCalls]
  
  // Apply filters
  if (filters.status && filters.status !== 'all') {
    filteredCalls = filteredCalls.filter(call => call.status === filters.status)
  }
  
  if (filters.categories && filters.categories.length > 0) {
    filteredCalls = filteredCalls.filter(call => filters.categories!.includes(call.category))
  }
  
  if (filters.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase()
    filteredCalls = filteredCalls.filter(call => 
      call.callerName?.toLowerCase().includes(searchLower) ||
      call.callerNumber?.includes(searchLower) ||
      call.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }
  
  // Apply date range filter
  if (filters.dateRange) {
    filteredCalls = filteredCalls.filter(call => {
      const callDate = new Date(call.dateISO)
      return callDate >= filters.dateRange!.from && callDate <= filters.dateRange!.to
    })
  }
  
  // Sort by latest first (as specified)
  filteredCalls.sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
  
  return {
    items: filteredCalls,
    total: filteredCalls.length
  }
}

export default function CallsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State
  const [calls, setCalls] = useState<CallItem[]>([])
  const [totalCalls, setTotalCalls] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize filters from URL
  const initialFilters: CallFilters = useMemo(() => ({
    status: (searchParams.get('status') as CallStatus) || 'action_needed',
    categories: searchParams.get('cats')?.split(',').filter(Boolean) as CallCategory[] || [],
    searchQuery: searchParams.get('q') || '',
    dateRange: (() => {
      const from = searchParams.get('from')
      const to = searchParams.get('to')
      if (from && to) {
        return {
          from: new Date(from),
          to: new Date(to)
        }
      }
      return undefined
    })()
  }), [searchParams])

  // Load calls when filters change
  useEffect(() => {
    const loadCalls = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetchCalls(initialFilters)
        setCalls(response.items.map(convertApiCall))
        setTotalCalls(response.total)
      } catch (err) {
        console.error('Error loading calls:', err)
        setError('Anrufe konnten nicht geladen werden.')
      } finally {
        setLoading(false)
      }
    }

    loadCalls()
  }, [initialFilters])

  // Update URL when filters change
  const handleFiltersChange = useCallback((newFilters: CallFilters) => {
    const params = new URLSearchParams()
    
    if (newFilters.status && newFilters.status !== 'all') {
      params.set('status', newFilters.status)
    }
    
    if (newFilters.searchQuery) {
      params.set('q', newFilters.searchQuery)
    }
    
    if (newFilters.categories && newFilters.categories.length > 0) {
      params.set('cats', newFilters.categories.join(','))
    }
    
    if (newFilters.dateRange) {
      params.set('from', newFilters.dateRange.from.toISOString().split('T')[0])
      params.set('to', newFilters.dateRange.to.toISOString().split('T')[0])
    }
    
    router.push(`/calls?${params.toString()}`)
  }, [router])

  // Handle retry
  const handleRetry = () => {
    const loadCalls = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetchCalls(initialFilters)
        setCalls(response.items.map(convertApiCall))
        setTotalCalls(response.total)
      } catch (err) {
        setError('Anrufe konnten nicht geladen werden.')
      } finally {
        setLoading(false)
      }
    }

    loadCalls()
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Anrufe</h1>
            <p className="text-slate-600 mt-1">
              Verwalten Sie alle eingehenden und ausgehenden Anrufe
            </p>
          </div>
          
          {/* Action buttons - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Aktualisieren
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <CallsFilters 
        onFiltersChange={handleFiltersChange}
      />

      {/* Content */}
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Wiederholen
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <CallsTable 
          calls={calls} 
          loading={loading}
          className="min-h-[400px]"
        />
      )}

      {/* Empty state when no calls */}
      {!loading && !error && calls.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Phone className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Keine Anrufe gefunden
          </h3>
          <p className="text-slate-600 max-w-sm mx-auto">
            Es wurden keine Anrufe mit den aktuellen Filtereinstellungen gefunden.
            Versuchen Sie andere Filtereinstellungen oder entfernen Sie einige Filter.
          </p>
        </div>
      )}
    </div>
  )
}
