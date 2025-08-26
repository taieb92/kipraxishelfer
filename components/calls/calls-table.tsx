"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StatusBadge } from "@/components/calls/status-badge"
import type { CallItem, CallCategory } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Eye, Phone, PhoneOutgoing } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"

interface CallsTableProps {
  calls: CallItem[]
  loading?: boolean
  className?: string
}

// Design System category colors
const categoryColors: Record<CallCategory, string> = {
  appointment: "bg-blue-50 text-blue-700 border-blue-200",
  receipt: "bg-green-50 text-green-700 border-green-200",
  sick_note: "bg-yellow-50 text-yellow-700 border-yellow-200",
  info: "bg-purple-50 text-purple-700 border-purple-200",
  other: "bg-slate-50 text-slate-700 border-slate-200",
  unknown: "bg-slate-50 text-slate-700 border-slate-200",
}

const categoryLabels: Record<CallCategory, string> = {
  appointment: "Termin",
  receipt: "Rezept", 
  sick_note: "Krankschreibung",
  info: "Information",
  other: "Sonstiges",
  unknown: "Unbekannt",
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

function getCallerInitials(name?: string, number?: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  if (number) {
    // Get last 2 digits of number
    const digits = number.replace(/\D/g, "")
    return digits.slice(-2)
  }
  return "??"
}

function getCallerDisplay(call: CallItem): string {
  if (call.callerName) {
    return call.callerName
  }
  return call.fromNumber || "Unbekannt"
}

// Loading skeleton row
function LoadingSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
          <div className="space-y-1">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </TableCell>
      <TableCell><div className="h-4 w-16 bg-slate-200 rounded animate-pulse" /></TableCell>
      <TableCell><div className="h-4 w-20 bg-slate-200 rounded animate-pulse" /></TableCell>
      <TableCell><div className="h-6 w-24 bg-slate-200 rounded animate-pulse" /></TableCell>
      <TableCell><div className="h-6 w-20 bg-slate-200 rounded animate-pulse" /></TableCell>
      <TableCell><div className="h-4 w-12 bg-slate-200 rounded animate-pulse" /></TableCell>
      <TableCell><div className="h-8 w-16 bg-slate-200 rounded animate-pulse" /></TableCell>
    </TableRow>
  )
}

// Empty state component
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-32">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 bg-slate-200 rounded-full mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {hasFilters ? "Keine Anrufe gefunden" : "Keine Anrufe vorhanden"}
          </h3>
          <p className="text-slate-600 max-w-sm">
            {hasFilters 
              ? "Versuchen Sie andere Filtereinstellungen oder suchen Sie nach anderen Begriffen."
              : "Es wurden noch keine Anrufe in diesem Zeitraum registriert."
            }
          </p>
        </div>
      </TableCell>
    </TableRow>
  )
}

// Mobile card view for small screens
function MobileCallCard({ call }: { call: CallItem }) {
  const router = useRouter()
  
  return (
    <div 
      className={cn(
        "bg-white border border-slate-200 rounded-lg p-4 space-y-3 cursor-pointer",
        "hover:bg-slate-50 transition-colors",
        call.status === 'action_needed' && "border-l-4 border-l-red-500"
      )}
      onClick={() => router.push(`/calls/${call.id}`)}
    >
      {/* Header with caller and status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
              {getCallerInitials(call.callerName, call.fromNumber)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-900 truncate">
              {getCallerDisplay(call)}
            </p>
            <p className="text-sm text-slate-500">
              {call.fromNumber}
            </p>
          </div>
        </div>
        <StatusBadge status={call.status} />
      </div>

      {/* Call details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-500 mb-1">Kategorie</p>
          <Badge 
            variant="outline" 
            className={cn("text-xs", categoryColors[call.category])}
          >
            {categoryLabels[call.category]}
          </Badge>
        </div>
        <div>
          <p className="text-slate-500 mb-1">Dauer</p>
          <p className="font-medium text-slate-900">
            {formatDuration(call.durationSec)}
          </p>
        </div>
        <div>
          <p className="text-slate-500 mb-1">Zeit</p>
          <p className="font-medium text-slate-900">
            {format(new Date(call.startedAt), "HH:mm", { locale: de })}
          </p>
        </div>
        <div>
          <p className="text-slate-500 mb-1">Richtung</p>
          <div className="flex items-center gap-1">
            {call.direction === 'inbound' ? (
              <Phone className="h-3 w-3 text-green-600" />
            ) : (
              <PhoneOutgoing className="h-3 w-3 text-blue-600" />
            )}
            <span className="text-xs text-slate-600">
              {call.direction === 'inbound' ? 'Eingehend' : 'Ausgehend'}
            </span>
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="pt-2 border-t border-slate-100">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/calls/${call.id}`)
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          Anruf anzeigen
        </Button>
      </div>
    </div>
  )
}

export function CallsTable({ calls, loading = false, className }: CallsTableProps) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (calls.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-16 w-16 bg-slate-200 rounded-full mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Keine Anrufe gefunden
        </h3>
        <p className="text-slate-600 max-w-sm mx-auto">
          Es wurden keine Anrufe mit den aktuellen Filtereinstellungen gefunden.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Mobile view - Cards */}
      <div className="block sm:hidden space-y-4">
        {calls.map((call) => (
          <MobileCallCard key={call.id} call={call} />
        ))}
      </div>

      {/* Desktop view - Table */}
      <div className="hidden sm:block">
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-medium text-slate-700">Anrufer</TableHead>
                <TableHead className="font-medium text-slate-700">Kategorie</TableHead>
                <TableHead className="font-medium text-slate-700">Dauer</TableHead>
                <TableHead className="font-medium text-slate-700">Status</TableHead>
                <TableHead className="font-medium text-slate-700">Richtung</TableHead>
                <TableHead className="font-medium text-slate-700">Zeit</TableHead>
                <TableHead className="font-medium text-slate-700 w-24">Aktion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => (
                <TableRow 
                  key={call.id}
                  className={cn(
                    "cursor-pointer hover:bg-slate-50 transition-colors",
                    call.status === 'action_needed' && "border-l-4 border-l-red-500"
                  )}
                  onClick={() => router.push(`/calls/${call.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                          {getCallerInitials(call.callerName, call.fromNumber)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {getCallerDisplay(call)}
                        </p>
                        <p className="text-sm text-slate-500 truncate">
                          {call.fromNumber}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", categoryColors[call.category])}
                    >
                      {categoryLabels[call.category]}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="font-medium text-slate-900">
                    {formatDuration(call.durationSec)}
                  </TableCell>
                  
                  <TableCell>
                    <StatusBadge status={call.status} />
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {call.direction === 'inbound' ? (
                        <Phone className="h-4 w-4 text-green-600" />
                      ) : (
                        <PhoneOutgoing className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="text-sm text-slate-600">
                        {call.direction === 'inbound' ? 'Eingehend' : 'Ausgehend'}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-sm text-slate-600">
                    {format(new Date(call.startedAt), "dd.MM.yyyy HH:mm", { locale: de })}
                  </TableCell>
                  
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/calls/${call.id}`)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Anruf anzeigen</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
