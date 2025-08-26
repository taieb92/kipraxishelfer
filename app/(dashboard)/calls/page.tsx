"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CallsTable } from "@/components/calls/calls-table"
import { CallsFilters, type CallFilters } from "@/components/calls/calls-filters"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { CallItem, CallStatus, CallCategory } from "@/lib/types"
import { AlertCircle, RefreshCw } from "lucide-react"

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
    callerNumber: "+49 30 99887766",
    direction: "inbound",
    dateISO: "2024-01-15T08:20:00Z",
    category: "info",
    status: "completed",
    durationSec: 60,
    tags: ["Öffnungszeiten", "Frage"]
  },
  {
    id: "6",
    callerName: "Petra Hoffmann",
    callerNumber: "+49 30 44433322",
    direction: "inbound",
    dateISO: "2024-01-15T16:10:00Z",
    category: "appointment",
    status: "booking_made",
    durationSec: 200,
    tags: ["Vorsorge", "Termin"]
  },
  {
    id: "7",
    callerName: "Klaus Bauer",
    callerNumber: "+49 30 77788899",
    direction: "inbound",
    dateISO: "2024-01-15T13:30:00Z",
    category: "receipt",
    status: "failed",
    durationSec: 30,
    tags: ["Rezept", "Abgebrochen"]
  }
]

// Mock API call function
async function fetchCalls(filters: CallFilters): Promise<ApiResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  let filteredCalls = [...mockApiCalls]
  
  // Apply filters
  if (filters.status && filters.status !== "all") {
    filteredCalls = filteredCalls.filter(call => call.status === filters.status)
  }
  
  if (filters.categories.length > 0) {
    filteredCalls = filteredCalls.filter(call => filters.categories.includes(call.category))
  }
  
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    filteredCalls = filteredCalls.filter(call => 
      call.callerName?.toLowerCase().includes(query) ||
      call.callerNumber?.includes(query)
    )
  }
  
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
  
  const [calls, setCalls] = useState<CallItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CallFilters>({
    status: "action_needed", // Default as specified
    categories: [],
    searchQuery: ""
  })

  // Check if there are action_needed calls available
  const [hasActionNeededCalls, setHasActionNeededCalls] = useState(true)

  // Initialize filters from URL params on mount
  useEffect(() => {
    const urlStatus = searchParams.get('status') as CallStatus | "all" || "action_needed"
    const urlQuery = searchParams.get('q') || ""
    const urlCats = searchParams.get('cats')?.split(',').filter(Boolean) as CallCategory[] || []
    const urlFrom = searchParams.get('from')
    const urlTo = searchParams.get('to')

    let dateRange: { from: Date; to: Date } | undefined
    if (urlFrom && urlTo) {
      dateRange = {
        from: new Date(urlFrom),
        to: new Date(urlTo)
      }
    }

    const urlFilters: CallFilters = {
      status: urlStatus,
      categories: urlCats,
      searchQuery: urlQuery,
      dateRange
    }

    setFilters(urlFilters)
  }, [searchParams])

  // Check for action_needed calls on mount
  useEffect(() => {
    const checkActionNeededCalls = async () => {
      try {
        const response = await fetchCalls({ 
          status: "action_needed", 
          categories: [],
          searchQuery: ""
        })
        setHasActionNeededCalls(response.items.length > 0)
        
        // If no action_needed calls, fall back to "all" as specified
        if (response.items.length === 0 && !searchParams.get('status')) {
          setFilters(prev => ({ ...prev, status: "all" }))
        }
      } catch (err) {
        console.error('Error checking action needed calls:', err)
      }
    }
    
    checkActionNeededCalls()
  }, [])

  // Fetch calls when filters change
  useEffect(() => {
    const loadCalls = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetchCalls(filters)
        const convertedCalls = response.items.map(convertApiCall)
        setCalls(convertedCalls)
      } catch (err) {
        setError('Fehler beim Laden der Anrufe. Bitte versuchen Sie es erneut.')
        console.error('Error fetching calls:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCalls()
  }, [filters])

  // Handle filter changes from CallsFilters component
  const handleFiltersChange = useCallback((newFilters: CallFilters) => {
    setFilters(newFilters)
  }, [])

  // Retry function for error state
  const handleRetry = () => {
    setError(null)
    handleFiltersChange(filters)
  }

  // Memoized empty state check
  const isEmpty = useMemo(() => {
    return !loading && calls.length === 0
  }, [loading, calls.length])

  // Check if filters are applied (for empty state)
  const hasActiveFilters = useMemo(() => {
    return filters.status !== "all" || 
           filters.categories.length > 0 || 
           filters.searchQuery ||
           filters.dateRange
  }, [filters])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Anrufe
        </h1>
        <p className="text-slate-600">
          Verwalten und überprüfen Sie alle eingehenden und ausgehenden Anrufe
        </p>
      </div>

      {/* Show info if no action needed calls initially */}
      {!hasActionNeededCalls && filters.status === "all" && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Aktuell gibt es keine Anrufe, die Ihre Aufmerksamkeit benötigen. 
            Alle angezeigten Anrufe sind bereits bearbeitet.
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Erneut versuchen
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
              <CallsFilters 
          onFiltersChange={handleFiltersChange}
        />

      {/* Results Summary */}
      {!loading && !error && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {calls.length > 0 ? (
              <span>
                {calls.length} Anruf{calls.length !== 1 ? 'e' : ''} gefunden
              </span>
            ) : hasActiveFilters ? (
              <span>Keine Anrufe für die aktuellen Filter gefunden</span>
            ) : (
              <span>Noch keine Anrufe vorhanden</span>
            )}
          </div>
          
          {/* Quick action for empty action_needed state */}
          {isEmpty && filters.status === "action_needed" && (
            <Button 
              variant="outline"
              onClick={() => handleFiltersChange({ ...filters, status: "all" })}
              className="text-sm"
            >
              Alle Anrufe anzeigen
            </Button>
          )}
        </div>
      )}

      {/* Calls Table */}
      <CallsTable 
        calls={calls} 
        loading={loading}
        className="shadow-sm"
      />
      
      {/* Footer Info */}
      {!loading && calls.length > 0 && (
        <div className="text-xs text-slate-500 text-center">
          Klicken Sie auf eine Zeile, um Details anzuzeigen
        </div>
      )}
    </div>
  )
}
