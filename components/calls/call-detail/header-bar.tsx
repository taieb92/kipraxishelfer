"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/calls/status-badge"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowLeft, Phone, PhoneOutgoing } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import type { CallStatus } from "@/lib/types"

interface CallData {
  id: string
  caller: { name?: string; number?: string }
  direction: "inbound" | "outbound"
  datetimeISO: string
  durationSec: number
  category: string
  status: CallStatus
}

interface HeaderBarProps {
  call: CallData
  onBack: () => void
  onStatusChange: (status: CallStatus) => void
  onMarkCompleted?: () => void
  className?: string
}

// Format duration helper
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// Category labels mapping
const categoryLabels: Record<string, string> = {
  appointment: "Termin",
  receipt: "Rezept", 
  sick_note: "Krankschreibung",
  info: "Information",
  other: "Sonstiges",
  unknown: "Unbekannt"
}

export function HeaderBar({ 
  call, 
  onBack, 
  onStatusChange, 
  onMarkCompleted,
  className 
}: HeaderBarProps) {
  const callerDisplay = call.caller.name || call.caller.number || "Unbekannt"
  const showMarkCompleted = call.status !== "completed" && onMarkCompleted

  return (
    <div className={cn(
      "border-b border-slate-200 pb-6 mb-6",
      className
    )}>
      {/* Back button + caller info */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className={cn(
              "shrink-0 mt-1",
              // Design System: focus ring
              "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            )}
            aria-label="Zurück zur Anrufliste"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 min-w-0">
            {/* Caller name + phone icon */}
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 truncate">
                {callerDisplay}
              </h1>
              {call.direction === "inbound" ? (
                <Phone className="h-5 w-5 text-green-600 shrink-0" aria-label="Eingehender Anruf" />
              ) : (
                <PhoneOutgoing className="h-5 w-5 text-blue-600 shrink-0" aria-label="Ausgehender Anruf" />
              )}
            </div>
            
            {/* Meta data row */}
            <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
              <span className="font-medium">
                {format(new Date(call.datetimeISO), "dd.MM.yyyy HH:mm", { locale: de })}
              </span>
              <span>•</span>
              <span>{formatDuration(call.durationSec)}</span>
              <span>•</span>
              <Badge 
                variant="outline" 
                className="text-xs bg-slate-50 text-slate-700 border-slate-200"
              >
                {categoryLabels[call.category] || call.category}
              </Badge>
              <span>•</span>
              <StatusBadge status={call.status} />
            </div>
          </div>
        </div>
        
        {/* Status controls */}
        <div className="flex items-center gap-3 shrink-0">
          <Select value={call.status} onValueChange={onStatusChange}>
            <SelectTrigger className={cn(
              "w-48",
              // Design System: focus ring
              "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            )}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="booking_made">Termin gebucht</SelectItem>
              <SelectItem value="action_needed">Aktion erforderlich</SelectItem>
              <SelectItem value="completed">Abgeschlossen</SelectItem>
              <SelectItem value="failed">Fehlgeschlagen</SelectItem>
            </SelectContent>
          </Select>
          
          {showMarkCompleted && (
            <Button
              onClick={onMarkCompleted}
              className={cn(
                // Design System: medical gradient on primary actions
                "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                "text-white shadow-md",
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
            >
              Als abgeschlossen markieren
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 