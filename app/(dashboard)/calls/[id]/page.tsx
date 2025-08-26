"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { HeaderBar } from "@/components/calls/call-detail/header-bar"
import { SummaryCard } from "@/components/calls/call-detail/summary-card"
import { RecordingCard } from "@/components/calls/call-detail/recording-card"
import { TranscriptCard } from "@/components/calls/call-detail/transcript-card"
import { LinksCard } from "@/components/calls/call-detail/links-card"
import type { CallStatus } from "@/lib/types"

// Mock data following the new data contract
const mockCallDetail = {
  id: "1",
  caller: { 
    name: "Maria Schmidt", 
    number: "+49 30 12345678" 
  },
  datetimeISO: "2024-01-15T09:30:00Z",
  durationSec: 180,
  category: "appointment" as const,
  status: "booking_made" as CallStatus,
  tags: ["Termin", "Hausarzt", "Routine"],
  summary: "Patientin möchte einen Routinetermin für nächste Woche buchen. Bevorzugt Vormittag zwischen 9-11 Uhr. AI konnte erfolgreich einen passenden Termin finden und buchen.",
  redactionApplied: true,
  recordingUrl: "/audio/call-1.mp3",
  transcript: [
    { speaker: "assistant" as const, text: "Guten Tag, Sie erreichen die Praxis Dr. Müller. Wie kann ich Ihnen helfen?" },
    { speaker: "caller" as const, text: "Hallo, ich würde gerne einen Termin für eine Routineuntersuchung vereinbaren." },
    { speaker: "assistant" as const, text: "Gerne! Für welchen Zeitraum hätten Sie denn Zeit?" },
    { speaker: "caller" as const, text: "Am liebsten nächste Woche vormittags, so zwischen 9 und 11 Uhr." },
    { speaker: "assistant" as const, text: "Ich schaue mal... Wie wäre es mit Dienstag, dem 23. Januar um 10:30 Uhr?" },
    { speaker: "caller" as const, text: "Das passt perfekt! Vielen Dank." },
    { speaker: "assistant" as const, text: "Sehr gerne. Ich habe den Termin für Sie eingetragen. Sie erhalten eine Bestätigung per E-Mail." },
    { speaker: "caller" as const, text: "Wunderbar. Muss ich etwas mitbringen?" },
    { speaker: "assistant" as const, text: "Bringen Sie bitte Ihre Versichertenkarte und den Impfpass mit, falls vorhanden." },
    { speaker: "caller" as const, text: "Alles klar, das mache ich. Vielen Dank und einen schönen Tag!" },
    { speaker: "assistant" as const, text: "Sehr gerne! Ich wünsche Ihnen auch einen schönen Tag. Auf Wiederhören!" },
    { speaker: "caller" as const, text: "Auf Wiederhören!" },
    // Adding more entries to test expand/collapse
    { speaker: "assistant" as const, text: "Zusätzliche Nachricht 1" },
    { speaker: "caller" as const, text: "Zusätzliche Nachricht 2" },
    { speaker: "assistant" as const, text: "Zusätzliche Nachricht 3" },
    { speaker: "caller" as const, text: "Zusätzliche Nachricht 4" },
    { speaker: "assistant" as const, text: "Zusätzliche Nachricht 5" },
  ],
  systemTrail: [
    { 
      tsISO: "2024-01-15T09:30:15Z", 
      action: "Anruf eingegangen", 
      meta: { number: "+49 30 12345678" } 
    },
    { 
      tsISO: "2024-01-15T09:30:18Z", 
      action: "Spracherkennung", 
      meta: { language: "Deutsch" } 
    },
    { 
      tsISO: "2024-01-15T09:30:25Z", 
      action: "Intent erkannt", 
      meta: { category: "Terminbuchung", confidence: 0.95 } 
    },
    { 
      tsISO: "2024-01-15T09:31:45Z", 
      action: "Doctolib Suche", 
      meta: { availableSlots: 5 } 
    },
    { 
      tsISO: "2024-01-15T09:32:30Z", 
      action: "Termin gebucht", 
      meta: { datetime: "23.01.2024 10:30", doctor: "Dr. Müller" } 
    },
    { 
      tsISO: "2024-01-15T09:33:00Z", 
      action: "Anruf beendet", 
      meta: { status: "Erfolgreich", duration: "180s" } 
    },
  ],
  links: {
    doctolibAppointment: "https://doctolib.de/appointment/123",
    doctolibPatient: "https://doctolib.de/patient/456"
  }
}

// Mock API functions
const fetchCallDetail = async (id: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockCallDetail
}

const updateCallStatus = async (id: string, status: CallStatus) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  return { ok: true, status }
}

export default function CallDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [call, setCall] = useState<typeof mockCallDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load call data
  useEffect(() => {
    const loadCall = async () => {
      try {
        setLoading(true)
        setError(null)
        const callData = await fetchCallDetail(params.id as string)
        setCall(callData)
      } catch (err) {
        console.error('Error loading call:', err)
        setError('Anruf konnte nicht geladen werden.')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadCall()
    }
  }, [params.id])

  // Handle status changes
  const handleStatusChange = useCallback(async (newStatus: CallStatus) => {
    if (!call) return

    try {
      // Optimistic update
      setCall(prev => prev ? { ...prev, status: newStatus } : null)
      
      // API call
      await updateCallStatus(call.id, newStatus)
      
      toast({
        title: "Status aktualisiert",
        description: `Status wurde auf "${getStatusLabel(newStatus)}" geändert.`,
      })
    } catch (err) {
      console.error('Error updating status:', err)
      
      // Revert optimistic update
      setCall(prev => prev ? { ...prev, status: call.status } : null)
      
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive"
      })
    }
  }, [call, toast])

  // Handle mark as completed
  const handleMarkCompleted = useCallback(() => {
    handleStatusChange("completed")
  }, [handleStatusChange])

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  // Get status label for display
  const getStatusLabel = (status: CallStatus): string => {
    const labels = {
      booking_made: "Termin gebucht",
      action_needed: "Aktion erforderlich", 
      completed: "Abgeschlossen",
      failed: "Fehlgeschlagen"
    }
    return labels[status] || status
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="border-b border-slate-200 pb-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="h-10 w-10 bg-slate-200 animate-pulse rounded" />
              <div className="space-y-2 flex-1">
                <div className="h-8 w-64 bg-slate-200 animate-pulse rounded" />
                <div className="h-4 w-96 bg-slate-200 animate-pulse rounded" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-48 bg-slate-200 animate-pulse rounded" />
              <div className="h-10 w-48 bg-slate-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
            <div className="h-96 bg-slate-200 animate-pulse rounded-2xl" />
            <div className="h-96 bg-slate-200 animate-pulse rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-slate-200 animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !call) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Anruf nicht gefunden
          </h2>
          <p className="text-slate-600 mb-4">
            {error || "Der angeforderte Anruf konnte nicht geladen werden."}
          </p>
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    )
  }

  // Prepare system outcome message
  const systemOutcome = call.status === "booking_made" 
    ? "AI hat erfolgreich Termin am 23.01.2024 um 10:30 Uhr gebucht (Doctolib)"
    : undefined

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <HeaderBar
        call={{
          id: call.id,
          caller: call.caller,
          direction: "inbound", // Inferred from mock data
          datetimeISO: call.datetimeISO,
          durationSec: call.durationSec,
          category: call.category,
          status: call.status
        }}
        onBack={handleBack}
        onStatusChange={handleStatusChange}
        onMarkCompleted={call.status !== "completed" ? handleMarkCompleted : undefined}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Card - First */}
          <SummaryCard
            summary={call.summary}
            tags={call.tags}
            systemOutcome={systemOutcome}
          />

          {/* Recording Card */}
          <RecordingCard
            recordingUrl={call.recordingUrl}
            redactionApplied={call.redactionApplied}
          />

          {/* Transcript Card with Tabs */}
          <TranscriptCard
            transcript={call.transcript}
            systemTrail={call.systemTrail}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Links Card */}
          <LinksCard links={call.links} />

          {/* Optional future components can be added here */}
          {/* - Insights Card (behind feature flag) */}
          {/* - Related Calls Card (behind feature flag) */}
        </div>
      </div>
    </div>
  )
}
